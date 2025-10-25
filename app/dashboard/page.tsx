"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { ContributionChart } from "@/components/dashboard/contribution-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowRight, AlertCircle } from "lucide-react"
import { usePageLoading } from "@/hooks/use-loading"

export default function DashboardPage() {
  const { isLoading, loadData } = usePageLoading()
  const [data, setData] = useState<any>(null)
  
  // TODO: Replace with actual user session data
  const isMember = false // This should come from user session/auth
  const userName = "John" // This should come from user session/auth

  useEffect(() => {
    // Simulate loading dashboard data
    loadData(async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      return { loaded: true }
    }).then(setData)
  }, [loadData])

  return (
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your housing cooperative account</p>
      </div>

      {!isMember && (
        <Alert className="border-primary/50 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Upgrade to Full Membership</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
            <span className="text-sm">
              Unlock exclusive benefits, lower interest rates, and priority access to properties by upgrading to full
              membership today!
            </span>
            <Link href="/dashboard/subscriptions/upgrade">
              <Button size="sm" className="whitespace-nowrap">
                Upgrade Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <StatsCards />

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <ContributionChart />
        </div>
        <div>
          <UpcomingPayments />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
      </div>
  )
}
