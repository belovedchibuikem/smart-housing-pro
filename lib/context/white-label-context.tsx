"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface WhiteLabelSettings {
  company_name: string
  company_tagline: string
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
}

interface WhiteLabelContextType {
  settings: WhiteLabelSettings | null
  loading: boolean
  refreshSettings: () => Promise<void>
}

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined)

const defaultSettings: WhiteLabelSettings = {
  company_name: "FRSC Housing Management",
  company_tagline: "Building Dreams Together",
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

export function WhiteLabelProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WhiteLabelSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/white-label")
      const data = await response.json()

      if (data.settings && data.settings.is_active) {
        setSettings(data.settings)
        applyWhiteLabelStyles(data.settings)
      } else {
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error("[v0] Error fetching white label settings:", error)
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  const applyWhiteLabelStyles = (settings: WhiteLabelSettings) => {
    // Apply CSS custom properties for colors
    const root = document.documentElement
    root.style.setProperty("--primary-color", settings.primary_color)
    root.style.setProperty("--secondary-color", settings.secondary_color)
    root.style.setProperty("--accent-color", settings.accent_color)
    root.style.setProperty("--background-color", settings.background_color)
    root.style.setProperty("--text-color", settings.text_color)

    // Apply fonts
    root.style.setProperty("--heading-font", settings.heading_font)
    root.style.setProperty("--body-font", settings.body_font)

    // Apply custom CSS if provided
    if (settings.custom_css) {
      const styleId = "white-label-custom-css"
      let styleElement = document.getElementById(styleId) as HTMLStyleElement

      if (!styleElement) {
        styleElement = document.createElement("style")
        styleElement.id = styleId
        document.head.appendChild(styleElement)
      }

      styleElement.textContent = settings.custom_css
    }

    // Update favicon if provided
    if (settings.favicon_url) {
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement
      if (favicon) {
        favicon.href = settings.favicon_url
      }
    }

    // Update page title if company name is set
    if (settings.company_name) {
      document.title = settings.company_name
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const refreshSettings = async () => {
    setLoading(true)
    await fetchSettings()
  }

  return (
    <WhiteLabelContext.Provider value={{ settings, loading, refreshSettings }}>{children}</WhiteLabelContext.Provider>
  )
}

export function useWhiteLabel() {
  const context = useContext(WhiteLabelContext)
  if (context === undefined) {
    throw new Error("useWhiteLabel must be used within a WhiteLabelProvider")
  }
  return context
}

export type { WhiteLabelSettings, WhiteLabelContextType }
