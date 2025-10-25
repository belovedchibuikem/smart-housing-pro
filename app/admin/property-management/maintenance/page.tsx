"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Wrench, AlertCircle, CheckCircle, Clock, Eye } from "lucide-react"

export default function MaintenanceRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const maintenanceRecords = [
    {
      id: "MNT-001",
      estate: "FRSC Estate Phase 1",
      plotNumber: "A-12",
      issueType: "Plumbing",
      description: "Leaking pipe in kitchen",
      reportedBy: "John Doe (MEM-001)",
      reportDate: "Jan 10, 2025",
      priority: "High",
      status: "In Progress",
      assignedTo: "Maintenance Team A",
      estimatedCost: 50000,
      actualCost: 0,
      completionDate: null,
    },
    {
      id: "MNT-002",
      estate: "FRSC Estate Phase 2",
      plotNumber: "B-25",
      issueType: "Electrical",
      description: "Faulty wiring in living room",
      reportedBy: "Jane Smith (MEM-002)",
      reportDate: "Jan 8, 2025",
      priority: "Critical",
      status: "Pending",
      assignedTo: "Maintenance Team B",
      estimatedCost: 75000,
      actualCost: 0,
      completionDate: null,
    },
    {
      id: "MNT-003",
      estate: "FRSC Estate Phase 1",
      plotNumber: "C-08",
      issueType: "Roofing",
      description: "Roof leak during rain",
      reportedBy: "Michael Johnson (MEM-003)",
      reportDate: "Dec 28, 2024",
      priority: "Medium",
      status: "Completed",
      assignedTo: "Maintenance Team A",
      estimatedCost: 120000,
      actualCost: 115000,
      completionDate: "Jan 5, 2025",
    },
  ]

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record)
    setShowDetailsDialog(true)
  }

  const filteredRecords = maintenanceRecords.filter(
    (record) =>
      record.estate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.plotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.issueType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4" />
      case "In Progress":
        return <Clock className="h-4 w-4" />
      case "Pending":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "destructive"
      case "High":
        return "default"
      case "Medium":
        return "secondary"
      case "Low":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Records</h1>
          <p className="text-muted-foreground mt-1">Track and manage property maintenance requests</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Maintenance Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
                <div className="text-2xl font-bold">{maintenanceRecords.length}</div>
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
                <div className="text-2xl font-bold text-orange-600">
                  {maintenanceRecords.filter((r) => r.status === "Pending").length}
                </div>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">In Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {maintenanceRecords.filter((r) => r.status === "In Progress").length}
                </div>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold text-green-600">
                  {maintenanceRecords.filter((r) => r.status === "Completed").length}
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Maintenance Records</CardTitle>
              <CardDescription>View and manage maintenance requests and repairs</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Estate</TableHead>
                <TableHead>Plot</TableHead>
                <TableHead>Issue Type</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.estate}</TableCell>
                  <TableCell>{record.plotNumber}</TableCell>
                  <TableCell>{record.issueType}</TableCell>
                  <TableCell>{record.reportedBy}</TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(record.priority) as any}>{record.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <span>{record.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.assignedTo}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(record)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Maintenance Request Details</DialogTitle>
            <DialogDescription>Complete information about the maintenance request</DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Request Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Request ID</label>
                    <p className="font-semibold">{selectedRecord.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Report Date</label>
                    <p className="font-semibold">{selectedRecord.reportDate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Estate</label>
                    <p className="font-semibold">{selectedRecord.estate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Plot Number</label>
                    <p className="font-semibold">{selectedRecord.plotNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Reported By</label>
                    <p className="font-semibold">{selectedRecord.reportedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Assigned To</label>
                    <p className="font-semibold">{selectedRecord.assignedTo}</p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Issue Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Issue Type</label>
                    <p className="font-semibold">{selectedRecord.issueType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Description</label>
                    <p className="font-semibold">{selectedRecord.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Priority</label>
                      <div className="mt-1">
                        <Badge variant={getPriorityColor(selectedRecord.priority) as any}>
                          {selectedRecord.priority}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Status</label>
                      <div className="mt-1 flex items-center gap-2">
                        {getStatusIcon(selectedRecord.status)}
                        <span className="font-semibold">{selectedRecord.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Cost Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    <p className="text-2xl font-bold">₦{selectedRecord.estimatedCost.toLocaleString()}</p>
                  </div>
                  {selectedRecord.actualCost > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Actual Cost</p>
                      <p className="text-2xl font-bold text-green-600">₦{selectedRecord.actualCost.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {selectedRecord.completionDate && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Completion Date</p>
                    <p className="font-semibold text-green-600">{selectedRecord.completionDate}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Update Status</Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Assign Team
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Add Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
