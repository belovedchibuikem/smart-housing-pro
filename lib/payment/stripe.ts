export interface StripeConfig {
  publishableKey: string
  secretKey: string
}

export interface StripePaymentData {
  amount: number // in cents
  currency: string
  description?: string
  metadata?: Record<string, any>
}

export class StripeService {
  private secretKey: string
  private publishableKey: string

  constructor(config: StripeConfig) {
    this.secretKey = config.secretKey
    this.publishableKey = config.publishableKey
  }

  async createPaymentIntent(data: StripePaymentData): Promise<any> {
    // This would use the Stripe SDK in production
    // For now, we'll return a mock response
    return {
      id: `pi_${Date.now()}`,
      client_secret: `secret_${Date.now()}`,
      amount: data.amount,
      currency: data.currency,
      status: "requires_payment_method",
    }
  }

  async createSubscription(customerId: string, priceId: string): Promise<any> {
    // This would use the Stripe SDK in production
    return {
      id: `sub_${Date.now()}`,
      customer: customerId,
      status: "active",
    }
  }

  getPublishableKey(): string {
    return this.publishableKey
  }
}

// Initialize Stripe service
export const stripeService = new StripeService({
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  secretKey: process.env.STRIPE_SECRET_KEY || "",
})
