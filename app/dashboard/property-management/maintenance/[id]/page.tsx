"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, AlertCircle, CheckCircle, Clock, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { getMaintenanceRequest, type MaintenanceRequest } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function MaintenanceDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [comment, setComment] = useState("")
  const [request, setRequest] = useState<MaintenanceRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true)
        const response = await getMaintenanceRequest(id)
        if (response.success) {
          setRequest(response.request)
        } else {
          sonnerToast.error("Failed to load maintenance request")
        }
      } catch (error: any) {
        console.error("Error fetching maintenance request:", error)
        sonnerToast.error("Failed to load maintenance request", {
          description: error?.message || "Please try again later",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [id])

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
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const handleAddComment = () => {
    // TODO: Implement comment submission when backend endpoint is available
    console.log("Adding comment:", comment)
    sonnerToast.info("Comment feature coming soon")
    setComment("")
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Maintenance request not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link href="/dashboard/property-management/maintenance">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">{request.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{request.request_id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={getStatusColor(request.status)}>{request.status.replace("_", " ")}</Badge>
          <Badge variant={getPriorityColor(request.priority)}>{request.priority} priority</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>Complete information about the maintenance request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{request.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t">
                <div>
                  <label className="text-sm text-muted-foreground">Property</label>
                  <p className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <MapPin className="h-4 w-4" />
                    {request.property}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Estate</label>
                  <p className="font-medium text-sm sm:text-base">{request.estate}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Category</label>
                  <p className="font-medium text-sm sm:text-base">{request.category}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Assigned To</label>
                  <p className="font-medium text-sm sm:text-base">{request.assigned_to || "Not assigned yet"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {request.resolution_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Resolution Notes</CardTitle>
                <CardDescription>Final notes from the maintenance team</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{request.resolution_notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Add Comment</CardTitle>
              <CardDescription>Communicate with the maintenance team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your message here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              <Button onClick={handleAddComment} disabled={!comment.trim()} className="w-full sm:w-auto">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Current Status</label>
                <Badge className="mt-1" variant={getStatusColor(request.status)}>
                  {request.status.replace("_", " ")}
                </Badge>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Priority Level</label>
                <Badge className="mt-1" variant={getPriorityColor(request.priority)}>
                  {request.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.date_submitted && (
                <div>
                  <label className="text-sm text-muted-foreground">Date Submitted</label>
                  <p className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <Calendar className="h-4 w-4" />
                    {new Date(request.date_submitted).toLocaleDateString()}
                  </p>
                </div>
              )}
              {request.date_assigned && (
                <div>
                  <label className="text-sm text-muted-foreground">Date Assigned</label>
                  <p className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {new Date(request.date_assigned).toLocaleDateString()}
                  </p>
                </div>
              )}
              {request.estimated_completion && (
                <div>
                  <label className="text-sm text-muted-foreground">Estimated Completion</label>
                  <p className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <Clock className="h-4 w-4 text-blue-600" />
                    {new Date(request.estimated_completion).toLocaleDateString()}
                  </p>
                </div>
              )}
              {request.estimated_cost && (
                <div>
                  <label className="text-sm text-muted-foreground">Estimated Cost</label>
                  <p className="font-medium text-sm sm:text-base">
                    ₦{Number(request.estimated_cost).toLocaleString()}
                  </p>
                </div>
              )}
              {request.actual_cost && (
                <div>
                  <label className="text-sm text-muted-foreground">Actual Cost</label>
                  <p className="font-medium text-sm sm:text-base">
                    ₦{Number(request.actual_cost).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Team
              </Button>
              {request.status === "pending" && (
                <Button variant="destructive" className="w-full justify-start">
                  Cancel Request
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
