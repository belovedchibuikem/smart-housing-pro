"use client"

import { useCallback, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  SearchableSelect,
  membersToSearchableOptions,
  propertiesToSearchableOptions,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select"
import { Loader2 } from "lucide-react"
import { getPropertyFinancialLedger } from "@/lib/api/accounting"
import { apiFetch } from "@/lib/api/client"
import { normalizeAdminMembersList } from "@/lib/api/normalize-admin-members"
import { useToast } from "@/hooks/use-toast"

function money(n: number | undefined) {
  return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function landsToSearchableOptions(
  lands: Array<{ id: string; title?: string; name?: string; location?: string; price?: number | string }>
): SearchableSelectOption[] {
  return propertiesToSearchableOptions(
    lands.map((land) => ({
      id: land.id,
      title: land.title || land.name || "Land",
      location: land.location,
      type_label: "Land",
      price: land.price,
    }))
  )
}

export default function PropertyFinancialLedgerPage() {
  const { toast } = useToast()
  const [filters, setFilters] = useState({
    property_type: "house",
    property_id: "",
    member_id: "",
    from: "",
    to: "",
  })
  const [memberOptions, setMemberOptions] = useState<SearchableSelectOption[]>([])
  const [propertyOptions, setPropertyOptions] = useState<SearchableSelectOption[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const searchMembers = useCallback(async (query: string): Promise<SearchableSelectOption[]> => {
    const res = await apiFetch(`/admin/members?search=${encodeURIComponent(query)}&per_page=50`)
    const rows = normalizeAdminMembersList(res) as Array<{ id: string; first_name?: string; last_name?: string; email?: string; member_number?: string }>
    const opts = membersToSearchableOptions(rows)
    setMemberOptions((prev) => {
      const map = new Map(prev.map((o) => [o.value, o]))
      opts.forEach((o) => map.set(o.value, o))
      return Array.from(map.values())
    })
    return opts
  }, [])

  const searchProperties = useCallback(async (query: string): Promise<SearchableSelectOption[]> => {
    if (filters.property_type === "land") {
      const res = await apiFetch<{ success?: boolean; data?: any[] }>(
        `/admin/lands?search=${encodeURIComponent(query)}&per_page=50`
      )
      const opts = landsToSearchableOptions(res.data || [])
      setPropertyOptions((prev) => {
        const map = new Map(prev.map((o) => [o.value, o]))
        opts.forEach((o) => map.set(o.value, o))
        return Array.from(map.values())
      })
      return opts
    }

    const res = await apiFetch<{ success?: boolean; data?: any[] }>(
      `/admin/properties?search=${encodeURIComponent(query)}&per_page=50`
    )
    const opts = propertiesToSearchableOptions(res.data || [])
    setPropertyOptions((prev) => {
      const map = new Map(prev.map((o) => [o.value, o]))
      opts.forEach((o) => map.set(o.value, o))
      return Array.from(map.values())
    })
    return opts
  }, [filters.property_type])

  const load = async () => {
    if (!filters.property_id.trim()) {
      toast({ title: "Select a property", variant: "destructive" })
      return
    }
    try {
      setLoading(true)
      const res = await getPropertyFinancialLedger({
        property_type: filters.property_type,
        property_id: filters.property_id.trim(),
        member_id: filters.member_id.trim() || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        per_page: 100,
      })
      setRows(res.data?.data || res.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load property ledger", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const selectedPropertyOptions = useMemo(() => propertyOptions, [propertyOptions])
  const selectedMemberOptions = useMemo(() => memberOptions, [memberOptions])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Property Financial Ledger</h1>
        <p className="text-muted-foreground mt-1">
          Independent GL history per house or land — payments, purchases, statutory charges and utilizations
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Filters</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Property type</Label>
            <Select
              value={filters.property_type}
              onValueChange={(v) => setFilters({ ...filters, property_type: v, property_id: "" })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{filters.property_type === "land" ? "Land" : "Property"}</Label>
            <SearchableSelect
              value={filters.property_id}
              onValueChange={(value) => setFilters({ ...filters, property_id: value })}
              options={selectedPropertyOptions}
              onSearch={searchProperties}
              placeholder={filters.property_type === "land" ? "Search and select land" : "Search and select property"}
              searchPlaceholder="Search by title, location…"
              emptyText="No matches."
            />
          </div>
          <div>
            <Label>Member (optional)</Label>
            <SearchableSelect
              value={filters.member_id}
              onValueChange={(value) => setFilters({ ...filters, member_id: value })}
              options={selectedMemberOptions}
              onSearch={searchMembers}
              allowEmpty
              emptyValueLabel="All members"
              placeholder="Search and select member"
              searchPlaceholder="Search by name, email, member no…"
              emptyText="No members match."
            />
          </div>
          <div>
            <Label>From</Label>
            <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <div className="flex items-end">
            <Button onClick={load} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Load ledger
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : rows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No property ledger rows yet. Load a property to view history.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Running</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatDate(row.entry_date)}</TableCell>
                    <TableCell className="capitalize">{String(row.transaction_type || "").replace(/_/g, " ")}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(row.debit) > 0 ? money(row.debit) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{Number(row.credit) > 0 ? money(row.credit) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{money(row.running_balance)}</TableCell>
                    <TableCell className="text-xs">{row.receipt_number || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
