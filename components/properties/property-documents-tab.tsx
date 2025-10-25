"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, CheckCircle2, Clock, Upload } from "lucide-react"

export function PropertyDocumentsTab() {
  const documents = [
    {
      id: 1,
      name: "Expression of Interest Form",
      type: "Application",
      status: "Submitted",
      date: "2024-01-15",
      verified: true,
    },
    {
      id: 2,
      name: "Payment Receipt - RCP-001",
      type: "Receipt",
      status: "Verified",
      date: "2024-01-15",
      verified: true,
    },
    {
      id: 3,
      name: "Payment Receipt - RCP-002",
      type: "Receipt",
      status: "Verified",
      date: "2024-02-15",
      verified: true,
    },
    {
      id: 4,
      name: "Payment Receipt - RCP-003",
      type: "Receipt",
      status: "Pending Verification",
      date: "2024-03-15",
      verified: false,
    },
    {
      id: 5,
      name: "Certificate of Payment Completion",
      type: "Certificate",
      status: "Not Yet Available",
      date: null,
      verified: false,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Documents</CardTitle>
          <CardDescription>All documents related to your property subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{doc.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {doc.type} {doc.date && `• ${new Date(doc.date).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {doc.verified ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {doc.status}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {doc.status}
                    </Badge>
                  )}
                  {doc.verified && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Additional Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Additional Documents</CardTitle>
          <CardDescription>Upload any additional documents required for your property subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</div>
            <div className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
