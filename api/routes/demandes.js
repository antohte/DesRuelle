import { Router } from 'express'
import db from '../db.js'
import { authenticateJWT, requireRole } from '../middleware/auth.js'
import { notify } from '../helpers/notify.js'

const router = Router()
router.use(authenticateJWT)

// POST /api/demandes — Client ou technicien soumet une demande
router.post('/', async (req, res) => {
  try {
    if (!['client', 'technicien'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }
    const { intervention_id, type, raison, nouvelle_date_debut, nouvelle_date_fin } = req.body
    if (!intervention_id || !type || !raison) {
      return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' })
    }
    if (!['annulation', 'modification'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Type invalide' })
    }

    const [interv] = await db.query('SELECT * FROM interventions WHERE id=?', [intervention_id])
    if (!interv.length) return res.status(404).json({ success: false, error: 'Intervention introuvable' })

    // Vérifier l'accès
    if (req.user.role === 'client' && interv[0].client_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }
    if (req.user.role === 'technicien') {
      const [check] = await db.query(
        "SELECT id FROM intervention_techniciens WHERE intervention_id=? AND technicien_id=? AND statut!='annule'",
        [intervention_id, req.user.id]
      )
      if (!check.length) return res.status(403).json({ success: false, error: 'Non assigné' })
    }

    // Calculer si remboursement applicable (>24h avant le service)
    const heuresAvant = (new Date(interv[0].date_debut) - new Date()) / 3600000
    const remboursement = type === 'annulation' && heuresAvant > 24 ? 1 : 0

    const [result] = await db.query(
      `INSERT INTO demandes_modification
       (intervention_id, demandeur_id, type, raison, nouvelle_date_debut, nouvelle_date_fin, remboursement)
       VALUES (?,?,?,?,?,?,?)`,
      [intervention_id, req.user.id, type, raison,
       nouvelle_date_debut || null, nouvelle_date_fin || null, remboursement]
    )

    // Notifier les responsables
    const [resps] = await db.query("SELECT id FROM users WHERE role='responsable' AND actif=1")
    const demandeur = `${req.user.prenom} ${req.user.nom}`
    const label = type === 'annulation' ? 'annulation' : 'modification'
    for (const r of resps) {
      await notify(r.id, `demande_${type}`, `Demande d'${label}`,
        `${demandeur} a demandé une ${label} d'intervention. Raison : ${raison}`,
        '/dashboard/responsable/demandes')
    }

    res.json({ success: true, id: result.insertId, remboursement: !!remboursement })
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/demandes — Liste selon le rôle
router.get('/', async (req, res) => {
  try {
    let rows
    if (req.user.role === 'responsable') {
      const { statut } = req.query
      let q = `SELECT dm.*, i.date_debut, i.date_fin, i.stripe_payment_intent_id,
                 d.type_service, d.prix,
                 u.prenom as demandeur_prenom, u.nom as demandeur_nom, u.role as demandeur_role
               FROM demandes_modification dm
               JOIN interventions i ON i.id = dm.intervention_id
               JOIN devis d ON d.id = i.devis_id
               JOIN users u ON u.id = dm.demandeur_id
               WHERE 1=1`
      const params = []
      if (statut) { q += ' AND dm.statut = ?'; params.push(statut) }
      q += ' ORDER BY dm.created_at DESC'
      ;[rows] = await db.query(q, params)
    } else {
      ;[rows] = await db.query(
        `SELECT dm.*, i.date_debut, i.date_fin, d.type_service
         FROM demandes_modification dm
         JOIN interventions i ON i.id = dm.intervention_id
         JOIN devis d ON d.id = i.devis_id
         WHERE dm.demandeur_id = ?
         ORDER BY dm.created_at DESC`,
        [req.user.id]
      )
    }
    res.json({ success: true, data: rows })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/demandes/:id/approuver — Responsable approuve
router.patch('/:id/approuver', requireRole('responsable'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT dm.*, i.stripe_payment_intent_id, i.client_id, i.date_debut
       FROM demandes_modification dm
       JOIN interventions i ON i.id = dm.intervention_id
       WHERE dm.id = ?`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ success: false, error: 'Demande introuvable' })
    const demande = rows[0]

    await db.query(
      'UPDATE demandes_modification SET statut=\'approuve\', traite_par=?, traite_at=NOW() WHERE id=?',
      [req.user.id, req.params.id]
    )

    if (demande.type === 'annulation') {
      await db.query("UPDATE interventions SET statut='annule' WHERE id=?", [demande.intervention_id])

      // Rembourser si >24h
      if (demande.remboursement && demande.stripe_payment_intent_id) {
        try {
          const { default: Stripe } = await import('stripe')
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
          await stripe.paymentIntents.cancel(demande.stripe_payment_intent_id)
          await db.query("UPDATE interventions SET stripe_statut='rembourse' WHERE id=?", [demande.intervention_id])
        } catch (stripeErr) {
          console.error('Stripe refund error:', stripeErr.message)
        }
      }

      await notify(demande.client_id, 'annulation_approuvee', 'Annulation approuvée',
        demande.remboursement
          ? 'Votre annulation a été approuvée. Vous serez remboursé.'
          : 'Votre annulation a été approuvée. Aucun remboursement (moins de 24h avant le service).',
        '/dashboard/client/interventions')

    } else if (demande.type === 'modification') {
      // Mettre à jour les dates si fournies
      if (demande.nouvelle_date_debut && demande.nouvelle_date_fin) {
        await db.query(
          'UPDATE interventions SET date_debut=?, date_fin=? WHERE id=?',
          [demande.nouvelle_date_debut, demande.nouvelle_date_fin, demande.intervention_id]
        )
      }
      await notify(demande.client_id, 'modification_approuvee', 'Modification approuvée',
        'Votre demande de modification a été approuvée.', '/dashboard/client/interventions')

      // Notifier les techniciens assignés
      const [techs] = await db.query(
        "SELECT technicien_id FROM intervention_techniciens WHERE intervention_id=? AND statut!='annule'",
        [demande.intervention_id]
      )
      for (const t of techs) {
        await notify(t.technicien_id, 'planning_modifie', 'Planning modifié',
          "Une intervention dans votre planning a été modifiée.", '/dashboard/technicien/planning')
      }
    }

    res.json({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/demandes/:id/refuser — Responsable refuse
router.patch('/:id/refuser', requireRole('responsable'), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT dm.*, i.client_id FROM demandes_modification dm JOIN interventions i ON i.id=dm.intervention_id WHERE dm.id=?',
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ success: false, error: 'Demande introuvable' })
    const demande = rows[0]

    await db.query(
      "UPDATE demandes_modification SET statut='refuse', traite_par=?, traite_at=NOW() WHERE id=?",
      [req.user.id, req.params.id]
    )
    await notify(demande.client_id, 'demande_refusee', 'Demande refusée',
      `Votre demande d'${demande.type} a été refusée.`, '/dashboard/client/interventions')

    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
