import { Router } from 'express'
import db from '../db.js'
import { authenticateJWT } from '../middleware/auth.js'

const router = Router()
router.use(authenticateJWT)

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id=? ORDER BY lu ASC, created_at DESC LIMIT 50',
      [req.user.id]
    )
    const unread = rows.filter(r => !r.lu).length
    res.json({ success: true, data: rows, unread })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/notifications/:id/lire
router.patch('/:id/lire', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET lu=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// PATCH /api/notifications/lire-tout
router.patch('/lire-tout', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET lu=1 WHERE user_id=?', [req.user.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
