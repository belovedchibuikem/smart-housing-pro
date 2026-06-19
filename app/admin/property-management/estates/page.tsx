"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Building, MapPin, Users, Home, Eye, Loader2, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getPropertyLocationOverview } from "@/lib/api/client"
import { Can } from "@/components/admin/can-permission"
import {
  buildPropertiesFilterHref,
  formatNaira,
  type LocationOverviewRow,
  type LocationOverviewSummary,
} from "@/lib/properties/location-filters"

export default function ManageEstatesPage() {
  const [estates, setEstates] = useState<LocationOverviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEstate, setSelectedEstate] = useState<LocationOverviewRow | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [stats, setStats] = useState<LocationOverviewSummary | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    void fetchEstates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const fetchEstates = async () => {
    try {
      setLoading(true)
      const response = await getPropertyLocationOverview(searchQuery ? { search: searchQuery } : undefined)
      if (response.success && response.data) {
        setEstates(response.data.locations ?? [])
        setStats(response.data.summary ?? null)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch estates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (estate: LocationOverviewRow) => {
    setSelectedEstate(estate)
    setShowDetailsDialog(true)
  }

  const filterHref = (estate: LocationOverviewRow, segment: "houses" | "land") =>
    buildPropertiesFilterHref(
      {
        estateId: estate.id,
        location: estate.name,
        city: estate.city,
        state: estate.state,
        status: "all",
      },
      segment
    )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Estates</h1>
          <p className="text-muted-foreground mt-1">
            Location-level accountability — properties, subscriptions, collections, and maintenance by estate
          </p>
        </div>
        <Can permission="manage_property_estates|create_properties">
          <Button onClick={() => router.push("/admin/property-management/estates/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Estate
          </Button>
        </Can>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Estates</div>
                <div className="text-2xl font-bold">{stats?.total_locations ?? estates.length}</div>
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
                <div className="text-2xl font-bold">{stats?.total_properties ?? 0}</div>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Active Subscriptions</div>
                <div className="text-2xl font-bold">{stats?.total_subscriptions ?? 0}</div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Outstanding</div>
                <div className="text-2xl font-bold">{formatNaira(stats?.outstanding_balance, true)}</div>
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
              <CardDescription>Grouped by estate name, city, and state — click through to filtered property lists</CardDescription>
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
            <div className="text-center py-12 text-muted-foreground">No estates found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estate Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Land</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Subscriptions</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estates.map((estate) => (
                    <TableRow key={estate.id}>
                      <TableCell className="font-medium">{estate.name}</TableCell>
                      <TableCell>{estate.location_label}</TableCell>
                      <TableCell>
                        {estate.total_properties}
                        <span className="block text-xs text-muted-foreground">
                          {estate.allocated_properties} alloc · {estate.available_properties} avail
                        </span>
                      </TableCell>
                      <TableCell>{estate.land_parcels}</TableCell>
                      <TableCell>
                        <Badge variant={estate.occupancy_rate >= 80 ? "default" : estate.occupancy_rate >= 50 ? "secondary" : "outline"}>
                          {estate.occupancy_rate.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {estate.active_subscriptions}
                        {estate.pending_subscriptions > 0 ? (
                          <span className="block text-xs text-amber-600">{estate.pending_subscriptions} pending</span>
                        ) : null}
                      </TableCell>
                      <TableCell>{formatNaira(estate.amount_collected, true)}</TableCell>
                      <TableCell>{formatNaira(estate.outstanding_balance, true)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(estate)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={filterHref(estate, "houses")}>
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Houses
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={filterHref(estate, "land")}>
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Land
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEstate?.name}</DialogTitle>
            <DialogDescription>Estate accountability snapshot</DialogDescription>
          </DialogHeader>
          {selectedEstate && (
            <div className="space-y-4">
              <DetailRow label="Location" value={selectedEstate.location_label} />
              <DetailRow label="Houses / buildings" value={String(selectedEstate.total_properties)} />
              <DetailRow label="Land parcels" value={String(selectedEstate.land_parcels)} />
              <DetailRow
                label="Occupancy"
                value={`${selectedEstate.occupancy_rate.toFixed(1)}% (${selectedEstate.allocated_properties} allocated, ${selectedEstate.available_properties} available)`}
              />
              <DetailRow
                label="Subscriptions"
                value={`${selectedEstate.active_subscriptions} active, ${selectedEstate.pending_subscriptions} pending`}
              />
              <DetailRow label="Portfolio value" value={formatNaira(selectedEstate.total_value)} />
              <DetailRow label="Amount collected" value={formatNaira(selectedEstate.amount_collected)} />
              <DetailRow label="Outstanding balance" value={formatNaira(selectedEstate.outstanding_balance)} />
              <DetailRow
                label="Collection rate"
                value={`${selectedEstate.collection_rate.toFixed(1)}%`}
              />
              <DetailRow
                label="Maintenance"
                value={`${selectedEstate.maintenance_open} open of ${selectedEstate.maintenance_total} total`}
              />
              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={filterHref(selectedEstate, "houses")}>View houses</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={filterHref(selectedEstate, "land")}>View land</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  )
}
