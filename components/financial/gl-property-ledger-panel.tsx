"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Scale } from "lucide-react"
import { getMemberPropertyFinancialLedger } from "@/lib/api/accounting"

function money(n: number | undefined) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(n || 0))
}

type GlPropertyLedgerPanelProps = {
  propertyType: "house" | "land"
  propertyId?: string | null
  title?: string
}

/**
 * Member-facing GL property ledger (Accounting Engine), shown alongside operational payment history.
 */
export function GlPropertyLedgerPanel({
  propertyType,
  propertyId,
  title = "General Ledger (official)",
}: GlPropertyLedgerPanelProps) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!propertyId) {
      setRows([])
      setError(null)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await getMemberPropertyFinancialLedger({
          property_type: propertyType,
          property_id: propertyId,
          per_page: 50,
        })
        if (cancelled) return
        setRows(res.data?.data || res.data || [])
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Could not load GL ledger")
          setRows([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [propertyType, propertyId])

  if (!propertyId) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription>
          Double-entry property history from the Accounting Engine.{" "}
          <Link href="/dashboard/financial" className="text-primary underline underline-offset-2">
            Open full statement of account
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No GL postings for this property yet. Purchases, repayments and statutory charges will appear here once posted.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row: any) => (
              <div
                key={row.id}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="outline" className="capitalize">
                      {String(row.transaction_type || "").replace(/_/g, " ")}
                    </Badge>
                    <span className="text-muted-foreground">{row.entry_date}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{row.description}</p>
                  {row.receipt_number && (
                    <p className="text-xs text-muted-foreground">Receipt: {row.receipt_number}</p>
                  )}
                </div>
                <div className="text-sm tabular-nums sm:text-right">
                  <div>Dr {Number(row.debit) > 0 ? money(row.debit) : "—"}</div>
                  <div>Cr {Number(row.credit) > 0 ? money(row.credit) : "—"}</div>
                  <div className="font-semibold">Bal {money(row.running_balance)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
