"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { isPlatformApexHost, isPlatformSuperAdminSession } from "@/lib/auth/platform-host"

interface TenantSettings {
  site_name?: string
  site_email?: string
  support_email?: string
  default_currency?: string
  timezone?: string
  maintenance_mode?: boolean
  allow_registration?: boolean
  require_email_verification?: boolean
  [key: string]: any
}

interface TenantSettingsContextType {
  settings: TenantSettings | null
  loading: boolean
  refreshSettings: () => Promise<void>
  getSetting: (key: string, defaultValue?: any) => any
}

const TenantSettingsContext = createContext<TenantSettingsContextType | undefined>(undefined)

const defaultSettings: TenantSettings = {
  site_name: "Smart Housing",
  site_email: "",
  support_email: "",
  default_currency: "NGN",
  timezone: "Africa/Lagos",
  maintenance_mode: false,
  allow_registration: true,
  require_email_verification: true,
}

const platformSettings: TenantSettings = {
  ...defaultSettings,
  site_name: "Smart Housing",
  allow_registration: false,
}

export function TenantSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TenantSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      // Platform apex / super-admin must not hit cooperative /admin/settings
      // (that 401 was wiping the SuperAdmin session after a successful login).
      if (isPlatformApexHost() || isPlatformSuperAdminSession()) {
        setSettings(platformSettings)
        return
      }

      const { apiFetch } = await import("@/lib/api/client")
      const data = await apiFetch<{ success: boolean; settings: TenantSettings }>("/admin/settings")

      if (data.success && data.settings) {
        setSettings(data.settings)
      } else {
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error("Error fetching cooperative settings:", error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchSettings()

    const handleSettingsUpdate = () => {
      void fetchSettings()
    }

    window.addEventListener("tenant-settings-updated", handleSettingsUpdate)

    return () => {
      window.removeEventListener("tenant-settings-updated", handleSettingsUpdate)
    }
  }, [])

  const refreshSettings = async () => {
    setLoading(true)
    await fetchSettings()
  }

  const getSetting = (key: string, defaultValue?: any) => {
    return settings?.[key] ?? defaultValue
  }

  return (
    <TenantSettingsContext.Provider value={{ settings, loading, refreshSettings, getSetting }}>
      {children}
    </TenantSettingsContext.Provider>
  )
}

export function useTenantSettings() {
  const context = useContext(TenantSettingsContext)
  if (context === undefined) {
    return {
      settings: defaultSettings,
      loading: false,
      refreshSettings: async () => {},
      getSetting: (key: string, defaultValue?: any) => defaultValue,
    }
  }
  return context
}

export type { TenantSettings, TenantSettingsContextType }
