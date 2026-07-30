"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { createChartAccount, getChartOfAccounts, updateChartAccount } from "@/lib/api/accounting"
import { useToast } from "@/hooks/use-toast"

export default function ChartOfAccountsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "asset",
    normal_balance: "debit",
    subtype: "",
  })

  const load = async () => {
    try {
      setLoading(true)
      const res = await getChartOfAccounts({ active_only: false })
      if (res.success) setRows(res.data || [])
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async () => {
    try {
      setSaving(true)
      await createChartAccount(form)
      toast({ title: "Account created" })
      setForm({ code: "", name: "", type: "asset", normal_balance: "debit", subtype: "" })
      await load()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (row: any) => {
    try {
      await updateChartAccount(row.id, { is_active: !row.is_active })
      await load()
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Chart of Accounts</h1>
        <p className="text-muted-foreground mt-1">Tenant-configurable accounts for the double-entry engine</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Add account</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v, normal_balance: ["asset", "expense"].includes(v) ? "debit" : "credit" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["asset", "liability", "equity", "income", "expense"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Subtype</Label><Input value={form.subtype} onChange={(e) => setForm({ ...form, subtype: e.target.value })} /></div>
          <div className="flex items-end"><Button onClick={onCreate} disabled={saving || !form.code || !form.name}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Normal</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.code}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="capitalize">{row.type}</TableCell>
                    <TableCell>{row.normal_balance}</TableCell>
                    <TableCell>{row.is_system ? <Badge>System</Badge> : "—"}</TableCell>
                    <TableCell>{row.is_active ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => toggleActive(row)}>
                        {row.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
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
