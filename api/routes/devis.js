import { Router } from 'express'
import db from '../db.js'
import { authenticateJWT, requireRole } from '../middleware/auth.js'
import { notify } from '../helpers/notify.js'

const router = Router()
router.use(authenticateJWT)

// POST /api/devis — Client soumet un devis
router.post('/', requireRole('client'), async (req, res) => {
  try {
    const { type_service, description, adresse_service, recurrence, recurrence_detail } = req.body
    if (!type_service || !description || !adresse_service) {
      return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' })
    }
    const [result] = await db.query(
      `INSERT INTO devis (client_id, type_service, description, adresse_service, recurrence, recurrence_detail)
       VALUES (?,?,?,?,?,?)`,
      [req.user.id, type_service, description, adresse_service,
       recurrence || 'unique', recurrence_detail || null]
    )
    // Notifier les responsables
    const [resps] = await db.query("SELECT id FROM users WHERE role = 'responsable' AND actif = 1")
    for (const r of resps) {
      await notify(r.id, 'nouveau_devis', 'Nouveau devis',
        `${req.user.prenom} ${req.user.nom} a soumis un devis pour : ${type_service}`,
        '/dashboard/responsable/devis')
    }
    res.json({ success: true, id: result.insertId })
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/devis — Liste selon le rôle
router.get('/', async (req, res) => {
  try {
    let rows
    if (req.user.role === 'client') {
      ;[rows] = await db.query(
        `SELECT d.*, u.prenom as resp_prenom, u.nom as resp_nom
         FROM devis d
         LEFT JOIN users u ON u.id = d.valide_par
         WHERE d.client_id = ?
         ORDER BY d.created_at DESC`,
        [req.user.id]
      )
    } else if (req.user.role === 'responsable') {
      const { statut } = req.query
      let q = `SELECT d.*, u.prenom as client_prenom, u.nom as client_nom, u.email as client_email, u.telephone as client_telephone
               FROM devis d JOIN users u ON u.id = d.client_id`
      const params = []
      if (statut) { q += ' WHERE d.statut = ?'; params.push(statut) }
      q += ' ORDER BY d.created_at DESC'
      ;[rows] = await db.query(q, params)
    } else {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }
    res.json({ success: true, data: rows })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/devis/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*,
        c.prenom as client_prenom, c.nom as client_nom, c.email as client_email, c.telephone as client_telephone,
        r.prenom as resp_prenom, r.nom as resp_nom
       FROM devis d
       JOIN users c ON c.id = d.client_id
       LEFT JOIN users r ON r.id = d.valide_par
       WHERE d.id = ?`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ success: false, error: 'Devis introuvable' })
    const devis = rows[0]
    if (req.user.role === 'client' && devis.client_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }
    res.json({ success: true, data: devis })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/devis/:id/valider — Responsable valide
router.patch('/:id/valider', requireRole('responsable'), async (req, res) => {
  try {
    const { prix, heures_estimees, nb_techniciens, note_responsable } = req.body
    if (!prix || !nb_techniciens) {
      return res.status(400).json({ success: false, error: 'Prix et nombre de techniciens requis' })
    }
    const [check] = await db.query('SELECT * FROM devis WHERE id = ?', [req.params.id])
    if (!check.length) return res.status(404).json({ success: false, error: 'Devis introuvable' })

    await db.query(
      `UPDATE devis SET statut='valide', prix=?, heures_estimees=?, nb_techniciens=?,
       note_responsable=?, valide_par=?, valide_at=NOW() WHERE id=?`,
      [prix, heures_estimees || null, nb_techniciens, note_responsable || null, req.user.id, req.params.id]
    )
    await notify(check[0].client_id, 'devis_valide', 'Devis validé',
      `Votre devis pour "${check[0].type_service}" a été validé. Prix : ${prix}€. Consultez-le pour accepter ou refuser.`,
      '/dashboard/client/devis')
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/devis/:id/refuser — Responsable refuse
router.patch('/:id/refuser', requireRole('responsable'), async (req, res) => {
  try {
    const { note_responsable } = req.body
    const [check] = await db.query('SELECT * FROM devis WHERE id = ?', [req.params.id])
    if (!check.length) return res.status(404).json({ success: false, error: 'Devis introuvable' })

    await db.query(
      'UPDATE devis SET statut=\'refuse\', note_responsable=?, valide_par=?, valide_at=NOW() WHERE id=?',
      [note_responsable || null, req.user.id, req.params.id]
    )
    await notify(check[0].client_id, 'devis_refuse', 'Devis refusé',
      `Votre devis pour "${check[0].type_service}" a été refusé.${note_responsable ? ' Raison : ' + note_responsable : ''}`,
      '/dashboard/client/devis')
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/devis/:id/accepter — Client accepte
router.patch('/:id/accepter', requireRole('client'), async (req, res) => {
  try {
    const [check] = await db.query('SELECT * FROM devis WHERE id=? AND client_id=?', [req.params.id, req.user.id])
    if (!check.length) return res.status(404).json({ success: false, error: 'Devis introuvable' })
    if (check[0].statut !== 'valide') return res.status(400).json({ success: false, error: 'Devis non validé' })

    await db.query("UPDATE devis SET statut='accepte_client' WHERE id=?", [req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/devis/:id/refuser-client — Client refuse
router.patch('/:id/refuser-client', requireRole('client'), async (req, res) => {
  try {
    const [check] = await db.query('SELECT * FROM devis WHERE id=? AND client_id=?', [req.params.id, req.user.id])
    if (!check.length) return res.status(404).json({ success: false, error: 'Devis introuvable' })
    if (check[0].statut !== 'valide') return res.status(400).json({ success: false, error: 'Devis non validé' })

    await db.query("UPDATE devis SET statut='refuse_client' WHERE id=?", [req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
