"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContributionHistory } from "@/components/contributions/contribution-history"
import { AutoPaymentSettings } from "@/components/contributions/auto-payment-settings"
import { Plus, TrendingUp, Calendar, Wallet, Target } from "lucide-react"
import Link from "next/link"

export default function ContributionsPage() {
  const stats = {
    totalContributions: 275000,
    thisMonth: 50000,
    thisYear: 275000,
    averageMonthly: 55000,
    completedPayments: 5,
    nextDueDate: "Jan 1, 2025",
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Contributions</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your monthly contributions</p>
        </div>
        <Link href="/dashboard/contributions/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Make Contribution
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Contributions</p>
              <p className="text-2xl font-bold">₦{stats.totalContributions.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">₦{stats.thisMonth.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">This Year</p>
              <p className="text-2xl font-bold">₦{stats.thisYear.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Average Monthly</p>
              <p className="text-2xl font-bold">₦{stats.averageMonthly.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Completed Payments</p>
            <p className="text-3xl font-bold">{stats.completedPayments}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Next Due Date</p>
            <p className="text-3xl font-bold">{stats.nextDueDate}</p>
            <p className="text-xs text-muted-foreground">Upcoming payment</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="history" className="flex-1 sm:flex-none">
            Contribution History
          </TabsTrigger>
          <TabsTrigger value="autopay" className="flex-1 sm:flex-none">
            Auto-Payment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <ContributionHistory />
        </TabsContent>

        <TabsContent value="autopay">
          <AutoPaymentSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
