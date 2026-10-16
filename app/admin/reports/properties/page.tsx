"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Home, TrendingUp, Users, Wallet, AlertTriangle, CheckCircle2 } from "lucide-react"
import { exportReport, getPropertyReports } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

type HouseRow = {
  id: string
  title: string
  type: string
  size: string
  location: string
  state: string
  status: string
  group_key: string
  group_name: string
  subscribers: number
  total_cost: number
  amount_paid: number
  balance: number
  completion_rate: number
  slots: number | null
}

type HouseGroup = {
  key: string
  name: string
  merged: boolean
  houses: HouseRow[]
  house_count: number
  subscribers: number
  total_cost: number
  amount_paid: number
  balance: number
  completion_rate: number
}

type SubscriberRow = {
  id: string
  property_id: string
  group_key: string
  group_name: string
  state: string
  house_title: string
  house_type: string
  house_size: string
  owner_name: string
  ippis: string
  frsc_pin: string
  house_cost: number
  admin_charge: number
  total_cost: number
  amount_paid: number
  balance: number
  completion: number
  standing: string
}

type HouseStats = {
  houses: number
  groups: number
  subscribers: number
  total_cost: number
  amount_paid: number
  outstanding: number
  completion_rate: number
  completed: number
  low_payment: number
  owing: number
  no_payment: number
}

const emptyStats: HouseStats = {
  houses: 0,
  groups: 0,
  subscribers: 0,
  total_cost: 0,
  amount_paid: 0,
  outstanding: 0,
  completion_rate: 0,
  completed: 0,
  low_payment: 0,
  owing: 0,
  no_payment: 0,
}

function money(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(value || 0)
}

function standingVariant(standing: string): "default" | "secondary" | "destructive" | "outline" {
  if (standing === "Fully paid") return "default"
  if (standing === "Paid less than 40%" || standing === "Nothing paid yet") return "destructive"
  if (standing === "Still owing") return "secondary"
  return "outline"
}

export default function PropertyReportsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [stats, setStats] = useState<HouseStats>(emptyStats)
  const [groups, setGroups] = useState<HouseGroup[]>([])
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([])
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const response = await getPropertyReports()
        if (response.success) {
          const data = response.data as {
            stats?: HouseStats
            groups?: HouseGroup[]
            subscribers?: SubscriberRow[]
          }
          setStats(data.stats || emptyStats)
          setGroups(data.groups || [])
          setSubscribers(data.subscribers || [])
        }
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load house reports",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const visibleSubscribers = useMemo(() => {
    if (selected.length === 0) return subscribers
    const chosen = new Set(selected)
    return subscribers.filter((row) => chosen.has(row.property_id))
  }, [selected, subscribers])

  const selectedHouses = useMemo(() => {
    const chosen = new Set(selected)
    return groups.flatMap((group) => group.houses).filter((house) => chosen.has(house.id))
  }, [groups, selected])

  const toggleHouse = (id: string, checked: boolean) => {
    setSelected((current) => (checked ? [...current, id] : current.filter((item) => item !== id)))
  }

  const toggleGroup = (group: HouseGroup, checked: boolean) => {
    const ids = group.houses.map((house) => house.id)
    setSelected((current) => {
      const rest = current.filter((id) => !ids.includes(id))
      return checked ? [...rest, ...ids] : rest
    })
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      await exportReport("properties", {
        format: "xlsx",
        ...(selected.length > 0 ? { property_ids: selected.join(",") } : {}),
      })
      toast({
        title: "Export completed",
        description: selected.length > 1
          ? "The merged house report has been downloaded."
          : "The house report has been downloaded.",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export report",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const cards = [
    { label: "Houses", value: String(stats.houses), icon: Home, color: "text-emerald-600" },
    { label: "Subscribers", value: String(stats.subscribers), icon: Users, color: "text-blue-600" },
    { label: "Full amount due", value: money(stats.total_cost), icon: TrendingUp, color: "text-orange-600" },
    { label: "Amount received", value: money(stats.amount_paid), icon: Wallet, color: "text-emerald-700" },
    { label: "Balance left", value: money(stats.outstanding), icon: AlertTriangle, color: "text-red-600" },
    { label: "Percentage paid", value: `${stats.completion_rate.toFixed(2)}%`, icon: CheckCircle2, color: "text-blue-700" },
    { label: "Fully paid", value: String(stats.completed), icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Paid less than 40%", value: String(stats.low_payment), icon: AlertTriangle, color: "text-amber-600" },
    { label: "Still owing", value: String(stats.owing), icon: AlertTriangle, color: "text-red-600" },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">House reports</h1>
          <p className="mt-1 text-muted-foreground">
            Subscriber balances for the house register. Houses in the same estate, such as the houses at one FRSC estate, can be selected together and exported as one merged report.
          </p>
        </div>
        <Button onClick={handleExport} disabled={exporting || loading}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting…" : selected.length > 1 ? "Export merged report" : "Export detailed report"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Related houses</CardTitle>
          <CardDescription>
            Houses that belong to the same estate sit in one group. Tick the houses to merge, then export.
            {selectedHouses.length > 0
              ? ` Selected: ${selectedHouses.map((house) => house.title).join("; ")}.`
              : " Nothing is ticked, so the table and export cover every house."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : groups.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No houses found</div>
          ) : (
            groups.map((group) => {
              const ids = group.houses.map((house) => house.id)
              const allChecked = ids.every((id) => selected.includes(id))
              return (
                <div key={group.key} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={allChecked}
                        onCheckedChange={(checked) => toggleGroup(group, checked === true)}
                        aria-label={`Select ${group.name}`}
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{group.name}</p>
                          {group.merged ? <Badge>Merged group · {group.house_count} houses</Badge> : <Badge variant="outline">Single house</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {group.subscribers} subscribers · {money(group.amount_paid)} paid · {money(group.balance)} outstanding · {group.completion_rate.toFixed(2)}% complete
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 pl-7">
                    {group.houses.map((house) => (
                      <label key={house.id} className="flex items-start gap-3 text-sm">
                        <Checkbox
                          checked={selected.includes(house.id)}
                          onCheckedChange={(checked) => toggleHouse(house.id, checked === true)}
                        />
                        <span>
                          <Link href={`/admin/properties/${house.id}`} className="font-medium hover:underline">
                            {house.title}
                          </Link>
                          <span className="text-muted-foreground">
                            {house.type ? ` · ${house.type}` : ""}
                            {house.size ? ` · ${house.size}` : ""} · {house.subscribers} subscribers · {house.completion_rate.toFixed(2)}%
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscriber balances</CardTitle>
          <CardDescription>
            {selected.length > 1
              ? `Merged view of ${selected.length} houses. The export states the houses that were combined.`
              : "Owner, identifiers, cost, charges, amount paid, balance, and completion."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : visibleSubscribers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No subscribers for this selection</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>House</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>IPPIS</TableHead>
                    <TableHead>FRSC PIN</TableHead>
                    <TableHead className="text-right">Full amount due</TableHead>
                    <TableHead className="text-right">Extra charges</TableHead>
                    <TableHead className="text-right">Total amount due</TableHead>
                    <TableHead className="text-right">Amount received</TableHead>
                    <TableHead className="text-right">Balance left</TableHead>
                    <TableHead className="text-right">Percentage paid</TableHead>
                    <TableHead>Payment status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleSubscribers.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.state}</TableCell>
                      <TableCell>
                        <div className="font-medium">{row.house_title}</div>
                        <div className="text-xs text-muted-foreground">{row.house_type}</div>
                      </TableCell>
                      <TableCell>{row.owner_name}</TableCell>
                      <TableCell>{row.ippis}</TableCell>
                      <TableCell>{row.frsc_pin}</TableCell>
                      <TableCell className="text-right">{money(row.house_cost)}</TableCell>
                      <TableCell className="text-right">{money(row.admin_charge)}</TableCell>
                      <TableCell className="text-right">{money(row.total_cost)}</TableCell>
                      <TableCell className="text-right">{money(row.amount_paid)}</TableCell>
                      <TableCell className="text-right">{money(row.balance)}</TableCell>
                      <TableCell className="text-right">{row.completion.toFixed(2)}%</TableCell>
                      <TableCell>
                        <Badge variant={standingVariant(row.standing)}>{row.standing}</Badge>
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
