import { Router } from 'express'
import db from '../db.js'
import { authenticateJWT, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(authenticateJWT)

// ── Horaires de travail par défaut ────────────────────────────
// Lundi-Vendredi, 8h-17h, pause 12h-13h
const HEURE_DEBUT = 8
const HEURE_FIN   = 17
const PAUSE_DEBUT = 12
const PAUSE_FIN   = 13

/**
 * Vérifie qu'un créneau est dans les horaires de travail.
 * Retourne un message d'erreur ou null si ok.
 */
function verifierHoraires(dateDebut, dateFin) {
  const debut = new Date(dateDebut)
  const fin   = new Date(dateFin)

  // Jour de la semaine (0=dim, 6=sam)
  const jourDebut = debut.getDay()
  const jourFin   = fin.getDay()

  if (jourDebut === 0 || jourDebut === 6) return 'Le service ne peut pas débuter un week-end.'
  if (jourFin === 0 || jourFin === 6)     return 'Le service ne peut pas se terminer un week-end.'

  const hDebut = debut.getHours() + debut.getMinutes() / 60
  const hFin   = fin.getHours()   + fin.getMinutes()   / 60

  if (hDebut < HEURE_DEBUT) return `Le service ne peut pas commencer avant ${HEURE_DEBUT}h.`
  if (hFin   > HEURE_FIN)   return `Le service ne peut pas se terminer après ${HEURE_FIN}h.`

  // Chevauchement avec la pause déjeuner
  if (hDebut < PAUSE_FIN && hFin > PAUSE_DEBUT) {
    return `Le créneau chevauche la pause déjeuner (${PAUSE_DEBUT}h-${PAUSE_FIN}h).`
  }

  return null
}

// GET /api/techniciens/disponibles?date_debut=&date_fin=
router.get('/disponibles', requireRole('responsable'), async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query
    if (!date_debut || !date_fin) {
      return res.status(400).json({ success: false, error: 'date_debut et date_fin requis' })
    }

    const errHoraire = verifierHoraires(date_debut, date_fin)
    if (errHoraire) return res.status(400).json({ success: false, error: errHoraire })

    // Techniciens occupés par une intervention qui chevauche ce créneau
    const [occupes] = await db.query(
      `SELECT DISTINCT it.technicien_id
       FROM intervention_techniciens it
       JOIN interventions i ON i.id = it.intervention_id
       WHERE it.statut != 'annule'
         AND i.statut NOT IN ('annule','termine')
         AND i.date_debut < ? AND i.date_fin > ?`,
      [date_fin, date_debut]
    )

    // Techniciens avec indisponibilité déclarée qui chevauche ce créneau
    const [indispos] = await db.query(
      `SELECT DISTINCT technicien_id
       FROM disponibilites_techniciens
       WHERE date_debut < ? AND date_fin > ?`,
      [date_fin, date_debut]
    )

    const tousOccupes = [...new Set([...occupes.map(r => r.technicien_id), ...indispos.map(r => r.technicien_id)])]

    let q = "SELECT id, prenom, nom, email, telephone FROM users WHERE role='technicien' AND actif=1"
    const params = []
    if (tousOccupes.length) {
      q += ` AND id NOT IN (${tousOccupes.map(() => '?').join(',')})`
      params.push(...tousOccupes)
    }
    q += ' ORDER BY prenom, nom'

    const [libres] = await db.query(q, params)
    res.json({ success: true, data: libres })
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/techniciens/creneaux-disponibles?nb=&date_debut=&date_fin=
router.get('/creneaux-disponibles', async (req, res) => {
  try {
    const { date_debut, date_fin, nb } = req.query
    if (!date_debut || !date_fin || !nb) {
      return res.status(400).json({ success: false, error: 'Paramètres manquants' })
    }

    // Hors horaires → créneau indisponible
    const errHoraire = verifierHoraires(date_debut, date_fin)
    if (errHoraire) return res.json({ success: true, disponible: false, nb_libres: 0, raison: errHoraire })

    const nbNecessaire = parseInt(nb)

    const [occupes] = await db.query(
      `SELECT DISTINCT it.technicien_id
       FROM intervention_techniciens it
       JOIN interventions i ON i.id = it.intervention_id
       WHERE it.statut != 'annule'
         AND i.statut NOT IN ('annule','termine')
         AND i.date_debut < ? AND i.date_fin > ?`,
      [date_fin, date_debut]
    )
    const [indispos] = await db.query(
      `SELECT DISTINCT technicien_id FROM disponibilites_techniciens
       WHERE date_debut < ? AND date_fin > ?`,
      [date_fin, date_debut]
    )
    const tousOccupes = [...new Set([...occupes.map(r => r.technicien_id), ...indispos.map(r => r.technicien_id)])]

    let q = "SELECT COUNT(*) as nb FROM users WHERE role='technicien' AND actif=1"
    const params = []
    if (tousOccupes.length) {
      q += ` AND id NOT IN (${tousOccupes.map(() => '?').join(',')})`
      params.push(...tousOccupes)
    }
    const [[{ nb: nbLibres }]] = await db.query(q, params)

    res.json({ success: true, disponible: nbLibres >= nbNecessaire, nb_libres: nbLibres })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/techniciens/indisponibilites — Liste des indisponibilités (responsable)
router.get('/indisponibilites', requireRole('responsable'), async (req, res) => {
  try {
    const { technicien_id } = req.query
    let q = `SELECT d.*, u.prenom, u.nom
             FROM disponibilites_techniciens d
             JOIN users u ON u.id = d.technicien_id
             WHERE 1=1`
    const params = []
    if (technicien_id) { q += ' AND d.technicien_id = ?'; params.push(technicien_id) }
    q += ' ORDER BY d.date_debut DESC'
    const [rows] = await db.query(q, params)
    res.json({ success: true, data: rows })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// POST /api/techniciens/indisponibilite — Responsable ou technicien déclare une indisponibilité
router.post('/indisponibilite', async (req, res) => {
  try {
    if (!['technicien', 'responsable'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }
    const { technicien_id, date_debut, date_fin, type, note } = req.body
    if (!date_debut || !date_fin) {
      return res.status(400).json({ success: false, error: 'Dates requises' })
    }

    // Le responsable peut déclarer pour n'importe quel technicien
    // Le technicien ne peut déclarer que pour lui-même
    const cibleId = req.user.role === 'responsable' && technicien_id
      ? technicien_id
      : req.user.id

    if (req.user.role === 'technicien' && cibleId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }

    await db.query(
      'INSERT INTO disponibilites_techniciens (technicien_id, date_debut, date_fin, type, note) VALUES (?,?,?,?,?)',
      [cibleId, date_debut, date_fin, type || 'indisponible', note || null]
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// DELETE /api/techniciens/indisponibilite/:id — Supprimer une indisponibilité
router.delete('/indisponibilite/:id', async (req, res) => {
  try {
    if (!['technicien', 'responsable'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }
    const [rows] = await db.query('SELECT * FROM disponibilites_techniciens WHERE id=?', [req.params.id])
    if (!rows.length) return res.status(404).json({ success: false, error: 'Introuvable' })

    if (req.user.role === 'technicien' && rows[0].technicien_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Accès refusé' })
    }
    await db.query('DELETE FROM disponibilites_techniciens WHERE id=?', [req.params.id])
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// GET /api/techniciens/liste — Liste tous les techniciens (responsable)
router.get('/liste', requireRole('responsable'), async (_req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, prenom, nom, email, telephone FROM users WHERE role='technicien' AND actif=1 ORDER BY prenom, nom"
    )
    res.json({ success: true, data: rows })
  } catch (e) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
