import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

export function ContributionHistory() {
  const contributions = [
    {
      id: "CONT-2024-12",
      amount: 50000,
      date: "Dec 1, 2024",
      status: "completed",
      method: "Bank Transfer",
      reference: "TXN001234567",
    },
    {
      id: "CONT-2024-11",
      amount: 50000,
      date: "Nov 1, 2024",
      status: "completed",
      method: "Card Payment",
      reference: "TXN001234566",
    },
    {
      id: "CONT-2024-10",
      amount: 50000,
      date: "Oct 1, 2024",
      status: "completed",
      method: "Bank Transfer",
      reference: "TXN001234565",
    },
    {
      id: "CONT-2024-09",
      amount: 75000,
      date: "Sep 1, 2024",
      status: "completed",
      method: "Bank Transfer",
      reference: "TXN001234564",
    },
    {
      id: "CONT-2024-08",
      amount: 50000,
      date: "Aug 1, 2024",
      status: "completed",
      method: "Card Payment",
      reference: "TXN001234563",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {contributions.map((contribution) => (
          <div
            key={contribution.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b last:border-0 last:pb-0"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {getStatusIcon(contribution.status)}
              </div>
              <div className="space-y-1">
                <p className="font-medium">{contribution.id}</p>
                <p className="text-sm text-muted-foreground">{contribution.date}</p>
                <p className="text-xs text-muted-foreground">
                  {contribution.method} • {contribution.reference}
                </p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-2">
              <p className="font-bold text-lg">₦{contribution.amount.toLocaleString()}</p>
              {getStatusBadge(contribution.status)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
