"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react"
import {
  downloadOwnStatementPdf,
  generateOwnStatement,
  getMemberFinancialLedger,
  getMemberFinancialSummary,
  getMemberPropertyFinancialLedger,
  getMemberStatements,
} from "@/lib/api/accounting"
import { toast } from "sonner"

function money(n: number | undefined) {
  return `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function MemberFinancialPage() {
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [ledger, setLedger] = useState<any[]>([])
  const [statements, setStatements] = useState<any[]>([])
  const [propertyLedger, setPropertyLedger] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10))
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [generating, setGenerating] = useState(false)
  const [propType, setPropType] = useState("house")
  const [propId, setPropId] = useState("")
  const [propLoading, setPropLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [s, l, st] = await Promise.all([
        getMemberFinancialSummary(),
        getMemberFinancialLedger({ per_page: 50 }),
        getMemberStatements({ per_page: 20 }),
      ])
      setSummary(s.data || {})
      setLedger(l.data?.data || l.data || [])
      setStatements(st.data?.data || st.data || [])
    } catch (e: any) {
      toast.error(e.message || "Failed to load financial data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadPropertyLedger = async () => {
    if (!propId.trim()) {
      toast.error("Enter a property ID")
      return
    }
    try {
      setPropLoading(true)
      const res = await getMemberPropertyFinancialLedger({
        property_type: propType,
        property_id: propId.trim(),
        per_page: 50,
      })
      setPropertyLedger(res.data?.data || res.data || [])
    } catch (e: any) {
      toast.error(e.message || "Failed to load property ledger")
    } finally {
      setPropLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Financial Account</h1>
        <p className="text-muted-foreground mt-1">Balances, ledger and downloadable statements of account</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ["Contribution Balance", summary.contribution_balance],
              ["Equity Balance", summary.equity_balance],
              ["Outstanding Loan", summary.outstanding_loan],
              ["Outstanding House", summary.outstanding_house],
              ["Outstanding Land", summary.outstanding_land],
              ["Outstanding Statutory", summary.outstanding_statutory],
            ].map(([label, value]) => (
              <Card key={label as string}>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{money(value as number)}</div></CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Generate statement</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-3 items-end">
              <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
              <Button disabled={generating} onClick={async () => {
                try {
                  setGenerating(true)
                  const res = await generateOwnStatement({ from, to })
                  toast.success(`Statement ${res.data?.statement?.statement_number} ready`)
                  if (res.data?.statement?.verification_token) {
                    toast.message("Verify anytime", {
                      description: `Token: ${res.data.statement.verification_token}`,
                    })
                  }
                  if (res.data?.statement?.id) {
                    const blob = await downloadOwnStatementPdf(res.data.statement.id)
                    downloadBlob(blob, `${res.data.statement.statement_number}.pdf`)
                  }
                  await load()
                } catch (e: any) {
                  toast.error(e.message || "Failed to generate statement")
                } finally {
                  setGenerating(false)
                }
              }}>
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                Download Statement PDF
              </Button>
              <Button variant="outline" asChild>
                <Link href="/verify" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" /> Verify document
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Property financial ledger</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <Label>Type</Label>
                  <Select value={propType} onValueChange={setPropType}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[220px] flex-1">
                  <Label>Property ID</Label>
                  <Input value={propId} onChange={(e) => setPropId(e.target.value)} placeholder="Property / land UUID" />
                </div>
                <Button variant="outline" disabled={propLoading} onClick={loadPropertyLedger}>
                  {propLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Load
                </Button>
              </div>
              {propertyLedger.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propertyLedger.map((row: any) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.entry_date}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell className="text-right">{Number(row.debit) > 0 ? money(row.debit) : "—"}</TableCell>
                        <TableCell className="text-right">{Number(row.credit) > 0 ? money(row.credit) : "—"}</TableCell>
                        <TableCell className="text-right">{money(row.running_balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent ledger</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.entry_date}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell className="text-right">{Number(row.debit) > 0 ? money(row.debit) : "—"}</TableCell>
                      <TableCell className="text-right">{Number(row.credit) > 0 ? money(row.credit) : "—"}</TableCell>
                      <TableCell className="text-right">{money(row.running_balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {statements.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Previous statements</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {statements.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between border-b py-2 text-sm gap-2">
                    <div>
                      <div className="font-medium">{s.statement_number}</div>
                      <div className="text-muted-foreground">{s.period_start} → {s.period_end}</div>
                      {s.verification_token && (
                        <Link className="text-xs text-primary underline" href={`/verify?code=${encodeURIComponent(s.verification_token)}`} target="_blank">
                          Verify
                        </Link>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={async () => {
                      const blob = await downloadOwnStatementPdf(s.id)
                      downloadBlob(blob, `${s.statement_number}.pdf`)
                    }}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
