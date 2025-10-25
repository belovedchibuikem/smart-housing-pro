"use client"

import { use, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Download,
  Calendar,
  Printer,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

export default function DocumentViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)

  // Mock data
  const document = {
    id,
    documentId: "DOC-2024-001",
    title: "Property Agreement - Block A Unit 12",
    type: "Property Agreement",
    category: "Legal Documents",
    uploadDate: "2024-01-15",
    fileSize: "2.5 MB",
    fileType: "PDF",
    totalPages: 15,
    description: "Property purchase agreement for Block A, Unit 12 in FRSC Estate Phase 1",
  }

  const handleDownload = () => {
    console.log("Downloading document:", id)
  }

  const handlePrint = () => {
    console.log("Printing document:", id)
  }

  const handleShare = () => {
    console.log("Sharing document:", id)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, document.totalPages))
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/documents">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{document.title}</h1>
          <p className="text-sm text-muted-foreground">{document.documentId}</p>
        </div>
        <Badge>{document.fileType}</Badge>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-16 text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="h-6 w-px bg-border mx-2" />
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-24 text-center">
                Page {currentPage} of {document.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= document.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="bg-muted/20 min-h-[800px] flex items-center justify-center rounded-lg overflow-auto">
                <div
                  className="bg-white shadow-lg"
                  style={{
                    width: `${(zoom / 100) * 800}px`,
                    minHeight: `${(zoom / 100) * 1000}px`,
                  }}
                >
                  <div className="p-8 space-y-4">
                    <div className="text-center border-b pb-4">
                      <h2 className="text-2xl font-bold">PROPERTY PURCHASE AGREEMENT</h2>
                      <p className="text-muted-foreground mt-2">FRSC Housing Management System</p>
                    </div>
                    <div className="space-y-4 text-sm">
                      <p>
                        This Property Purchase Agreement ("Agreement") is entered into on January 15, 2024, between the
                        Federal Road Safety Corps Housing Management System ("Seller") and the Purchaser identified
                        below.
                      </p>
                      <div className="space-y-2">
                        <h3 className="font-semibold">PROPERTY DETAILS</h3>
                        <p>Property: Block A, Unit 12</p>
                        <p>Location: FRSC Estate Phase 1, Lagos</p>
                        <p>Type: 3-Bedroom Apartment</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold">PURCHASE TERMS</h3>
                        <p>Purchase Price: ₦50,000,000</p>
                        <p>Payment Method: Installment Plan</p>
                        <p>Duration: 60 months</p>
                      </div>
                      <p className="text-muted-foreground italic">
                        [This is a preview. Download the full document to view all pages and details.]
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Type</label>
                <p className="font-medium">{document.type}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Category</label>
                <p className="font-medium">{document.category}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Upload Date</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(document.uploadDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">File Size</label>
                <p className="font-medium">{document.fileSize}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Pages</label>
                <p className="font-medium">{document.totalPages} pages</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Document
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Document
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Maximize className="h-4 w-4 mr-2" />
                Fullscreen View
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{document.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
