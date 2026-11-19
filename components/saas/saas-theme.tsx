"use client"

import { useEffect } from "react"
import { applyBrandColorVariables } from "@/lib/branding/brand-colors"
import { isPlatformApexHost } from "@/lib/auth/platform-host"
import { useSaasBranding } from "@/hooks/use-saas-branding"

/** Applies the platform color palette on the SaaS site and super-admin dashboard. */
export function SaasTheme() {
  const { branding } = useSaasBranding()

  useEffect(() => {
    if (!isPlatformApexHost()) return
    applyBrandColorVariables(document.documentElement, {
      primary: branding.primary_color,
      secondary: branding.secondary_color,
      accent: branding.accent_color,
      background: branding.background_color,
      text: branding.text_color,
    })
  }, [branding])

  return null
}
