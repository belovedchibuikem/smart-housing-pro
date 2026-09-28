import { getAuthToken, meRequest } from "@/lib/api/client"
import { persistCurrentSessionUser } from "@/lib/auth/impersonation"
import type { AuthUser } from "@/lib/auth/types"

/**
 * Re-fetch /auth/me and update localStorage + cookies so sidebar/route gates
 * reflect the latest role and permission assignments.
 */
export async function refreshAuthSession(): Promise<AuthUser | null> {
  if (typeof window === "undefined") return null

  const token = getAuthToken()
  if (!token) return null

  try {
    const res = await meRequest()
    const fresh = res?.user as AuthUser | undefined
    if (!fresh) return null

    persistCurrentSessionUser(fresh, token)
    return fresh
  } catch {
    return null
  }
}
