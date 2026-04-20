"use client"

import type React from "react"
import { useLayoutEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getUserData } from "@/lib/auth/auth-utils"
import { isTenantSuperAdminContext, userHasPermissionForAdminHref } from "@/lib/admin/nav-permissions"
import { getRoleSlug } from "@/lib/auth/user-roles"
import type { AuthUser } from "@/lib/auth/types"

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
    const user = getUserData() as AuthUser | null
    if (!user) {
      setAllowed(true)
      setReady(true)
      return
    }

    const perms = Array.isArray(user.permissions) ? user.permissions : []
    const roles = Array.isArray(user.roles) ? (user.roles as string[]) : []
    const legacyRole = getRoleSlug(user)

    if (isTenantSuperAdminContext(roles, legacyRole)) {
      setAllowed(true)
      setReady(true)
      return
    }

    const raw = pathname || "/admin"
    const normalized = raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw

    if (perms.length === 0) {
      const fallbackOk =
        normalized === "/admin" ||
        normalized === "/admin/subscriptions" ||
        normalized.startsWith("/admin/subscriptions/")
      if (!fallbackOk) {
        setAllowed(false)
        setReady(true)
        router.replace("/unauthorized")
        return
      }
      setAllowed(true)
      setReady(true)
      return
    }

    if (userHasPermissionForAdminHref(normalized, perms)) {
      setAllowed(true)
      setReady(true)
      return
    }

    setAllowed(false)
    setReady(true)
    router.replace("/unauthorized")
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
