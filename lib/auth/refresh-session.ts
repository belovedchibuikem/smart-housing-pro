import { meRequest } from "@/lib/api/client"
import { persistAuthSession } from "@/lib/auth/auth-cookies"
import type { AuthUser } from "@/lib/auth/types"

/**
 * Re-fetch /auth/me and update localStorage + cookies so sidebar/route gates
 * reflect the latest role and permission assignments.
 */
export async function refreshAuthSession(): Promise<AuthUser | null> {
  if (typeof window === "undefined") return null

  const token = window.localStorage.getItem("auth_token")
  if (!token) return null

  try {
    const res = await meRequest()
    const fresh = res?.user as AuthUser | undefined
    if (!fresh) return null

    window.localStorage.setItem("user_data", JSON.stringify(fresh))
    persistAuthSession(fresh, token)
    window.dispatchEvent(new Event("sh-auth-updated"))
    return fresh
  } catch {
    return null
  }
}
