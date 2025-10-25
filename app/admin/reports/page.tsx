"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { SimpleBarChart } from "@/components/charts/simple-bar"

interface ReportData {
  total?: number
  series?: Array<{ label: string; value: number }>
}

export default function AdminReportsPage() {
  const [financial, setFinancial] = useState<ReportData | null>(null)
  const [member, setMember] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || ""
        const [finRes, memRes] = await Promise.all([
          fetch(`${base}/reports/financial-summary`, { cache: "no-store" }),
          fetch(`${base}/reports/member-analytics`, { cache: "no-store" }),
        ])
        const fin = await finRes.json()
        const mem = await memRes.json()
        if (!finRes.ok) throw new Error(fin?.message || "Failed financial report")
        if (!memRes.ok) throw new Error(mem?.message || "Failed member report")
        setFinancial(fin)
        setMember(mem)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load reports")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  const finSeries = (financial?.series || []) as Array<{ label: string; value: number }>
  const memSeries = (member?.series || []) as Array<{ label: string; value: number }>

  return (
    <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
      <SimpleBarChart data={finSeries} title="Financial Summary" />
      <SimpleBarChart data={memSeries} title="Member Analytics" />
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, Users, Wallet, Home } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminReportsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const reportCategories = [
    {
      title: "Financial Reports",
      description: "Contribution and transaction reports",
      icon: Wallet,
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
      reports: ["Member Registration Report", "KYC Status Report", "Member Activity Report", "Demographic Analysis"],
    },
    {
      title: "Loan Reports",
      description: "Loan disbursement and repayment",
      icon: TrendingUp,
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
      reports: [
        "Property Portfolio Report",
        "Investment Performance Report",
        "Property Allocation Report",
        "ROI Analysis Report",
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
            <Select defaultValue="this-month">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
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
                    <div>
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
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Custom Report Builder</CardTitle>
            <CardDescription>Create custom reports with specific parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="members">Members</SelectItem>
                  <SelectItem value="loans">Loans</SelectItem>
                  <SelectItem value="properties">Properties</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
              <Button>Generate Report</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
