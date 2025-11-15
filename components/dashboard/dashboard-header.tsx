"use client"

import { User, Menu } from "lucide-react"
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
import { handleLogout } from "@/lib/auth/auth-utils"
import { useWhiteLabelSettings } from "@/lib/hooks/use-white-label"
import { UserNotificationBell } from "./user-notification-bell"
import { SubscriptionAlertBanner } from "./subscription-alert-banner"

interface DashboardHeaderProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function DashboardHeader({ mobileMenuOpen, setMobileMenuOpen }: DashboardHeaderProps) {
  const { getCompanyName, getCompanyTagline, getLogo } = useWhiteLabelSettings()

  const siteName = getCompanyName() || "FRSC HMS"
  const siteTagline = getCompanyTagline() || "Housing Management"
  const logoUrl = getLogo()

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <SubscriptionAlertBanner />
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl ?? ""} alt="Dashboard Logo" className="h-8 w-8 object-contain" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                HMS
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg">{siteName}</h1>
              <p className="text-xs text-muted-foreground">{siteTagline}</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <UserNotificationBell />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
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
