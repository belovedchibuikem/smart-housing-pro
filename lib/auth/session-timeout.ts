const SESSION_TIMEOUT_KEY = "session_timeout"
const LAST_ACTIVITY_KEY = "sh_last_activity_at"

export const DEFAULT_SESSION_TIMEOUT_MINUTES = 30
export const MIN_SESSION_TIMEOUT_MINUTES = 5
export const MAX_SESSION_TIMEOUT_MINUTES = 480
export const IDLE_WARNING_SECONDS = 60

export function clampSessionTimeoutMinutes(minutes: number): number {
	if (!Number.isFinite(minutes) || minutes <= 0) {
		return DEFAULT_SESSION_TIMEOUT_MINUTES
	}
	return Math.max(
		MIN_SESSION_TIMEOUT_MINUTES,
		Math.min(MAX_SESSION_TIMEOUT_MINUTES, Math.floor(minutes))
	)
}

export function persistSessionTimeout(minutes: number | null | undefined): void {
	if (typeof window === "undefined") return
	try {
		const value = clampSessionTimeoutMinutes(
			typeof minutes === "number" ? minutes : DEFAULT_SESSION_TIMEOUT_MINUTES
		)
		window.localStorage.setItem(SESSION_TIMEOUT_KEY, String(value))
	} catch {
		// no-op
	}
}

export function getSessionTimeoutMinutes(): number {
	if (typeof window === "undefined") return DEFAULT_SESSION_TIMEOUT_MINUTES
	try {
		const raw = window.localStorage.getItem(SESSION_TIMEOUT_KEY)
		if (!raw) return DEFAULT_SESSION_TIMEOUT_MINUTES
		return clampSessionTimeoutMinutes(parseInt(raw, 10))
	} catch {
		return DEFAULT_SESSION_TIMEOUT_MINUTES
	}
}

export function clearSessionTimeout(): void {
	if (typeof window === "undefined") return
	try {
		window.localStorage.removeItem(SESSION_TIMEOUT_KEY)
		window.sessionStorage.removeItem(LAST_ACTIVITY_KEY)
	} catch {
		// no-op
	}
}

export function touchSessionActivity(at: number = Date.now()): void {
	if (typeof window === "undefined") return
	try {
		window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(at))
		window.dispatchEvent(
			new CustomEvent("sh-session-activity", { detail: { at } })
		)
	} catch {
		// no-op
	}
}

export function getLastActivityAt(): number {
	if (typeof window === "undefined") return Date.now()
	try {
		const raw = window.sessionStorage.getItem(LAST_ACTIVITY_KEY)
		const parsed = raw ? parseInt(raw, 10) : NaN
		if (!Number.isFinite(parsed) || parsed <= 0) {
			const now = Date.now()
			window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now))
			return now
		}
		return parsed
	} catch {
		return Date.now()
	}
}
