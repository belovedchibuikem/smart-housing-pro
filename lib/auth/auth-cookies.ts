/**
 * Mirrors localStorage auth for Next.js middleware (Edge) and full page loads.
 * Permission slugs are comma-separated (names never contain commas).
 */

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export const AUTH_COOKIE = {
  TOKEN: "sh_auth_token",
  PERMISSIONS: "sh_permissions",
  ROLE_SLUG: "sh_role_slug",
} as const

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}

export type SessionUserLike = {
  permissions?: string[]
  role?: string | { slug?: string }
  roles?: string[]
}

export function persistAuthSession(user: SessionUserLike | null | undefined, token: string | null) {
  if (typeof window === "undefined") return
  if (!user || !token) {
    clearAuthCookies()
    return
  }
  const perms = Array.isArray(user.permissions) ? user.permissions : []
  const slug =
    typeof user.role === "object" && user.role?.slug
      ? user.role.slug
      : typeof user.role === "string"
        ? user.role
        : user.roles?.[0] ?? ""

  setCookie(AUTH_COOKIE.TOKEN, token, COOKIE_MAX_AGE)
  setCookie(AUTH_COOKIE.PERMISSIONS, perms.join(","), COOKIE_MAX_AGE)
  setCookie(AUTH_COOKIE.ROLE_SLUG, slug, COOKIE_MAX_AGE)
}

export function persistAuthSessionFromStorage() {
  if (typeof window === "undefined") return
  try {
    const token = window.localStorage.getItem("auth_token")
    const raw = window.localStorage.getItem("user_data")
    if (!token || !raw) {
      clearAuthCookies()
      return
    }
    const user = JSON.parse(raw) as SessionUserLike
    persistAuthSession(user, token)
  } catch {
    clearAuthCookies()
  }
}

export function clearAuthCookies() {
  deleteCookie(AUTH_COOKIE.TOKEN)
  deleteCookie(AUTH_COOKIE.PERMISSIONS)
  deleteCookie(AUTH_COOKIE.ROLE_SLUG)
}
