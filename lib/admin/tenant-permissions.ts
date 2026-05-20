"use client"

import { getUserData } from "@/lib/auth/auth-utils"
import type { AuthUser } from "@/lib/auth/types"
import { getRoleSlug } from "@/lib/auth/user-roles"
import {
  isTenantSuperAdminContext,
  userHasPermissionForAdminHref,
} from "@/lib/admin/nav-permissions"

/**
 * Check whether the current session has any of the given Spatie permission slugs (OR).
 */
export function canTenantPermission(
  permission: string | string[],
  user?: AuthUser | null,
): boolean {
  const u = user ?? (getUserData() as AuthUser | null)
  if (!u) return false

  const roles = Array.isArray(u.roles) ? (u.roles as string[]) : []
  const legacyRole = getRoleSlug(u)
  if (isTenantSuperAdminContext(roles, legacyRole)) return true

  const required = Array.isArray(permission) ? permission : permission.split("|")
  const perms = Array.isArray(u.permissions) ? u.permissions : []
  const set = new Set(perms)

  return required.some((p) => set.has(p.trim()))
}

/** Whether the user may open a given /admin/* path (mirrors API route map). */
export function canAccessAdminHref(href: string, user?: AuthUser | null): boolean {
  const u = user ?? (getUserData() as AuthUser | null)
  if (!u) return false

  const roles = Array.isArray(u.roles) ? (u.roles as string[]) : []
  const legacyRole = getRoleSlug(u)
  if (isTenantSuperAdminContext(roles, legacyRole)) return true

  const perms = Array.isArray(u.permissions) ? u.permissions : []
  if (perms.length === 0) {
    const normalized = href.replace(/\/+$/, "") || "/admin"
    return (
      normalized === "/admin" ||
      normalized === "/admin/subscriptions" ||
      normalized.startsWith("/admin/subscriptions/")
    )
  }

  return userHasPermissionForAdminHref(href, perms)
}
