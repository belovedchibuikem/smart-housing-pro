"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ContributionRow {
  id: string
  amount: number
  status?: string
  contribution_date?: string
  member?: {
    user?: { first_name?: string; last_name?: string; email?: string }
  }
}

interface PlanDetail {
  id: string
  name: string
  description?: string
  amount: number
  minimum_amount: number
  frequency: string
  is_mandatory: boolean
  is_active: boolean
  total_contributions?: number
  total_members?: number
  contributions?: ContributionRow[]
  created_at: string
}

export default function ContributionPlanDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [plan, setPlan] = useState<PlanDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params?.id
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiFetch<{ success: boolean; data: PlanDetail }>(`/admin/contribution-plans/${id}`)
        if (res.success && res.data) setPlan(res.data)
      } catch (e: any) {
        sonnerToast.error(e?.message || "Failed to load plan")
        router.push("/admin/contribution-plans")
      } finally {
        setLoading(false)
      }
    })()
  }, [params?.id, router])

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">Plan not found.</CardContent>
      </Card>
    )
  }

  const rows = plan.contributions ?? []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/contribution-plans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <p className="text-muted-foreground mt-1">Contribution plan details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/contribution-plans/${plan.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Configuration and totals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={plan.is_active ? "default" : "secondary"}>{plan.is_active ? "Active" : "Inactive"}</Badge>
            {plan.is_mandatory && <Badge variant="outline">Mandatory</Badge>}
            <Badge variant="outline" className="capitalize">
              {plan.frequency}
            </Badge>
          </div>
          {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Plan amount</p>
              <p className="font-semibold">{formatCurrency(plan.amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Minimum</p>
              <p className="font-semibold">{formatCurrency(plan.minimum_amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total collected</p>
              <p className="font-semibold">{formatCurrency(plan.total_contributions ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Members</p>
              <p className="font-semibold">{plan.total_members ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent contributions</CardTitle>
          <CardDescription>Members linked to this plan ({rows.length} loaded)</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No contributions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 100).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.member?.user
                        ? `${c.member.user.first_name ?? ""} ${c.member.user.last_name ?? ""}`.trim() ||
                          c.member.user.email
                        : "—"}
                    </TableCell>
                    <TableCell>{formatCurrency(Number(c.amount))}</TableCell>
                    <TableCell className="capitalize">{c.status ?? "—"}</TableCell>
                    <TableCell>
                      {c.contribution_date ? new Date(c.contribution_date).toLocaleDateString() : "—"}
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
