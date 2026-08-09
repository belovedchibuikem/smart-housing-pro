"use client"

import { Building2, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"
import { useWhiteLabelSettings } from "@/lib/hooks/use-white-label"
import { useTenantSettings } from "@/lib/context/tenant-settings-context"
import { AdminNotificationBell } from "./admin-notification-bell"
import { handleLogout } from "@/lib/auth/auth-utils"
import { AdminSubscriptionAlertBanner } from "./subscription-alert-banner"
import { resolveStorageUrl } from "@/lib/api/config"
import { useTenantPermissions } from "@/components/admin/can-permission"
import { canAccessAdminHref } from "@/lib/admin/tenant-permissions"
import { AdminNavMenuSearch } from "@/components/admin/admin-nav-menu-search"
import type { UserRole } from "@/lib/roles"

interface AdminHeaderProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  userRole?: UserRole
  permissions?: string[]
  roleNames?: string[]
}

export function AdminHeader({
  mobileMenuOpen,
  setMobileMenuOpen,
  userRole = "member",
  permissions = [],
  roleNames = [],
}: AdminHeaderProps) {
  const { getCompanyName, getCompanyTagline, getLogo } = useWhiteLabelSettings()
  const { getSetting } = useTenantSettings()
  useTenantPermissions()
  const showSettings = canAccessAdminHref("/admin/settings")
  const showAuditLogs = canAccessAdminHref("/admin/audit-logs")

  const siteName = getCompanyName() || getSetting("site_name", "FRSC HMS Admin")
  const siteTagline = getCompanyTagline() || "System Administration"
  const logoUrl = getLogo()

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <AdminSubscriptionAlertBanner />
      <div className="flex items-center justify-between gap-3 px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/admin" className="flex items-center gap-2">
            {logoUrl ? (
              <Image
                src={resolveStorageUrl(logoUrl)}
                alt={siteName}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg">{siteName}</h1>
              <p className="text-xs text-muted-foreground">{siteTagline}</p>
            </div>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center px-2">
          <AdminNavMenuSearch
            userRole={userRole}
            permissions={permissions}
            roleNames={roleNames}
            placeholder="Search admin menu…"
            triggerClassName="max-w-lg"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="md:hidden">
            <AdminNavMenuSearch
              userRole={userRole}
              permissions={permissions}
              roleNames={roleNames}
              placeholder="Search…"
              enableShortcut={false}
              triggerClassName="w-9 px-0 justify-center max-w-none [&>span]:hidden [&>kbd]:hidden"
            />
          </div>
          <AdminNotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {showSettings ? (
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
              ) : null}
              {showAuditLogs ? (
                <DropdownMenuItem asChild>
                  <Link href="/admin/audit-logs">Audit Logs</Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => handleLogout()}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
