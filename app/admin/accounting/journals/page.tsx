"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { getJournalEntries, getJournalEntry, postManualJournal, reverseJournal } from "@/lib/api/accounting"
import { useToast } from "@/hooks/use-toast"

function money(n: number) {
  return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function JournalsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [form, setForm] = useState({
    transaction_type: "adjustment",
    amount: "",
    description: "",
    debit_account_code: "1100",
    credit_account_code: "4900",
    member_id: "",
  })

  const load = async () => {
    try {
      setLoading(true)
      const res = await getJournalEntries({ per_page: 50 })
      setRows(res.data?.data || res.data || [])
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openDetail = async (id: string) => {
    try {
      setDetailLoading(true)
      const res = await getJournalEntry(id)
      setDetail(res.data)
    } catch (e: any) {
      toast({ title: "Could not load journal", description: e.message, variant: "destructive" })
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Journal Entries</h1>
        <p className="text-muted-foreground mt-1">Tenant general ledger with balanced double-entry postings</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Manual journal</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><Label>Type</Label><Input value={form.transaction_type} onChange={(e) => setForm({ ...form, transaction_type: e.target.value })} /></div>
          <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <div><Label>Member ID (optional)</Label><Input value={form.member_id} onChange={(e) => setForm({ ...form, member_id: e.target.value })} /></div>
          <div><Label>Debit account</Label><Input value={form.debit_account_code} onChange={(e) => setForm({ ...form, debit_account_code: e.target.value })} /></div>
          <div><Label>Credit account</Label><Input value={form.credit_account_code} onChange={(e) => setForm({ ...form, credit_account_code: e.target.value })} /></div>
          <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="md:col-span-3">
            <Button onClick={async () => {
              try {
                await postManualJournal({
                  ...form,
                  amount: Number(form.amount),
                  member_id: form.member_id || undefined,
                })
                toast({ title: "Journal posted" })
                await load()
              } catch (e: any) {
                toast({ title: "Post failed", description: e.message, variant: "destructive" })
              }
            }}>Post Journal</Button>
          </div>
        </CardContent>
      </Card>

      {detail && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{detail.entry_number} detail</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setDetail(null)}>Close</Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {detailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <>
                <p>{detail.description}</p>
                <p className="text-muted-foreground">{detail.transaction_type} · {detail.entry_date} · {detail.status}</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Side</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(detail.lines || []).map((line: any) => (
                      <TableRow key={line.id || `${line.side}-${line.account_code}`}>
                        <TableCell className="capitalize">{line.side}</TableCell>
                        <TableCell className="font-mono text-xs">{line.account_code}</TableCell>
                        <TableCell className="text-right">{money(line.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">
                      <button type="button" className="underline-offset-2 hover:underline" onClick={() => openDetail(row.id)}>
                        {row.entry_number}
                      </button>
                    </TableCell>
                    <TableCell>{row.entry_date}</TableCell>
                    <TableCell className="font-mono text-xs">{row.transaction_type}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell className="text-right">{money(row.total_debit)}</TableCell>
                    <TableCell><Badge>{row.status}</Badge></TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openDetail(row.id)}>View</Button>
                      {row.status === "posted" && (
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            await reverseJournal(row.id, "Admin reversal")
                            toast({ title: "Reversed" })
                            await load()
                          } catch (e: any) {
                            toast({ title: "Reverse failed", description: e.message, variant: "destructive" })
                          }
                        }}>Reverse</Button>
                      )}
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
