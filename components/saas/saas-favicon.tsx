"use client"

import { useEffect } from "react"
import { useSaasBranding } from "@/hooks/use-saas-branding"
import { resolveStorageUrl } from "@/lib/api/config"

/** Sets document favicon from SaaS branding icon when available. */
export function SaasFavicon() {
  const { branding } = useSaasBranding()

  useEffect(() => {
    if (!branding.icon_url) return
    const href = resolveStorageUrl(branding.icon_url)
    if (!href) return

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (!link) {
      link = document.createElement("link")
      link.rel = "icon"
      document.head.appendChild(link)
    }
    link.href = href
    link.type = "image/png"
  }, [branding.icon_url])

  return null
}
