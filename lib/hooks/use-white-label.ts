"use client"

import { useWhiteLabel } from "@/lib/context/white-label-context"

export { useWhiteLabel }

export function useWhiteLabelSettings() {
  const { settings, loading, refreshSettings } = useWhiteLabel()

  const isModuleEnabled = (module: string) => {
    if (!settings || !settings.is_active) return true
    return settings.enabled_modules.includes(module)
  }

  const getCompanyName = () => {
    return settings?.company_name || "FRSC Housing Management"
  }

  const getCompanyTagline = () => {
    return settings?.company_tagline || "Building Dreams Together"
  }

  const getLogo = (isDark = false) => {
    if (!settings) return ""
    return isDark ? settings.logo_dark_url : settings.logo_url
  }

  const getPrimaryColor = () => {
    return settings?.primary_color || "#3b82f6"
  }

  return {
    settings,
    loading,
    refreshSettings,
    isModuleEnabled,
    getCompanyName,
    getCompanyTagline,
    getLogo,
    getPrimaryColor,
  }
}
