"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function PendingApprovalsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showDialog, setShowDialog] = useState(false)

  const pendingTransactions = [
    {
      id: "1",
      memberName: "Jane Smith",
      memberId: "FRSC002",
      type: "withdrawal",
      amount: 25000,
      method: "Bank Transfer",
      accountNumber: "0123456789",
      bankName: "First Bank",
      date: "2024-01-10 12:15",
      reference: "TXN001235",
    },
    {
      id: "2",
      memberName: "David Brown",
      memberId: "FRSC004",
      type: "withdrawal",
      amount: 50000,
      method: "Bank Transfer",
      accountNumber: "9876543210",
      bankName: "GTBank",
      date: "2024-01-10 10:30",
      reference: "TXN001237",
    },
  ]

  const handleApprove = (transaction: any) => {
    setSelectedTransaction(transaction)
    setShowDialog(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-muted-foreground mt-2">Review and approve withdrawal requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>
            {pendingTransactions.length} pending approval{pendingTransactions.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-lg">{transaction.memberName}</p>
                          <p className="text-sm text-muted-foreground">{transaction.memberId}</p>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-semibold text-lg">₦{transaction.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Method</p>
                          <p className="font-medium">{transaction.method}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Bank</p>
                          <p className="font-medium">{transaction.bankName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Account Number</p>
                          <p className="font-medium">{transaction.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{transaction.date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reference</p>
                          <p className="font-mono text-xs">{transaction.reference}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1 lg:flex-none bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 lg:flex-none"
                        onClick={() => handleApprove(transaction)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1 lg:flex-none">
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
            <DialogDescription>Are you sure you want to approve this withdrawal request?</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-2 py-4">
              <p>
                <span className="font-medium">Member:</span> {selectedTransaction.memberName}
              </p>
              <p>
                <span className="font-medium">Amount:</span> ₦{selectedTransaction.amount.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Bank:</span> {selectedTransaction.bankName}
              </p>
              <p>
                <span className="font-medium">Account:</span> {selectedTransaction.accountNumber}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowDialog(false)}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
