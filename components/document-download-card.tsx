"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Eye, Calendar } from "lucide-react"
import Link from "next/link"

interface DocumentDownloadCardProps {
  document: {
    id: string
    title: string
    type: string
    fileSize: string
    uploadDate: string
    status?: string
  }
}

export function DocumentDownloadCard({ document }: DocumentDownloadCardProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("Downloading document:", document.id)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{document.title}</h3>
                <p className="text-sm text-muted-foreground">{document.type}</p>
              </div>
              {document.status && <Badge variant="secondary">{document.status}</Badge>}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>{document.fileSize}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {document.uploadDate}
              </span>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/documents/view/${document.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
