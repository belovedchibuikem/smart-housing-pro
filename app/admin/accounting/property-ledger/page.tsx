"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { getPropertyFinancialLedger } from "@/lib/api/accounting"
import { useToast } from "@/hooks/use-toast"

function money(n: number | undefined) {
  return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!filters.property_id.trim()) {
      toast({ title: "Property ID required", variant: "destructive" })
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
              onValueChange={(v) => setFilters({ ...filters, property_type: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Property ID</Label>
            <Input
              value={filters.property_id}
              onChange={(e) => setFilters({ ...filters, property_id: e.target.value })}
              placeholder="UUID"
            />
          </div>
          <div>
            <Label>Member ID (optional)</Label>
            <Input
              value={filters.member_id}
              onChange={(e) => setFilters({ ...filters, member_id: e.target.value })}
              placeholder="UUID"
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
                    <TableCell>{row.entry_date}</TableCell>
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
