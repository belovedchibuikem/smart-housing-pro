"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { MemberLoadingProvider } from "@/components/dashboard/member-loading-context"
import { ProfileCompletionBanner } from "@/components/dashboard/profile-completion-banner"
import { AuthGuard } from "@/lib/tenant/auth-guard"
import { useSubscriptionGuard } from "@/lib/hooks/use-subscription"
import { Loader2 } from "lucide-react"
import { unlockBodyPointerEvents } from "@/lib/ui/unlock-body"
import { IdleSessionGuard } from "@/lib/auth/idle-session"
import { meRequest } from "@/lib/api/client"
import { persistSessionTimeout } from "@/lib/auth/session-timeout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check member subscription status and handle redirects
  const { isLoading } = useSubscriptionGuard(false)

  useEffect(() => {
    unlockBodyPointerEvents()
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    let cancelled = false
    meRequest()
      .then((me) => {
        if (!cancelled && typeof me?.session_timeout === "number") {
          persistSessionTimeout(me.session_timeout)
        }
      })
      .catch(() => {
        // AuthGuard / 401 handler manage expired sessions
      })
    return () => {
      cancelled = true
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
    <AuthGuard requireMemberDashboard redirectTo="/login">
      <IdleSessionGuard />
      <div className="min-h-screen bg-background">
        <DashboardHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex">
          <DashboardSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
            <MemberLoadingProvider>
              <ProfileCompletionBanner />
              {children}
            </MemberLoadingProvider>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
