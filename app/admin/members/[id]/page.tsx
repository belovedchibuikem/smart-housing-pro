"use client"

import { use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  // Mock data - replace with actual API call
  const member = {
    id,
    name: "John Adebayo",
    email: "john.adebayo@frsc.gov.ng",
    phone: "+234 803 456 7890",
    memberId: "FRSC/HMS/2024/001",
    rank: "Inspector",
    command: "Lagos State Command",
    unit: "Traffic Control Unit",
    dateJoined: "Jan 15, 2024",
    kycStatus: "pending",
    membershipType: "member",
    address: "15 Admiralty Way, Lekki Phase 1, Lagos",
    dateOfBirth: "May 10, 1985",
    gender: "Male",
    maritalStatus: "Married",
    nextOfKin: {
      name: "Mary Adebayo",
      relationship: "Spouse",
      phone: "+234 805 123 4567",
    },
    documents: [
      { type: "National ID", status: "verified", uploadDate: "Jan 15, 2024" },
      { type: "Passport Photo", status: "verified", uploadDate: "Jan 15, 2024" },
      { type: "Proof of Address", status: "pending", uploadDate: "Jan 16, 2024" },
    ],
    contributions: {
      total: 2500000,
      monthly: 50000,
      lastPayment: "Mar 1, 2024",
    },
    loans: {
      active: 1,
      totalBorrowed: 5000000,
      outstanding: 3500000,
    },
  }

  const handleApprove = () => {
    // Implement approval logic
    console.log("Approving KYC for member:", id)
    setShowApproveDialog(false)
  }

  const handleReject = () => {
    // Implement rejection logic
    console.log("Rejecting KYC for member:", id, "Reason:", rejectionReason)
    setShowRejectDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/members">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{member.name}</h1>
          <p className="text-muted-foreground">{member.memberId}</p>
        </div>
        <Badge
          variant={
            member.kycStatus === "approved" ? "default" : member.kycStatus === "rejected" ? "destructive" : "secondary"
          }
        >
          {member.kycStatus === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
          {member.kycStatus === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
          {member.kycStatus === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
          KYC {member.kycStatus}
        </Badge>
      </div>

      {member.kycStatus === "pending" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">KYC Verification Pending</h3>
                <p className="text-sm text-muted-foreground">Review member documents and approve or reject KYC</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowApproveDialog(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve KYC
                </Button>
                <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject KYC
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Member's personal details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <p className="font-medium">{member.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Date of Birth</label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {member.dateOfBirth}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Gender</label>
                  <p className="font-medium">{member.gender}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Marital Status</label>
                  <p className="font-medium">{member.maritalStatus}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {member.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Address</label>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {member.address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next of Kin</CardTitle>
              <CardDescription>Emergency contact information</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground">Name</label>
                <p className="font-medium">{member.nextOfKin.name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Relationship</label>
                <p className="font-medium">{member.nextOfKin.relationship}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {member.nextOfKin.phone}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>FRSC employment information</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground">Member ID</label>
                <p className="font-medium font-mono">{member.memberId}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Rank</label>
                <p className="font-medium">{member.rank}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Command</label>
                <p className="font-medium">{member.command}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Unit</label>
                <p className="font-medium">{member.unit}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Date Joined</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {member.dateJoined}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Membership Type</label>
                <Badge>{member.membershipType}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>KYC and verification documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {member.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-muted-foreground">Uploaded: {doc.uploadDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={doc.status === "verified" ? "default" : "secondary"}>{doc.status}</Badge>
                      <Button variant="outline" size="sm">
                        View Document
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contributions</CardTitle>
                <CardDescription>Member contribution summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Total Contributions</label>
                  <p className="text-2xl font-bold">₦{member.contributions.total.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Monthly Contribution</label>
                  <p className="text-lg font-semibold">₦{member.contributions.monthly.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Last Payment</label>
                  <p className="font-medium">{member.contributions.lastPayment}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loans</CardTitle>
                <CardDescription>Member loan summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Active Loans</label>
                  <p className="text-2xl font-bold">{member.loans.active}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Total Borrowed</label>
                  <p className="text-lg font-semibold">₦{member.loans.totalBorrowed.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Outstanding Balance</label>
                  <p className="font-medium text-orange-600">₦{member.loans.outstanding.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve KYC Verification</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve KYC verification for {member.name}? This will grant them full access to
              the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>Approve KYC</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {member.name}'s KYC verification.
            </DialogDescription>
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
              Reject KYC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
