"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Tenant } from "@/lib/types/tenant"
import { setTenantSlug } from "@/lib/api/client"
import { getTenantSlugFromHost, isCustomDomain } from "@/lib/tenant/tenant-utils"

const TENANT_WISHLIST_STORAGE_KEY = "sh_tenant_property_wishlist"

export type TenantWishlistEntry = {
  id: string
  listingKind: "house" | "land" | string
}

interface TenantContextType {
  tenant: Tenant | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  wishlist: TenantWishlistEntry[]
  isWishlisted: (id: string, listingKind?: string) => boolean
  toggleWishlist: (entry: TenantWishlistEntry) => void
  clearWishlist: () => void
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
  error: null,
  refetch: async () => {},
  wishlist: [],
  isWishlisted: () => false,
  toggleWishlist: () => {},
  clearWishlist: () => {},
})

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<TenantWishlistEntry[]>([])

  const normalizeKind = (listingKind?: string) => {
    return listingKind === "house" ? "house" : "land"
  }

  const wishlistKeyFor = (id: string, listingKind?: string) => `${normalizeKind(listingKind)}:${id}`

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(TENANT_WISHLIST_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as TenantWishlistEntry[]
      if (Array.isArray(parsed)) {
        const next = parsed
          .filter((item) => item?.id)
          .map((item) => ({ id: String(item.id), listingKind: normalizeKind(item.listingKind) }))
        setWishlist(next)
      }
    } catch {
      /* ignore malformed wishlist storage */
    }
  }, [])

  const persistWishlist = (next: TenantWishlistEntry[]) => {
    setWishlist(next)
    if (typeof window === "undefined") return
    window.localStorage.setItem(TENANT_WISHLIST_STORAGE_KEY, JSON.stringify(next))
  }

  const isWishlisted = (id: string, listingKind?: string) =>
    wishlist.some((item) => wishlistKeyFor(item.id, item.listingKind) === wishlistKeyFor(id, listingKind))

  const toggleWishlist = (entry: TenantWishlistEntry) => {
    const key = wishlistKeyFor(entry.id, entry.listingKind)
    const exists = wishlist.some((item) => wishlistKeyFor(item.id, item.listingKind) === key)
    const normalizedEntry = { id: entry.id, listingKind: normalizeKind(entry.listingKind) }
    const next = exists
      ? wishlist.filter((item) => wishlistKeyFor(item.id, item.listingKind) !== key)
      : [...wishlist, normalizedEntry]
    persistWishlist(next)
  }

  const clearWishlist = () => persistWishlist([])

  const fetchTenant = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Platform apex is not a cooperative — skip tenant/current (was binding FRSC via stale slug).
      if (typeof window !== "undefined") {
        const host = window.location.hostname
        if (!getTenantSlugFromHost(host) && !isCustomDomain(host)) {
          setTenant(null)
          setTenantSlug(null)
          return
        }
      }

      // Fetch current tenant based on domain/subdomain
      const response = await fetch("/api/tenant/current")

      if (!response.ok) {
        throw new Error("Failed to fetch cooperative")
      }

      const data = await response.json()
      const tenantData = data.tenant
        ? {
            ...data.tenant,
            enabled_modules: data.enabled_modules ?? [],
            modules: data.modules ?? [],
          }
        : null
      setTenant(tenantData)
      if (data?.tenant?.slug) {
        setTenantSlug(data.tenant.slug)
      } else {
        setTenantSlug(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("[v0] Error fetching cooperative:", err)
      setTenantSlug(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTenant()
  }, [])

  return (
    <TenantContext.Provider
      value={{ tenant, isLoading, error, refetch: fetchTenant, wishlist, isWishlisted, toggleWishlist, clearWishlist }}
    >
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
