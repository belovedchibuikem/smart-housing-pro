export interface RemitaConfig {
  merchantId: string
  apiKey: string
  serviceTypeId: string
}

export interface RemitaPaymentData {
  amount: number
  payerName: string
  payerEmail: string
  payerPhone: string
  description: string
  orderId?: string
}

export interface RemitaResponse {
  statuscode: string
  RRR: string
  status: string
}

export class RemitaService {
  private merchantId: string
  private apiKey: string
  private serviceTypeId: string
  private baseUrl = "https://remitademo.net/remita" // Use production URL in production

  constructor(config: RemitaConfig) {
    this.merchantId = config.merchantId
    this.apiKey = config.apiKey
    this.serviceTypeId = config.serviceTypeId
  }

  async generateRRR(data: RemitaPaymentData): Promise<RemitaResponse> {
    const orderId = data.orderId || `ORD-${Date.now()}`

    const payload = {
      serviceTypeId: this.serviceTypeId,
      amount: data.amount,
      orderId,
      payerName: data.payerName,
      payerEmail: data.payerEmail,
      payerPhone: data.payerPhone,
      description: data.description,
    }

    const response = await fetch(`${this.baseUrl}/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `remitaConsumerKey=${this.merchantId},remitaConsumerToken=${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    return response.json()
  }

  async verifyPayment(rrr: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/exapp/api/v1/send/api/echannelsvc/${this.merchantId}/${rrr}/${this.apiKey}/status.reg`,
      {
        method: "GET",
      },
    )

    return response.json()
  }

  getMerchantId(): string {
    return this.merchantId
  }
}

// Initialize Remita service
export const remitaService = new RemitaService({
  merchantId: process.env.REMITA_MERCHANT_ID || "",
  apiKey: process.env.REMITA_API_KEY || "",
  serviceTypeId: process.env.REMITA_SERVICE_TYPE_ID || "",
})
