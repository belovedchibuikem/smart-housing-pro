"use client"

import { NavMenuSearch } from "@/components/shared/nav-menu-search"
import { useFilteredAdminNav } from "@/hooks/use-filtered-admin-nav"
import type { UserRole } from "@/lib/roles"

type Props = {
  userRole?: UserRole | string
  permissions?: string[]
  roleNames?: string[]
  variant?: "header" | "sidebar"
  placeholder?: string
  triggerClassName?: string
  enableShortcut?: boolean
}

export function AdminNavMenuSearch({
  userRole,
  permissions,
  roleNames,
  variant = "header",
  placeholder = "Search menu…",
  triggerClassName,
  enableShortcut = true,
}: Props) {
  const items = useFilteredAdminNav({ userRole, permissions, roleNames })

  return (
    <NavMenuSearch
      items={items}
      variant={variant}
      placeholder={placeholder}
      triggerClassName={triggerClassName}
      enableShortcut={enableShortcut}
    />
  )
}
