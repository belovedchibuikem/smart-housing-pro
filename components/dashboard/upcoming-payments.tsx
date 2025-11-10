"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMemo } from "react"

interface UpcomingPayment {
  id: string
  amount: number
  due_date: string
  status: string
  description?: string
  type?: string
}

interface UpcomingPaymentsProps {
  data?: UpcomingPayment[]
  loading?: boolean
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

function isDue(dueDate: string): boolean {
  try {
    const due = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due <= today
  } catch {
    return false
  }
}

export function UpcomingPayments({ data, loading }: UpcomingPaymentsProps) {
  const payments = useMemo(() => {
    if (!data || data.length === 0) return []

    return data
      .map((payment) => ({
        title: payment.description || payment.type || "Payment",
        amount: formatCurrency(payment.amount),
        dueDate: formatDate(payment.due_date),
        status: isDue(payment.due_date) ? "due" : "upcoming",
      }))
      .slice(0, 5) // Limit to 5 payments
  }, [data])

  if (loading && !data) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (!data || payments.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Payments</h2>
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <p className="text-sm">No upcoming payments</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Upcoming Payments</h2>
      <div className="space-y-4">
        {payments.map((payment, index) => (
          <div key={index} className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0">
            <div className="space-y-1">
              <p className="font-medium text-sm">{payment.title}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {payment.dueDate}
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="font-semibold text-sm">{payment.amount}</p>
              <Badge variant={payment.status === "due" ? "destructive" : "secondary"} className="text-xs">
                {payment.status === "due" ? "Due Now" : "Upcoming"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
