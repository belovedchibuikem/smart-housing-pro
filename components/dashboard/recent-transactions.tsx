import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

export function RecentTransactions() {
  const transactions = [
    {
      id: "TXN001",
      type: "credit",
      description: "Monthly Contribution",
      amount: 50000,
      date: "Dec 1, 2024",
      status: "completed",
    },
    {
      id: "TXN002",
      type: "debit",
      description: "Loan Repayment",
      amount: 125000,
      date: "Nov 15, 2024",
      status: "completed",
    },
    {
      id: "TXN003",
      type: "credit",
      description: "Wallet Top-up",
      amount: 100000,
      date: "Nov 10, 2024",
      status: "completed",
    },
    {
      id: "TXN004",
      type: "debit",
      description: "Statutory Charge",
      amount: 10000,
      date: "Nov 5, 2024",
      status: "completed",
    },
    {
      id: "TXN005",
      type: "credit",
      description: "Monthly Contribution",
      amount: 50000,
      date: "Nov 1, 2024",
      status: "completed",
    },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <p className="text-sm text-muted-foreground">Your latest account activity</p>
        </div>
        <Badge variant="outline">Last 30 days</Badge>
      </div>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  transaction.type === "credit" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                }`}
              >
                {transaction.type === "credit" ? (
                  <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-500" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${transaction.type === "credit" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
              >
                {transaction.type === "credit" ? "+" : "-"}₦{transaction.amount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{transaction.id}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
