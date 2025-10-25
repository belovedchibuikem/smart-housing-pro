"use client"

import { use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, Calendar, User, Eye } from "lucide-react"
import Link from "next/link"

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Mock data
  const document = {
    id,
    documentId: "DOC-2024-001",
    title: "Property Agreement - Block A Unit 12",
    type: "Property Agreement",
    category: "Legal Documents",
    uploadedBy: "Admin User",
    uploadDate: "2024-01-15",
    fileSize: "2.5 MB",
    fileType: "PDF",
    status: "active",
    description: "Property purchase agreement for Block A, Unit 12 in FRSC Estate Phase 1",
    relatedTo: {
      type: "Property",
      name: "Block A, Unit 12",
      id: "PROP-001",
    },
    member: {
      name: "John Adebayo",
      memberId: "FRSC/HMS/2024/001",
      email: "john.adebayo@frsc.gov.ng",
    },
    versions: [
      { version: "1.0", date: "2024-01-15", uploadedBy: "Admin User", notes: "Initial version" },
      { version: "1.1", date: "2024-02-01", uploadedBy: "Admin User", notes: "Updated terms" },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/documents">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{document.title}</h1>
          <p className="text-muted-foreground">{document.documentId}</p>
        </div>
        <Badge>{document.status}</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <CardDescription>View document content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-8 bg-muted/20 min-h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <FileText className="h-24 w-24 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Document preview not available</p>
                  <Button>
                    <Eye className="h-4 w-4 mr-2" />
                    Open Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
              <CardDescription>Details about this document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{document.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <label className="text-sm text-muted-foreground">Document Type</label>
                  <p className="font-medium">{document.type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Category</label>
                  <p className="font-medium">{document.category}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">File Type</label>
                  <p className="font-medium">{document.fileType}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">File Size</label>
                  <p className="font-medium">{document.fileSize}</p>
                </div>
              </div>

              {document.relatedTo && (
                <div className="pt-4 border-t">
                  <label className="text-sm text-muted-foreground">Related To</label>
                  <div className="mt-2 p-4 border rounded-lg">
                    <p className="font-medium">{document.relatedTo.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {document.relatedTo.type} • {document.relatedTo.id}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>Document version tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {document.versions.map((version, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Version {version.version}</p>
                      <p className="text-sm text-muted-foreground">
                        {version.date} • {version.uploadedBy}
                      </p>
                      {version.notes && <p className="text-sm text-muted-foreground mt-1">{version.notes}</p>}
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Uploaded By</label>
                <p className="font-medium">{document.uploadedBy}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Upload Date</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(document.uploadDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Badge className="mt-1">{document.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {document.member && (
            <Card>
              <CardHeader>
                <CardTitle>Associated Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {document.member.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Member ID</label>
                  <p className="font-medium font-mono">{document.member.memberId}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium text-sm">{document.member.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                View Document
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Print Document
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
