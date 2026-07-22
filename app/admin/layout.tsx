"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminLoadingProvider } from "@/components/admin/admin-loading-context"
import { AdminRoutePermissionGate } from "@/components/admin/admin-route-permission-gate"
import { AuthGuard } from "@/lib/tenant/auth-guard"
import type { UserRole } from "@/lib/roles"
import { getUserData } from "@/lib/auth/auth-utils"
import type { AuthUser } from "@/lib/auth/types"
import { persistAuthSession, persistAuthSessionFromStorage } from "@/lib/auth/auth-cookies"
import { meRequest } from "@/lib/api/client"
import { getRoleSlug } from "@/lib/auth/user-roles"
import { useSubscriptionGuard } from "@/lib/hooks/use-subscription"
import { unlockBodyPointerEvents } from "@/lib/ui/unlock-body"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>("member")
  const [permissions, setPermissions] = useState<string[]>([])
  const [roleNames, setRoleNames] = useState<string[]>([])

  // Check tenant subscription status and handle redirects
  const { isLoading } = useSubscriptionGuard(true)

  // Clear stuck Radix body locks after route changes (roles/permissions menus, selects).
  useEffect(() => {
    unlockBodyPointerEvents()
    setMobileMenuOpen(false)
  }, [pathname])

  const applyUserToNav = (user: AuthUser) => {
    const slug = getRoleSlug(user)
    setUserRole((slug || "member") as UserRole)
    setPermissions(Array.isArray(user.permissions) ? user.permissions : [])
    setRoleNames(Array.isArray(user.roles) ? (user.roles as string[]) : [])
  }

  useEffect(() => {
    let cancelled = false

    async function syncSession() {
      persistAuthSessionFromStorage()
      const cached = getUserData()
      if (cached && !cancelled) {
        applyUserToNav(cached as AuthUser)
      }

      try {
        const me = await meRequest()
        const fresh = me?.user as AuthUser | undefined
        const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null
        if (fresh && token && !cancelled) {
          localStorage.setItem("user_data", JSON.stringify(fresh))
          persistAuthSession(fresh, token)
          window.dispatchEvent(new Event("sh-auth-updated"))
          applyUserToNav(fresh)
        }
      } catch {
        // AuthGuard handles expired sessions
      }
    }

    function onAuthUpdated() {
      const cached = getUserData()
      if (cached) {
        applyUserToNav(cached as AuthUser)
      }
    }

    syncSession()
    window.addEventListener("sh-auth-updated", onAuthUpdated)
    window.addEventListener("storage", onAuthUpdated)
    return () => {
      cancelled = true
      window.removeEventListener("sh-auth-updated", onAuthUpdated)
      window.removeEventListener("storage", onAuthUpdated)
    }
  }, [])

  // Show loading while checking subscription
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireStaffDashboardAccess>
      <div className="min-h-screen bg-background">
        <AdminHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex">
          <AdminSidebar
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            userRole={userRole}
            permissions={permissions}
            roleNames={roleNames}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
            <AdminLoadingProvider>
              <AdminRoutePermissionGate>{children}</AdminRoutePermissionGate>
            </AdminLoadingProvider>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
