"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Building2,
  CreditCard,
  DollarSign,
  Home,
  LayoutDashboard,
  ListTodo,
  Loader2,
  Megaphone,
  Receipt,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getRaOfficerOverview } from "@/lib/api/resident-association"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-NG").format(Number(num) || 0)
}

const LINKS = [
  { href: "/admin/resident-association/houses", label: "Houses", desc: "Estate houses and occupants", icon: Home },
  { href: "/admin/resident-association/charges", label: "Charges", desc: "Levies and service charges", icon: Receipt },
  { href: "/admin/resident-association/payments", label: "Payments", desc: "Verify resident payments", icon: CreditCard },
  { href: "/admin/resident-association/discrepancies", label: "Discrepancies", desc: "Payment mismatches", icon: AlertCircle },
  { href: "/admin/resident-association/revenue", label: "Revenue", desc: "Collections for your estates", icon: DollarSign },
  { href: "/admin/resident-association/expenditures", label: "Expenditure", desc: "Estate spending", icon: DollarSign },
  { href: "/admin/resident-association/notices", label: "Notices", desc: "Resident notices", icon: Megaphone },
  { href: "/admin/office/workflow/queue", label: "Workflow queue", desc: "Reviews and approvals", icon: ListTodo },
  { href: "/admin/office/tasks", label: "My tasks", desc: "Items waiting on you", icon: ListTodo },
  { href: "/admin/office/cases", label: "Case desk", desc: "Resident cases", icon: ListTodo },
]

export function RaOfficerHomeDashboard({ heading }: { heading: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await getRaOfficerOverview()
        if (!cancelled) setData(res.data || null)
      } catch (e: any) {
        if (!cancelled) {
          toast({ title: "Failed to load dashboard", description: e?.message, variant: "destructive" })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [toast])

  const stats = [
    { title: "Estates", value: formatNumber(data?.estates ?? 0), hint: (data?.estate_names || []).join(", ") || "Assigned estates", icon: Building2 },
    { title: "Houses", value: formatNumber(data?.houses ?? 0), hint: "Linked to your estates", icon: Home },
    { title: "Collected", value: formatCurrency(data?.collected_revenue ?? 0), hint: "Verified levy collections", icon: CreditCard },
    { title: "Outstanding", value: formatCurrency(data?.outstanding_revenue ?? 0), hint: "Unpaid house charges", icon: AlertCircle },
    { title: "Pending verification", value: formatCurrency(data?.pending_verification ?? 0), hint: `${formatNumber(data?.pending_payments ?? 0)} payment(s)`, icon: Receipt },
    { title: "Expenditure", value: formatCurrency(data?.expenditure ?? 0), hint: "Recorded estate spend", icon: DollarSign },
    { title: "Paid houses", value: formatNumber(data?.paid_houses ?? 0), hint: "Charges fully settled", icon: Home },
    { title: "Unpaid houses", value: formatNumber(data?.unpaid_houses ?? 0), hint: "Pending or overdue", icon: Home },
    { title: "Workflow tasks", value: formatNumber(data?.workflow_pending ?? 0), hint: "Residence workflows", icon: ListTodo },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{heading || "Resident Association Dashboard"}</h1>
        <p className="text-muted-foreground">Estate houses, charges, payments, and residence workflows only.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading residence dashboard…
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground truncate">{item.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Residence work</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LINKS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="h-full transition hover:border-primary/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-primary">Open →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Link href="/admin/resident-association">
          <Button variant="outline">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Estate summaries
          </Button>
        </Link>
      </div>
    </div>
  )
}
