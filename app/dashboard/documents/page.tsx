import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Download, CheckCircle, Clock, XCircle, AlertCircle, Eye } from "lucide-react"
import Link from "next/link"
import { DocumentDownloadCard } from "@/components/document-download-card"

export default function DocumentsPage() {
  // Mock data - would come from database
  const kycStatus = "approved" // approved, pending, rejected, incomplete
  const documents = [
    {
      id: "1",
      title: "National ID Card",
      name: "National ID Card",
      type: "ID Card",
      status: "approved",
      uploadedDate: "2024-01-15",
      uploadDate: "Jan 15, 2024",
      fileSize: "1.2 MB",
      fileUrl: "#",
    },
    {
      id: "2",
      title: "Salary Payslip",
      name: "Salary Payslip",
      type: "Payslip",
      status: "approved",
      uploadedDate: "2024-01-15",
      uploadDate: "Jan 15, 2024",
      fileSize: "850 KB",
      fileUrl: "#",
    },
    {
      id: "3",
      title: "Passport Photograph",
      name: "Passport Photograph",
      type: "Passport Photo",
      status: "pending",
      uploadedDate: "2024-01-20",
      uploadDate: "Jan 20, 2024",
      fileSize: "450 KB",
      fileUrl: "#",
    },
    {
      id: "4",
      title: "Proof of Address",
      name: "Proof of Address",
      type: "Utility Bill",
      status: "incomplete",
      uploadedDate: null,
      uploadDate: "Not uploaded",
      fileSize: "-",
      fileUrl: null,
    },
  ]

  const propertyDocuments = [
    {
      id: "5",
      title: "Property Agreement - Block A Unit 12",
      type: "Property Agreement",
      uploadDate: "Jan 15, 2024",
      fileSize: "2.5 MB",
      status: "active",
    },
    {
      id: "6",
      title: "Investment Certificate - Modern Apartment",
      type: "Investment Certificate",
      uploadDate: "Feb 1, 2024",
      fileSize: "1.8 MB",
      status: "active",
    },
    {
      id: "7",
      title: "Loan Agreement - LN-2024-001",
      type: "Loan Agreement",
      uploadDate: "Mar 1, 2024",
      fileSize: "3.2 MB",
      status: "active",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case "incomplete":
        return (
          <Badge className="bg-gray-500/10 text-gray-700 hover:bg-gray-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Uploaded
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents & KYC</h1>
        <p className="text-muted-foreground mt-2">Manage your identity verification documents and KYC status</p>
      </div>

      {/* KYC Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>KYC Verification Status</CardTitle>
              <CardDescription>Your identity verification status</CardDescription>
            </div>
            {getStatusBadge(kycStatus)}
          </div>
        </CardHeader>
        <CardContent>
          {kycStatus === "approved" && (
            <div className="flex items-start gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">KYC Verified</p>
                <p className="text-sm text-green-700 mt-1">
                  Your identity has been verified. You have full access to all platform features.
                </p>
              </div>
            </div>
          )}
          {kycStatus === "pending" && (
            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Under Review</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your documents are being reviewed. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          )}
          {kycStatus === "incomplete" && (
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Action Required</p>
                <p className="text-sm text-blue-700 mt-1">
                  Please upload all required documents to complete your KYC verification.
                </p>
                <Link href="/register/kyc">
                  <Button className="mt-3" size="sm">
                    Complete KYC
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Documents</CardTitle>
          <CardDescription>View and manage your identity verification documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.type}
                      {doc.uploadedDate && ` • Uploaded ${doc.uploadedDate}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(doc.status)}
                  {doc.status === "incomplete" ? (
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  ) : (
                    <>
                      <Link href={`/dashboard/documents/view/${doc.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property & Investment Documents</CardTitle>
          <CardDescription>Access your property agreements, certificates, and related documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {propertyDocuments.map((doc) => (
              <DocumentDownloadCard key={doc.id} document={doc} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload New Document */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Additional Document</CardTitle>
          <CardDescription>Submit additional documents if requested by admin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium mb-1">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">PDF, PNG, JPG up to 5MB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
