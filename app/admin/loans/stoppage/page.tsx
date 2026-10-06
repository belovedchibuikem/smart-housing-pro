"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch, apiFetchBlob } from "@/lib/api/client"

type Candidate = {
  loan_id: string
  loan_number?: string | null
  member_name: string
  member_number?: string | null
  ippis_number?: string | null
  frsc_pin?: string | null
  email?: string | null
  deduction_amount: number
  default_fee: number
  confirmed: boolean
  confirmed_at?: string | null
}

type HistoryRow = {
  id: string
  period: string
  loan_number?: string | null
  member_name: string
  member_number?: string | null
  ippis_number?: string | null
  frsc_pin?: string | null
  deduction_amount: number
  default_fee: number
  confirmed_at?: string | null
  emailed_at?: string | null
}

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 })

export default function LoanStoppagePage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7))
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [history, setHistory] = useState<HistoryRow[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  const load = async (month = period) => {
    setLoading(true)
    try {
      const res = await apiFetch<{
        success: boolean
        candidates: Candidate[]
        history: HistoryRow[]
      }>(`/admin/loans/stoppage?period=${month}`)
      setCandidates(res.candidates || [])
      setHistory(res.history || [])
      setSelected((res.candidates || []).filter((row) => !row.confirmed).map((row) => row.loan_id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load stoppage")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(period)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const confirmedCount = useMemo(() => candidates.filter((row) => row.confirmed).length, [candidates])

  const confirm = async () => {
    if (selected.length === 0) {
      toast.error("Select the members to confirm")
      return
    }
    setConfirming(true)
    try {
      const res = await apiFetch<{ success: boolean; message?: string }>("/admin/loans/stoppage/confirm", {
        method: "POST",
        body: { period, loan_ids: selected },
      })
      toast.success(res.message || "Stoppage confirmed")
      await load(period)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not confirm stoppage")
    } finally {
      setConfirming(false)
    }
  }

  const download = async () => {
    try {
      const blob = await apiFetchBlob(`/admin/loans/stoppage/download?period=${period}`)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `loan_stoppage_${period}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Confirm stoppage before downloading")
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Loan Stoppage</h1>
          <p className="text-muted-foreground">
            Members with one repayment left in the selected month. Confirm the list, then download the deduction file.
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="stoppage-month">Month</label>
          <Input id="stoppage-month" type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{period}</CardTitle>
          <CardDescription>
            Deduction amount is the monthly repayment. Default fee is 10% of that repayment for each earlier month that was missed.
            {confirmedCount > 0 ? ` ${confirmedCount} already confirmed.` : " Confirm before download."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No loans finish in {period}.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Member</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead>Deduction</TableHead>
                  <TableHead>Default fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((row) => (
                  <TableRow key={row.loan_id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.includes(row.loan_id)}
                        disabled={row.confirmed}
                        onChange={() =>
                          setSelected((current) =>
                            current.includes(row.loan_id)
                              ? current.filter((id) => id !== row.loan_id)
                              : [...current, row.loan_id],
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{row.member_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {[row.member_number, row.ippis_number, row.frsc_pin].filter(Boolean).join(" · ")}
                      </div>
                    </TableCell>
                    <TableCell>{row.loan_number}</TableCell>
                    <TableCell>{money.format(row.deduction_amount)}</TableCell>
                    <TableCell>{money.format(row.default_fee)}</TableCell>
                    <TableCell>{row.confirmed ? "Confirmed" : "Awaiting confirmation"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void confirm()} disabled={confirming || selected.length === 0}>
              {confirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm stoppage
            </Button>
            <Button variant="outline" onClick={() => void download()} disabled={confirmedCount === 0}>
              <Download className="mr-2 h-4 w-4" />
              Download stoppage list
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stoppage history</CardTitle>
          <CardDescription>Confirmed stoppages and when the member was notified.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stoppages have been confirmed yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Loan</TableHead>
                  <TableHead>Deduction</TableHead>
                  <TableHead>Confirmed</TableHead>
                  <TableHead>Emailed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.period}</TableCell>
                    <TableCell>
                      <div>{row.member_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {[row.member_number, row.ippis_number, row.frsc_pin].filter(Boolean).join(" · ")}
                      </div>
                    </TableCell>
                    <TableCell>{row.loan_number}</TableCell>
                    <TableCell>{money.format(row.deduction_amount)}</TableCell>
                    <TableCell>{row.confirmed_at ? new Date(row.confirmed_at).toLocaleString() : "—"}</TableCell>
                    <TableCell>{row.emailed_at ? new Date(row.emailed_at).toLocaleString() : "Not sent"}</TableCell>
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
