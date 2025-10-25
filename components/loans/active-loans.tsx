"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, AlertCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ActiveLoans() {
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<any>(null)

  const activeLoans = [
    {
      id: "LOAN-2024-001",
      type: "Housing Development Loan",
      amount: 5000000,
      disbursed: 5000000,
      outstanding: 4375000,
      monthlyPayment: 125000,
      nextPayment: "Jan 15, 2025",
      progress: 12.5,
      status: "active",
      tenure: "48 months",
      interestRate: "8%",
      maturityDate: "2028-01-15",
      monthsRemaining: 42,
    },
  ]

  const calculateTerminationAmount = (loan: any) => {
    const oneMonthInterest = (loan.outstanding * (Number.parseFloat(loan.interestRate) / 100)) / 12
    return loan.outstanding + oneMonthInterest
  }

  const canTerminate = (loan: any) => {
    return loan.monthsRemaining >= 2
  }

  const handleTerminate = (loan: any) => {
    setSelectedLoan(loan)
    setShowTerminateDialog(true)
  }

  return (
    <div className="space-y-6">
      {activeLoans.length > 0 ? (
        activeLoans.map((loan) => (
          <Card key={loan.id} className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{loan.type}</h3>
                    <Badge>{loan.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{loan.id}</p>
                </div>
                <Link href={`/dashboard/loans/${loan.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Loan Amount</p>
                  <p className="text-lg font-semibold">₦{loan.amount.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Outstanding Balance</p>
                  <p className="text-lg font-semibold text-orange-600">₦{loan.outstanding.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Monthly Payment</p>
                  <p className="text-lg font-semibold">₦{loan.monthlyPayment.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Interest Rate</p>
                  <p className="text-lg font-semibold">{loan.interestRate}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Repayment Progress</span>
                  <span className="font-medium">{loan.progress}%</span>
                </div>
                <Progress value={loan.progress} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next Payment:</span>
                  <span className="font-medium">{loan.nextPayment}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tenure:</span>
                  <span className="font-medium">{loan.tenure}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/dashboard/loans/${loan.id}/repay`} className="flex-1">
                  <Button className="w-full">Make Payment</Button>
                </Link>
                <Link href={`/dashboard/loans/${loan.id}/schedule`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    View Schedule
                  </Button>
                </Link>
                {canTerminate(loan) && (
                  <Button
                    variant="outline"
                    className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                    onClick={() => handleTerminate(loan)}
                  >
                    Terminate Loan
                  </Button>
                )}
              </div>

              {!canTerminate(loan) && loan.monthsRemaining < 2 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Loan termination is only available 2 months before maturity date
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Active Loans</h3>
          <p className="text-muted-foreground mb-6">You don't have any active loans at the moment</p>
          <Link href="/dashboard/loans/apply">
            <Button>Apply for a Loan</Button>
          </Link>
        </Card>
      )}

      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Loan Early</DialogTitle>
            <DialogDescription>
              You are about to terminate your loan before the maturity date. Please review the details below.
            </DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan Type</span>
                  <span className="font-medium">{selectedLoan.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Outstanding Balance</span>
                  <span className="font-medium">₦{selectedLoan.outstanding.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">One Month Interest Charge</span>
                  <span className="font-medium text-orange-600">
                    +₦
                    {(
                      (selectedLoan.outstanding * (Number.parseFloat(selectedLoan.interestRate) / 100)) /
                      12
                    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining Interest Cancelled</span>
                  <span className="font-medium text-green-600">
                    -₦
                    {(
                      (selectedLoan.outstanding *
                        (Number.parseFloat(selectedLoan.interestRate) / 100) *
                        (selectedLoan.monthsRemaining - 1)) /
                      12
                    ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total Amount to Pay</span>
                  <span className="font-bold text-lg">
                    ₦{calculateTerminationAmount(selectedLoan).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> By terminating early, you will be charged interest for one additional month,
                  and all remaining interest will be cancelled. This action cannot be undone.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log("Terminating loan:", selectedLoan?.id)
                setShowTerminateDialog(false)
              }}
            >
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
