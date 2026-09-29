"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { formatNairaAmount } from "@/lib/utils/currency"

type Candidate = {
  id: string
  member_name: string
  member_code?: string | null
  property_title?: string | null
  provider_name?: string | null
  monthly_payment: number
  tenure_months: number
  status: string
  schedule_approved: boolean
}

type PreviewInstallment = {
  month: number
  due_date: string
  principal: number
  interest: number
  total: number
}

type PreviewRow = {
  mortgage_id: string
  member_name: string
  member_code?: string | null
  property_title?: string | null
  provider_name?: string | null
  status: "payable" | "skipped"
  skip_reason?: string | null
  installments: PreviewInstallment[]
  payable_count: number
  payable_total: number
}

type PreviewData = {
  rows: PreviewRow[]
  payable_count: number
  skipped_count: number
  total_payable: number
  from_month: number
  to_month: number
}

export default function BulkMortgageRepaymentPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [fromMonth, setFromMonth] = useState("1")
  const [toMonth, setToMonth] = useState("1")
  const [previewing, setPreviewing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set("search", search.trim())
      const response = await apiFetch<{ success: boolean; data: Candidate[] }>(
        `/admin/mortgages/bulk-repay/candidates?${params.toString()}`,
      )
      if (response.success) setCandidates(response.data)
    } catch (error) {
      toast({
        title: "Unable to load mortgages",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [search, toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      void load()
    }, 250)
    return () => clearTimeout(timer)
  }, [load])

  const allChecked = candidates.length > 0 && candidates.every((row) => selected.includes(row.id))

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelected((current) => current.filter((id) => !candidates.some((row) => row.id === id)))
      return
    }
    setSelected((current) => Array.from(new Set([...current, ...candidates.map((row) => row.id)])))
  }

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((current) => (checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)))
  }

  const payload = useMemo(
    () => ({
      mortgage_ids: selected,
      from_month: Number(fromMonth),
      to_month: Number(toMonth),
    }),
    [selected, fromMonth, toMonth],
  )

  const monthsValid =
    Number.isInteger(payload.from_month) &&
    Number.isInteger(payload.to_month) &&
    payload.from_month >= 1 &&
    payload.to_month >= payload.from_month

  const runPreview = async () => {
    if (selected.length === 0 || !monthsValid) {
      toast({
        title: "Select members and months",
        description: "Choose at least one mortgage and a valid schedule month range.",
        variant: "destructive",
      })
      return
    }
    setPreviewing(true)
    try {
      const response = await apiFetch<{ success: boolean; data: PreviewData; message?: string }>(
        "/admin/mortgages/bulk-repay/preview",
        { method: "POST", body: payload },
      )
      if (!response.success) throw new Error(response.message || "Preview failed")
      setPreview(response.data)
      setConfirmOpen(true)
    } catch (error) {
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Could not build the repayment plan.",
        variant: "destructive",
      })
    } finally {
      setPreviewing(false)
    }
  }

  const record = async () => {
    setRecording(true)
    try {
      const response = await apiFetch<{
        success: boolean
        message?: string
        data?: { recorded_installments: number }
      }>("/admin/mortgages/bulk-repay", { method: "POST", body: payload })
      if (!response.success) throw new Error(response.message || "Repayment failed")
      toast({
        title: "Bulk repayment recorded",
        description: response.message || `Recorded ${response.data?.recorded_installments ?? 0} installments.`,
      })
      setConfirmOpen(false)
      setPreview(null)
      setSelected([])
      await load()
    } catch (error) {
      toast({
        title: "Bulk repayment failed",
        description: error instanceof Error ? error.message : "Could not record repayments.",
        variant: "destructive",
      })
    } finally {
      setRecording(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/mortgages">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to mortgages
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Bulk mortgage repayment</h1>
        <p className="mt-1 text-muted-foreground">
          Select members and the schedule months to mark as repaid. Each mortgage uses its own installment amount.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule months</CardTitle>
          <CardDescription>
            Month 1 is the first installment after the application date. Already paid months are skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="from-month">From installment month</Label>
            <Input
              id="from-month"
              type="number"
              min={1}
              value={fromMonth}
              onChange={(event) => setFromMonth(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to-month">Through installment month</Label>
            <Input
              id="to-month"
              type="number"
              min={1}
              value={toMonth}
              onChange={(event) => setToMonth(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Approved and active mortgages. Select everyone who should repay these months.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by member, property, or provider"
              className="pl-10"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allChecked} onCheckedChange={(value) => toggleAll(value === true)} />
                  </TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead>Tenure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No approved mortgages found
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(row.id)}
                          onCheckedChange={(value) => toggleOne(row.id, value === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{row.member_name}</div>
                        <div className="text-xs text-muted-foreground">{row.member_code || "—"}</div>
                      </TableCell>
                      <TableCell>{row.property_title || "—"}</TableCell>
                      <TableCell>{row.provider_name || "—"}</TableCell>
                      <TableCell className="text-right">{formatNairaAmount(row.monthly_payment)}</TableCell>
                      <TableCell>{row.tenure_months} months</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{selected.length} selected</p>
            <Button onClick={() => void runPreview()} disabled={previewing || selected.length === 0}>
              {previewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Preview repayment
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm bulk repayment</DialogTitle>
            <DialogDescription>
              Installments {preview?.from_month} to {preview?.to_month}. Months that are already paid are left unchanged.
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge>{preview.payable_count} mortgages payable</Badge>
                <Badge variant="secondary">{preview.skipped_count} skipped</Badge>
                <Badge variant="outline">{formatNairaAmount(preview.total_payable)}</Badge>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Months</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.map((row) => (
                      <TableRow key={row.mortgage_id}>
                        <TableCell>
                          <div className="font-medium">{row.member_name}</div>
                          <div className="text-xs text-muted-foreground">{row.provider_name || row.property_title || "—"}</div>
                        </TableCell>
                        <TableCell>
                          {row.installments.length > 0
                            ? row.installments.map((item) => item.month).join(", ")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">{formatNairaAmount(row.payable_total)}</TableCell>
                        <TableCell>{row.status === "payable" ? "Ready" : row.skip_reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={recording}>
              Cancel
            </Button>
            <Button onClick={() => void record()} disabled={recording || (preview?.payable_count ?? 0) === 0}>
              {recording ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Record repayment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
