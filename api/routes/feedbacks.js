import { Router } from 'express'
import db from '../db.js'
import { authenticateJWT } from '../middleware/auth.js'

const router = Router()
router.use(authenticateJWT)

// POST /api/feedbacks
router.post('/', async (req, res) => {
  try {
    const { intervention_id, type, rating, commentaire, cible_id } = req.body
    if (!intervention_id || !type || !rating || !commentaire) {
      return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' })
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating doit être entre 1 et 5' })
    }

    const validTypes = ['client_sur_service', 'technicien_sur_client', 'technicien_sur_service']
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: 'Type invalide' })
    }

    // Vérifier accès
    const [interv] = await db.query('SELECT * FROM interventions WHERE id=?', [intervention_id])
    if (!interv.length) return res.status(404).json({ success: false, error: 'Intervention introuvable' })
    if (interv[0].statut !== 'termine') {
      return res.status(400).json({ success: false, error: 'L\'intervention doit être terminée' })
    }

    if (type === 'client_sur_service' && interv[0].client_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }
    if ((type === 'technicien_sur_client' || type === 'technicien_sur_service') && req.user.role !== 'technicien') {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }

    await db.query(
      'INSERT INTO feedbacks (intervention_id, auteur_id, cible_id, type, rating, commentaire) VALUES (?,?,?,?,?,?)',
      [intervention_id, req.user.id, cible_id || null, type, rating, commentaire]
    )
    res.json({ success: true })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, error: 'Vous avez déjà laissé un avis de ce type' })
    }
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/feedbacks/intervention/:id
router.get('/intervention/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.*, u.prenom as auteur_prenom, u.nom as auteur_nom
       FROM feedbacks f JOIN users u ON u.id = f.auteur_id
       WHERE f.intervention_id = ?`,
      [req.params.id]
    )
    res.json({ success: true, data: rows })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
