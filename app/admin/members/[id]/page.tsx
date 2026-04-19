"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, AlertCircle, Upload, Download, Eye, Trash2, RefreshCw, User, Building, FileText, DollarSign, Pencil, Undo2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  MemberService,
  Member,
  Document,
  MemberStats,
  mergeContributionWalletIntoStats,
} from "@/lib/api/member-service"
import { Skeleton } from "@/components/ui/skeleton"

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const formatCurrency = (value?: number) => currencyFormatter.format(value ?? 0)

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  // State management
  const [member, setMember] = useState<Member | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [financialStats, setFinancialStats] = useState<MemberStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [financialLoading, setFinancialLoading] = useState(false)
  
  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showReverseDialog, setShowReverseDialog] = useState(false)
  const [showDocumentUploadDialog, setShowDocumentUploadDialog] = useState(false)
  const [showDocumentViewDialog, setShowDocumentViewDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [openingKycIndex, setOpeningKycIndex] = useState<number | null>(null)
  
  // Form states
  const [rejectionReason, setRejectionReason] = useState("")
  const [documentUploadData, setDocumentUploadData] = useState({
    type: "",
    title: "",
    description: "",
    file: null as File | null
  })
  
  // Load member data
  useEffect(() => {
    loadMemberData()
  }, [id])

  const loadMemberData = async () => {
    try {
      setLoading(true)
      
      let loadedMember: Member | null = null
      try {
        const memberResponse = await MemberService.getMember(id)
        loadedMember = memberResponse.member
        setMember(memberResponse.member)
      } catch (error) {
        console.error("Error loading member:", error)
        toast.error("Failed to load member data")
        return
      }

      const [documentsResponse, financialResponse] = await Promise.allSettled([
        MemberService.getMemberDocuments(id),
        MemberService.getMemberFinancialStats(id),
      ])

      if (documentsResponse.status === "fulfilled") {
        setDocuments(documentsResponse.value.documents)
      } else {
        console.warn("Error loading documents:", documentsResponse.reason)
        setDocuments([])
      }

      if (financialResponse.status === "fulfilled") {
        setFinancialStats(
          mergeContributionWalletIntoStats(financialResponse.value, loadedMember?.contribution_wallet),
        )
      } else {
        console.warn("Error loading financial stats:", financialResponse.reason)
        setFinancialStats(
          mergeContributionWalletIntoStats(
            {
              total_contributions: 0,
              contribution_balance: 0,
              monthly_contribution: 0,
              last_payment_date: undefined,
              active_loans: 0,
              total_borrowed: 0,
              outstanding_balance: 0,
              total_investments: 0,
              investment_returns: 0,
            },
            loadedMember?.contribution_wallet,
          ),
        )
      }
    } catch (error) {
      console.error("Error loading member data:", error)
      toast.error("Failed to load member data")
    } finally {
      setLoading(false)
    }
  }

  const handleViewKycDocument = async (index: number) => {
    if (!member?.id) return
    const path = member.kyc_documents?.[index]?.path
    if (!path?.trim()) {
      toast.error("File missing")
      return
    }
    if (path.startsWith("http://") || path.startsWith("https://")) {
      window.open(path, "_blank", "noopener,noreferrer")
      return
    }
    setOpeningKycIndex(index)
    try {
      const blob = await MemberService.fetchKycDocumentBlob(member.id, index)
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank", "noopener,noreferrer")
      window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
    } catch (error) {
      console.error("Error opening KYC document:", error)
      toast.error(error instanceof Error ? error.message : "Failed to open document")
    } finally {
      setOpeningKycIndex(null)
    }
  }

  const handleApproveKyc = async () => {
    try {
      await MemberService.approveKyc(id)
      toast.success("KYC approved successfully")
      setShowApproveDialog(false)
      loadMemberData() // Refresh data
    } catch (error) {
      console.error("Error approving KYC:", error)
      toast.error("Failed to approve KYC")
    }
  }

  const handleRejectKyc = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    
    try {
      await MemberService.rejectKyc(id, rejectionReason)
      toast.success("KYC rejected successfully")
      setShowRejectDialog(false)
      setRejectionReason("")
      loadMemberData() // Refresh data
    } catch (error) {
      console.error("Error rejecting KYC:", error)
      toast.error("Failed to reject KYC")
    }
  }

  const handleReverseKyc = async () => {
    try {
      await MemberService.reverseKyc(id)
      toast.success("KYC approval reversed")
      setShowReverseDialog(false)
      loadMemberData()
    } catch (error) {
      console.error("Error reversing KYC:", error)
      toast.error("Failed to reverse KYC approval")
    }
  }

  const handleDocumentAction = async (documentId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      if (action === 'approve') {
        await MemberService.approveDocument(documentId)
        toast.success("Document approved successfully")
      } else {
        if (!reason?.trim()) {
          toast.error("Please provide a rejection reason")
          return
        }
        await MemberService.rejectDocument(documentId, reason)
        toast.success("Document rejected successfully")
      }
      loadMemberData() // Refresh data
    } catch (error) {
      console.error(`Error ${action}ing document:`, error)
      toast.error(`Failed to ${action} document`)
    }
  }

  const handleDocumentDownload = async (document: Document) => {
    try {
      const response = await MemberService.getDocumentDownloadUrl(document.id)
      // Open download URL in new tab
      window.open(response.download_url, '_blank')
    } catch (error) {
      console.error("Error downloading document:", error)
      toast.error("Failed to download document")
    }
  }

  const handleDocumentUpload = async () => {
    if (!documentUploadData.file || !documentUploadData.type || !documentUploadData.title) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // In a real implementation, you would upload the file first
      // For now, we'll simulate the upload
      const mockFileData = {
        type: documentUploadData.type,
        title: documentUploadData.title,
        description: documentUploadData.description,
        file_path: `documents/${id}/${Date.now()}_${documentUploadData.file.name}`,
        file_size: documentUploadData.file.size,
        mime_type: documentUploadData.file.type
      }

      await MemberService.uploadDocument(id, mockFileData)
      toast.success("Document uploaded successfully")
      setShowDocumentUploadDialog(false)
      setDocumentUploadData({ type: "", title: "", description: "", file: null })
      loadMemberData() // Refresh data
    } catch (error) {
      console.error("Error uploading document:", error)
      toast.error("Failed to upload document")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/members">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Member Not Found</h1>
            <p className="text-muted-foreground">The requested member could not be found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/members">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {member.first_name} {member.last_name}
          </h1>
          <p className="text-muted-foreground">{member.member_number}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/members/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Badge
            variant={
              member.kyc_status === "verified" ? "default" : 
              member.kyc_status === "rejected" ? "destructive" : "secondary"
            }
          >
            {member.kyc_status === "verified" && <CheckCircle className="h-3 w-3 mr-1" />}
            {member.kyc_status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
            {member.kyc_status === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
            KYC {member.kyc_status}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadMemberData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KYC — pending review (includes not-yet-submitted and resubmission after rejection) */}
      {["pending", "submitted", "rejected"].includes((member.kyc_status || "").toLowerCase()) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">KYC verification</h3>
                <p className="text-sm text-muted-foreground">
                  {(member.kyc_status || "").toLowerCase() === "rejected"
                    ? "Member was rejected — you can approve after review, or reject again with a reason."
                    : "Review member details and documents. You may approve even if the member has not submitted the KYC form yet."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setShowApproveDialog(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve KYC
                </Button>
                {(member.kyc_status || "").toLowerCase() === "submitted" && (
                  <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject KYC
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KYC verified — reverse mistaken approval */}
      {(member.kyc_status || "").toLowerCase() === "verified" && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">KYC verified</h3>
                <p className="text-sm text-muted-foreground">
                  If this approval was a mistake, you can reverse it. The member returns to{" "}
                  {member.kyc_submitted_at ? "submitted" : "pending"} review.
                </p>
              </div>
              <Button variant="outline" className="border-emerald-300 bg-white" onClick={() => setShowReverseDialog(true)}>
                <Undo2 className="h-4 w-4 mr-2" />
                Reverse approval
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="employment" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Employment
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
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
                  <p className="font-medium">{member.first_name} {member.last_name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Date of Birth</label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Gender</label>
                  <p className="font-medium capitalize">{member.gender || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Marital Status</label>
                  <p className="font-medium capitalize">{member.marital_status || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Nationality</label>
                  <p className="font-medium">{member.nationality || 'Not provided'}</p>
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
                    {member.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Address</label>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {member.residential_address || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">City</label>
                  <p className="font-medium">{member.city || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">State</label>
                  <p className="font-medium">{member.state || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Additional member details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground">State of Origin</label>
                <p className="font-medium">{member.state_of_origin || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">LGA</label>
                <p className="font-medium">{member.lga || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Tab */}
        <TabsContent value="employment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>FRSC employment information</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground">Member ID (cooperative)</label>
                <p className="font-medium font-mono">{member.member_number}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">IPPIS number</label>
                <p className="font-medium">{member.ippis_number || 'Not provided'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Civil servants (IPPIS)</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">FRSC PIN</label>
                <p className="font-medium">{member.frsc_pin || 'Not provided'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">FRSC staff only</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Legacy reference ID</label>
                <p className="font-medium">{member.staff_id || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Rank</label>
                <p className="font-medium">{member.rank || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Department</label>
                <p className="font-medium">{member.department || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Command State</label>
                <p className="font-medium">{member.command_state || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Employment Date</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {member.employment_date ? new Date(member.employment_date).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Years of Service</label>
                <p className="font-medium">{member.years_of_service || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Membership Type</label>
                <Badge variant="outline" className="capitalize">{member.membership_type}</Badge>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Badge 
                  variant={member.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {member.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          {(member.kyc_documents?.length ?? 0) > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Member KYC Documents</CardTitle>
                <CardDescription>Files submitted directly by the member during KYC</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {member.kyc_documents?.map((doc, index) => {
                  const hasPath = Boolean(doc.path?.trim())
                  return (
                    <div key={`${doc.type}-${index}`} className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium capitalize">{doc.type.replace(/_/g, " ")}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasPath ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={openingKycIndex === index}
                            onClick={() => handleViewKycDocument(index)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            View File
                          </Button>
                        ) : (
                          <Badge variant="secondary">File missing</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Member KYC Documents</CardTitle>
                <CardDescription>No direct member uploads found for KYC</CardDescription>
              </CardHeader>
            </Card>
          )}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Uploaded Documents</CardTitle>
                  <CardDescription>KYC and verification documents</CardDescription>
                </div>
                <Button onClick={() => setShowDocumentUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{doc.title}</p>
                          <Badge 
                            variant={
                              doc.status === "approved" ? "default" : 
                              doc.status === "rejected" ? "destructive" : "secondary"
                            }
                            className="text-xs"
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {doc.file_size_human} • {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        {doc.rejection_reason && (
                          <p className="text-sm text-red-600 mt-1">Reason: {doc.rejection_reason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDocumentAction(doc.id, 'approve')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt("Enter rejection reason:")
                                if (reason) handleDocumentAction(doc.id, 'reject', reason)
                              }}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDocumentDownload(doc)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          {financialLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-28" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contributions</CardTitle>
                  <CardDescription>Member contribution summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Total Contributions</label>
                    <p className="text-2xl font-bold">{formatCurrency(financialStats?.total_contributions)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Contribution Balance</label>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(financialStats?.contribution_balance)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Monthly Contribution</label>
                    <p className="text-lg font-semibold">
                      {formatCurrency(
                        financialStats?.monthly_contribution ||
                          member?.monthly_contribution_amount ||
                          0,
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Last Payment</label>
                    <p className="font-medium">
                      {financialStats?.last_payment_date ? 
                        new Date(financialStats.last_payment_date).toLocaleDateString() : 
                        'No payments yet'
                      }
                    </p>
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
                    <p className="text-2xl font-bold">{financialStats?.active_loans || '0'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Total Borrowed</label>
                    <p className="text-lg font-semibold">{formatCurrency(financialStats?.total_borrowed)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Outstanding Balance</label>
                    <p className="font-medium text-orange-600">{formatCurrency(financialStats?.outstanding_balance)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* KYC Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve KYC Verification</DialogTitle>
            <DialogDescription>
              Approve KYC for {member.first_name} {member.last_name}? This works even if they have not submitted
              the KYC form yet. The member will be treated as verified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveKyc}>
              Approve KYC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KYC Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {member.first_name} {member.last_name}'s KYC verification.
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
            <Button variant="destructive" onClick={handleRejectKyc} disabled={!rejectionReason.trim()}>
              Reject KYC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KYC Reverse Dialog */}
      <Dialog open={showReverseDialog} onOpenChange={setShowReverseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reverse KYC approval</DialogTitle>
            <DialogDescription>
              This removes verified status from {member.first_name} {member.last_name}. They will return to{" "}
              {member.kyc_submitted_at ? "submitted (awaiting review)" : "pending"} so you can review again if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReverseDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReverseKyc}>
              <Undo2 className="h-4 w-4 mr-2" />
              Reverse approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={showDocumentUploadDialog} onOpenChange={setShowDocumentUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document for {member.first_name} {member.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-type">Document Type</Label>
              <Select 
                value={documentUploadData.type} 
                onValueChange={(value) => setDocumentUploadData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="proof_of_address">Proof of Address</SelectItem>
                  <SelectItem value="employment_letter">Employment Letter</SelectItem>
                  <SelectItem value="bank_statement">Bank Statement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="document-title">Title</Label>
              <Input
                id="document-title"
                placeholder="Enter document title"
                value={documentUploadData.title}
                onChange={(e) => setDocumentUploadData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="document-description">Description (Optional)</Label>
              <Textarea
                id="document-description"
                placeholder="Enter document description"
                value={documentUploadData.description}
                onChange={(e) => setDocumentUploadData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="document-file">File</Label>
              <Input
                id="document-file"
                type="file"
                onChange={(e) => setDocumentUploadData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDocumentUpload}>
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
