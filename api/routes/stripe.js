import { Router } from 'express'
import Stripe from 'stripe'
import db from '../db.js'
import { authenticateJWT, requireRole } from '../middleware/auth.js'

const router = Router()

// POST /api/stripe/create-payment-intent — Client initie le paiement
router.post('/create-payment-intent', authenticateJWT, requireRole('client'), async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { devis_id } = req.body

    const [rows] = await db.query('SELECT * FROM devis WHERE id=? AND client_id=?', [devis_id, req.user.id])
    if (!rows.length) return res.status(404).json({ success: false, error: 'Devis introuvable' })
    if (rows[0].statut !== 'accepte_client') {
      return res.status(400).json({ success: false, error: 'Devis non accepté' })
    }

    const montantCentimes = Math.round(parseFloat(rows[0].prix) * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: montantCentimes,
      currency: 'eur',
      capture_method: 'manual', // Paiement mis en attente
      metadata: {
        devis_id: String(devis_id),
        client_id: String(req.user.id),
        client_email: req.user.email,
      },
    })

    res.json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id })
  } catch (e) {
    console.error(e)
    res.status(500).json({ success: false, error: e.message })
  }
})

// POST /api/stripe/webhook — Stripe webhook
router.post('/webhook', async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    await db.query(
      "UPDATE interventions SET stripe_statut='en_attente' WHERE stripe_payment_intent_id=?",
      [pi.id]
    )
  }

  res.json({ received: true })
})

export default router
