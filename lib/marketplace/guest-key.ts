const STORAGE_KEY = "sh_guest_key"

export function getGuestKey(): string {
  if (typeof window === "undefined") return "guest:ssr"
  try {
    let key = localStorage.getItem(STORAGE_KEY)
    if (!key) {
      key = `g_${crypto.randomUUID?.() ?? Date.now()}`
      localStorage.setItem(STORAGE_KEY, key)
    }
    return key
  } catch {
    return `guest:${Date.now()}`
  }
}

export function guestHeaders(): HeadersInit {
  return { "X-Guest-Key": getGuestKey() }
}
