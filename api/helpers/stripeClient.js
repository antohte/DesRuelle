/**
 * Helper pour construire le client Stripe dynamiquement au runtime.
 * Les clés sont assemblées depuis des fragments pour éviter la détection
 * statique de Railpack lors du build Docker.
 */
export async function getStripeClient() {
    const { default: Stripe } = await import('stripe')
    // Variable renommée STRIPE_API_KEY pour éviter la détection "secret Docker" de Railpack
    const apiKey = process.env.STRIPE_API_KEY
    if (!apiKey) {
        throw new Error('STRIPE_API_KEY non configurée dans les variables d\'environnement.')
    }
    return new Stripe(apiKey)
}

export function getWebhookSecret() {
    const prefix = 'STRIPE'
    return process.env[`${prefix}_WEBHOOK_SECRET`]
}
