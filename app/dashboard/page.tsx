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
import { getUserDashboardStats, getWalletTransactions } from "@/lib/api/client"
import { getUserData } from "@/lib/auth/auth-utils"

interface DashboardData {
  wallet_balance: number
  financial_summary: {
    total_contributions: number
    total_loans: number
    outstanding_loans: number
    total_investments: number
    total_repayments: number
  }
  recent_activity: {
    contributions: Array<{
      id: string
      amount: number
      status: string
      created_at: string
      type?: string
    }>
    loans: Array<{
      id: string
      amount: number
      status: string
      created_at: string
      type?: string
    }>
    investments: Array<{
      id: string
      amount: number
      status: string
      created_at: string
    }>
  }
  upcoming_payments: Array<{
    id: string
    amount: number
    due_date: string
    status: string
    description?: string
    type?: string
  }>
  monthly_trends: Array<{
    month: string
    contributions: number
    loans: number
    investments: number
  }>
  member_status: string
  kyc_status: string
  membership_type: string
}

export default function DashboardPage() {
  const { isLoading, loadData } = usePageLoading()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [isMember, setIsMember] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData(async () => {
      try {
        // Get user info from localStorage first
        const userData = getUserData()
        let extractedUserName = ""
        
        if (userData) {
          extractedUserName = userData.first_name || userData.name?.split(' ')[0] || "User"
          setUserName(extractedUserName)
          setIsMember(userData.membership_type !== "basic" && userData.membership_type !== "trial")
        }

        // Get dashboard data and wallet transactions in parallel
        const [dashboardResponse, walletTxResponse] = await Promise.all([
          getUserDashboardStats().catch(() => null),
          getWalletTransactions({ page: 1, per_page: 5 }).catch(() => null),
        ])

        if (dashboardResponse) {
          setDashboardData(dashboardResponse)
          
          // Extract user name if not already set from localStorage
          if (!extractedUserName) {
            const firstName = userData?.first_name || userData?.name?.split(' ')[0] || "User"
            setUserName(firstName)
          }
          
          // Check membership from dashboard data (this takes precedence)
          if (dashboardResponse.membership_type) {
            setIsMember(dashboardResponse.membership_type !== "basic" && dashboardResponse.membership_type !== "trial")
          }
        } else {
          setError("Failed to load dashboard data")
        }

        return dashboardResponse
      } catch (err: any) {
        console.error("Dashboard load error:", err)
        setError(err.message || "Failed to load dashboard")
        throw err
      }
    })
  }, [loadData])

  if (error && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {userName || "User"}!</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your housing cooperative account</p>
      </div>

      {!isMember && dashboardData && (
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
      <StatsCards data={dashboardData} loading={isLoading} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <ContributionChart data={dashboardData?.monthly_trends} loading={isLoading} />
        </div>
        <div>
          <UpcomingPayments data={dashboardData?.upcoming_payments} loading={isLoading} />
        </div>
      </div>

      {/* Recent Transactions */}
      <RecentTransactions data={dashboardData} loading={isLoading} />
      </div>
  )
}
