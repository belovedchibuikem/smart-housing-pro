"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  SearchableSelect,
  membersToSearchableOptions,
  propertiesToSearchableOptions,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select"
import { Download, ExternalLink, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { downloadMemberStatementPdf, exportMemberStatementCsv, generateMemberStatement } from "@/lib/api/accounting"
import { apiFetch } from "@/lib/api/client"
import { normalizeAdminMembersList } from "@/lib/api/normalize-admin-members"
import { useToast } from "@/hooks/use-toast"

function money(n: number) {
  return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

export default function MemberStatementsAdminPage() {
  const { toast } = useToast()
  const [form, setForm] = useState({
    member_id: "",
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    balance_bucket: "",
    property_type: "",
    property_id: "",
  })
  const [memberOptions, setMemberOptions] = useState<SearchableSelectOption[]>([])
  const [propertyOptions, setPropertyOptions] = useState<SearchableSelectOption[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

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
    if (form.property_type === "land") {
      const res = await apiFetch<{ success?: boolean; data?: any[] }>(
        `/admin/lands?search=${encodeURIComponent(query)}&per_page=50`
      )
      const opts = landsToSearchableOptions(res.data || [])
      setPropertyOptions(opts)
      return opts
    }
    if (form.property_type === "house") {
      const res = await apiFetch<{ success?: boolean; data?: any[] }>(
        `/admin/properties?search=${encodeURIComponent(query)}&per_page=50`
      )
      const opts = propertiesToSearchableOptions(res.data || [])
      setPropertyOptions(opts)
      return opts
    }
    return []
  }, [form.property_type])

  const payload = () => ({
    member_id: form.member_id,
    from: form.from,
    to: form.to,
    balance_bucket: form.balance_bucket || undefined,
    property_type: form.property_type || undefined,
    property_id: form.property_id || undefined,
  })

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const memberSelectOptions = useMemo(() => memberOptions, [memberOptions])
  const propertySelectOptions = useMemo(() => propertyOptions, [propertyOptions])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Member Statements of Account</h1>
        <p className="text-muted-foreground mt-1">
          Generate PDF statements with running balances, QR verification, CSV and Excel export
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Generate statement</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Member</Label>
            <SearchableSelect
              value={form.member_id}
              onValueChange={(value) => setForm({ ...form, member_id: value })}
              options={memberSelectOptions}
              onSearch={searchMembers}
              placeholder="Search and select member"
              searchPlaceholder="Search by name, email, member no…"
              emptyText="No members match."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>From</Label><Input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} /></div>
            <div><Label>To</Label><Input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Balance bucket</Label>
              <Select
                value={form.balance_bucket || "all"}
                onValueChange={(v) => setForm({ ...form, balance_bucket: v === "all" ? "" : v })}
              >
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="contribution">Contribution</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="statutory">Statutory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Property type</Label>
              <Select
                value={form.property_type || "all"}
                onValueChange={(v) => setForm({ ...form, property_type: v === "all" ? "" : v, property_id: "" })}
              >
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Property (optional)</Label>
              <SearchableSelect
                value={form.property_id}
                onValueChange={(value) => setForm({ ...form, property_id: value })}
                options={propertySelectOptions}
                onSearch={form.property_type ? searchProperties : undefined}
                allowEmpty
                emptyValueLabel="Any property"
                disabled={!form.property_type}
                placeholder={form.property_type ? "Search and select" : "Select type first"}
                searchPlaceholder="Search…"
                emptyText="No matches."
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={loading || !form.member_id} onClick={async () => {
              try {
                setLoading(true)
                const res = await generateMemberStatement(payload())
                setResult(res.data)
                toast({ title: "Statement generated", description: res.data?.statement?.statement_number })
              } catch (e: any) {
                toast({ title: "Failed", description: e.message, variant: "destructive" })
              } finally {
                setLoading(false)
              }
            }}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Generate PDF
            </Button>
            <Button variant="outline" disabled={!form.member_id} onClick={async () => {
              try {
                const blob = await exportMemberStatementCsv({ ...payload(), format: "csv" })
                downloadBlob(blob, `statement-${form.from}-${form.to}.csv`)
              } catch (e: any) {
                toast({ title: "CSV export failed", description: e.message, variant: "destructive" })
              }
            }}>
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" disabled={!form.member_id} onClick={async () => {
              try {
                const blob = await exportMemberStatementCsv({ ...payload(), format: "xlsx" })
                downloadBlob(blob, `statement-${form.from}-${form.to}.xlsx`)
              } catch (e: any) {
                toast({ title: "Excel export failed", description: e.message, variant: "destructive" })
              }
            }}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle className="text-base">{result.statement?.statement_number}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Opening: ₦{money(result.summary?.opening_balance)}</p>
            <p>Debits: ₦{money(result.summary?.total_debits)} · Credits: ₦{money(result.summary?.total_credits)}</p>
            <p>Closing: ₦{money(result.summary?.closing_balance)}</p>
            <p>Contribution: ₦{money(result.summary?.contribution_balance)} · Equity: ₦{money(result.summary?.equity_balance)}</p>
            <p>Loan: ₦{money(result.summary?.outstanding_loan)} · House: ₦{money(result.summary?.outstanding_house)} · Land: ₦{money(result.summary?.outstanding_land)}</p>
            {result.statement?.verification_token && (
              <p className="text-muted-foreground break-all">
                Verification token: {result.statement.verification_token}{" "}
                <Link className="inline-flex items-center gap-1 text-primary underline" href={`/verify?code=${encodeURIComponent(result.statement.verification_token)}`} target="_blank">
                  Open verify <ExternalLink className="h-3 w-3" />
                </Link>
              </p>
            )}
            {result.statement?.id && (
              <Button variant="outline" onClick={async () => {
                const blob = await downloadMemberStatementPdf(result.statement.id)
                downloadBlob(blob, `${result.statement.statement_number}.pdf`)
              }}>Download PDF</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
