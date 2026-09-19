const PENDING_KEY = "pending_gateway_subscription"

export type PendingGatewayPayment = {
	reference: string
	provider: string
	successPath: string
}

export function rememberPendingGatewayPayment(payload: PendingGatewayPayment): void {
	if (typeof window === "undefined") return
	try {
		window.sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload))
	} catch {
		// ignore storage failures
	}
}

export function readPendingGatewayPayment(): PendingGatewayPayment | null {
	if (typeof window === "undefined") return null
	try {
		const raw = window.sessionStorage.getItem(PENDING_KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as PendingGatewayPayment
		if (!parsed?.reference) return null
		return parsed
	} catch {
		return null
	}
}

export function clearPendingGatewayPayment(): void {
	if (typeof window === "undefined") return
	try {
		window.sessionStorage.removeItem(PENDING_KEY)
	} catch {
		// ignore
	}
}

export function gatewayPaymentUrl(response: { payment_url?: string | null; paymentUrl?: string | null }): string | null {
	const url = response.payment_url || response.paymentUrl
	return url && url.trim() ? url : null
}

export const GATEWAY_PAYMENT_MESSAGE = "smart-housing-gateway-complete"

/**
 * Open the hosted gateway in a popup when possible, otherwise full-page redirect.
 * Returns the popup window, or "redirect" when the current tab navigated away.
 */
export function launchGatewayCheckout(paymentUrl: string): Window | "redirect" {
	if (typeof window === "undefined") return "redirect"

	try {
		const popup = window.open(
			paymentUrl,
			"smart_housing_gateway",
			"width=520,height=720,scrollbars=yes,resizable=yes"
		)
		if (popup && !popup.closed) {
			try {
				popup.focus()
			} catch {
				// ignore
			}
			return popup
		}
	} catch {
		// popup blocked
	}

	window.location.href = paymentUrl
	return "redirect"
}

export async function verifyWithRetries<T extends { success?: boolean }>(
	verify: () => Promise<T>,
	attempts = 5,
	delayMs = 2000
): Promise<T> {
	let last: T | null = null
	for (let i = 0; i < attempts; i += 1) {
		try {
			last = await verify()
			if (last?.success) return last
		} catch (error) {
			if (i === attempts - 1) throw error
		}
		if (i < attempts - 1) {
			await new Promise((resolve) => setTimeout(resolve, delayMs))
		}
	}
	return last as T
}
