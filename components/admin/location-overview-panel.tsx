"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2, Search, TrendingUp, Wallet, Wrench, Building2, Home, Landmark } from "lucide-react"
import { getPropertyLocationOverview } from "@/lib/api/client"
import {
  buildPropertiesFilterHref,
  formatNaira,
  type LocationOverviewRow,
  type LocationOverviewSummary,
  type PropertyLocationFilterValues,
} from "@/lib/properties/location-filters"
import { formatCompactNaira, formatHouseLandCompact } from "@/lib/utils/currency"

type LocationOverviewPanelProps = {
  onApplyFilters?: (filters: PropertyLocationFilterValues) => void
  /** Hide the large title block when the parent already provides a section chrome. */
  hideHeader?: boolean
}

export function LocationOverviewPanel({ onApplyFilters, hideHeader = false }: LocationOverviewPanelProps) {
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
    <div className="space-y-5">
      {hideHeader ? (
        <div className="relative w-full max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Location & estate overview</h2>
            <p className="text-sm text-muted-foreground">
              Accountability snapshot across estates — occupancy, subscriptions, collections, and open maintenance.
            </p>
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
      )}

      {summary ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <CountCard label="Locations" value={String(summary.total_locations)} icon={Building2} />
            <CountCard label="Houses" value={String(summary.total_properties)} icon={Home} />
            <CountCard label="Land parcels" value={String(summary.total_land_parcels)} icon={Landmark} />
            <CountCard
              label="Subscriptions"
              value={String(summary.total_subscriptions)}
              hint={`House ${summary.houses?.subscriptions ?? 0} · Land ${summary.land?.subscriptions ?? 0}`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FinancialBreakdownCard
              title="Houses / Property"
              icon={Home}
              accent="text-primary"
              data={summary.houses}
            />
            <FinancialBreakdownCard
              title="Land"
              icon={Landmark}
              accent="text-emerald-700"
              data={summary.land}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard
              label="Combined portfolio"
              value={formatHouseLandCompact(
                summary.houses?.portfolio_value,
                summary.land?.portfolio_value,
                { showCombined: true },
              )}
              icon={TrendingUp}
            />
            <MetricCard
              label="Total collected"
              value={formatHouseLandCompact(
                summary.houses?.amount_collected,
                summary.land?.amount_collected,
                { showCombined: true },
              )}
              icon={Wallet}
            />
            <MetricCard
              label="Total outstanding"
              value={formatHouseLandCompact(
                summary.houses?.outstanding,
                summary.land?.outstanding,
                { showCombined: true },
              )}
              sub={`Open maintenance: ${summary.open_maintenance}`}
              icon={Wrench}
            />
          </div>
        </>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">By location</CardTitle>
          <CardDescription>Drill down into each estate or area</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableHead className="text-right">House subs</TableHead>
                    <TableHead className="text-right">Land subs</TableHead>
                    <TableHead className="text-right">House collected</TableHead>
                    <TableHead className="text-right">Land collected</TableHead>
                    <TableHead className="text-right">House out.</TableHead>
                    <TableHead className="text-right">Land out.</TableHead>
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
                      <TableCell className="text-right">{row.land_subscriptions ?? row.land?.subscriptions ?? 0}</TableCell>
                      <TableCell className="text-right">{formatNaira(row.houses?.amount_collected ?? row.amount_collected, true)}</TableCell>
                      <TableCell className="text-right">{formatNaira(row.land?.amount_collected ?? row.land_amount_collected, true)}</TableCell>
                      <TableCell className="text-right">{formatNaira(row.house_outstanding ?? row.houses?.outstanding, true)}</TableCell>
                      <TableCell className="text-right">{formatNaira(row.land_outstanding ?? row.land?.outstanding, true)}</TableCell>
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
                                "houses",
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
                                "land",
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
    </div>
  )
}

function CountCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
        </div>
        <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}

function FinancialBreakdownCard({
  title,
  icon: Icon,
  accent,
  data,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
  data?: LocationOverviewSummary["houses"]
}) {
  if (!data) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`h-4 w-4 ${accent}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBlock label="Portfolio" value={formatCompactNaira(data.portfolio_value)} />
        <StatBlock label="Expected" value={formatCompactNaira(data.expected_revenue)} />
        <StatBlock label="Collected" value={formatCompactNaira(data.amount_collected)} valueClass="text-green-600" />
        <StatBlock label="Outstanding" value={formatCompactNaira(data.outstanding)} valueClass="text-orange-600" />
      </CardContent>
    </Card>
  )
}

function StatBlock({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold tabular-nums ${valueClass ?? ""}`}>{value}</p>
    </div>
  )
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string
  sub?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
        </div>
        <div className="mt-1 text-sm font-semibold leading-snug">{value}</div>
        {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  )
}
