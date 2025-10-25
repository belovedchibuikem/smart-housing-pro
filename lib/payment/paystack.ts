export interface PaystackConfig {
  publicKey: string
  secretKey: string
}

export interface PaystackPaymentData {
  email: string
  amount: number // in kobo (multiply by 100)
  reference?: string
  callback_url?: string
  metadata?: Record<string, any>
}

export interface PaystackResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export class PaystackService {
  private secretKey: string
  private publicKey: string
  private baseUrl = "https://api.paystack.co"

  constructor(config: PaystackConfig) {
    this.secretKey = config.secretKey
    this.publicKey = config.publicKey
  }

  async initializeTransaction(data: PaystackPaymentData): Promise<PaystackResponse> {
    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        amount: data.amount * 100, // Convert to kobo
      }),
    })

    return response.json()
  }

  async verifyTransaction(reference: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    })

    return response.json()
  }

  getPublicKey(): string {
    return this.publicKey
  }
}

// Initialize Paystack service
export const paystackService = new PaystackService({
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  secretKey: process.env.PAYSTACK_SECRET_KEY || "",
})
