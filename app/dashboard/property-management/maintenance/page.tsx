"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Calendar, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { getMyMaintenanceRequests, type MaintenanceRequest } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function MaintenanceRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true)
        const params: { status?: string } = {}
        if (statusFilter !== "all") {
          params.status = statusFilter
        }
        const response = await getMyMaintenanceRequests(params)
        if (response.success) {
          setRequests(response.requests)
        } else {
          sonnerToast.error("Failed to load maintenance requests")
        }
      } catch (error: any) {
        console.error("Error fetching maintenance requests:", error)
        sonnerToast.error("Failed to load maintenance requests", {
          description: error?.message || "Please try again later",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [statusFilter])

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return requests
    const query = searchQuery.toLowerCase()
    return requests.filter(
      (request) =>
        request.title.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query) ||
        request.property.toLowerCase().includes(query) ||
        request.estate.toLowerCase().includes(query) ||
        request.request_id.toLowerCase().includes(query)
    )
  }, [requests, searchQuery])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
      case "urgent":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
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

  return (
    <div className="w-full space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Maintenance Requests</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Track and manage your maintenance requests</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/property-management/maintenance/new">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Requests</CardTitle>
          <CardDescription>Search and filter your maintenance requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "No maintenance requests found matching your filters"
                : "You haven't submitted any maintenance requests yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-base sm:text-lg">{request.title}</h3>
                      <Badge variant={getStatusColor(request.status)}>{request.status.replace("_", " ")}</Badge>
                      <Badge variant={getPriorityColor(request.priority)}>{request.priority} priority</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Request ID:</span> {request.request_id}
                      </div>
                      <div>
                        <span className="font-medium">Property:</span> {request.property}
                      </div>
                      <div>
                        <span className="font-medium">Estate:</span> {request.estate}
                      </div>
                      {request.date_submitted && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.date_submitted).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto sm:self-end bg-transparent" asChild>
                    <Link href={`/dashboard/property-management/maintenance/${request.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
