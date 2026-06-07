"use client"

import type React from "react"
import { useLayoutEffect, useState } from "react"
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

  useLayoutEffect(() => {
    setReady(false)

    const run = async () => {
      const user = getUserData() as AuthUser | null
      if (!user) {
        setAllowed(false)
        setReady(true)
        router.replace("/login")
        return
      }

      const perms = Array.isArray(user.permissions) ? user.permissions : []
      const roles = Array.isArray(user.roles) ? (user.roles as string[]) : []
      const legacyRole = getRoleSlug(user)

      const raw = pathname || "/admin"
      const normalized = raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw

      if (!isTenantSuperAdminContext(roles, legacyRole)) {
        if (perms.length === 0) {
          if (!isLegacyStaffFallbackPath(normalized)) {
            setAllowed(false)
            setReady(true)
            router.replace("/unauthorized")
            return
          }
        } else if (!userHasPermissionForAdminHref(normalized, perms)) {
          setAllowed(false)
          setReady(true)
          router.replace("/unauthorized")
          return
        }
      }

      const requiredModule = resolveAdminHrefModule(normalized)
      if (requiredModule) {
        try {
          const subRes = await getCurrentSubscription()
          const enabled = subRes.enabled_modules ?? []
          if (!hasModuleAccess(enabled, requiredModule)) {
            setAllowed(false)
            setReady(true)
            router.replace(`/admin/subscriptions?upgrade_module=${encodeURIComponent(requiredModule)}`)
            return
          }
        } catch {
          setAllowed(false)
          setReady(true)
          router.replace("/admin/subscriptions")
          return
        }
      }

      setAllowed(true)
      setReady(true)
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
    return null
  }

  return <>{children}</>
}
