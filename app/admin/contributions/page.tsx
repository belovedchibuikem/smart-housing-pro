"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Eye, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

interface Contribution {
  id: string
  member?: {
    member_id?: string
    user?: {
      first_name?: string
      last_name?: string
    }
  }
  amount: number
  type: string
  frequency: string
  status: string
  contribution_date: string
  payment_method?: string
  created_at: string
}

interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export default function AdminContributionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalThisMonth: 0,
    pending: 0,
    completed: 0,
    totalAllTime: 0,
  })
  const router = useRouter()

  const fetchContributions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('per_page', '15')

      const response = await apiFetch<{ success: boolean; data: Contribution[]; pagination: Pagination }>(
        `/admin/contributions?${params.toString()}`
      )

      if (response.success) {
        setContributions(response.data || [])
        setPagination(response.pagination || null)
      }
    } catch (error: any) {
      console.error('Error fetching contributions:', error)
      sonnerToast.error("Failed to load contributions", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const allResponse = await apiFetch<{ success: boolean; data: Contribution[] }>('/admin/contributions?per_page=1000')
      if (allResponse.success && allResponse.data) {
        const now = new Date()
        const thisMonth = allResponse.data.filter((c: Contribution) => {
          const date = new Date(c.contribution_date || c.created_at)
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        })

        const totalThisMonth = thisMonth.reduce((sum: number, c: Contribution) => sum + (c.amount || 0), 0)
        const pending = allResponse.data.filter((c: Contribution) => c.status === 'pending').length
        const completed = allResponse.data.filter((c: Contribution) => c.status === 'approved' || c.status === 'completed').length
        const totalAllTime = allResponse.data.reduce((sum: number, c: Contribution) => sum + (c.amount || 0), 0)

        setStats({ totalThisMonth, pending, completed, totalAllTime })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchContributions()
    fetchStats()
  }, [statusFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchContributions()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleViewContribution = (id: string) => {
    router.push(`/admin/contributions/${id}`)
  }

  const handleApproveContribution = async (id: string) => {
    try {
      setProcessing(id)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/contributions/${id}/approve`,
        { method: 'POST' }
      )

      if (response.success) {
        sonnerToast.success("Contribution Approved", {
          description: response.message || "Contribution has been approved successfully",
        })
        fetchContributions()
        fetchStats()
      }
    } catch (error: any) {
      console.error('Error approving contribution:', error)
      sonnerToast.error("Failed to approve contribution", {
        description: error.message || "Please try again later",
    })
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectContribution = async (id: string) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (!reason) return

    try {
      setProcessing(id)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/contributions/${id}/reject`,
        {
          method: 'POST',
          body: { rejection_reason: reason }
        }
      )

      if (response.success) {
        sonnerToast.success("Contribution Rejected", {
          description: response.message || "Contribution has been rejected",
        })
        fetchContributions()
        fetchStats()
      }
    } catch (error: any) {
      console.error('Error rejecting contribution:', error)
      sonnerToast.error("Failed to reject contribution", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
  }

  const getMemberName = (contribution: Contribution) => {
    if (contribution.member?.user) {
      return `${contribution.member.user.first_name || ''} ${contribution.member.user.last_name || ''}`.trim() || 'N/A'
    }
    return 'N/A'
  }

  const getMemberId = (contribution: Contribution) => {
    return contribution.member?.member_id || 'N/A'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contribution Management</h1>
          <p className="text-muted-foreground mt-1">View and manage member contributions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/bulk-upload/contributions">Bulk Upload</Link>
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalThisMonth)}</div>
            <p className="text-xs text-muted-foreground mt-1">Current month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved contributions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total All Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAllTime)}</div>
            <p className="text-xs text-muted-foreground mt-1">Since inception</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contributions</CardTitle>
          <CardDescription>View and verify member contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name, ID, or contribution ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contribution ID</TableHead>
                  <TableHead>Member</TableHead>
                      <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {contributions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No contributions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      contributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                          <TableCell className="font-medium">{contribution.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <div>
                              <div className="font-medium">{getMemberName(contribution)}</div>
                              <div className="text-sm text-muted-foreground">{getMemberId(contribution)}</div>
                      </div>
                    </TableCell>
                          <TableCell>{contribution.type || contribution.frequency || '-'}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(contribution.amount)}</TableCell>
                          <TableCell>{contribution.payment_method || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(contribution.contribution_date || contribution.created_at)}
                          </TableCell>
                    <TableCell>
                            <Badge 
                              variant={
                                contribution.status === "approved" || contribution.status === "completed" 
                                  ? "default" 
                                  : contribution.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                        {contribution.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleViewContribution(contribution.id)}
                                disabled={processing === contribution.id}
                              >
                          <Eye className="h-4 w-4" />
                        </Button>
                              {(contribution.status === "pending") && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => handleApproveContribution(contribution.id)}
                                    disabled={processing === contribution.id}
                            >
                                    {processing === contribution.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                              <CheckCircle className="h-4 w-4" />
                                    )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleRejectContribution(contribution.id)}
                                    disabled={processing === contribution.id}
                            >
                                    {processing === contribution.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                              <XCircle className="h-4 w-4" />
                                    )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                      ))
                    )}
              </TableBody>
            </Table>
          </div>

              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} contributions
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (pagination.current_page > 1) {
                          // Update pagination logic here
                        }
                      }}
                      disabled={pagination.current_page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (pagination.current_page < pagination.last_page) {
                          // Update pagination logic here
                        }
                      }}
                      disabled={pagination.current_page === pagination.last_page}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
