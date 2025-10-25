import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

export function UpcomingPayments() {
  const payments = [
    {
      title: "Monthly Contribution",
      amount: "₦50,000",
      dueDate: "Dec 31, 2024",
      status: "due",
    },
    {
      title: "Loan Repayment",
      amount: "₦125,000",
      dueDate: "Jan 15, 2025",
      status: "upcoming",
    },
    {
      title: "Statutory Charge",
      amount: "₦10,000",
      dueDate: "Jan 20, 2025",
      status: "upcoming",
    },
  ]

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
