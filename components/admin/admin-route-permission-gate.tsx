"use client"

import type React from "react"
import { useLayoutEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getUserData } from "@/lib/auth/auth-utils"
import {
  isTenantSuperAdminContext,
  userHasPermissionForAdminHref,
} from "@/lib/admin/nav-permissions"

/**
 * When the user has a Spatie permission list from login, block direct URL access to
 * admin routes they are not allowed to use (sidebar already hides those links).
 * Backend still enforces /api/admin/* — this improves UX and avoids confusing empty pages.
 * If permissions are missing (legacy session), we do not block (role-based sidebar still applies).
 */
export function AdminRoutePermissionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(true)

  useLayoutEffect(() => {
    setReady(false)
    const user = getUserData()
    if (!user) {
      setAllowed(true)
      setReady(true)
      return
    }

    const perms = Array.isArray(user.permissions) ? user.permissions : []
    const roles = Array.isArray(user.roles) ? (user.roles as string[]) : []
    const legacyRole = typeof user.role === "string" ? user.role : undefined

    if (isTenantSuperAdminContext(roles, legacyRole)) {
      setAllowed(true)
      setReady(true)
      return
    }

    if (perms.length === 0) {
      setAllowed(true)
      setReady(true)
      return
    }

    const raw = pathname || "/admin"
    const normalized =
      raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw

    if (userHasPermissionForAdminHref(normalized, perms)) {
      setAllowed(true)
      setReady(true)
      return
    }

    setAllowed(false)
    setReady(true)
    router.replace("/admin")
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
