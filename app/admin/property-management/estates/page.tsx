"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Building, MapPin, Users, Home, Loader2, Download, Layers } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getPropertyEstates, exportReport } from "@/lib/api/client"
import { Can } from "@/components/admin/can-permission"
import { formatNaira } from "@/lib/properties/location-filters"

type EstateRow = {
  id: string
  name: string
  location?: string
  location_label?: string
  city?: string | null
  state?: string | null
  total_properties: number
  allocated_properties: number
  available_properties: number
  occupancy_rate: number
  active_subscriptions: number
  pending_subscriptions: number
  amount_collected: number
  outstanding_balance: number
}

type Summary = {
  total_estates: number
  total_properties: number
  ungrouped_houses: number
  outstanding_balance: number
  active_subscriptions: number
}

export default function ManageEstatesPage() {
  const [estates, setEstates] = useState<EstateRow[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchEstates()
    }, searchQuery ? 300 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const fetchEstates = async () => {
    try {
      setLoading(true)
      const response = await getPropertyEstates(searchQuery ? { search: searchQuery } : undefined)
      if (response.success) {
        setEstates(response.data ?? [])
        setSummary(response.summary ?? null)
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

  const handleDownloadBalances = async (estate?: EstateRow) => {
    const key = estate?.id || "all"
    try {
      setDownloadingKey(key)
      await exportReport("estate-repayment-balances", {
        format: "xlsx",
        estate_id: estate?.id || undefined,
      })
      toast({
        title: "Download started",
        description: estate
          ? `Repayment balances for ${estate.name} have been downloaded.`
          : "Repayment balances for all estates have been downloaded.",
      })
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error?.message || "Could not download repayment balances.",
        variant: "destructive",
      })
    } finally {
      setDownloadingKey(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Estates</h1>
          <p className="text-muted-foreground mt-1">
            Group existing houses under one estate, then download repayment balances for that estate.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Can permission="export_reports|view_property_reports">
            <Button
              variant="outline"
              onClick={() => handleDownloadBalances()}
              disabled={downloadingKey === "all"}
            >
              {downloadingKey === "all" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download all balances
            </Button>
          </Can>
          <Can permission="manage_property_estates|edit_properties">
            <Button onClick={() => router.push("/admin/property-management/estates/group")}>
              <Layers className="h-4 w-4 mr-2" />
              Group houses into estate
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Estates</div>
                <div className="text-2xl font-bold">{summary?.total_estates ?? estates.length}</div>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Houses in estates</div>
                <div className="text-2xl font-bold">{summary?.total_properties ?? 0}</div>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Ungrouped houses</div>
                <div className="text-2xl font-bold">{summary?.ungrouped_houses ?? 0}</div>
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
                <div className="text-2xl font-bold">{formatNaira(summary?.outstanding_balance, true)}</div>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Estates</CardTitle>
              <CardDescription>
                Use Group houses into estate to pick existing houses. You can add more houses later.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
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
            <div className="space-y-3 py-12 text-center">
              <p className="text-muted-foreground">No estates yet. Group the houses you already have.</p>
              <Can permission="manage_property_estates|edit_properties">
                <Button onClick={() => router.push("/admin/property-management/estates/group")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Group houses into estate
                </Button>
              </Can>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estate Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Houses</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Allottees</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estates.map((estate) => (
                    <TableRow key={estate.id}>
                      <TableCell className="font-medium">{estate.name}</TableCell>
                      <TableCell>{estate.location_label || "—"}</TableCell>
                      <TableCell>
                        {estate.total_properties}
                        <span className="block text-xs text-muted-foreground">
                          {estate.allocated_properties} alloc · {estate.available_properties} avail
                        </span>
                      </TableCell>
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
                          <Can permission="manage_property_estates|edit_properties">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/property-management/estates/group?estateId=${estate.id}`}>
                                Add houses
                              </Link>
                            </Button>
                          </Can>
                          <Can permission="export_reports|view_property_reports">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadBalances(estate)}
                              disabled={downloadingKey === estate.id}
                            >
                              {downloadingKey === estate.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 mr-1" />
                              )}
                              Balances
                            </Button>
                          </Can>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/properties?estate_id=${estate.id}`}>Houses</Link>
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
    </div>
  )
}
