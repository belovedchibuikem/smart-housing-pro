"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"

export type SaasBranding = {
  site_name: string
  logo_url: string | null
  icon_url: string | null
  footer_tagline: string | null
  cta_button_text: string
  navigation_links: Array<{ href: string; label: string }>
}

const DEFAULT_BRANDING: SaasBranding = {
  site_name: "Smart Housing",
  logo_url: null,
  icon_url: null,
  footer_tagline: "The complete platform for housing cooperative management.",
  cta_button_text: "Start Free Trial",
  navigation_links: [],
}

export function useSaasBranding() {
  const [branding, setBranding] = useState<SaasBranding>(DEFAULT_BRANDING)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetch<{ success: boolean; branding?: SaasBranding; header?: SaasBranding }>(
      "/public/saas/branding",
    )
      .then((res) => {
        if (cancelled) return
        const data = res.branding ?? res.header
        if (res.success && data) {
          setBranding({ ...DEFAULT_BRANDING, ...data })
        }
      })
      .catch(() => {
        if (!cancelled) setBranding(DEFAULT_BRANDING)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { branding, loading }
}
