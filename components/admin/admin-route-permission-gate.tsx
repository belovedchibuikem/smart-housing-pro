"use client"

import type React from "react"
import { useLayoutEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getUserData } from "@/lib/auth/auth-utils"
import {
  isLegacyStaffFallbackPath,
  isTenantSuperAdminContext,
  userHasPermissionForAdminHref,
} from "@/lib/admin/nav-permissions"
import { getRoleSlug } from "@/lib/auth/user-roles"
import type { AuthUser } from "@/lib/auth/types"
import { hasModuleAccess, resolveAdminHrefModule } from "@/lib/modules/module-config"
import { getCurrentSubscription } from "@/lib/api/client"

/** Cached for the session so every route change does not re-hit the API. */
let cachedEnabledModules: string[] | null = null
let modulesFetchPromise: Promise<string[]> | null = null

async function loadEnabledModules(): Promise<string[]> {
  if (cachedEnabledModules !== null) {
    return cachedEnabledModules
  }
  if (!modulesFetchPromise) {
    modulesFetchPromise = getCurrentSubscription()
      .then((res) => {
        cachedEnabledModules = res.enabled_modules ?? []
        return cachedEnabledModules
      })
      .catch(() => {
        cachedEnabledModules = []
        return cachedEnabledModules
      })
      .finally(() => {
        modulesFetchPromise = null
      })
  }
  return modulesFetchPromise
}

function normalizeAdminPath(pathname: string | null): string {
  const raw = pathname || "/admin"
  return raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw
}

/**
 * Blocks direct URL access to admin routes when the user lacks matching Spatie permissions.
 * Backend still enforces /api/admin/*. Super admins bypass. Legacy sessions with no permission
 * list may only open /admin and /admin/subscriptions.
 */
export function AdminRoutePermissionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(true)
  const hasInitializedRef = useRef(false)
  const checkGenerationRef = useRef(0)

  useLayoutEffect(() => {
    const generation = ++checkGenerationRef.current
    const normalized = normalizeAdminPath(pathname)

    // Only show the full-page gate on the first check — keep content mounted on later navigations.
    if (!hasInitializedRef.current) {
      setReady(false)
    }

    const run = async () => {
      const user = getUserData() as AuthUser | null
      if (!user) {
        if (generation !== checkGenerationRef.current) return
        setAllowed(false)
        setReady(true)
        hasInitializedRef.current = true
        router.replace("/login")
        return
      }

      const perms = Array.isArray(user.permissions) ? user.permissions : []
      const roles = Array.isArray(user.roles) ? (user.roles as string[]) : []
      const legacyRole = getRoleSlug(user)

      if (!isTenantSuperAdminContext(roles, legacyRole)) {
        if (perms.length === 0) {
          if (!isLegacyStaffFallbackPath(normalized)) {
            if (generation !== checkGenerationRef.current) return
            setAllowed(false)
            setReady(true)
            hasInitializedRef.current = true
            router.replace("/unauthorized")
            return
          }
        } else if (!userHasPermissionForAdminHref(normalized, perms)) {
          if (generation !== checkGenerationRef.current) return
          setAllowed(false)
          setReady(true)
          hasInitializedRef.current = true
          router.replace("/unauthorized")
          return
        }
      }

      const requiredModule = resolveAdminHrefModule(normalized)
      if (requiredModule) {
        try {
          const enabled = await loadEnabledModules()
          if (generation !== checkGenerationRef.current) return
          if (!hasModuleAccess(enabled, requiredModule)) {
            setAllowed(false)
            setReady(true)
            hasInitializedRef.current = true
            router.replace(`/admin/subscriptions?upgrade_module=${encodeURIComponent(requiredModule)}`)
            return
          }
        } catch {
          if (generation !== checkGenerationRef.current) return
          // Subscription metadata unavailable — allow route if permission check passed.
          setAllowed(true)
          setReady(true)
          hasInitializedRef.current = true
          return
        }
      }

      if (generation !== checkGenerationRef.current) return
      setAllowed(true)
      setReady(true)
      hasInitializedRef.current = true
    }

    void run()
  }, [pathname, router])

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        <p>Redirecting…</p>
      </div>
    )
  }

  return <>{children}</>
}
