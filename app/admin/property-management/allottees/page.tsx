"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Users, Home, MapPin, Eye, Download } from "lucide-react"

export default function ManageAllotteesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAllottee, setSelectedAllottee] = useState<any>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const allottees = [
    {
      id: "ALL-001",
      memberNo: "MEM-001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+234 801 234 5678",
      estate: "FRSC Estate Phase 1",
      plotNumber: "A-12",
      houseType: "3 Bedroom Bungalow",
      allocationDate: "Jan 15, 2023",
      completionStatus: "Completed",
      occupancyStatus: "Occupied",
      paymentStatus: "Fully Paid",
      totalCost: 15000000,
      amountPaid: 15000000,
    },
    {
      id: "ALL-002",
      memberNo: "MEM-002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+234 802 345 6789",
      estate: "FRSC Estate Phase 2",
      plotNumber: "B-25",
      houseType: "4 Bedroom Duplex",
      allocationDate: "Mar 20, 2023",
      completionStatus: "Under Construction",
      occupancyStatus: "Pending",
      paymentStatus: "Partial",
      totalCost: 25000000,
      amountPaid: 18000000,
    },
    {
      id: "ALL-003",
      memberNo: "MEM-003",
      name: "Michael Johnson",
      email: "michael.j@example.com",
      phone: "+234 803 456 7890",
      estate: "FRSC Estate Phase 1",
      plotNumber: "C-08",
      houseType: "2 Bedroom Flat",
      allocationDate: "Feb 10, 2023",
      completionStatus: "Completed",
      occupancyStatus: "Occupied",
      paymentStatus: "Fully Paid",
      totalCost: 10000000,
      amountPaid: 10000000,
    },
  ]

  const handleViewDetails = (allottee: any) => {
    setSelectedAllottee(allottee)
    setShowDetailsDialog(true)
  }

  const filteredAllottees = allottees.filter(
    (allottee) =>
      allottee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allottee.memberNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allottee.estate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allottee.plotNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Allottees</h1>
          <p className="text-muted-foreground mt-1">View and manage property allottees</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Allottees
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Allottees</div>
                <div className="text-2xl font-bold">{allottees.length}</div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Occupied</div>
                <div className="text-2xl font-bold">
                  {allottees.filter((a) => a.occupancyStatus === "Occupied").length}
                </div>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Fully Paid</div>
                <div className="text-2xl font-bold">
                  {allottees.filter((a) => a.paymentStatus === "Fully Paid").length}
                </div>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Under Construction</div>
                <div className="text-2xl font-bold">
                  {allottees.filter((a) => a.completionStatus === "Under Construction").length}
                </div>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Allottees</CardTitle>
              <CardDescription>Manage property allocations and allottee information</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search allottees..."
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
                <TableHead>Member No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Estate</TableHead>
                <TableHead>Plot No</TableHead>
                <TableHead>House Type</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllottees.map((allottee) => (
                <TableRow key={allottee.id}>
                  <TableCell className="font-medium">{allottee.memberNo}</TableCell>
                  <TableCell>{allottee.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {allottee.estate}
                    </div>
                  </TableCell>
                  <TableCell>{allottee.plotNumber}</TableCell>
                  <TableCell>{allottee.houseType}</TableCell>
                  <TableCell>
                    <Badge variant={allottee.completionStatus === "Completed" ? "default" : "secondary"}>
                      {allottee.completionStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={allottee.paymentStatus === "Fully Paid" ? "default" : "secondary"}>
                      {allottee.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={allottee.occupancyStatus === "Occupied" ? "default" : "secondary"}>
                      {allottee.occupancyStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(allottee)}>
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
            <DialogTitle>Allottee Details</DialogTitle>
            <DialogDescription>Complete information about the allottee and their property</DialogDescription>
          </DialogHeader>

          {selectedAllottee && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Member Number</label>
                    <p className="font-semibold">{selectedAllottee.memberNo}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    <p className="font-semibold">{selectedAllottee.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-semibold">{selectedAllottee.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-semibold">{selectedAllottee.phone}</p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Property Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Estate</label>
                    <p className="font-semibold">{selectedAllottee.estate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Plot Number</label>
                    <p className="font-semibold">{selectedAllottee.plotNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">House Type</label>
                    <p className="font-semibold">{selectedAllottee.houseType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Allocation Date</label>
                    <p className="font-semibold">{selectedAllottee.allocationDate}</p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Status</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Completion</label>
                    <Badge variant={selectedAllottee.completionStatus === "Completed" ? "default" : "secondary"}>
                      {selectedAllottee.completionStatus}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Payment</label>
                    <Badge variant={selectedAllottee.paymentStatus === "Fully Paid" ? "default" : "secondary"}>
                      {selectedAllottee.paymentStatus}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Occupancy</label>
                    <Badge variant={selectedAllottee.occupancyStatus === "Occupied" ? "default" : "secondary"}>
                      {selectedAllottee.occupancyStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-2xl font-bold">₦{selectedAllottee.totalCost.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="text-2xl font-bold text-green-600">₦{selectedAllottee.amountPaid.toLocaleString()}</p>
                  </div>
                </div>
                {selectedAllottee.totalCost > selectedAllottee.amountPaid && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ₦{(selectedAllottee.totalCost - selectedAllottee.amountPaid).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">View Payment History</Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Download Documents
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Send Notification
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
