"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { MemberLoadingProvider } from "@/components/dashboard/member-loading-context"
import { AuthGuard } from "@/lib/tenant/auth-guard"
import { useSubscriptionGuard } from "@/lib/hooks/use-subscription"
import { fetchUserProfile } from "@/lib/api/user-profile"
import { isMemberProfileComplete } from "@/lib/profile/profile-completion"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCheckingProfileCompletion, setIsCheckingProfileCompletion] = useState(true)
  
  // Check member subscription status and handle redirects
  const { isLoading } = useSubscriptionGuard(false)

  useEffect(() => {
    let cancelled = false

    const checkProfileCompletion = async () => {
      setIsCheckingProfileCompletion(true)
      try {
        const response = await fetchUserProfile()
        const complete = isMemberProfileComplete(response.user, response.user.member ?? null)
        const onWizard = pathname === "/dashboard/complete-profile"

        if (!complete && !onWizard) {
          router.replace("/dashboard/complete-profile")
          return
        }

        if (complete && onWizard) {
          router.replace("/dashboard")
          return
        }
      } catch (error) {
        // Allow dashboard access if profile check fails, to avoid lockouts.
        console.error("Profile completion check failed", error)
      } finally {
        if (!cancelled) setIsCheckingProfileCompletion(false)
      }
    }

    checkProfileCompletion()
    return () => {
      cancelled = true
    }
  }, [pathname, router])

  // Show loading while checking subscription
  if (isLoading || isCheckingProfileCompletion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isLoading ? "Checking subscription status..." : "Preparing your profile wizard..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireMemberDashboard redirectTo="/login">
      <div className="min-h-screen bg-background">
        <DashboardHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex">
          <DashboardSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
            <MemberLoadingProvider>
              {children}
            </MemberLoadingProvider>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
