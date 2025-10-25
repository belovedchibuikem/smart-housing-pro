"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Building, MapPin, Users, Home, Eye } from "lucide-react"

export default function ManageEstatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEstate, setSelectedEstate] = useState<any>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const estates = [
    {
      id: "EST-001",
      name: "FRSC Estate Phase 1",
      location: "Gwarinpa, Abuja",
      totalPlots: 150,
      allocatedPlots: 120,
      availablePlots: 30,
      totalHouses: 80,
      completedHouses: 65,
      status: "Active",
      developer: "FRSC Housing Cooperative",
      startDate: "Jan 2020",
      completionRate: 81,
    },
    {
      id: "EST-002",
      name: "FRSC Estate Phase 2",
      location: "Lugbe, Abuja",
      totalPlots: 200,
      allocatedPlots: 150,
      availablePlots: 50,
      totalHouses: 100,
      completedHouses: 45,
      status: "Active",
      developer: "FRSC Housing Cooperative",
      startDate: "Jun 2021",
      completionRate: 45,
    },
    {
      id: "EST-003",
      name: "FRSC Estate Phase 3",
      location: "Apo, Abuja",
      totalPlots: 100,
      allocatedPlots: 30,
      availablePlots: 70,
      totalHouses: 50,
      completedHouses: 10,
      status: "Under Development",
      developer: "FRSC Housing Cooperative",
      startDate: "Mar 2023",
      completionRate: 20,
    },
  ]

  const handleViewDetails = (estate: any) => {
    setSelectedEstate(estate)
    setShowDetailsDialog(true)
  }

  const filteredEstates = estates.filter(
    (estate) =>
      estate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estate.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estate.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Estates</h1>
          <p className="text-muted-foreground mt-1">View and manage all housing estates</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Estate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Estates</div>
                <div className="text-2xl font-bold">{estates.length}</div>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Plots</div>
                <div className="text-2xl font-bold">{estates.reduce((sum, e) => sum + e.totalPlots, 0)}</div>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Allocated Plots</div>
                <div className="text-2xl font-bold">{estates.reduce((sum, e) => sum + e.allocatedPlots, 0)}</div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Completed Houses</div>
                <div className="text-2xl font-bold">{estates.reduce((sum, e) => sum + e.completedHouses, 0)}</div>
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
              <CardTitle>All Estates</CardTitle>
              <CardDescription>Manage and monitor all housing estates</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search estates..."
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
                <TableHead>Estate ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Total Plots</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstates.map((estate) => (
                <TableRow key={estate.id}>
                  <TableCell className="font-medium">{estate.id}</TableCell>
                  <TableCell>{estate.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {estate.location}
                    </div>
                  </TableCell>
                  <TableCell>{estate.totalPlots}</TableCell>
                  <TableCell>{estate.allocatedPlots}</TableCell>
                  <TableCell>{estate.availablePlots}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${estate.completionRate}%` }} />
                      </div>
                      <span className="text-sm">{estate.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={estate.status === "Active" ? "default" : "secondary"}>{estate.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(estate)}>
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
            <DialogTitle>{selectedEstate?.name}</DialogTitle>
            <DialogDescription>Complete estate information and statistics</DialogDescription>
          </DialogHeader>

          {selectedEstate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Estate ID</label>
                  <p className="font-semibold">{selectedEstate.id}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Location</label>
                  <p className="font-semibold">{selectedEstate.location}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Developer</label>
                  <p className="font-semibold">{selectedEstate.developer}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Start Date</label>
                  <p className="font-semibold">{selectedEstate.startDate}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Plot Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Plots</p>
                    <p className="text-2xl font-bold">{selectedEstate.totalPlots}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Allocated</p>
                    <p className="text-2xl font-bold text-green-600">{selectedEstate.allocatedPlots}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedEstate.availablePlots}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Construction Progress</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Houses</p>
                    <p className="text-2xl font-bold">{selectedEstate.totalHouses}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{selectedEstate.completedHouses}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Completion</span>
                    <span className="font-semibold">{selectedEstate.completionRate}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${selectedEstate.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Edit Estate</Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  View Allottees
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Generate Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
