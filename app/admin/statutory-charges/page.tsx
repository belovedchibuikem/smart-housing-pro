"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Plus, Check, X, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getStatutoryCharges, getStatutoryChargeStats, deleteStatutoryCharge, approveStatutoryCharge, rejectStatutoryCharge } from "@/lib/api/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface StatutoryCharge {
  id: string
  member_id: string
  member: {
    id: string
    name: string
    member_id?: string
  } | null
  type: string
  amount: number
  description?: string
  due_date: string
  status: string
  total_paid: number
  remaining_amount: number
  is_overdue: boolean
}

export default function StatutoryChargesPage() {
  const [charges, setCharges] = useState<StatutoryCharge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [stats, setStats] = useState({ total_charges: 0, paid_charges: 0, pending_charges: 0, overdue_charges: 0, overdue_count: 0, collection_rate: 0 })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; chargeId: string | null }>({ open: false, chargeId: null })
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; chargeId: string | null }>({ open: false, chargeId: null })
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; chargeId: string | null; reason: string }>({ open: false, chargeId: null, reason: "" })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCharges()
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, typeFilter])

  const fetchCharges = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'all') params.status = statusFilter
      if (typeFilter !== 'all') params.type = typeFilter
      
      const response = await getStatutoryCharges(params)
      if (response.success) {
        setCharges(response.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch statutory charges",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await getStatutoryChargeStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.chargeId) return
    
    try {
      const response = await deleteStatutoryCharge(deleteDialog.chargeId)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Statutory charge deleted successfully",
        })
        fetchCharges()
        fetchStats()
        setDeleteDialog({ open: false, chargeId: null })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete statutory charge",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async () => {
    if (!approveDialog.chargeId) return
    
    try {
      const response = await approveStatutoryCharge(approveDialog.chargeId)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Charge approved successfully",
        })
        fetchCharges()
        fetchStats()
        setApproveDialog({ open: false, chargeId: null })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to approve charge",
        variant: "destructive",
      })
    }
  }

  const handleReject = async () => {
    if (!rejectDialog.chargeId || !rejectDialog.reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      })
      return
    }
    
    try {
      const response = await rejectStatutoryCharge(rejectDialog.chargeId, rejectDialog.reason)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Charge rejected successfully",
        })
        fetchCharges()
        fetchStats()
        setRejectDialog({ open: false, chargeId: null, reason: "" })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to reject charge",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "approved":
        return "secondary"
      case "pending":
        return "outline"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const uniqueTypes = Array.from(new Set(charges.map(c => c.type)))

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Statutory Charges</h1>
            <p className="text-muted-foreground mt-1">View and manage all statutory charges</p>
          </div>
          <Link href="/admin/statutory-charges/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Charge
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Charges</CardDescription>
              <CardTitle className="text-3xl">₦{(stats.total_charges / 1000000).toFixed(1)}M</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Across all members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Paid</CardDescription>
              <CardTitle className="text-3xl text-green-600">₦{(stats.paid_charges / 1000).toFixed(0)}K</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stats.collection_rate.toFixed(1)}% collection rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">₦{(stats.pending_charges / 1000).toFixed(0)}K</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Pending payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Overdue</CardDescription>
              <CardTitle className="text-3xl text-red-600">₦{(stats.overdue_charges / 1000).toFixed(0)}K</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stats.overdue_count} overdue charges</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Statutory Charges</CardTitle>
                <CardDescription>Complete list of charges</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search charges..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : charges.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No statutory charges found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Charge ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Charge Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charges.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell className="font-medium">{charge.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        {charge.member?.name || '—'}
                        {charge.member?.member_id && (
                          <span className="text-xs text-muted-foreground block">{charge.member.member_id}</span>
                        )}
                      </TableCell>
                      <TableCell>{charge.type}</TableCell>
                      <TableCell className="font-semibold">
                        ₦{charge.amount.toLocaleString()}
                        {charge.remaining_amount > 0 && charge.remaining_amount < charge.amount && (
                          <span className="text-xs text-muted-foreground block">
                            Remaining: ₦{charge.remaining_amount.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(charge.due_date).toLocaleDateString()}
                        {charge.is_overdue && (
                          <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(charge.status)}>
                          {charge.status.charAt(0).toUpperCase() + charge.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/statutory-charges/${charge.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {charge.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => setApproveDialog({ open: true, chargeId: charge.id })}>
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setRejectDialog({ open: true, chargeId: charge.id, reason: "" })}>
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/statutory-charges/${charge.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, chargeId: charge.id })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, chargeId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Statutory Charge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this statutory charge? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open, chargeId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Statutory Charge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this statutory charge?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, chargeId: null, reason: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Statutory Charge</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this charge.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter rejection reason..."
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
