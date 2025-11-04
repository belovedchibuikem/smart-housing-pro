"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, CheckCircle, XCircle, Eye, FileText, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

interface Loan {
  id: string
  member?: {
    member_id?: string
    user?: {
      first_name?: string
      last_name?: string
    }
  }
  amount: number
  interest_rate: number
  duration_months: number
  type: string
  purpose?: string
  status: string
  application_date: string
  created_at: string
}

interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export default function AdminLoansPage() {
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    totalDisbursed: 0,
  })

  useEffect(() => {
    fetchLoans()
    fetchStats()
  }, [statusFilter, activeTab])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchLoans()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const fetchLoans = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      
      // Map tab to status filter
      const statusMap: Record<string, string> = {
        pending: 'pending',
        approved: 'approved',
        active: 'active',
        rejected: 'rejected',
      }
      
      if (activeTab !== 'all') {
        params.append('status', statusMap[activeTab] || activeTab)
      } else if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      params.append('per_page', '15')

      const response = await apiFetch<{ success: boolean; data: Loan[]; pagination: Pagination }>(
        `/admin/loans?${params.toString()}`
      )

      if (response.success) {
        setLoans(response.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching loans:', error)
      sonnerToast.error("Failed to load loans", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const allResponse = await apiFetch<{ success: boolean; data: Loan[] }>('/admin/loans?per_page=1000')
      if (allResponse.success && allResponse.data) {
        const pending = allResponse.data.filter((l: Loan) => l.status === 'pending').length
        const active = allResponse.data.filter((l: Loan) => l.status === 'active').length
        const totalDisbursed = allResponse.data
          .filter((l: Loan) => l.status === 'active' || l.status === 'approved')
          .reduce((sum: number, l: Loan) => sum + (l.amount || 0), 0)

        setStats({ pending, active, totalDisbursed })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleApprove = async (loanId: string) => {
    try {
      setProcessing(loanId)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/loans/${loanId}/approve`,
        { method: 'POST' }
      )

      if (response.success) {
        sonnerToast.success("Loan Approved", {
          description: response.message || "Loan has been approved successfully",
        })
        fetchLoans()
        fetchStats()
      }
    } catch (error: any) {
      console.error('Error approving loan:', error)
      sonnerToast.error("Failed to approve loan", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (loanId: string) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (!reason) return

    try {
      setProcessing(loanId)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/loans/${loanId}/reject`,
        {
          method: 'POST',
          body: { rejection_reason: reason }
        }
      )

      if (response.success) {
        sonnerToast.success("Loan Rejected", {
          description: response.message || "Loan has been rejected",
        })
        fetchLoans()
        fetchStats()
      }
    } catch (error: any) {
      console.error('Error rejecting loan:', error)
      sonnerToast.error("Failed to reject loan", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleDisburse = async (loanId: string) => {
    try {
      setProcessing(loanId)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/loans/${loanId}/disburse`,
        { method: 'POST' }
      )

      if (response.success) {
        sonnerToast.success("Loan Disbursed", {
          description: response.message || "Loan has been disbursed successfully",
        })
        fetchLoans()
        fetchStats()
      }
    } catch (error: any) {
      console.error('Error disbursing loan:', error)
      sonnerToast.error("Failed to disburse loan", {
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

  const getMemberName = (loan: Loan) => {
    if (loan.member?.user) {
      return `${loan.member.user.first_name || ''} ${loan.member.user.last_name || ''}`.trim() || 'N/A'
    }
    return 'N/A'
  }

  const getMemberId = (loan: Loan) => {
    return loan.member?.member_id || 'N/A'
  }

  const calculateMonthlyPayment = (loan: Loan) => {
    if (!loan.amount || !loan.duration_months || loan.duration_months === 0) return 0
    const interest = loan.amount * (loan.interest_rate / 100)
    const total = loan.amount + interest
    return total / loan.duration_months
  }

  const filteredLoans = loans.filter((loan) => {
    if (activeTab === 'pending') return loan.status === 'pending'
    if (activeTab === 'approved') return loan.status === 'approved'
    if (activeTab === 'active') return loan.status === 'active'
    if (activeTab === 'rejected') return loan.status === 'rejected'
    return true
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage loan applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/bulk-upload/loan-repayments">Bulk Upload Repayments</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/loan-products">Loan Products</Link>
        </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently disbursed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalDisbursed)}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="active">Active Loans</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {activeTab === 'pending' && 'Pending Loan Applications'}
                    {activeTab === 'approved' && 'Approved Loans'}
                    {activeTab === 'active' && 'Active Loans'}
                    {activeTab === 'rejected' && 'Rejected Applications'}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === 'pending' && 'Applications awaiting approval decision'}
                    {activeTab === 'approved' && 'Loans approved and ready for disbursement'}
                    {activeTab === 'active' && 'Currently disbursed loans with ongoing repayments'}
                    {activeTab === 'rejected' && 'Loan applications that were not approved'}
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search loans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredLoans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No loans found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLoans.map((loan) => (
                      <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <div>
                              <p className="font-medium">{getMemberName(loan)}</p>
                              <p className="text-sm text-muted-foreground">{getMemberId(loan)}</p>
                          </div>
                        </TableCell>
                          <TableCell>{loan.type || '-'}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(loan.amount)}</TableCell>
                          <TableCell>{loan.duration_months} months</TableCell>
                          <TableCell>{formatCurrency(calculateMonthlyPayment(loan))}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(loan.application_date || loan.created_at)}
                          </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={processing === loan.id}>
                                  {processing === loan.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                <MoreVertical className="h-4 w-4" />
                                  )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/admin/loans/${loan.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                                {loan.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      className="text-green-600"
                                      onClick={() => handleApprove(loan.id)}
                                    >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Loan
                              </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleReject(loan.id)}
                                    >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Loan
                              </DropdownMenuItem>
                                  </>
                                )}
                                {loan.status === 'approved' && (
                                  <DropdownMenuItem
                                    className="text-green-600"
                                    onClick={() => handleDisburse(loan.id)}
                                  >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Disburse Loan
                              </DropdownMenuItem>
                                )}
                                {loan.status === 'active' && (
                                  <DropdownMenuItem onClick={() => router.push(`/admin/loans/${loan.id}`)}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Repayment History
                              </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
