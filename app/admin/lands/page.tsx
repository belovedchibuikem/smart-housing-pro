"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPinned, Plus, Search, Loader2, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface LandRow {
  id: string
  land_code?: string | null
  land_title?: string | null
  land_size?: string | null
  cost?: number | string | null
  location?: string | null
  status?: string | null
}

export default function AdminLandsListPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [lands, setLands] = useState<LandRow[]>([])
  const [pagination, setPagination] = useState({ total: 0, current_page: 1, last_page: 1 })

  const load = async () => {
    try {
      setLoading(true)
      const q = new URLSearchParams()
      if (search.trim()) q.set("search", search.trim())
      q.set("per_page", "50")
      const res = await apiFetch<{
        success: boolean
        data: LandRow[]
        pagination?: { total: number; current_page: number; last_page: number }
      }>(`/admin/lands?${q.toString()}`)
      if (res.success && Array.isArray(res.data)) {
        setLands(res.data)
        setPagination({
          total: res.pagination?.total ?? res.data.length,
          current_page: res.pagination?.current_page ?? 1,
          last_page: res.pagination?.last_page ?? 1,
        })
      }
    } catch (e: unknown) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to load land parcels",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => void load(), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const formatMoney = (n: number | string | null | undefined) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
      Number(n || 0) || 0,
    )

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Land parcels</h1>
          <p className="text-muted-foreground mt-1">
            Dedicated land catalog — IDs are used for subscriptions and payments ({pagination.total} record
            {pagination.total === 1 ? "" : "s"})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/bulk-upload/lands">Bulk CSV</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/lands/new">
              <Plus className="mr-2 h-4 w-4" />
              Upload land
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Browse</CardTitle>
          <CardDescription>Search by title, Land ID (<span className="font-mono">LND-</span>), or location</CardDescription>
          <div className="relative max-w-md pt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search lands..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mb-3 h-8 w-8 animate-spin" />
              Loading land parcels...
            </div>
          ) : lands.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">No land parcels found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lands.map((land) => (
                <Card key={land.id} className="overflow-hidden">
                  <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
                    <MapPinned className="h-4 w-4 text-emerald-600" />
                    <Badge variant="secondary" className="font-normal">
                      🌍 Land
                    </Badge>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">{land.land_code || "—"}</span>
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <div>
                      <div className="text-lg font-semibold leading-snug">{land.land_title || "Untitled land"}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{land.location || "—"}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {land.land_size ? (
                        <Badge variant="outline" className="font-normal">
                          {land.land_size}
                        </Badge>
                      ) : null}
                      <Badge variant="outline">{land.status || "—"}</Badge>
                    </div>
                    <div className="text-lg font-bold text-primary">{formatMoney(land.cost)}</div>
                    <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                      <Link href={`/admin/lands/${land.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
