"use client"

import { use, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle, XCircle, FileText, Download, Calendar, User } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDisburseDialog, setShowDisburseDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  // Mock data
  const loan = {
    id,
    loanId: "LN-2024-001",
    applicant: "John Adebayo",
    memberId: "FRSC/HMS/2024/001",
    email: "john.adebayo@frsc.gov.ng",
    phone: "+234 803 456 7890",
    amount: 5000000,
    tenure: 24,
    interestRate: 10,
    monthlyRepayment: 229167,
    totalRepayment: 5500000,
    lastNetPay: 500000,
    purpose: "Property Purchase",
    status: "pending",
    applicationDate: "Mar 1, 2024",
    approvedDate: null,
    disbursedDate: null,
    rejectionReason: null,
    documents: [
      { name: "Employment Letter", status: "verified", uploadDate: "Mar 1, 2024" },
      { name: "Bank Statement (6 months)", status: "verified", uploadDate: "Mar 1, 2024" },
      { name: "Guarantor Form", status: "pending", uploadDate: "Mar 2, 2024" },
    ],
    repaymentSchedule: Array.from({ length: 24 }, (_, i) => ({
      month: i + 1,
      dueDate: new Date(2024, 3 + i, 1).toLocaleDateString(),
      amount: 229167,
      status: i === 0 ? "paid" : "pending",
    })),
  }

  const handleApprove = () => {
    console.log("Approving loan:", id)
    setShowApproveDialog(false)
  }

  const handleReject = () => {
    console.log("Rejecting loan:", id, "Reason:", rejectionReason)
    setShowRejectDialog(false)
  }

  const handleDisburse = () => {
    console.log("Disbursing loan:", id)
    setShowDisburseDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/loans">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Loan Application</h1>
          <p className="text-muted-foreground">{loan.loanId}</p>
        </div>
        <Badge
          variant={
            loan.status === "approved"
              ? "default"
              : loan.status === "rejected"
                ? "destructive"
                : loan.status === "active"
                  ? "default"
                  : "secondary"
          }
        >
          {loan.status}
        </Badge>
      </div>

      {loan.status === "pending" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Loan Application Pending Review</h3>
                <p className="text-sm text-muted-foreground">Review application details and approve or reject</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowApproveDialog(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Loan
                </Button>
                <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Loan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loan.status === "approved" && !loan.disbursedDate && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Loan Approved - Ready for Disbursement</h3>
                <p className="text-sm text-muted-foreground">Disburse funds to the applicant's account</p>
              </div>
              <Button onClick={() => setShowDisburseDialog(true)}>Disburse Loan</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Loan Details</TabsTrigger>
          <TabsTrigger value="applicant">Applicant Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="schedule">Repayment Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Information</CardTitle>
              <CardDescription>Application details and terms</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Loan Amount</label>
                  <p className="text-2xl font-bold">₦{loan.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tenure</label>
                  <p className="font-medium">{loan.tenure} months</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Interest Rate</label>
                  <p className="font-medium">{loan.interestRate}% (Simple Interest)</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Purpose</label>
                  <p className="font-medium">{loan.purpose}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Monthly Repayment</label>
                  <p className="text-2xl font-bold text-primary">₦{loan.monthlyRepayment.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Total Repayment</label>
                  <p className="font-medium">₦{loan.totalRepayment.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Last Net Pay</label>
                  <p className="font-medium">₦{loan.lastNetPay.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Net Pay Ratio</label>
                  <p className="font-medium">
                    {((loan.monthlyRepayment / loan.lastNetPay) * 100).toFixed(1)}% of net pay
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
              <CardDescription>Key dates and milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Application Date</p>
                  <p className="text-sm text-muted-foreground">{loan.applicationDate}</p>
                </div>
              </div>
              {loan.approvedDate && (
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Approved Date</p>
                    <p className="text-sm text-muted-foreground">{loan.approvedDate}</p>
                  </div>
                </div>
              )}
              {loan.disbursedDate && (
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Disbursed Date</p>
                    <p className="text-sm text-muted-foreground">{loan.disbursedDate}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applicant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applicant Information</CardTitle>
              <CardDescription>Member details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {loan.applicant}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Member ID</label>
                  <p className="font-medium font-mono">{loan.memberId}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{loan.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <p className="font-medium">{loan.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>Uploaded documents for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loan.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">Uploaded: {doc.uploadDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={doc.status === "verified" ? "default" : "secondary"}>{doc.status}</Badge>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Repayment Schedule</CardTitle>
              <CardDescription>Monthly repayment plan</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loan.repaymentSchedule.slice(0, 12).map((payment) => (
                    <TableRow key={payment.month}>
                      <TableCell>Month {payment.month}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell className="text-right">₦{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={payment.status === "paid" ? "default" : "secondary"}>{payment.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Loan Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this loan application for ₦{loan.amount.toLocaleString()}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>Approve Loan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Loan Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this loan application.</DialogDescription>
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
              Reject Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisburseDialog} onOpenChange={setShowDisburseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disburse Loan</DialogTitle>
            <DialogDescription>
              Confirm disbursement of ₦{loan.amount.toLocaleString()} to {loan.applicant}'s account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisburseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDisburse}>Confirm Disbursement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
