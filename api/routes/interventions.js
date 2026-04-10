import { Router } from 'express'
import db from '../db.js'
import { authenticateJWT, requireRole } from '../middleware/auth.js'
import { notify } from '../helpers/notify.js'

const router = Router()
router.use(authenticateJWT)

// POST /api/interventions — Client crée l'intervention après avoir payé et choisi le créneau
router.post('/', requireRole('client'), async (req, res) => {
  try {
    const { devis_id, date_debut, date_fin, stripe_payment_intent_id } = req.body
    if (!devis_id || !date_debut || !date_fin) {
      return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' })
    }
    const [devis] = await db.query('SELECT * FROM devis WHERE id=? AND client_id=?', [devis_id, req.user.id])
    if (!devis.length) return res.status(404).json({ success: false, error: 'Devis introuvable' })
    if (devis[0].statut !== 'accepte_client') {
      return res.status(400).json({ success: false, error: 'Devis non accepté' })
    }

    const [result] = await db.query(
      `INSERT INTO interventions (devis_id, client_id, date_debut, date_fin, montant, stripe_payment_intent_id)
       VALUES (?,?,?,?,?,?)`,
      [devis_id, req.user.id, date_debut, date_fin, devis[0].prix, stripe_payment_intent_id || null]
    )
    // Notifier les responsables
    const [resps] = await db.query("SELECT id FROM users WHERE role='responsable' AND actif=1")
    for (const r of resps) {
      await notify(r.id, 'intervention_planifiee', 'Intervention planifiée',
        `Une intervention a été planifiée le ${new Date(date_debut).toLocaleDateString('fr-FR')} pour ${req.user.prenom} ${req.user.nom}.`,
        '/dashboard/responsable/interventions')
    }
    res.json({ success: true, id: result.insertId })
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/interventions — Liste selon le rôle
router.get('/', async (req, res) => {
  try {
    let rows
    const { statut } = req.query

    if (req.user.role === 'client') {
      let q = `SELECT i.*, d.type_service, d.nb_techniciens,
                 GROUP_CONCAT(CONCAT(u.prenom,' ',u.nom) SEPARATOR ', ') as techniciens_noms
               FROM interventions i
               JOIN devis d ON d.id = i.devis_id
               LEFT JOIN intervention_techniciens it ON it.intervention_id = i.id AND it.statut != 'annule'
               LEFT JOIN users u ON u.id = it.technicien_id
               WHERE i.client_id = ?`
      const params = [req.user.id]
      if (statut) { q += ' AND i.statut = ?'; params.push(statut) }
      q += ' GROUP BY i.id ORDER BY i.date_debut DESC'
        ;[rows] = await db.query(q, params)

    } else if (req.user.role === 'technicien') {
      let q = `SELECT i.*, d.type_service, d.nb_techniciens,
                 c.prenom as client_prenom, c.nom as client_nom, c.telephone as client_telephone,
                 c.adresse as client_adresse
               FROM interventions i
               JOIN devis d ON d.id = i.devis_id
               JOIN users c ON c.id = i.client_id
               JOIN intervention_techniciens it ON it.intervention_id = i.id
               WHERE it.technicien_id = ? AND it.statut != 'annule'`
      const params = [req.user.id]
      if (statut) { q += ' AND i.statut = ?'; params.push(statut) }
      q += ' ORDER BY i.date_debut DESC'
        ;[rows] = await db.query(q, params)

    } else if (req.user.role === 'responsable') {
      let q = `SELECT i.*, d.type_service, d.nb_techniciens,
                 c.prenom as client_prenom, c.nom as client_nom,
                 GROUP_CONCAT(CONCAT(u.prenom,' ',u.nom) SEPARATOR ', ') as techniciens_noms
               FROM interventions i
               JOIN devis d ON d.id = i.devis_id
               JOIN users c ON c.id = i.client_id
               LEFT JOIN intervention_techniciens it ON it.intervention_id = i.id AND it.statut != 'annule'
               LEFT JOIN users u ON u.id = it.technicien_id
               WHERE 1=1`
      const params = []
      if (statut) { q += ' AND i.statut = ?'; params.push(statut) }
      q += ' GROUP BY i.id ORDER BY i.date_debut DESC'
        ;[rows] = await db.query(q, params)
    } else {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }
    res.json({ success: true, data: rows })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/interventions/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.*, d.type_service, d.description, d.nb_techniciens, d.heures_estimees, d.recurrence,
         c.prenom as client_prenom, c.nom as client_nom, c.email as client_email, c.telephone as client_telephone, c.adresse as client_adresse
       FROM interventions i
       JOIN devis d ON d.id = i.devis_id
       JOIN users c ON c.id = i.client_id
       WHERE i.id = ?`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ success: false, error: 'Intervention introuvable' })
    const interv = rows[0]

    // Techniciens assignés
    const [techs] = await db.query(
      `SELECT u.id, u.prenom, u.nom, u.telephone, u.email, it.statut as assign_statut
       FROM intervention_techniciens it
       JOIN users u ON u.id = it.technicien_id
       WHERE it.intervention_id = ? AND it.statut != 'annule'`,
      [req.params.id]
    )
    interv.techniciens = techs

    // Vérif accès
    if (req.user.role === 'client' && interv.client_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }
    if (req.user.role === 'technicien') {
      const assigned = techs.some(t => t.id === req.user.id)
      if (!assigned) return res.status(403).json({ success: false, error: 'Accès refusé' })
    }

    // Masquer les téléphones des techniciens si pas encore confirmé
    if (req.user.role === 'client' && interv.statut === 'planifie' && !techs.length) {
      interv.techniciens = techs.map(t => ({ ...t, telephone: null }))
    }

    res.json({ success: true, data: interv })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/interventions/:id/progression — Technicien met à jour la progression
router.patch('/:id/progression', requireRole('technicien'), async (req, res) => {
  try {
    const { progression } = req.body
    if (progression === undefined || progression < 0 || progression > 100) {
      return res.status(400).json({ success: false, error: 'Progression invalide (0-100)' })
    }
    // Vérifier que le tech est assigné
    const [check] = await db.query(
      "SELECT id FROM intervention_techniciens WHERE intervention_id=? AND technicien_id=? AND statut!='annule'",
      [req.params.id, req.user.id]
    )
    if (!check.length) return res.status(403).json({ success: false, error: 'Non assigné à cette intervention' })

    await db.query('UPDATE interventions SET progression=? WHERE id=?', [progression, req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/interventions/:id/statut — Responsable change le statut
router.patch('/:id/statut', requireRole('responsable'), async (req, res) => {
  try {
    const { statut } = req.body
    const validStatuts = ['planifie', 'en_cours', 'termine', 'annule']
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({ success: false, error: 'Statut invalide' })
    }
    const [check] = await db.query('SELECT * FROM interventions WHERE id=?', [req.params.id])
    if (!check.length) return res.status(404).json({ success: false, error: 'Intervention introuvable' })

    await db.query('UPDATE interventions SET statut=? WHERE id=?', [statut, req.params.id])

    // Si en_cours → capturer le paiement Stripe
    if (statut === 'en_cours' && check[0].stripe_payment_intent_id) {
      try {
        const { default: Stripe } = await import('stripe')
        const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'])
        await stripe.paymentIntents.capture(check[0].stripe_payment_intent_id)
        await db.query("UPDATE interventions SET stripe_statut='capture' WHERE id=?", [req.params.id])
      } catch (stripeErr) {
        console.error('Stripe capture error:', stripeErr.message)
      }
    }

    // Notifier le client
    const messages = {
      en_cours: 'Votre intervention a démarré.',
      termine: 'Votre intervention est terminée. Laissez un avis !',
      annule: 'Votre intervention a été annulée.'
    }
    if (messages[statut]) {
      await notify(check[0].client_id, `intervention_${statut}`, 'Mise à jour intervention',
        messages[statut], '/dashboard/client/interventions')
    }
    res.json({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

// POST /api/interventions/:id/assigner — Responsable assigne des techniciens
router.post('/:id/assigner', requireRole('responsable'), async (req, res) => {
  try {
    const { technicien_ids } = req.body
    if (!Array.isArray(technicien_ids) || !technicien_ids.length) {
      return res.status(400).json({ success: false, error: 'Liste de techniciens requise' })
    }
    const [interv] = await db.query('SELECT * FROM interventions WHERE id=?', [req.params.id])
    if (!interv.length) return res.status(404).json({ success: false, error: 'Intervention introuvable' })

    // Supprimer les anciens assignments
    await db.query("DELETE FROM intervention_techniciens WHERE intervention_id=?", [req.params.id])

    for (const techId of technicien_ids) {
      await db.query(
        'INSERT INTO intervention_techniciens (intervention_id, technicien_id) VALUES (?,?)',
        [req.params.id, techId]
      )
      // Notifier le technicien
      await notify(techId, 'intervention_assignee', 'Nouvelle intervention',
        `Vous avez été assigné à une intervention le ${new Date(interv[0].date_debut).toLocaleDateString('fr-FR')}.`,
        '/dashboard/technicien/planning')
    }
    // Notifier le client
    await notify(interv[0].client_id, 'techniciens_assignes', 'Techniciens assignés',
      'Les techniciens ont été assignés à votre intervention. Vous pouvez voir leur contact.',
      '/dashboard/client/interventions')

    res.json({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
