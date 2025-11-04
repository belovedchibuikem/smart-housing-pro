"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, Users, Wallet, Home, Mail, FileText, CreditCard, HandCoins, Activity } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("this-month")

  const reportCategories = [
    {
      title: "Financial Reports",
      description: "Contribution and transaction reports",
      icon: Wallet,
      link: "/admin/reports/financial",
      reports: [
        "Monthly Contribution Summary",
        "Transaction History Report",
        "Outstanding Payments Report",
        "Revenue Analysis Report",
      ],
    },
    {
      title: "Member Reports",
      description: "Member statistics and analytics",
      icon: Users,
      link: "/admin/reports/members",
      reports: ["Member Registration Report", "KYC Status Report", "Member Activity Report", "Demographic Analysis"],
    },
    {
      title: "Contribution Reports",
      description: "Member contribution tracking",
      icon: CreditCard,
      link: "/admin/reports/contributions",
      reports: [
        "Contribution Summary",
        "Payment Status Report",
        "Outstanding Contributions",
        "Contribution Trends",
      ],
    },
    {
      title: "Investment Reports",
      description: "Investment performance analytics",
      icon: TrendingUp,
      link: "/admin/reports/investments",
      reports: [
        "Investment Portfolio Report",
        "ROI Analysis Report",
        "Investment Performance Report",
        "Plan Comparison Report",
      ],
    },
    {
      title: "Loan Reports",
      description: "Loan disbursement and repayment",
      icon: HandCoins,
      link: "/admin/reports/loans",
      reports: [
        "Loan Application Report",
        "Disbursement Report",
        "Repayment Schedule Report",
        "Default Analysis Report",
      ],
    },
    {
      title: "Property Reports",
      description: "Property and investment analytics",
      icon: Home,
      link: "/admin/reports/properties",
      reports: [
        "Property Portfolio Report",
        "Investment Performance Report",
        "Property Allocation Report",
        "ROI Analysis Report",
      ],
    },
    {
      title: "Mail Service Reports",
      description: "Communication and messaging analytics",
      icon: Mail,
      link: "/admin/reports/mail-service",
      reports: [
        "Message Statistics",
        "Delivery Status Report",
        "Category Breakdown",
        "Response Time Analysis",
      ],
    },
    {
      title: "Audit Reports",
      description: "System activity and security logs",
      icon: Activity,
      link: "/admin/reports/audit",
      reports: [
        "Activity Log Report",
        "Security Audit Trail",
        "User Action Report",
        "System Events Report",
      ],
    },
  ]

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Generate and download system reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {reportCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.reports.map((report) => (
                      <div
                        key={report}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-medium">{report}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={category.link}>
                            <Download className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="default" className="w-full" asChild>
                      <Link href={category.link}>
                        View All {category.title}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
