"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, FileText, Download } from "lucide-react"
import Link from "next/link"

export default function AllotteeStatusPage() {
  const allotteeInfo = {
    status: "approved",
    allotteeId: "ALLOT-2024-001",
    dateAllocated: "2024-01-15",
    properties: [
      {
        id: 1,
        type: "House",
        estate: "FRSC Estate Phase 1",
        unit: "Block A, Unit 12",
        allocationDate: "2024-01-15",
        status: "allocated",
      },
      {
        id: 2,
        type: "Land",
        estate: "FRSC Estate Phase 2",
        unit: "Plot 45",
        allocationDate: "2024-02-01",
        status: "pending_documentation",
      },
    ],
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "allocated":
        return "default"
      case "pending_documentation":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="w-full space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Allottee Status</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">View your property allocation status</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Allottee Information</CardTitle>
              <CardDescription>Your allocation details and status</CardDescription>
            </div>
            <Badge variant="default" className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 w-fit">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved Allottee
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Allottee ID</div>
              <div className="font-semibold">{allotteeInfo.allotteeId}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Date Allocated</div>
              <div className="font-semibold">{new Date(allotteeInfo.dateAllocated).toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allocated Properties</CardTitle>
          <CardDescription>Properties allocated to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allotteeInfo.properties.map((property) => (
            <div key={property.id} className="flex flex-col gap-4 p-4 border rounded-lg">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold">{property.type}</h3>
                  <Badge variant={getStatusColor(property.status)}>{property.status.replace("_", " ")}</Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Estate: {property.estate}</div>
                  <div>Unit: {property.unit}</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Allocated: {new Date(property.allocationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent" asChild>
                  <Link href={`/dashboard/property-management/allottees/${property.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Documents
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
