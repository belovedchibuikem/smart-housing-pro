"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { isPlatformApexHost } from "@/lib/auth/platform-host"

export type SaasBranding = {
  site_name: string
  logo_url: string | null
  icon_url: string | null
  footer_tagline: string | null
  cta_button_text: string
  navigation_links: Array<{ href: string; label: string }>
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
}

export const DEFAULT_SAAS_BRANDING: SaasBranding = {
  site_name: "Smart Housing",
  logo_url: null,
  icon_url: null,
  footer_tagline: "The complete platform for housing cooperative management.",
  cta_button_text: "Start Free Trial",
  navigation_links: [],
  primary_color: "#FDB11E",
  secondary_color: "#276254",
  accent_color: "#10b981",
  background_color: "#ffffff",
  text_color: "#1f2937",
}

export function useSaasBranding() {
  const pathname = usePathname()
  const [branding, setBranding] = useState<SaasBranding>(DEFAULT_SAAS_BRANDING)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPlatformApexHost()) {
      setLoading(false)
      return
    }

    let cancelled = false
    const endpoint = pathname.startsWith("/super-admin")
      ? "/super-admin/saas-branding"
      : "/public/saas/branding"

    const load = () => {
      apiFetch<{ success: boolean; branding?: Partial<SaasBranding>; header?: Partial<SaasBranding> }>(
        endpoint,
      )
        .then((res) => {
          if (cancelled) return
          const data = res.branding ?? res.header
          if (res.success && data) {
            setBranding({ ...DEFAULT_SAAS_BRANDING, ...data })
          }
        })
        .catch(() => {
          if (!cancelled) setBranding(DEFAULT_SAAS_BRANDING)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    load()
    const onUpdate = () => load()
    window.addEventListener("saas-branding-updated", onUpdate)
    return () => {
      cancelled = true
      window.removeEventListener("saas-branding-updated", onUpdate)
    }
  }, [pathname])

  return { branding, loading }
}
