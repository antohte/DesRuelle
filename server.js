import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const db = await mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: '',
  database: 'desruellebis',
})

// GET — stats globales
app.get('/api/stats', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT rating FROM avis")
    const total = rows.length
    const avg = total > 0
      ? (rows.reduce((a, r) => a + parseFloat(r.rating), 0) / total).toFixed(1)
      : '—'
    res.json({ success: true, total, avg })
  } catch (e) {
    console.error(e.message)
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET — avis approuvés
app.get('/api/avis', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM avis WHERE statut = 'approuve' ORDER BY created_at DESC"
    )
    const data = rows.map(r => ({
      ...r,
      name:   r.prenom + ' ' + r.nom.charAt(0).toUpperCase() + '.',
      rating: parseFloat(r.rating),
    }))
    res.json({ success: true, data })
  } catch (e) {
    console.error(e.message)
    res.status(500).json({ success: false, error: e.message })
  }
})

// POST — soumettre un avis
app.post('/api/avis', async (req, res) => {
  try {
    const { prenom, nom, email, location, service, rating, texte } = req.body
    await db.query(
      "INSERT INTO avis (nom, prenom, email, location, service, rating, texte, statut) VALUES (?,?,?,?,?,?,?,'en_attente')",
      [nom, prenom, email, location, service, rating, texte]
    )
    res.json({ success: true })
  } catch (e) {
    console.error(e.message)
    res.status(500).json({ success: false, error: e.message })
  }
})

app.listen(3001, () => console.log('API running on http://localhost:3001'))
