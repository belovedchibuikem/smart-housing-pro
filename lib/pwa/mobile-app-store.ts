/** Default Google Play listing for the Smart Housing member app. */
export const DEFAULT_ANDROID_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.smartlogix.smarthousing&pcampaignid=web_share"

/** Routes where install prompts are disabled (platform admin / marketing). */
export function isInstallPromptRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return true
  if (pathname.startsWith("/super-admin")) return false
  if (pathname.startsWith("/saas")) return false
  return true
}

export function isAndroidDevice(): boolean {
  if (typeof window === "undefined") return false
  return /android/i.test(window.navigator.userAgent)
}

/** Desktop browsers eligible for PWA install (not Android / iOS mobile). */
export function isDesktopBrowser(): boolean {
  if (typeof window === "undefined") return false
  const ua = window.navigator.userAgent.toLowerCase()
  if (ua.includes("android")) return false
  if (/iphone|ipad|ipod/i.test(ua)) return false
  // Phones using mobile UA on uncommon desktop browsers are excluded from PWA prompt.
  if (ua.includes("mobile") && !ua.includes("ipad")) return false
  return true
}

export function openAndroidPlayStore(url: string = DEFAULT_ANDROID_PLAY_STORE_URL): void {
  window.location.assign(url)
}
