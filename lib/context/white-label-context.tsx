"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { applyPublicBranding } from "@/lib/branding/apply-public-branding"
import { useTenant } from "@/lib/tenant/tenant-context"

export interface WhiteLabelSettings {
  company_name: string
  company_tagline: string
  company_description?: string
  logo_url: string
  logo_dark_url: string
  favicon_url: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  heading_font: string
  body_font: string
  enabled_modules: string[]
  custom_css: string
  is_active: boolean
  footer_text?: string
  privacy_url?: string
  terms_url?: string
  support_email?: string
  support_phone?: string
  help_center_url?: string
}

export interface WhiteLabelContextType {
  settings: WhiteLabelSettings | null
  loading: boolean
  refreshSettings: () => Promise<void>
}

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined)

const defaultSettings: WhiteLabelSettings = {
  company_name: "FRSC Housing Management",
  company_tagline: "Building Dreams Together",
  company_description: "",
  logo_url: "",
  logo_dark_url: "",
  favicon_url: "",
  primary_color: "#3b82f6",
  secondary_color: "#8b5cf6",
  accent_color: "#10b981",
  background_color: "#ffffff",
  text_color: "#1f2937",
  heading_font: "Inter",
  body_font: "Inter",
  enabled_modules: ["properties", "loans", "investments", "contributions", "wallet"],
  custom_css: "",
  is_active: false,
}

async function fetchPublicWhiteLabelSettings(): Promise<WhiteLabelSettings | null> {
  // On the SaaS apex, use platform defaults — do not proxy cooperative white-label.
  const { isPlatformApexHost } = await import("@/lib/auth/platform-host")
  if (isPlatformApexHost()) {
    return {
      ...defaultSettings,
      company_name: "Smart Housing",
      company_tagline: "Housing cooperatives, managed better",
      is_active: true,
    }
  }

  const response = await fetch("/api/public/white-label", {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  return data.settings ?? null
}

export function WhiteLabelProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WhiteLabelSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { tenant, isLoading: tenantLoading } = useTenant()

  const fetchSettings = async () => {
    try {
      const apiSettings = await fetchPublicWhiteLabelSettings()

      if (apiSettings) {
        setSettings(apiSettings)
        applyPublicBranding(apiSettings)
      } else {
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error("Error fetching white label settings:", error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tenantLoading) return
    fetchSettings()

    const handleSettingsUpdate = () => {
      fetchSettings()
    }

    window.addEventListener("white-label-settings-updated", handleSettingsUpdate)

    return () => {
      window.removeEventListener("white-label-settings-updated", handleSettingsUpdate)
    }
  }, [tenantLoading, tenant?.id, tenant?.slug])

  const refreshSettings = async () => {
    setLoading(true)
    await fetchSettings()
  }

  return (
    <WhiteLabelContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </WhiteLabelContext.Provider>
  )
}

export function useWhiteLabel() {
  const context = useContext(WhiteLabelContext)
  if (context === undefined) {
    throw new Error("useWhiteLabel must be used within a WhiteLabelProvider")
  }
  return context
}
