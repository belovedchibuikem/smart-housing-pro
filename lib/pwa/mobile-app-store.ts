/** Default Google Play listing for the Smart Housing member app. */
export const DEFAULT_ANDROID_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.smartlogix.smarthousing&pcampaignid=web_share"

export function isMemberDashboardRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/")
}

export function isAndroidPhone(): boolean {
  if (typeof window === "undefined") return false
  const ua = window.navigator.userAgent.toLowerCase()
  return ua.includes("android") && ua.includes("mobile")
}

export function openAndroidPlayStore(url: string = DEFAULT_ANDROID_PLAY_STORE_URL): void {
  window.location.assign(url)
}
