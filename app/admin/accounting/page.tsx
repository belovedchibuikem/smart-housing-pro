"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Database, FileText, Home, Landmark, Loader2, Scale, Settings2, Wallet } from "lucide-react"
import { backfillHistoricalGl, bootstrapAccounting, getAccountingDashboard } from "@/lib/api/accounting"
import { useToast } from "@/hooks/use-toast"

function money(n: number | undefined) {
  return `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const links = [
  { href: "/admin/accounting/accounts", label: "Chart of Accounts", icon: BookOpen, desc: "Configure asset, liability, equity, income and expense accounts" },
  { href: "/admin/accounting/rules", label: "Posting Rules", icon: Settings2, desc: "Map transaction types to debit/credit accounts" },
  { href: "/admin/accounting/periods", label: "Financial Periods", icon: Landmark, desc: "Financial years, month-end close and reopen controls" },
  { href: "/admin/accounting/journals", label: "Journals", icon: Scale, desc: "General ledger entries, manual postings and reversals" },
  { href: "/admin/accounting/reports", label: "GL Reports", icon: FileText, desc: "Trial balance, P&L, balance sheet, cash flow and aging" },
  { href: "/admin/accounting/statements", label: "Member Statements", icon: Wallet, desc: "Generate statement of account PDF, CSV and Excel exports" },
  { href: "/admin/accounting/property-ledger", label: "Property Ledger", icon: Home, desc: "Per-house and per-land financial history from the GL" },
]

export default function AccountingHubPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [backfilling, setBackfilling] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [data, setData] = useState<Record<string, any> | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await getAccountingDashboard()
      if (res.success) setData(res.data)
    } catch (e: any) {
      toast({ title: "Accounting not ready", description: e.message || "Run bootstrap to initialize CoA and periods.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleBootstrap = async () => {
    try {
      setBootstrapping(true)
      const res = await bootstrapAccounting()
      toast({ title: "Accounting bootstrapped", description: res.message || "Chart of accounts and periods are ready." })
      await load()
    } catch (e: any) {
      toast({ title: "Bootstrap failed", description: e.message, variant: "destructive" })
    } finally {
      setBootstrapping(false)
    }
  }

  const handleDryRun = async () => {
    try {
      setBackfilling(true)
      const res = await backfillHistoricalGl({ dry_run: true })
      setPreview(res.data)
      toast({
        title: "Dry-run complete",
        description: `Would post ${res.data?.totals?.posted ?? 0}, skip ${res.data?.totals?.skipped ?? 0}, fail ${res.data?.totals?.failed ?? 0}`,
      })
    } catch (e: any) {
      toast({ title: "Dry-run failed", description: e.message, variant: "destructive" })
    } finally {
      setBackfilling(false)
    }
  }

  const handleExecuteBackfill = async () => {
    if (!preview) {
      toast({ title: "Run dry-run first", description: "Preview counts before writing journals.", variant: "destructive" })
      return
    }
    const ok = window.confirm(
      `Post historical GL now?\n\nWould write ~${preview.totals?.posted ?? 0} journals (idempotent; already-posted rows stay skipped).`
    )
    if (!ok) return

    try {
      setBackfilling(true)
      const res = await backfillHistoricalGl({ dry_run: false })
      setPreview(res.data)
      toast({
        title: "Backfill complete",
        description: `Posted ${res.data?.totals?.posted ?? 0}, skipped ${res.data?.totals?.skipped ?? 0}, failed ${res.data?.totals?.failed ?? 0}`,
      })
      await load()
    } catch (e: any) {
      toast({ title: "Backfill failed", description: e.message, variant: "destructive" })
    } finally {
      setBackfilling(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Enterprise Accounting</h1>
          <p className="text-muted-foreground mt-1">Double-entry GL, periods, statements and executive KPIs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleBootstrap} disabled={bootstrapping || backfilling}>
            {bootstrapping ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Bootstrap / Sync Defaults
          </Button>
          <Button variant="outline" onClick={handleDryRun} disabled={backfilling || bootstrapping}>
            {backfilling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
            Dry-run Backfill
          </Button>
          <Button variant="secondary" onClick={handleExecuteBackfill} disabled={backfilling || bootstrapping || !preview}>
            Run Historical Backfill
          </Button>
        </div>
      </div>

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Backfill {preview.dry_run ? "preview (dry-run)" : "result"}
            </CardTitle>
            <CardDescription>Run ID: {preview.run_id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><div className="text-muted-foreground">Scanned</div><div className="font-semibold">{preview.totals?.scanned ?? 0}</div></div>
              <div><div className="text-muted-foreground">{preview.dry_run ? "Would post" : "Posted"}</div><div className="font-semibold">{preview.totals?.posted ?? 0}</div></div>
              <div><div className="text-muted-foreground">Skipped</div><div className="font-semibold">{preview.totals?.skipped ?? 0}</div></div>
              <div><div className="text-muted-foreground">Failed</div><div className="font-semibold">{preview.totals?.failed ?? 0}</div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-auto">
              {Object.entries(preview.by_type || {}).map(([type, counts]: [string, any]) => (
                <div key={type} className="flex justify-between border-b py-1 text-xs">
                  <span className="font-mono">{type}</span>
                  <span>
                    scan {counts.scanned} · post {counts.posted} · skip {counts.skipped} · fail {counts.failed}
                  </span>
                </div>
              ))}
            </div>
            {(preview.failures?.length ?? 0) > 0 && (
              <p className="text-destructive text-xs">
                {preview.failures.length} failure(s) recorded — first: {preview.failures[0]?.error}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Revenue Today", value: money(data?.revenue_today) },
              { label: "Revenue This Month", value: money(data?.revenue_this_month) },
              { label: "Contributions", value: money(data?.contribution_balance) },
              { label: "Outstanding Loans", value: money(data?.outstanding_loans) },
              { label: "Equity Balance", value: money(data?.equity_balance) },
              { label: "House Outstanding", value: money(data?.outstanding_house) },
              { label: "Land Outstanding", value: money(data?.outstanding_land) },
              { label: "Statutory Outstanding", value: money(data?.outstanding_statutory) },
            ].map((card) => (
              <Card key={card.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{item.label}</CardTitle>
                      </div>
                      <CardDescription>{item.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
