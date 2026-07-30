"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { getAgingReport, getBalanceSheet, getCashFlowReport, getIncomeExpenditure, getTrialBalance } from "@/lib/api/accounting"
import { useToast } from "@/hooks/use-toast"

function money(n: number) {
  return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function AccountingReportsPage() {
  const { toast } = useToast()
  const [tab, setTab] = useState<"tb" | "pl" | "bs" | "cf" | "aging">("tb")
  const [from, setFrom] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10))
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [bucket, setBucket] = useState("loan")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const load = async () => {
    try {
      setLoading(true)
      let res: any
      if (tab === "tb") res = await getTrialBalance({ as_of: to })
      else if (tab === "pl") res = await getIncomeExpenditure({ from, to })
      else if (tab === "bs") res = await getBalanceSheet({ as_of: to })
      else if (tab === "cf") res = await getCashFlowReport({ from, to })
      else res = await getAgingReport({ bucket, as_of: to })
      setData(res.data)
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [tab])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">GL Reports</h1>
        <p className="text-muted-foreground mt-1">Trial balance, income & expenditure, balance sheet, cash flow and aging</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ["tb", "Trial Balance"],
          ["pl", "Income & Expenditure"],
          ["bs", "Balance Sheet"],
          ["cf", "Cash Flow"],
          ["aging", "Aging"],
        ].map(([k, label]) => (
          <Button key={k} variant={tab === k ? "default" : "outline"} onClick={() => setTab(k as any)}>{label}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-3 items-end">
          <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><Label>To / As of</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          {tab === "aging" && (
            <div>
              <Label>Bucket</Label>
              <Select value={bucket} onValueChange={setBucket}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["loan", "house", "land", "statutory", "contribution", "equity"].map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={load}>Refresh</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base capitalize">{tab === "pl" ? "Income & Expenditure" : tab === "tb" ? "Trial Balance" : tab === "bs" ? "Statement of Financial Position" : tab === "cf" ? "Cash Flow" : `Aging — ${bucket}`}</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : !data ? null : tab === "tb" ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.lines || []).map((line: any) => (
                    <TableRow key={line.account_code}>
                      <TableCell className="font-mono">{line.account_code}</TableCell>
                      <TableCell>{line.account_name}</TableCell>
                      <TableCell className="text-right">{money(line.debit)}</TableCell>
                      <TableCell className="text-right">{money(line.credit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="mt-3 text-sm text-muted-foreground">
                Totals — Debit: {money(data.totals?.debit)} · Credit: {money(data.totals?.credit)} · Balanced: {data.totals?.balanced ? "Yes" : "No"}
              </p>
            </>
          ) : tab === "pl" ? (
            <div className="space-y-4">
              <p className="font-medium">Surplus / Deficit: ₦{money(data.surplus_deficit)}</p>
              <Table>
                <TableHeader><TableRow><TableHead>Income</TableHead><TableHead className="text-right">Net</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(data.income || []).map((r: any) => (
                    <TableRow key={r.account_code}><TableCell>{r.account_code} {r.account_name}</TableCell><TableCell className="text-right">{money(r.net)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
              <Table>
                <TableHeader><TableRow><TableHead>Expenses</TableHead><TableHead className="text-right">Net</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(data.expenses || []).map((r: any) => (
                    <TableRow key={r.account_code}><TableCell>{r.account_code} {r.account_name}</TableCell><TableCell className="text-right">{money(r.net)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : tab === "bs" ? (
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Assets ({money(data.total_assets)})</h3>
                {(data.assets || []).map((r: any) => <div key={r.account_code} className="flex justify-between py-1 border-b"><span>{r.account_name}</span><span>{money(r.amount)}</span></div>)}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Liabilities ({money(data.total_liabilities)})</h3>
                {(data.liabilities || []).map((r: any) => <div key={r.account_code} className="flex justify-between py-1 border-b"><span>{r.account_name}</span><span>{money(r.amount)}</span></div>)}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Equity ({money(data.total_equity)})</h3>
                {(data.equity || []).map((r: any) => <div key={r.account_code} className="flex justify-between py-1 border-b"><span>{r.account_name}</span><span>{money(r.amount)}</span></div>)}
                <div className="flex justify-between py-1 border-b"><span>YTD Surplus</span><span>{money(data.retained_earnings_ytd)}</span></div>
              </div>
            </div>
          ) : tab === "cf" ? (
            <div className="space-y-2 text-sm">
              <p>Inflows: ₦{money(data.total_inflows)}</p>
              <p>Outflows: ₦{money(data.total_outflows)}</p>
              <p className="font-semibold">Net: ₦{money(data.net_cash_movement)}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                {Object.entries(data.aging_totals || {}).map(([k, v]) => (
                  <Card key={k}><CardContent className="pt-4"><div className="text-muted-foreground text-xs">{k}</div><div className="font-bold">₦{money(v as number)}</div></CardContent></Card>
                ))}
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Days</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Bucket</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(data.members || []).slice(0, 100).map((m: any) => (
                    <TableRow key={m.member_id}><TableCell className="font-mono text-xs">{m.member_id}</TableCell><TableCell>{m.days}</TableCell><TableCell className="text-right">{money(m.balance)}</TableCell><TableCell>{m.bucket}</TableCell></TableRow>
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
