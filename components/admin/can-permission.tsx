"use client"

import { useEffect, useState, type ReactNode } from "react"
import { canTenantPermission } from "@/lib/admin/tenant-permissions"

/**
 * Reactive permission checks for admin UI (re-reads after /auth/me refresh via storage event).
 */
export function useTenantPermissions() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const bump = () => setTick((n) => n + 1)
    window.addEventListener("storage", bump)
    window.addEventListener("sh-auth-updated", bump)
    return () => {
      window.removeEventListener("storage", bump)
      window.removeEventListener("sh-auth-updated", bump)
    }
  }, [])

  return {
    can: (permission: string | string[]) => canTenantPermission(permission),
  }
}

type CanProps = {
  /** Spatie slug or pipe-separated OR list (e.g. "approve_loans|edit_loans"). */
  permission: string | string[]
  children: ReactNode
  fallback?: ReactNode
}

/** Renders children only when the current user has the required permission(s). */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = useTenantPermissions()
  if (!can(permission)) {
    return <>{fallback}</>
  }
  return <>{children}</>
}
