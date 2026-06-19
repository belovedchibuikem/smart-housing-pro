"use client"

import { resolveStorageUrl } from "@/lib/api/config"
import type { WhiteLabelSettings } from "@/lib/context/white-label-context"

function upsertMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement("meta")
    element.setAttribute("name", name)
    document.head.appendChild(element)
  }
  element.setAttribute("content", content)
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = extra?.sizes
    ? `link[rel="${rel}"][sizes="${extra.sizes}"]`
    : `link[rel="${rel}"]`

  let element = document.querySelector(selector) as HTMLLinkElement | null
  if (!element) {
    element = document.createElement("link")
    element.setAttribute("rel", rel)
    if (extra?.sizes) element.setAttribute("sizes", extra.sizes)
    document.head.appendChild(element)
  }
  element.setAttribute("href", href)
}

export function applyPwaMetaTags(settings: WhiteLabelSettings | null, fallbackThemeColor = "#276254") {
  if (typeof document === "undefined") return

  const companyName = settings?.company_name || "Smart Housing"
  const themeColor = settings?.primary_color || fallbackThemeColor
  const favicon = resolveStorageUrl(settings?.favicon_url)
  const logo = resolveStorageUrl(settings?.logo_url)
  const iconHref = favicon || logo || "/branding/smarthousing-icon.svg"

  document.title = companyName

  upsertMeta("application-name", companyName)
  upsertMeta("apple-mobile-web-app-title", companyName)
  upsertMeta("theme-color", themeColor)
  upsertMeta("mobile-web-app-capable", "yes")
  upsertMeta("apple-mobile-web-app-capable", "yes")
  upsertMeta("apple-mobile-web-app-status-bar-style", "default")
  upsertMeta("format-detection", "telephone=no")

  upsertLink("manifest", "/manifest.webmanifest")
  upsertLink("icon", iconHref)
  upsertLink("apple-touch-icon", iconHref, { sizes: "180x180" })
}
