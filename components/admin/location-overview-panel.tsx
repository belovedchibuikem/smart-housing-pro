"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2, Search, TrendingUp, Wallet, Wrench, Building2 } from "lucide-react"
import { getPropertyLocationOverview } from "@/lib/api/client"
import {
  buildPropertiesFilterHref,
  formatNaira,
  type LocationOverviewRow,
  type LocationOverviewSummary,
  type PropertyLocationFilterValues,
} from "@/lib/properties/location-filters"

type LocationOverviewPanelProps = {
  onApplyFilters?: (filters: PropertyLocationFilterValues) => void
}

export function LocationOverviewPanel({ onApplyFilters }: LocationOverviewPanelProps) {
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [summary, setSummary] = useState<LocationOverviewSummary | null>(null)
  const [rows, setRows] = useState<LocationOverviewRow[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOverview()
    }, 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const fetchOverview = async () => {
    try {
      setLoading(true)
      const response = await getPropertyLocationOverview(search ? { search } : undefined)
      if (response.success && response.data) {
        setSummary(response.data.summary)
        setRows(response.data.locations ?? [])
      }
    } catch {
      setSummary(null)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const applyLocation = (row: LocationOverviewRow) => {
    onApplyFilters?.({
      estateId: row.id,
      location: row.name,
      city: row.city,
      state: row.state,
      status: "all",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Location & estate overview</CardTitle>
            <CardDescription>
              Accountability snapshot across estates — occupancy, subscriptions, collections, and open maintenance.
            </CardDescription>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
            <SummaryTile label="Locations" value={String(summary.total_locations)} icon={Building2} />
            <SummaryTile label="Houses" value={String(summary.total_properties)} />
            <SummaryTile label="Land parcels" value={String(summary.total_land_parcels)} />
            <SummaryTile label="Subscriptions" value={String(summary.total_subscriptions)} />
            <SummaryTile label="Portfolio" value={formatNaira(summary.total_value, true)} icon={TrendingUp} />
            <SummaryTile label="Collected" value={formatNaira(summary.amount_collected, true)} icon={Wallet} />
            <SummaryTile label="Outstanding" value={formatNaira(summary.outstanding_balance, true)} />
            <SummaryTile label="Open maintenance" value={String(summary.open_maintenance)} icon={Wrench} />
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No location data yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estate / area</TableHead>
                  <TableHead>City / state</TableHead>
                  <TableHead className="text-right">Houses</TableHead>
                  <TableHead className="text-right">Land</TableHead>
                  <TableHead className="text-right">Occupancy</TableHead>
                  <TableHead className="text-right">Subs</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Maint.</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.location_label}</TableCell>
                    <TableCell className="text-right">
                      {row.total_properties}
                      <span className="block text-xs text-muted-foreground">
                        {row.available_properties} avail · {row.allocated_properties} alloc
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{row.land_parcels}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={row.occupancy_rate >= 70 ? "default" : "secondary"}>
                        {row.occupancy_rate.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.active_subscriptions}
                      {row.pending_subscriptions > 0 ? (
                        <span className="block text-xs text-amber-600">{row.pending_subscriptions} pending</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">{formatNaira(row.amount_collected, true)}</TableCell>
                    <TableCell className="text-right">{formatNaira(row.outstanding_balance, true)}</TableCell>
                    <TableCell className="text-right">
                      {row.maintenance_open > 0 ? (
                        <Badge variant="outline">{row.maintenance_open}</Badge>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => applyLocation(row)}>
                          Filter
                        </Button>
                        <Button type="button" variant="ghost" size="sm" asChild>
                          <Link
                            href={buildPropertiesFilterHref(
                              {
                                estateId: row.id,
                                location: row.name,
                                city: row.city,
                                state: row.state,
                                status: "all",
                              },
                              "houses"
                            )}
                          >
                            Houses
                          </Link>
                        </Button>
                        <Button type="button" variant="ghost" size="sm" asChild>
                          <Link
                            href={buildPropertiesFilterHref(
                              {
                                estateId: row.id,
                                location: row.name,
                                city: row.city,
                                state: row.state,
                                status: "all",
                              },
                              "land"
                            )}
                          >
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
  )
}

function SummaryTile({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        {Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  )
}
