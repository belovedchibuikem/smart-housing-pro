import { resolveStorageUrl } from "@/lib/api/config"
import type { WhiteLabelSettings } from "@/lib/context/white-label-context"
import { applyPwaMetaTags } from "@/lib/pwa/apply-pwa-meta"

export function applyPublicBranding(settings: WhiteLabelSettings) {
  if (typeof document === "undefined") return

  const root = document.documentElement

  if (settings.is_active) {
    root.style.setProperty("--primary-color", settings.primary_color)
    root.style.setProperty("--secondary-color", settings.secondary_color)
    root.style.setProperty("--accent-color", settings.accent_color)
    root.style.setProperty("--background-color", settings.background_color)
    root.style.setProperty("--text-color", settings.text_color)
    root.style.setProperty("--heading-font", settings.heading_font)
    root.style.setProperty("--body-font", settings.body_font)

    if (settings.custom_css) {
      const styleId = "white-label-custom-css"
      let styleElement = document.getElementById(styleId) as HTMLStyleElement | null
      if (!styleElement) {
        styleElement = document.createElement("style")
        styleElement.id = styleId
        document.head.appendChild(styleElement)
      }
      styleElement.textContent = settings.custom_css
    }
  }

  if (settings.company_name) {
    document.title = settings.company_name
  }

  applyPwaMetaTags(settings)

  const faviconHref = resolveStorageUrl(settings.favicon_url)
  if (faviconHref) {
    let favicon =
      document.querySelector("link[rel='icon']") ||
      document.querySelector("link[rel='shortcut icon']")

    if (!favicon) {
      favicon = document.createElement("link")
      favicon.setAttribute("rel", "icon")
      document.head.appendChild(favicon)
    }

    favicon.setAttribute("href", faviconHref)
  }
}
