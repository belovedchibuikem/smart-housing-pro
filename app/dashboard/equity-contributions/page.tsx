"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Eye, Wallet, TrendingUp, Calendar, Target, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

interface EquityContribution {
  id: string
  plan?: {
    name?: string
  }
  amount: number
  payment_method: string
  status: string
  payment_reference?: string
  notes?: string
  approved_at?: string
  created_at: string
}

export default function EquityContributionsPage() {
  const [loading, setLoading] = useState(true)
  const [contributions, setContributions] = useState<EquityContribution[]>([])
  const [stats, setStats] = useState({
    totalContributions: 0,
    thisMonth: 0,
    thisYear: 0,
    approved: 0,
    pending: 0,
  })

  useEffect(() => {
    fetchContributions()
  }, [])

  const fetchContributions = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success: boolean; data: EquityContribution[]; pagination?: any }>(
        '/user/equity-contributions?per_page=100'
      )

      if (response.success) {
        const contributionsData = Array.isArray(response.data) ? response.data : (response.data as any).data || []
        setContributions(contributionsData)

        // Calculate stats
        const now = new Date()
        const thisMonth = contributionsData.filter((c: EquityContribution) => {
          const date = new Date(c.created_at)
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        })
        const thisYear = contributionsData.filter((c: EquityContribution) => {
          const date = new Date(c.created_at)
          return date.getFullYear() === now.getFullYear()
        })

        const parseAmount = (value: unknown): number => {
          const parsed = Number(value)
          return Number.isFinite(parsed) ? parsed : 0
        }

        setStats({
          totalContributions: contributionsData.reduce(
            (sum: number, contribution: EquityContribution) => sum + parseAmount(contribution.amount),
            0,
          ),
          thisMonth: thisMonth.reduce(
            (sum: number, contribution: EquityContribution) => sum + parseAmount(contribution.amount),
            0,
          ),
          thisYear: thisYear.reduce(
            (sum: number, contribution: EquityContribution) => sum + parseAmount(contribution.amount),
            0,
          ),
          approved: contributionsData.filter((c: EquityContribution) => c.status === "approved").length,
          pending: contributionsData.filter((c: EquityContribution) => c.status === "pending").length,
        })
      }
    } catch (error: any) {
      console.error('Error fetching equity contributions:', error)
      sonnerToast.error("Failed to load equity contributions", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
      failed: "destructive",
    }

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  })

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Equity Contributions</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your equity contributions for property deposits</p>
        </div>
        <Link href="/dashboard/equity-contributions/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Make Equity Contribution
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Contributions</p>
              <p className="text-2xl font-bold">{currencyFormatter.format(stats.totalContributions || 0)}</p>
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
              <p className="text-2xl font-bold">{currencyFormatter.format(stats.thisMonth || 0)}</p>
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
              <p className="text-2xl font-bold">{currencyFormatter.format(stats.thisYear || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Contributions History</CardTitle>
          <CardDescription>All your equity contributions for property deposits</CardDescription>
        </CardHeader>
        <CardContent>
          {contributions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No equity contributions yet</p>
              <Link href="/dashboard/equity-contributions/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Make Your First Contribution
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>{new Date(contribution.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{contribution.plan?.name || "N/A"}</TableCell>
                    <TableCell className="font-semibold">
                      ₦{parseFloat(contribution.amount.toString()).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {contribution.payment_method?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {contribution.payment_reference || "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(contribution.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/equity-contributions/${contribution.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

