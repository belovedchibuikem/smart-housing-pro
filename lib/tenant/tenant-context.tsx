"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Tenant } from "@/lib/types/tenant"
import { setTenantSlug } from "@/lib/api/client"

interface TenantContextType {
  tenant: Tenant | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
  error: null,
  refetch: async () => {},
})

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTenant = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch current tenant based on domain/subdomain
      const response = await fetch("/api/tenant/current")

      if (!response.ok) {
        throw new Error("Failed to fetch tenant")
      }

      const data = await response.json()
      setTenant(data.tenant)
      if (data?.tenant?.slug) {
        setTenantSlug(data.tenant.slug)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("[v0] Error fetching tenant:", err)
      setTenantSlug(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTenant()
  }, [])

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error, refetch: fetchTenant }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error("useTenant must be used within TenantProvider")
  }
  return context
}
