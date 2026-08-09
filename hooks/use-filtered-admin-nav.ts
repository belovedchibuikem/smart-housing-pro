"use client"

import { useEffect, useMemo, useState } from "react"
import { LayoutDashboard } from "lucide-react"
import type { UserRole } from "@/lib/roles"
import {
  getPermissionFilteredNavItems,
  isTenantSuperAdminContext,
} from "@/lib/admin/nav-permissions"
import { getCurrentSubscription } from "@/lib/api/client"
import { filterAdminNavByModules } from "@/lib/modules/filter-nav-by-modules"
import {
  ADMIN_NAV_MODULE_MAP,
  ALWAYS_VISIBLE_ADMIN_HREFS,
  CORE_ADMIN_MODULE_SLUGS,
} from "@/lib/modules/module-config"
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-sidebar"

type NavItem = (typeof ADMIN_NAV_ITEMS)[number]

const MINIMAL_STAFF_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
]

type Options = {
  userRole?: UserRole | string
  permissions?: string[]
  roleNames?: string[]
}

/**
 * Same permission / subscription / module filters as the tenant admin sidebar,
 * so menu search never surfaces pages staff cannot open.
 */
export function useFilteredAdminNav({
  userRole = "member",
  permissions = [],
  roleNames = [],
}: Options = {}) {
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [enabledModules, setEnabledModules] = useState<string[] | null>(null)

  useEffect(() => {
    let cancelled = false
    const checkSubscription = async () => {
      try {
        const response = await getCurrentSubscription()
        const isActive =
          response.subscription?.is_active === true && response.subscription?.status === "active"
        if (!cancelled) {
          setHasActiveSubscription(isActive)
          setEnabledModules(response.enabled_modules ?? [])
        }
      } catch {
        if (!cancelled) {
          setHasActiveSubscription(false)
          setEnabledModules([])
        }
      }
    }
    checkSubscription()
    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(() => {
    const isCoreAdminNavItem = (item: NavItem): boolean => {
      if (item.href) {
        const normalized = item.href.split("?")[0].replace(/\/$/, "")
        if (ALWAYS_VISIBLE_ADMIN_HREFS.has(normalized)) {
          return true
        }
      }
      const slug = ADMIN_NAV_MODULE_MAP[item.label]
      return slug ? CORE_ADMIN_MODULE_SLUGS.has(slug) : false
    }

    const filterBySubscription = (items: NavItem[]): NavItem[] =>
      items.filter((item) => {
        if (
          item.label === "Subscription" ||
          item.href === "/admin/subscriptions" ||
          item.href === "/admin/subscription"
        ) {
          return true
        }
        if (isCoreAdminNavItem(item)) {
          return true
        }
        if (hasActiveSubscription === null) {
          return true
        }
        return hasActiveSubscription
      })

    const roleSlug = String(userRole || "member").toLowerCase().replace(/-/g, "_")
    const superAdmin = isTenantSuperAdminContext(roleNames, roleSlug)
    const roleFilteredItems = superAdmin
      ? ADMIN_NAV_ITEMS
      : permissions.length > 0
        ? getPermissionFilteredNavItems(
            permissions,
            roleNames.length ? roleNames : [],
            ADMIN_NAV_ITEMS,
            roleSlug,
          )
        : MINIMAL_STAFF_NAV

    const subscriptionFiltered = filterBySubscription(roleFilteredItems)
    const shouldSkipModuleFilter =
      enabledModules === null ||
      (hasActiveSubscription === true && enabledModules.length === 0)

    return shouldSkipModuleFilter
      ? subscriptionFiltered
      : filterAdminNavByModules(subscriptionFiltered, enabledModules)
  }, [userRole, permissions, roleNames, hasActiveSubscription, enabledModules])
}
