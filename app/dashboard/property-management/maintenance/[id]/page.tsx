"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

export default function MaintenanceDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [comment, setComment] = useState("")

  // Mock data
  const request = {
    id,
    requestId: "MNT-001",
    title: "Plumbing Issue",
    description:
      "There is a leaking pipe in the kitchen that needs immediate attention. Water is dripping from the sink connection.",
    property: "Block A, Unit 12",
    estate: "FRSC Estate Phase 1",
    status: "in_progress",
    priority: "high",
    dateSubmitted: "2024-01-15",
    dateAssigned: "2024-01-16",
    estimatedCompletion: "2024-01-20",
    assignedTo: "John Maintenance Team",
    category: "Plumbing",
    updates: [
      {
        date: "2024-01-16 10:30 AM",
        user: "Admin",
        message: "Request has been assigned to maintenance team",
        type: "status",
      },
      {
        date: "2024-01-16 02:15 PM",
        user: "John Maintenance Team",
        message: "Inspection completed. Parts ordered for repair.",
        type: "update",
      },
      {
        date: "2024-01-17 09:00 AM",
        user: "John Maintenance Team",
        message: "Parts received. Repair scheduled for tomorrow.",
        type: "update",
      },
    ],
    images: ["/leaking-pipe.jpg"],
  }

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
    console.log("Adding comment:", comment)
    setComment("")
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
          <p className="text-sm sm:text-base text-muted-foreground">{request.requestId}</p>
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

              {request.images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Attached Images</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {request.images.map((img, index) => (
                      <img
                        key={index}
                        src={img || "/placeholder.svg"}
                        alt=""
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

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
                  <p className="font-medium text-sm sm:text-base">{request.assignedTo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates & Activity</CardTitle>
              <CardDescription>Track progress and communication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.updates.map((update, index) => (
                <div key={index} className="flex gap-3 sm:gap-4 pb-4 border-b last:border-0">
                  <div className="mt-1 flex-shrink-0">
                    {update.type === "status" ? (
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <p className="font-medium text-sm sm:text-base">{update.user}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{update.date}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{update.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

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
              <div>
                <label className="text-sm text-muted-foreground">Date Submitted</label>
                <p className="font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="h-4 w-4" />
                  {new Date(request.dateSubmitted).toLocaleDateString()}
                </p>
              </div>
              {request.dateAssigned && (
                <div>
                  <label className="text-sm text-muted-foreground">Date Assigned</label>
                  <p className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {new Date(request.dateAssigned).toLocaleDateString()}
                  </p>
                </div>
              )}
              {request.estimatedCompletion && (
                <div>
                  <label className="text-sm text-muted-foreground">Estimated Completion</label>
                  <p className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <Clock className="h-4 w-4 text-blue-600" />
                    {new Date(request.estimatedCompletion).toLocaleDateString()}
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
