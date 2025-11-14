"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, FileText, Download, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getAllotteeStatus, type AllotteeInfo } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function AllotteeStatusPage() {
  const [allotteeInfo, setAllotteeInfo] = useState<AllotteeInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllotteeStatus = async () => {
      try {
        setLoading(true)
        const response = await getAllotteeStatus()
        if (response.success) {
          setAllotteeInfo(response.allottee_info)
        } else {
          sonnerToast.error("Failed to load allottee status")
        }
      } catch (error: any) {
        console.error("Error fetching allottee status:", error)
        sonnerToast.error("Failed to load allottee status", {
          description: error?.message || "Please try again later",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAllotteeStatus()
  }, [])

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 w-fit">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approved Allottee
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 w-fit">
            <Clock className="h-4 w-4 mr-2" />
            Pending Approval
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 w-fit">
            <AlertCircle className="h-4 w-4 mr-2" />
            No Allocations
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="w-full space-y-6 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!allotteeInfo) {
    return (
      <div className="w-full space-y-6 px-4 sm:px-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Unable to load allottee status</p>
          </CardContent>
        </Card>
      </div>
    )
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
            {getStatusBadge(allotteeInfo.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Allottee ID</div>
              <div className="font-semibold">{allotteeInfo.allottee_id}</div>
            </div>
            {allotteeInfo.date_allocated && (
              <div>
                <div className="text-sm text-muted-foreground">Date Allocated</div>
                <div className="font-semibold">{new Date(allotteeInfo.date_allocated).toLocaleDateString()}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allocated Properties</CardTitle>
          <CardDescription>Properties allocated to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allotteeInfo.properties.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No properties allocated yet</p>
            </div>
          ) : (
            allotteeInfo.properties.map((property) => (
              <div key={property.id} className="flex flex-col gap-4 p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold">{property.type}</h3>
                    <Badge variant={getStatusColor(property.status)}>{property.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Estate: {property.estate}</div>
                    <div>Unit: {property.unit}</div>
                    {property.allocation_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Allocated: {new Date(property.allocation_date).toLocaleDateString()}
                      </div>
                    )}
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
