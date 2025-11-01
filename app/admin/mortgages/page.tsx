"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, FileText, Download, Edit, Trash2, Check, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface Mortgage {
  id: string
  member: {
    id: string
    user: {
      first_name: string
      last_name: string
    }
    member_id?: string
    staff_id?: string
  }
  property?: {
    id: string
    title?: string
    address?: string
  }
  provider?: {
    id: string
    name: string
  }
  loan_amount: number
  interest_rate: number
  tenure_years: number
  monthly_payment: number
  status: string
  application_date: string
}

export default function AdminMortgagesPage() {
  const [mortgages, setMortgages] = useState<Mortgage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchMortgages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter])

  const fetchMortgages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await apiFetch<{ success: boolean; data: Mortgage[] }>(
        `/admin/mortgages?${params.toString()}`
      )
      if (response.success) {
        setMortgages(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch mortgages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewMortgage = (id: string) => {
    router.push(`/admin/mortgages/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/mortgages/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mortgage?")) return
    
    try {
      await apiFetch(`/admin/mortgages/${id}`, { method: "DELETE" })
      toast({
        title: "Success",
        description: "Mortgage deleted successfully",
      })
      fetchMortgages()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete mortgage",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await apiFetch(`/admin/mortgages/${id}/approve`, { method: "POST" })
      toast({
        title: "Success",
        description: "Mortgage approved successfully",
      })
      fetchMortgages()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve mortgage",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await apiFetch(`/admin/mortgages/${id}/reject`, { method: "POST" })
      toast({
        title: "Success",
        description: "Mortgage rejected successfully",
      })
      fetchMortgages()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject mortgage",
        variant: "destructive",
      })
    }
  }

  const stats = {
    total: mortgages.length,
    active: mortgages.filter(m => m.status === 'active' || m.status === 'approved').length,
    totalValue: mortgages.reduce((sum, m) => sum + m.loan_amount, 0),
    monthlyCollection: mortgages.reduce((sum, m) => sum + m.monthly_payment, 0),
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mortgage Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage housing mortgage agreements</p>
        </div>
        <Link href="/admin/mortgages/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Mortgage
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mortgages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(stats.totalValue / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(stats.monthlyCollection / 1000).toFixed(0)}K</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Mortgages</CardTitle>
          <CardDescription>View and manage all mortgage agreements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name, ID, or mortgage ID..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mortgage ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : mortgages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No mortgages found</TableCell>
                  </TableRow>
                ) : (
                  mortgages.map((mortgage) => (
                    <TableRow key={mortgage.id}>
                      <TableCell className="font-medium">{mortgage.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {mortgage.member?.user?.first_name} {mortgage.member?.user?.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {mortgage.member?.member_id || mortgage.member?.staff_id || '—'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {mortgage.property?.title || mortgage.property?.address || '—'}
                      </TableCell>
                      <TableCell className="text-right">₦{(mortgage.loan_amount / 1000000).toFixed(1)}M</TableCell>
                      <TableCell className="text-right">₦{(mortgage.monthly_payment / 1000).toFixed(0)}K</TableCell>
                      <TableCell>{mortgage.tenure_years} years</TableCell>
                      <TableCell>
                        <Badge variant={mortgage.status === "active" || mortgage.status === "approved" ? "default" : "secondary"}>
                          {mortgage.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewMortgage(mortgage.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {mortgage.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleApprove(mortgage.id)} title="Approve">
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleReject(mortgage.id)} title="Reject">
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(mortgage.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(mortgage.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
