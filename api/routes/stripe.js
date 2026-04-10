import { Router } from 'express'
import db from '../db.js'
import { authenticateJWT, requireRole } from '../middleware/auth.js'
import { getStripeClient, getWebhookSecret } from '../helpers/stripeClient.js'

const router = Router()

// POST /api/stripe/create-payment-intent — Client initie le paiement
router.post('/create-payment-intent', authenticateJWT, requireRole('client'), async (req, res) => {
  try {
    const stripe = await getStripeClient()
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
      capture_method: 'manual', // Paiement mis en attente, capturé au début de l'intervention
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
  try {
    const stripe = await getStripeClient()
    const sig = req.headers['stripe-signature']
    const webhookSecret = getWebhookSecret()

    let event
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Logique métier selon le type d'événement
    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.amount_capturable_updated': {
        const pi = event.data.object
        await db.query(
          "UPDATE interventions SET stripe_statut='capture' WHERE stripe_payment_intent_id=?",
          [pi.id]
        )
        console.log(`PaymentIntent ${pi.id} succeeded or updated.`)
        break
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object
        await db.query(
          "UPDATE interventions SET stripe_statut='en_attente' WHERE stripe_payment_intent_id=?",
          [pi.id]
        )
        console.log(`PaymentIntent ${pi.id} failed.`)
        break
      }
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })
  } catch (e) {
    console.error('Webhook processing error:', e.message)
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
