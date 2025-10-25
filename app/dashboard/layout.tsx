"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { MemberLoadingProvider } from "@/components/dashboard/member-loading-context"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Mock subscription check - replace with actual API call
    const hasActiveSubscription = true // This should come from your auth/subscription service

    // Allow access to subscription pages without active subscription
    const isSubscriptionPage = pathname.startsWith("/dashboard/subscriptions")

    if (!hasActiveSubscription && !isSubscriptionPage) {
      console.log("[v0] No active subscription, redirecting to subscription page")
      router.push("/subscription")
    }
  }, [pathname, router])

  return (
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
  )
}
