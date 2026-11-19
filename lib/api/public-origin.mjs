/**
 * Production Laravel host from the Cloudflare worker variables.
 * API and storage are served under /public on this host.
 * Local `next dev` keeps .env.local (http://127.0.0.1:8000/api).
 */
export const PRODUCTION_API_BASE = "https://smarthousing.katakarra.com/public/api"
export const PRODUCTION_API_ORIGIN = "https://smarthousing.katakarra.com/public"
export const PRODUCTION_STORAGE_URL = "https://smarthousing.katakarra.com/public/storage"

export function isLocalHost(value) {
  return /localhost|127\.0\.0\.1/i.test(String(value || ""))
}

function trimSlash(value) {
  return String(value || "").replace(/\/$/, "")
}

/** Drop a trailing /api. Keeps /public so /public/api stays /public. */
function stripApiSuffix(value) {
  return trimSlash(value).replace(/\/api$/, "")
}

function preferRemote(value, production) {
  const trimmed = trimSlash(value)
  if (!trimmed) return ""
  if (production && isLocalHost(trimmed)) return ""
  return trimmed
}

/**
 * Laravel root the app appends /api and /storage onto.
 * https://smarthousing.katakarra.com/public/api → https://smarthousing.katakarra.com/public
 */
export function resolveLaravelOrigin() {
  const production = process.env.NODE_ENV === "production"
  const fromUrl = preferRemote(stripApiSuffix(process.env.NEXT_PUBLIC_API_URL), production)
  const fromBase = preferRemote(stripApiSuffix(process.env.NEXT_PUBLIC_API_BASE_URL), production)
  const candidate = fromUrl || fromBase
  if (candidate) return candidate
  if (!production) return "http://127.0.0.1:8000"
  return PRODUCTION_API_ORIGIN
}

/** Full Laravel API prefix, for server fetches and the Next /api rewrite. */
export function resolveLaravelApiBase() {
  const production = process.env.NODE_ENV === "production"
  const explicit = preferRemote(process.env.NEXT_PUBLIC_API_BASE_URL, production)
  if (explicit) return explicit
  if (!production) return "http://127.0.0.1:8000/api"
  return PRODUCTION_API_BASE
}

/** Public disk base. Prefers NEXT_PUBLIC_STORAGE_URL, then origin + /public + /storage. */
export function resolveStorageBase() {
  const production = process.env.NODE_ENV === "production"
  const explicit = preferRemote(process.env.NEXT_PUBLIC_STORAGE_URL, production)
  if (explicit) return explicit

  const prefix = String(
    process.env.NEXT_PUBLIC_PUBLIC_PATH_PREFIX || process.env.NEXT_PUBLIC_PUBLIC_PATH || "",
  ).replace(/^\/+|\/+$/g, "")
  const origin = resolveLaravelOrigin()
  if (prefix && !origin.endsWith(`/${prefix}`)) {
    return `${origin}/${prefix}/storage`
  }
  return `${origin}/storage`
}
