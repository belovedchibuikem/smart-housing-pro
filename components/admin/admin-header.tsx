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

interface AdminHeaderProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function AdminHeader({ mobileMenuOpen, setMobileMenuOpen }: AdminHeaderProps) {
  const { getCompanyName, getCompanyTagline, getLogo } = useWhiteLabelSettings()
  const { getSetting } = useTenantSettings()
  
  const siteName = getCompanyName() || getSetting("site_name", "FRSC HMS Admin")
  const siteTagline = getCompanyTagline() || "System Administration"
  const logoUrl = getLogo()

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <AdminSubscriptionAlertBanner />
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/admin" className="flex items-center gap-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
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

        <div className="flex items-center gap-2">
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
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/audit-logs">Audit Logs</Link>
              </DropdownMenuItem>
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
