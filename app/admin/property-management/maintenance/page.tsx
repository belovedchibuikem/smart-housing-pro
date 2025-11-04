"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Wrench, AlertCircle, CheckCircle, Clock, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getPropertyMaintenance, getPropertyMaintenanceStats, deletePropertyMaintenance } from "@/lib/api/client"
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

interface MaintenanceRecord {
  id: string
  property: {
    id: string
    title: string
    location: string
  }
  reported_by: {
    id: string
    name: string
    member_id: string
  } | null
  issue_type?: string
  priority: string
  description: string
  status: string
  assigned_to?: {
    id: string
    name: string
  } | null
  estimated_cost?: number
  actual_cost?: number
  reported_date?: string
  started_date?: string
  completed_date?: string
  resolution_notes?: string
  created_at: string
  updated_at: string
}

export default function MaintenanceRecordsPage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; recordId: string | null }>({ open: false, recordId: null })
  const [stats, setStats] = useState({
    total_records: 0,
    pending_records: 0,
    in_progress_records: 0,
    completed_records: 0,
    cancelled_records: 0,
    total_estimated_cost: 0,
    total_actual_cost: 0,
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchRecords()
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'all') params.maintenance_status = statusFilter
      
      const response = await getPropertyMaintenance(params)
      if (response.success) {
        setRecords(response.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch maintenance records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await getPropertyMaintenanceStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.recordId) return
    
    try {
      const response = await deletePropertyMaintenance(deleteDialog.recordId)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Maintenance record deleted successfully",
        })
        fetchRecords()
        fetchStats()
        setDeleteDialog({ open: false, recordId: null })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete maintenance record",
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = (record: MaintenanceRecord) => {
    setSelectedRecord(record)
    setShowDetailsDialog(true)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Records</h1>
          <p className="text-muted-foreground mt-1">View and manage property maintenance requests</p>
        </div>
        <Button onClick={() => router.push('/admin/property-management/maintenance/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Maintenance Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Records</div>
                <div className="text-2xl font-bold">{stats.total_records}</div>
              </div>
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending_records}</div>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">In Progress</div>
                <div className="text-2xl font-bold text-blue-600">{stats.in_progress_records}</div>
              </div>
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold text-green-600">{stats.completed_records}</div>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Maintenance Records</CardTitle>
              <CardDescription>Complete list of maintenance requests and repairs</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search records..." 
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
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No maintenance records found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.property.title}</div>
                        <div className="text-sm text-muted-foreground">{record.property.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.issue_type || '—'}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.description}</TableCell>
                    <TableCell>
                      {record.reported_by ? (
                        <div>
                          <div className="font-medium">{record.reported_by.name}</div>
                          <div className="text-sm text-muted-foreground">{record.reported_by.member_id}</div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(record.priority)} className="flex items-center gap-1 w-fit">
                        {getPriorityIcon(record.priority)}
                        {record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(record.status)}>
                        {record.status.replace('_', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.actual_cost ? (
                        <span className="font-semibold">₦{record.actual_cost.toLocaleString()}</span>
                      ) : record.estimated_cost ? (
                        <span className="text-muted-foreground">₦{record.estimated_cost.toLocaleString()} (est.)</span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(record)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/property-management/maintenance/${record.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, recordId: record.id })}>
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

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Maintenance Record Details</DialogTitle>
            <DialogDescription>Complete information about this maintenance request</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Property</p>
                  <p className="text-sm text-muted-foreground">{selectedRecord.property.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedRecord.property.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Issue Type</p>
                  <p className="text-sm text-muted-foreground">{selectedRecord.issue_type || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <Badge variant={getPriorityBadgeVariant(selectedRecord.priority)} className="flex items-center gap-1 w-fit">
                    {getPriorityIcon(selectedRecord.priority)}
                    {selectedRecord.priority.charAt(0).toUpperCase() + selectedRecord.priority.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedRecord.status)}>
                    {selectedRecord.status.replace('_', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                  </Badge>
                </div>
                {selectedRecord.reported_by && (
                  <div>
                    <p className="text-sm font-medium">Reported By</p>
                    <p className="text-sm text-muted-foreground">{selectedRecord.reported_by.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedRecord.reported_by.member_id}</p>
                  </div>
                )}
                {selectedRecord.assigned_to && (
                  <div>
                    <p className="text-sm font-medium">Assigned To</p>
                    <p className="text-sm text-muted-foreground">{selectedRecord.assigned_to.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Reported Date</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRecord.reported_date ? new Date(selectedRecord.reported_date).toLocaleDateString() : '—'}
                  </p>
                </div>
                {selectedRecord.started_date && (
                  <div>
                    <p className="text-sm font-medium">Started Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedRecord.started_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedRecord.completed_date && (
                  <div>
                    <p className="text-sm font-medium">Completed Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedRecord.completed_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedRecord.estimated_cost && (
                  <div>
                    <p className="text-sm font-medium">Estimated Cost</p>
                    <p className="text-sm text-muted-foreground">₦{selectedRecord.estimated_cost.toLocaleString()}</p>
                  </div>
                )}
                {selectedRecord.actual_cost && (
                  <div>
                    <p className="text-sm font-medium">Actual Cost</p>
                    <p className="text-sm font-semibold">₦{selectedRecord.actual_cost.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{selectedRecord.description}</p>
              </div>
              {selectedRecord.resolution_notes && (
                <div>
                  <p className="text-sm font-medium">Resolution Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedRecord.resolution_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, recordId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Maintenance Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this maintenance record? This action cannot be undone.
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
