"use client"

import { use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Download, Calendar, TrendingUp, FileText } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Mock data - would come from database
  const loan = {
    id,
    type: "Housing Development Loan",
    amount: 5000000,
    disbursed: 5000000,
    outstanding: 4375000,
    paid: 625000,
    monthlyPayment: 125000,
    nextPayment: "Jan 15, 2025",
    progress: 12.5,
    status: "active",
    tenure: "48 months",
    interestRate: "8%",
    startDate: "Jan 1, 2024",
    endDate: "Dec 31, 2027",
    guarantor: "John Doe",
    purpose: "Construction of residential property",
  }

  const handleDownload = (documentType: string) => {
    toast.success(`Downloading ${documentType}...`)
    // In production, this would trigger actual file download
    // Example: window.open(`/api/loans/${loan.id}/download/${documentType}`, '_blank')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/loans">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Loans
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{loan.type}</h1>
            <p className="text-muted-foreground mt-1">Loan ID: {loan.id}</p>
          </div>
          <Badge className="text-sm px-3 py-1">{loan.status}</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Loan Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{loan.amount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₦{loan.outstanding.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₦{loan.paid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{loan.monthlyPayment.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Repayment Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Repayment Progress</CardTitle>
          <CardDescription>Track your loan repayment journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{loan.progress}% Complete</span>
            </div>
            <Progress value={loan.progress} className="h-3" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Next Payment</p>
                <p className="font-medium text-sm">{loan.nextPayment}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tenure Remaining</p>
                <p className="font-medium text-sm">42 months</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Interest Rate</p>
                <p className="font-medium text-sm">{loan.interestRate} p.a.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loan Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Loan Type</span>
              <span className="font-medium">{loan.type}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Disbursement Date</span>
              <span className="font-medium">{loan.startDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Maturity Date</span>
              <span className="font-medium">{loan.endDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Tenure</span>
              <span className="font-medium">{loan.tenure}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Guarantor</span>
              <span className="font-medium">{loan.guarantor}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Purpose</span>
              <span className="font-medium text-right max-w-[200px]">{loan.purpose}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/dashboard/loans/${loan.id}/repay`}>
              <Button className="w-full">Make Payment</Button>
            </Link>
            <Link href={`/dashboard/loans/${loan.id}/schedule`}>
              <Button variant="outline" className="w-full bg-transparent">
                View Repayment Schedule
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => handleDownload("Loan Agreement")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Loan Agreement
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => handleDownload("Payment Receipt")}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Payment Receipt
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
