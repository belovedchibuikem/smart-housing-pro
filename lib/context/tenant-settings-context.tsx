"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

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
  site_name: "FRSC Housing Management",
  site_email: "housing20000@frsc.gov.ng",
  support_email: "frschousingcooperative@gmail.com",
  default_currency: "NGN",
  timezone: "Africa/Lagos",
  maintenance_mode: false,
  allow_registration: true,
  require_email_verification: true,
}

export function TenantSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TenantSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const { apiFetch } = await import("@/lib/api/client")
      const data = await apiFetch<{ success: boolean; settings: TenantSettings }>("/admin/settings")
      
      if (data.success && data.settings) {
        setSettings(data.settings)
      } else {
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error("Error fetching tenant settings:", error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
    
    // Listen for settings updates
    const handleSettingsUpdate = () => {
      fetchSettings()
    }
    
    window.addEventListener('tenant-settings-updated', handleSettingsUpdate)
    
    return () => {
      window.removeEventListener('tenant-settings-updated', handleSettingsUpdate)
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
    // Return default context if not in provider (for public pages)
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

