"use client"

import { use, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Calendar, User, CreditCard, Building } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function WalletTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  // Mock data
  const transaction = {
    id,
    transactionId: "TXN-2024-001",
    member: "Jane Smith",
    memberId: "FRSC/HMS/2024/002",
    email: "jane.smith@frsc.gov.ng",
    phone: "+234 805 123 4567",
    type: "withdrawal",
    amount: 25000,
    method: "Bank Transfer",
    accountNumber: "0123456789",
    bankName: "First Bank",
    accountName: "Jane Smith",
    status: "pending",
    dateSubmitted: "2024-03-10",
    reference: "TXN001235",
    currentBalance: 150000,
    balanceAfter: 125000,
    reason: "Personal expenses",
  }

  const handleApprove = () => {
    console.log("Approving withdrawal:", id)
    setShowApproveDialog(false)
  }

  const handleReject = () => {
    console.log("Rejecting withdrawal:", id, "Reason:", rejectionReason)
    setShowRejectDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/wallets/pending">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Withdrawal Request</h1>
          <p className="text-muted-foreground">{transaction.transactionId}</p>
        </div>
        <Badge
          variant={
            transaction.status === "approved"
              ? "default"
              : transaction.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {transaction.status}
        </Badge>
      </div>

      {transaction.status === "pending" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Withdrawal Request Pending Approval</h3>
                <p className="text-sm text-muted-foreground">Review details and approve or reject the withdrawal</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowApproveDialog(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>Withdrawal request information</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Withdrawal Amount</label>
                  <p className="text-3xl font-bold">₦{transaction.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Transaction Type</label>
                  <p className="font-medium capitalize">{transaction.type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Payment Method</label>
                  <p className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {transaction.method}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Current Balance</label>
                  <p className="text-2xl font-semibold">₦{transaction.currentBalance.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Balance After Withdrawal</label>
                  <p className="text-xl font-medium text-orange-600">₦{transaction.balanceAfter.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Reference</label>
                  <p className="font-medium font-mono text-sm">{transaction.reference}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
              <CardDescription>Destination account for withdrawal</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Bank Name</label>
                  <p className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {transaction.bankName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Account Number</label>
                  <p className="font-medium font-mono">{transaction.accountNumber}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Account Name</label>
                  <p className="font-medium">{transaction.accountName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
              <CardDescription>Details about the requesting member</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {transaction.member}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Member ID</label>
                  <p className="font-medium font-mono">{transaction.memberId}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{transaction.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <p className="font-medium">{transaction.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Date Submitted</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(transaction.dateSubmitted).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Badge
                  className="mt-1"
                  variant={
                    transaction.status === "approved"
                      ? "default"
                      : transaction.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {transaction.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {transaction.reason && (
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{transaction.reason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this withdrawal of ₦{transaction.amount.toLocaleString()} to{" "}
              {transaction.member}'s account?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-sm">
              <span className="font-medium">Bank:</span> {transaction.bankName}
            </p>
            <p className="text-sm">
              <span className="font-medium">Account:</span> {transaction.accountNumber}
            </p>
            <p className="text-sm">
              <span className="font-medium">Account Name:</span> {transaction.accountName}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>Approve Withdrawal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this withdrawal request.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
              Reject Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
