"use client"

import { use, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, Calendar, User, Eye } from "lucide-react"
import Link from "next/link"
import { getDocument, viewDocument, downloadDocument } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [document, setDocument] = useState<any>(null)

  useEffect(() => {
    fetchDocument()
  }, [id])

  const fetchDocument = async () => {
    try {
      setLoading(true)
      const response = await getDocument(id)
      if (response.success) {
        setDocument(response.data)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load document",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleView = async () => {
    try {
      const response = await viewDocument(id)
      if (response.success && response.data.view_url) {
        window.open(response.data.view_url, '_blank')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to view document",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async () => {
    try {
      const response = await downloadDocument(id)
      if (response.success && response.data.download_url) {
        const link = document.createElement('a')
        link.href = response.data.download_url
        link.download = response.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download document",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Document not found</p>
          <Link href="/admin/documents">
            <Button className="mt-4">Back to Documents</Button>
          </Link>
        </div>
      </div>
    )
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
          <p className="text-muted-foreground">{document.id}</p>
        </div>
        <Badge variant={getStatusBadgeVariant(document.status)}>
          {document.status}
        </Badge>
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
                  <Button onClick={handleView}>
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
              {document.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{document.description}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <label className="text-sm text-muted-foreground">Document Type</label>
                  <p className="font-medium">{document.type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">File Size</label>
                  <p className="font-medium">{document.file_size}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">MIME Type</label>
                  <p className="font-medium text-sm">{document.mime_type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Upload Date</label>
                  <p className="font-medium">{new Date(document.upload_date).toLocaleDateString()}</p>
                </div>
              </div>

              {document.rejection_reason && (
                <div className="pt-4 border-t">
                  <label className="text-sm text-muted-foreground">Rejection Reason</label>
                  <div className="mt-2 p-4 border rounded-lg bg-destructive/10">
                    <p className="text-sm">{document.rejection_reason}</p>
                  </div>
                </div>
              )}
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
                <label className="text-sm text-muted-foreground">Upload Date</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(document.upload_date).toLocaleDateString()}
                </p>
              </div>
              {document.approved_at && (
                <div>
                  <label className="text-sm text-muted-foreground">Approved Date</label>
                  <p className="font-medium">
                    {new Date(document.approved_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {document.rejected_at && (
                <div>
                  <label className="text-sm text-muted-foreground">Rejected Date</label>
                  <p className="font-medium">
                    {new Date(document.rejected_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Badge variant={getStatusBadgeVariant(document.status)} className="mt-1">
                  {document.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {document.member && document.member !== 'N/A' && (
            <Card>
              <CardHeader>
                <CardTitle>Associated Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {document.member}
                  </p>
                </div>
                {document.member_id && document.member_id !== 'N/A' && (
                  <div>
                    <label className="text-sm text-muted-foreground">Member ID</label>
                    <p className="font-medium font-mono">{document.member_id}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View Document
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
