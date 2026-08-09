"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createMemberOfficeCase, getMemberOfficeCases } from "@/lib/api/member-office-cases"
import { Loader2, Plus } from "lucide-react"

export default function MyRequestsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    case_type: "general",
    subject: "",
    body: "",
  })

  const load = async () => {
    try {
      setLoading(true)
      const res = await getMemberOfficeCases({ per_page: 50 })
      setRows(res.data?.data || res.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load requests", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    if (!form.subject.trim() || !form.body.trim()) {
      toast({ title: "Subject and details are required", variant: "destructive" })
      return
    }
    setCreating(true)
    try {
      await createMemberOfficeCase(form)
      toast({ title: "Request submitted" })
      setShowNew(false)
      setForm({ case_type: "general", subject: "", body: "" })
      load()
    } catch (e: any) {
      toast({ title: "Could not submit", description: e.message, variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Requests</h1>
          <p className="text-muted-foreground">
            Track letters, applications, complaints, and office responses — including who attended your case.
          </p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New request
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No requests yet. Open a new request to the Digital Office.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    <Link href={`/dashboard/requests/${row.id}`} className="hover:underline">
                      {row.case_number}
                    </Link>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{row.case_type}</Badge>
                    <Badge
                      variant={
                        row.status === "closed" || row.status === "resolved" ? "default" : "secondary"
                      }
                    >
                      {row.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{row.subject}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Attending:{" "}
                  {row.assignee
                    ? `${row.assignee.first_name || ""} ${row.assignee.last_name || ""}`.trim()
                    : "Pending assignment"}
                </p>
                {row.resolution_summary && (
                  <p className="text-sm mt-2 text-emerald-700 dark:text-emerald-400">
                    Resolved: {row.resolution_summary}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New office request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select
                value={form.case_type}
                onValueChange={(v) => setForm((f) => ({ ...f, case_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="stoppage_of_deduction">Stoppage of deduction</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </div>
            <div>
              <Label>Details</Label>
              <Textarea rows={5} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
