"use client"

import { useState, useEffect, useCallback } from "react"
import { apiFetch } from "@/lib/api/client"
import { getCurrentSubscription } from "@/lib/api/client"

interface TenantModule {
  slug: string
  name: string
  icon?: string | null
}

interface UseTenantModulesOptions {
  /** When true, loads from admin subscription current endpoint */
  isAdmin?: boolean
}

export function useTenantModules(options: UseTenantModulesOptions = {}) {
  const { isAdmin = false } = options
  const [enabledModules, setEnabledModules] = useState<string[]>([])
  const [modules, setModules] = useState<TenantModule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      if (isAdmin) {
        const res = await getCurrentSubscription()
        setEnabledModules(res.enabled_modules ?? [])
        setModules(res.modules ?? [])
      } else {
        const res = await apiFetch<{
          enabled_modules?: string[]
          modules?: TenantModule[]
        }>("/tenant/modules")
        setEnabledModules(res.enabled_modules ?? [])
        setModules(res.modules ?? [])
      }
    } catch {
      setEnabledModules([])
      setModules([])
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    void load()
  }, [load])

  const hasModule = useCallback(
    (slug: string) => enabledModules.includes(slug),
    [enabledModules],
  )

  return {
    enabledModules,
    modules,
    isLoading,
    hasModule,
    refetch: load,
  }
}
