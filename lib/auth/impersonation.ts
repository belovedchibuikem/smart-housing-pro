import { persistAuthSession } from "@/lib/auth/auth-cookies"

export const IMPERSONATION_TOKEN_KEY = "impersonation_token"
export const IMPERSONATION_USER_KEY = "impersonation_user"
export const PENDING_IMPERSONATION_KEY = "pending_impersonation"

export function isImpersonatingSession(): boolean {
  if (typeof window === "undefined") return false
  try {
    return Boolean(window.sessionStorage.getItem(IMPERSONATION_TOKEN_KEY))
  } catch {
    return false
  }
}

export function getImpersonationToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.sessionStorage.getItem(IMPERSONATION_TOKEN_KEY)
  } catch {
    return null
  }
}

export function getImpersonationUser<T = unknown>(): T | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(IMPERSONATION_USER_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function clearImpersonationSession(): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.removeItem(IMPERSONATION_TOKEN_KEY)
    window.sessionStorage.removeItem(IMPERSONATION_USER_KEY)
    window.localStorage.removeItem(PENDING_IMPERSONATION_KEY)
  } catch {
    // no-op
  }
}

/** Keep an impersonated tab on sessionStorage so the original super-admin tab stays signed in. */
export function persistCurrentSessionUser(user: unknown, token?: string | null): void {
  if (typeof window === "undefined") return
  if (isImpersonatingSession()) {
    window.sessionStorage.setItem(IMPERSONATION_USER_KEY, JSON.stringify(user))
    window.dispatchEvent(new Event("sh-auth-updated"))
    return
  }
  window.localStorage.setItem("user_data", JSON.stringify(user))
  const resolved = token ?? window.localStorage.getItem("auth_token")
  if (resolved) persistAuthSession(user as Parameters<typeof persistAuthSession>[0], resolved)
  window.dispatchEvent(new Event("sh-auth-updated"))
}

export function storePendingImpersonation(token: string, user: unknown): void {
  window.localStorage.setItem(
    PENDING_IMPERSONATION_KEY,
    JSON.stringify({ token, user }),
  )
}

export function consumePendingImpersonation(): boolean {
  if (typeof window === "undefined") return false
  const raw = window.localStorage.getItem(PENDING_IMPERSONATION_KEY)
  if (!raw) return false
  window.localStorage.removeItem(PENDING_IMPERSONATION_KEY)
  let parsed: { token?: string; user?: unknown }
  try {
    parsed = JSON.parse(raw) as { token?: string; user?: unknown }
  } catch {
    return false
  }
  if (!parsed?.token || !parsed.user) return false
  window.sessionStorage.setItem(IMPERSONATION_TOKEN_KEY, parsed.token)
  window.sessionStorage.setItem(IMPERSONATION_USER_KEY, JSON.stringify(parsed.user))
  return true
}
