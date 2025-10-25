"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, FileText, Calendar, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AllotteeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const propertyId = params.id

  // Mock data
  const allotteeDetails = {
    id: propertyId,
    type: "House",
    estate: "FRSC Estate Phase 1",
    unit: "Block A, Unit 12",
    allocationDate: "2024-01-15",
    status: "allocated",
    allotteeId: "ALLOT-2024-001",
    propertyDetails: {
      bedrooms: 3,
      bathrooms: 2,
      size: "120 sqm",
      floor: "Ground Floor",
    },
    documents: [
      { name: "Allocation Letter", date: "2024-01-15", status: "available" },
      { name: "Property Agreement", date: "2024-01-16", status: "available" },
      { name: "Payment Receipt", date: "2024-01-15", status: "available" },
    ],
    paymentSchedule: [
      { month: "January 2024", amount: 50000, status: "paid", date: "2024-01-15" },
      { month: "February 2024", amount: 50000, status: "paid", date: "2024-02-15" },
      { month: "March 2024", amount: 50000, status: "pending", date: "2024-03-15" },
    ],
  }

  const handleDownloadDocument = (docName: string) => {
    toast({
      title: "Downloading Document",
      description: `${docName} is being downloaded...`,
    })
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Allottee Details</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Property allocation information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>{allotteeDetails.type}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4" />
                {allotteeDetails.estate} - {allotteeDetails.unit}
              </CardDescription>
            </div>
            <Badge variant="default" className="text-base px-4 py-2 w-fit">
              {allotteeDetails.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm text-muted-foreground">Allottee ID</div>
              <div className="font-semibold">{allotteeDetails.allotteeId}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Allocation Date</div>
              <div className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(allotteeDetails.allocationDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Property Size</div>
              <div className="font-semibold">{allotteeDetails.propertyDetails.size}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Bedrooms</div>
              <div className="font-semibold">{allotteeDetails.propertyDetails.bedrooms} Bedrooms</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-grid">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>Complete information about your allocated property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Property Type</div>
                    <div className="font-medium">{allotteeDetails.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Estate</div>
                    <div className="font-medium">{allotteeDetails.estate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Unit</div>
                    <div className="font-medium">{allotteeDetails.unit}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                    <div className="font-medium">{allotteeDetails.propertyDetails.bedrooms}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                    <div className="font-medium">{allotteeDetails.propertyDetails.bathrooms}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Floor</div>
                    <div className="font-medium">{allotteeDetails.propertyDetails.floor}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Allocation Documents</CardTitle>
              <CardDescription>Download your property allocation documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allotteeDetails.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Issued: {new Date(doc.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(doc.name)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>Track your property payment schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allotteeDetails.paymentSchedule.map((payment, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{payment.month}</div>
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(payment.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold">₦{payment.amount.toLocaleString()}</div>
                      </div>
                      <Badge variant={payment.status === "paid" ? "default" : "secondary"}>{payment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
