"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Building, MapPin, Users, Home, Eye, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getPropertyEstates, getPropertyEstateStats } from "@/lib/api/client"

interface Estate {
  id: string
  name: string
  location: string
  city?: string
  state?: string
  total_properties: number
  allocated_properties: number
  available_properties: number
  completion_rate: number
}

export default function ManageEstatesPage() {
  const [estates, setEstates] = useState<Estate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEstate, setSelectedEstate] = useState<Estate | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [stats, setStats] = useState({ total_estates: 0, total_properties: 0, allocated_properties: 0, available_properties: 0 })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchEstates()
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const fetchEstates = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchQuery) params.search = searchQuery
      
      const response = await getPropertyEstates(params)
      if (response.success) {
        setEstates(response.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch estates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await getPropertyEstateStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats", error)
    }
  }

  const handleViewDetails = (estate: Estate) => {
    setSelectedEstate(estate)
    setShowDetailsDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Estates</h1>
          <p className="text-muted-foreground mt-1">View and manage all housing estates</p>
        </div>
        <Button onClick={() => router.push('/admin/property-management/estates/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Estate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Estates</div>
                <div className="text-2xl font-bold">{stats.total_estates}</div>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Properties</div>
                <div className="text-2xl font-bold">{stats.total_properties}</div>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Allocated</div>
                <div className="text-2xl font-bold">{stats.allocated_properties}</div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Available</div>
                <div className="text-2xl font-bold">{stats.available_properties}</div>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Estates</CardTitle>
              <CardDescription>Complete list of housing estates</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search estates..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : estates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No estates found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estate Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Total Properties</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estates.map((estate) => (
                  <TableRow key={estate.id}>
                    <TableCell className="font-medium">{estate.name}</TableCell>
                    <TableCell>{estate.location}</TableCell>
                    <TableCell>{estate.total_properties}</TableCell>
                    <TableCell>{estate.allocated_properties}</TableCell>
                    <TableCell>{estate.available_properties}</TableCell>
                    <TableCell>
                      <Badge variant={estate.completion_rate >= 80 ? 'default' : estate.completion_rate >= 50 ? 'secondary' : 'outline'}>
                        {estate.completion_rate.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(estate)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEstate?.name}</DialogTitle>
            <DialogDescription>Estate details and statistics</DialogDescription>
          </DialogHeader>
          {selectedEstate && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{selectedEstate.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Properties</p>
                <p className="text-sm text-muted-foreground">{selectedEstate.total_properties}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Allocated Properties</p>
                <p className="text-sm text-muted-foreground">{selectedEstate.allocated_properties}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Available Properties</p>
                <p className="text-sm text-muted-foreground">{selectedEstate.available_properties}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-sm text-muted-foreground">{selectedEstate.completion_rate.toFixed(1)}%</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
