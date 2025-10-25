import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"

export default function LoanSchedulePage({ params }: { params: { id: string } }) {
  // Calculate amortization schedule
  const principal = 5000000
  const annualRate = 0.08
  const monthlyRate = annualRate / 12
  const months = 48
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)

  const schedule = []
  let balance = principal

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate
    const principalPayment = monthlyPayment - interest
    balance -= principalPayment

    schedule.push({
      month: i,
      date: new Date(2024, i - 1, 15).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interest,
      balance: Math.max(0, balance),
      status: i <= 5 ? "paid" : "pending",
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link href={`/dashboard/loans/${params.id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Loan Details
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Repayment Schedule</h1>
            <p className="text-muted-foreground mt-1">Loan ID: {params.id}</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{months}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">43</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{Math.round(monthlyPayment).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
          <CardDescription>Detailed breakdown of your loan repayment plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Month</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((item) => (
                  <TableRow key={item.month}>
                    <TableCell className="font-medium">{item.month}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-right">₦{Math.round(item.payment).toLocaleString()}</TableCell>
                    <TableCell className="text-right">₦{Math.round(item.principal).toLocaleString()}</TableCell>
                    <TableCell className="text-right">₦{Math.round(item.interest).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₦{Math.round(item.balance).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.status === "paid" ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
