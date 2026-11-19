"use client"

import { useEffect, useState } from "react"
import { isPlatformApexHost } from "@/lib/auth/platform-host"
import { useSaasBranding } from "@/hooks/use-saas-branding"
import { useWhiteLabel } from "@/lib/hooks/use-white-label"
import { useTenant } from "@/lib/tenant/tenant-context"

export type AuthBrand = {
  ready: boolean
  platform: boolean
  siteName: string
  siteTagline: string
  logoUrl: string
  loginBackgroundUrl: string
  homeHref: string
}

/** Platform login uses SaaS branding. A cooperative host uses that cooperative's white label. */
export function useAuthBrand(): AuthBrand {
  const [platform, setPlatform] = useState<boolean | null>(null)
  const { branding, loading: saasLoading } = useSaasBranding()
  const { settings: whiteLabel, loading: whiteLabelLoading } = useWhiteLabel()
  const { tenant, isLoading: tenantLoading } = useTenant()

  useEffect(() => {
    setPlatform(isPlatformApexHost())
  }, [])

  const ready = platform === true ? !saasLoading : platform === false && !whiteLabelLoading && !tenantLoading

  if (platform) {
    return {
      ready,
      platform: true,
      siteName: branding.site_name?.trim() || "Smart Housing",
      siteTagline:
        branding.footer_tagline?.trim() ||
        "The complete platform for housing cooperative management.",
      logoUrl: branding.logo_url || branding.icon_url || "",
      loginBackgroundUrl: "",
      homeHref: "/saas",
    }
  }

  return {
    ready,
    platform: false,
    siteName: whiteLabel?.company_name?.trim() || tenant?.name?.trim() || "Smart Housing",
    siteTagline: whiteLabel?.company_tagline?.trim() || "",
    logoUrl: whiteLabel?.logo_url || whiteLabel?.favicon_url || tenant?.logo_url || "",
    loginBackgroundUrl: whiteLabel?.login_background_url || "",
    homeHref: "/",
  }
}
