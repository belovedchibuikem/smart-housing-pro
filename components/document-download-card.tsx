"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Calendar } from "lucide-react"

export interface DocumentDownloadCardProps {
  document: {
    id: string
    title: string
    type: string
		fileSize?: string
		uploadDate?: string
    status?: string
		description?: string | null
	}
	onDownload?: (documentId: string) => Promise<void> | void
	extraActions?: React.ReactNode
}

export function DocumentDownloadCard({ document, onDownload, extraActions }: DocumentDownloadCardProps) {
	const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault()
		if (onDownload) {
			await onDownload(document.id)
		}
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
					<div className="rounded-lg bg-primary/10 p-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
					<div className="min-w-0 flex-1 space-y-3">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0 flex-1">
								<h3 className="truncate font-semibold">{document.title}</h3>
                <p className="text-sm text-muted-foreground">{document.type}</p>
								{document.description ? (
									<p className="mt-1 text-xs text-muted-foreground line-clamp-2">{document.description}</p>
								) : null}
              </div>
							{document.status ? <Badge variant="secondary">{document.status}</Badge> : null}
            </div>
						<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
							{document.fileSize ? <span>{document.fileSize}</span> : null}
							{document.uploadDate ? (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {document.uploadDate}
              </span>
							) : null}
            </div>
						<div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
								<Download className="mr-2 h-4 w-4" />
                Download
              </Button>
							{extraActions}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
