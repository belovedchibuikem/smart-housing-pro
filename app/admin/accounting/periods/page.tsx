"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { closeAccountingPeriod, closeFinancialYear, ensureFinancialYear, getFinancialYears, reopenAccountingPeriod } from "@/lib/api/accounting"
import { useToast } from "@/hooks/use-toast"

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatDateRange(start?: string | null, end?: string | null): string {
  return `${formatDate(start)} – ${formatDate(end)}`
}

export default function FinancialPeriodsPage() {
  const { toast } = useToast()
  const [years, setYears] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const res = await getFinancialYears()
      setYears(res.data || [])
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Financial Periods</h1>
          <p className="text-muted-foreground mt-1">Year setup, month-end closing and locked period controls</p>
        </div>
        <Button onClick={async () => {
          try {
            await ensureFinancialYear()
            toast({ title: "Current year ensured" })
            await load()
          } catch (e: any) {
            toast({ title: "Failed", description: e.message, variant: "destructive" })
          }
        }}>Ensure Current Year</Button>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : years.map((year) => (
        <Card key={year.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{year.name} <span className="text-sm font-normal text-muted-foreground">({year.code})</span></CardTitle>
              <p className="text-sm text-muted-foreground">{formatDateRange(year.start_date, year.end_date)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={year.status === "open" ? "default" : "secondary"}>{year.status}</Badge>
              {year.status === "open" && (
                <Button size="sm" variant="destructive" onClick={async () => {
                  try {
                    await closeFinancialYear(year.id)
                    toast({ title: "Financial year closed" })
                    await load()
                  } catch (e: any) {
                    toast({ title: "Close failed", description: e.message, variant: "destructive" })
                  }
                }}>Close Year</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(year.periods || []).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.period_number}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-sm">{formatDateRange(p.start_date, p.end_date)}</TableCell>
                    <TableCell><Badge variant={p.status === "open" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                    <TableCell className="space-x-2">
                      {p.status === "open" ? (
                        <Button size="sm" variant="outline" onClick={async () => {
                          await closeAccountingPeriod(p.id, true)
                          toast({ title: "Period locked" })
                          await load()
                        }}>Lock</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={async () => {
                          await reopenAccountingPeriod(p.id)
                          toast({ title: "Period reopened" })
                          await load()
                        }}>Reopen</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
