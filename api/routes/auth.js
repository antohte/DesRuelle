import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import { authenticateJWT } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { prenom, nom, email, password, telephone, adresse } = req.body
    if (!prenom || !nom || !email || !password) {
      return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' })
    }
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length) {
      return res.status(409).json({ success: false, error: 'Email déjà utilisé' })
    }
    const hash = await bcrypt.hash(password, 10)
    const [result] = await db.query(
      'INSERT INTO users (prenom, nom, email, password, telephone, adresse, role) VALUES (?,?,?,?,?,?,?)',
      [prenom, nom, email, hash, telephone || null, adresse || null, 'client']
    )
    const token = jwt.sign(
      { id: result.insertId, email, role: 'client', prenom, nom },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ success: true, token, user: { id: result.insertId, prenom, nom, email, role: 'client' } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email et mot de passe requis' })
    }
    const [rows] = await db.query(
      'SELECT id, prenom, nom, email, password, role, actif FROM users WHERE email = ?',
      [email]
    )
    if (!rows.length) {
      return res.status(401).json({ success: false, error: 'Identifiants incorrects' })
    }
    const user = rows[0]
    if (!user.actif) {
      return res.status(403).json({ success: false, error: 'Compte désactivé' })
    }
    // Compatibilité hash PHP ($2y$) → bcryptjs ($2b$)
    const hash = user.password.replace(/^\$2y\$/, '$2b$')
    const valid = await bcrypt.compare(password, hash)
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Identifiants incorrects' })
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, prenom: user.prenom, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      success: true,
      token,
      user: { id: user.id, prenom: user.prenom, nom: user.nom, email: user.email, role: user.role }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/auth/me
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, prenom, nom, email, telephone, adresse, role, actif, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (!rows.length) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' })
    res.json({ success: true, user: rows[0] })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
