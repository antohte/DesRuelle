import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import db from './api/db.js'

// Routes
import authRoutes         from './api/routes/auth.js'
import devisRoutes        from './api/routes/devis.js'
import interventionsRoutes from './api/routes/interventions.js'
import techniciensRoutes  from './api/routes/techniciens.js'
import demandesRoutes     from './api/routes/demandes.js'
import stripeRoutes       from './api/routes/stripe.js'
import notificationsRoutes from './api/routes/notifications.js'
import feedbacksRoutes    from './api/routes/feedbacks.js'
import adminRoutes        from './api/routes/admin.js'

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://conciergerie-desruelle.fr',
  ],
  credentials: true,
}))

// Webhook Stripe doit recevoir le corps brut
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

// ── Routes existantes ──────────────────────────────────────────────

// GET /api/stats
app.get('/api/stats', async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT rating FROM avis WHERE statut='approuve'")
    const total = rows.length
    const avg = total > 0
      ? (rows.reduce((a, r) => a + parseFloat(r.rating), 0) / total).toFixed(1)
      : '—'
    res.json({ success: true, total, avg })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/avis
app.get('/api/avis', async (_req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM avis WHERE statut='approuve' ORDER BY created_at DESC"
    )
    const data = rows.map(r => ({
      ...r,
      name: (r.prenom || '') + ' ' + (r.nom_initial || r.nom || ''),
      rating: parseFloat(r.rating),
    }))
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// POST /api/avis
app.post('/api/avis', async (req, res) => {
  try {
    const { prenom, nom, email, location, service, rating, texte } = req.body
    await db.query(
      "INSERT INTO avis (prenom, nom_initial, location, service, rating, texte, statut) VALUES (?,?,?,?,?,?,'en_attente')",
      [prenom, nom ? nom.charAt(0).toUpperCase() : '?', location, service, rating, texte]
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// ── Nouvelles routes ───────────────────────────────────────────────

app.use('/api/auth',          authRoutes)
app.use('/api/devis',         devisRoutes)
app.use('/api/interventions', interventionsRoutes)
app.use('/api/techniciens',   techniciensRoutes)
app.use('/api/demandes',      demandesRoutes)
app.use('/api/stripe',        stripeRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/feedbacks',     feedbacksRoutes)
app.use('/api/admin',         adminRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
