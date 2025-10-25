"use client"

import { use, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, Calendar, User, CreditCard } from "lucide-react"
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

export default function ContributionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  // Mock data
  const contribution = {
    id,
    contributionId: "CONT-2024-001",
    member: "John Adebayo",
    memberId: "FRSC/HMS/2024/001",
    email: "john.adebayo@frsc.gov.ng",
    phone: "+234 803 456 7890",
    amount: 50000,
    type: "Monthly Contribution",
    paymentMethod: "Bank Transfer",
    transactionRef: "TXN123456789",
    bankName: "First Bank",
    accountNumber: "0123456789",
    status: "pending",
    dateSubmitted: "2024-03-01",
    proofOfPayment: "/payment-receipt.jpg",
    notes: "Monthly contribution for March 2024",
  }

  const handleApprove = () => {
    console.log("Approving contribution:", id)
    setShowApproveDialog(false)
  }

  const handleReject = () => {
    console.log("Rejecting contribution:", id, "Reason:", rejectionReason)
    setShowRejectDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/contributions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Contribution Details</h1>
          <p className="text-muted-foreground">{contribution.contributionId}</p>
        </div>
        <Badge
          variant={
            contribution.status === "approved"
              ? "default"
              : contribution.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {contribution.status}
        </Badge>
      </div>

      {contribution.status === "pending" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Contribution Pending Verification</h3>
                <p className="text-sm text-muted-foreground">Review payment details and approve or reject</p>
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
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Contribution and payment details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Amount</label>
                  <p className="text-3xl font-bold">₦{contribution.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Contribution Type</label>
                  <p className="font-medium">{contribution.type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Payment Method</label>
                  <p className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {contribution.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Transaction Reference</label>
                  <p className="font-medium font-mono text-sm">{contribution.transactionRef}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Bank Name</label>
                  <p className="font-medium">{contribution.bankName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Account Number</label>
                  <p className="font-medium">{contribution.accountNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
              <CardDescription>Details about the contributing member</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {contribution.member}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Member ID</label>
                  <p className="font-medium font-mono">{contribution.memberId}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{contribution.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <p className="font-medium">{contribution.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {contribution.proofOfPayment && (
            <Card>
              <CardHeader>
                <CardTitle>Proof of Payment</CardTitle>
                <CardDescription>Uploaded payment receipt</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={contribution.proofOfPayment || "/placeholder.svg"}
                  alt="Payment Receipt"
                  className="w-full max-w-2xl border rounded-lg"
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Date Submitted</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(contribution.dateSubmitted).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Badge
                  className="mt-1"
                  variant={
                    contribution.status === "approved"
                      ? "default"
                      : contribution.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {contribution.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {contribution.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{contribution.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Contribution</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this contribution of ₦{contribution.amount.toLocaleString()} from{" "}
              {contribution.member}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>Approve Contribution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Contribution</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this contribution.</DialogDescription>
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
              Reject Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
