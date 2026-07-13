"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Users, Home, MapPin, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getPropertyAllottees, getPropertyAllotteeStats, deletePropertyAllottee } from "@/lib/api/client"
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
import { Can, useTenantPermissions } from "@/components/admin/can-permission"
import { formatMemberDisplayIdentifier } from "@/hooks/use-sidebar-navigation"

interface Allottee {
  id: string
  property: {
    id: string
    title: string
    location: string
    type: string
  }
  member: {
    id: string
    name: string
    member_id?: string | null
    member_number?: string | null
    staff_id?: string | null
    ippis_number?: string | null
    email: string
  } | null
  allocation_date: string
  status: string
  unit_address?: string | null
  property_slot_id?: string | null
  slot_number?: number | null
  slot_label?: string | null
  sale_price?: number | null
  amount_paid?: number | null
  outstanding?: number | null
  payment_progress_percent?: number | null
  payment_status?: string | null
  notes?: string
  rejection_reason?: string
  created_at: string
}

export default function ManageAllotteesPage() {
  const { can } = useTenantPermissions()
  const [allottees, setAllottees] = useState<Allottee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAllottee, setSelectedAllottee] = useState<Allottee | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; allotteeId: string | null }>({ open: false, allotteeId: null })
  const [stats, setStats] = useState({ total_allottees: 0, approved_allottees: 0, pending_allottees: 0, rejected_allottees: 0 })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchAllottees()
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter])

  const fetchAllottees = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'all') params.status = statusFilter
      
      const response = await getPropertyAllottees(params)
      if (response.success) {
        setAllottees(response.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch allottees",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await getPropertyAllotteeStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.allotteeId) return
    
    try {
      const response = await deletePropertyAllottee(deleteDialog.allotteeId)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Allottee deleted successfully",
        })
        fetchAllottees()
        fetchStats()
        setDeleteDialog({ open: false, allotteeId: null })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete allottee",
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = (allottee: Allottee) => {
    setSelectedAllottee(allottee)
    setShowDetailsDialog(true)
  }

  const formatMoney = (value?: number | null) =>
    value == null ? "—" : `₦${Number(value).toLocaleString()}`

  const formatProgress = (allottee: Allottee) => {
    const percent =
      allottee.payment_progress_percent != null
        ? Math.round(Number(allottee.payment_progress_percent))
        : null
    return {
      percent,
      paid: formatMoney(allottee.amount_paid),
      sale: formatMoney(allottee.sale_price),
      outstanding: formatMoney(allottee.outstanding),
      status: allottee.payment_status,
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Allottees</h1>
          <p className="text-muted-foreground mt-1">View and manage property allocations</p>
        </div>
        <Can permission="manage_property_allottees|approve_allotments">
          <Button onClick={() => router.push("/admin/property-management/allottees/new")}>
            <Users className="h-4 w-4 mr-2" />
            Add New Allottee
          </Button>
        </Can>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Allottees</div>
                <div className="text-2xl font-bold">{stats.total_allottees}</div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Approved</div>
                <div className="text-2xl font-bold text-green-600">{stats.approved_allottees}</div>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending_allottees}</div>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Rejected</div>
                <div className="text-2xl font-bold text-red-600">{stats.rejected_allottees}</div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Allottees</CardTitle>
              <CardDescription>Complete list of property allocations</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search allottees..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : allottees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No allottees found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Property / Slot</TableHead>
                  <TableHead>Payment progress</TableHead>
                  <TableHead>Allocation Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allottees.map((allottee) => {
                  const memberIdentifier = formatMemberDisplayIdentifier(allottee.member)
                  const progress = formatProgress(allottee)
                  const slotText =
                    allottee.slot_label ||
                    (allottee.slot_number != null ? `Slot #${allottee.slot_number}` : null)
                  return (
                  <TableRow key={allottee.id}>
                    <TableCell>
                      {allottee.member ? (
                        <div>
                          <div className="font-medium">{allottee.member.name}</div>
                          {memberIdentifier ? (
                            <div className="text-sm text-muted-foreground">{memberIdentifier}</div>
                          ) : null}
                          <div className="text-sm text-muted-foreground">{allottee.member.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{allottee.property.title}</div>
                        {slotText ? (
                          <div className="text-sm text-muted-foreground">{slotText}</div>
                        ) : null}
                        <div className="text-sm text-muted-foreground">
                          {allottee.unit_address || allottee.property.location}
                        </div>
                        {allottee.unit_address ? (
                          <div className="text-xs text-muted-foreground">
                            Estate: {allottee.property.location}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-sm">
                        <div className="font-medium">
                          {progress.percent != null ? `${progress.percent}%` : "—"}
                          {progress.status ? (
                            <span className="ml-1 text-xs capitalize text-muted-foreground">
                              ({progress.status.replace(/_/g, " ")})
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Paid {progress.paid} / Sale {progress.sale}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Outstanding {progress.outstanding}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {allottee.allocation_date ? new Date(allottee.allocation_date).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(allottee.status)}>
                        {allottee.status.charAt(0).toUpperCase() + allottee.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Tenure & ownership"
                          onClick={() => router.push(`/admin/property-management/allottees/${allottee.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {can("manage_property_allottees|approve_allotments") && (
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/property-management/allottees/${allottee.id}/edit`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {can("manage_property_allottees") && (
                          <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, allotteeId: allottee.id })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Allottee Details</DialogTitle>
            <DialogDescription>Complete information about this property allocation</DialogDescription>
          </DialogHeader>
          {selectedAllottee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Member Name</p>
                  <p className="text-sm text-muted-foreground">{selectedAllottee.member?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Member identifier</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMemberDisplayIdentifier(selectedAllottee.member) ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{selectedAllottee.member?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Property</p>
                  <p className="text-sm text-muted-foreground">{selectedAllottee.property.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Slot</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAllottee.slot_label ||
                      (selectedAllottee.slot_number != null
                        ? `Slot #${selectedAllottee.slot_number}`
                        : "—")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment progress</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAllottee.payment_progress_percent != null
                      ? `${Math.round(Number(selectedAllottee.payment_progress_percent))}%`
                      : "—"}
                    {selectedAllottee.payment_status
                      ? ` · ${selectedAllottee.payment_status.replace(/_/g, " ")}`
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Paid / Sale / Outstanding</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(selectedAllottee.amount_paid)} / {formatMoney(selectedAllottee.sale_price)} /{" "}
                    {formatMoney(selectedAllottee.outstanding)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">House / block address</p>
                  <p className="text-sm text-muted-foreground">{selectedAllottee.unit_address || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Property location</p>
                  <p className="text-sm text-muted-foreground">{selectedAllottee.property.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Property Type</p>
                  <p className="text-sm text-muted-foreground">{selectedAllottee.property.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Allocation Date</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAllottee.allocation_date ? new Date(selectedAllottee.allocation_date).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedAllottee.status)}>
                    {selectedAllottee.status.charAt(0).toUpperCase() + selectedAllottee.status.slice(1)}
                  </Badge>
                </div>
              </div>
              {selectedAllottee.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedAllottee.notes}</p>
                </div>
              )}
              {selectedAllottee.rejection_reason && (
                <div>
                  <p className="text-sm font-medium">Rejection Reason</p>
                  <p className="text-sm text-red-600">{selectedAllottee.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, allotteeId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Allottee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this allottee record? This action cannot be undone.
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
    </div>
  )
}
