import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

export function LoanHistory() {
  const history = [
    {
      id: "LOAN-2024-001",
      type: "Housing Development Loan",
      amount: 5000000,
      status: "active",
      appliedDate: "Jan 15, 2024",
      approvedDate: "Jan 20, 2024",
      disbursedDate: "Jan 25, 2024",
    },
    {
      id: "LOAN-2023-005",
      type: "Emergency Loan",
      amount: 1000000,
      status: "completed",
      appliedDate: "Jun 10, 2023",
      approvedDate: "Jun 12, 2023",
      disbursedDate: "Jun 15, 2023",
    },
    {
      id: "LOAN-2023-002",
      type: "Home Renovation Loan",
      amount: 2000000,
      status: "rejected",
      appliedDate: "Mar 5, 2023",
      approvedDate: null,
      disbursedDate: null,
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Active</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {history.map((loan) => (
          <div
            key={loan.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {getStatusIcon(loan.status)}
              </div>
              <div className="space-y-1">
                <p className="font-medium">{loan.type}</p>
                <p className="text-sm text-muted-foreground">{loan.id}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Applied: {loan.appliedDate}</span>
                  {loan.approvedDate && <span>Approved: {loan.approvedDate}</span>}
                  {loan.disbursedDate && <span>Disbursed: {loan.disbursedDate}</span>}
                </div>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-2">
              <p className="font-bold text-lg">₦{loan.amount.toLocaleString()}</p>
              {getStatusBadge(loan.status)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
