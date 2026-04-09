import { Router } from 'express'
import db from '../db.js'
import { authenticateJWT, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authenticateJWT, requireRole('responsable'))

// GET /api/admin/users?role=
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query
    let q = 'SELECT id, prenom, nom, email, telephone, adresse, role, actif, created_at FROM users WHERE 1=1'
    const params = []
    if (role) { q += ' AND role = ?'; params.push(role) }
    q += ' ORDER BY role, nom, prenom'
    const [rows] = await db.query(q, params)
    res.json({ success: true, data: rows })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body
    if (!['client', 'technicien', 'responsable'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Rôle invalide' })
    }
    await db.query('UPDATE users SET role=? WHERE id=?', [role, req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/admin/users/:id/actif
router.patch('/users/:id/actif', async (req, res) => {
  try {
    const { actif } = req.body
    await db.query('UPDATE users SET actif=? WHERE id=?', [actif ? 1 : 0, req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/admin/contacts — Clients + techniciens avec infos complètes
router.get('/contacts', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, prenom, nom, email, telephone, adresse, role, actif, created_at
       FROM users
       WHERE role IN ('client','technicien') AND actif=1
       ORDER BY role, nom, prenom`
    )
    res.json({ success: true, data: rows })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/admin/avis-pending — Avis en attente de modération
router.get('/avis-pending', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM avis WHERE statut='en_attente' ORDER BY created_at DESC"
    )
    res.json({ success: true, data: rows })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/admin/avis/:id/approuver
router.patch('/avis/:id/approuver', async (req, res) => {
  try {
    await db.query(
      "UPDATE avis SET statut='approuve', controle=1, controle_par=?, controle_at=NOW() WHERE id=?",
      [req.user.id, req.params.id]
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/admin/avis/:id/refuser
router.patch('/avis/:id/refuser', async (req, res) => {
  try {
    await db.query(
      "UPDATE avis SET statut='refuse', controle=1, controle_par=?, controle_at=NOW() WHERE id=?",
      [req.user.id, req.params.id]
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
