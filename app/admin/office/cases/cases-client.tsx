"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { createOfficeCase, getOfficeCases, getOfficeStaffUsers } from "@/lib/api/office"
import { Loader2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const TYPE_LABELS: Record<string, string> = {
  letter: "Letter",
  application: "Application",
  complaint: "Complaint",
  stoppage_of_deduction: "Stoppage of Deduction",
  schedule: "Schedule",
  general: "General",
  other: "Other",
}

type Props = {
  title?: string
  description?: string
  orgUnitCode?: string
  defaultCaseType?: string
}

export default function OfficeCasesPage({
  title = "Case Desk",
  description = "Office-standard requests, complaints, letters, and resolutions.",
  orgUnitCode,
  defaultCaseType,
}: Props) {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const forcedOrg = orgUnitCode || searchParams.get("org_unit_code") || undefined

  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [status, setStatus] = useState("all")
  const [caseType, setCaseType] = useState(defaultCaseType || "all")
  const [q, setQ] = useState("")
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [creating, setCreating] = useState(false)
  const [staff, setStaff] = useState<any[]>([])
  const [form, setForm] = useState({
    case_type: defaultCaseType || "general",
    subject: "",
    body: "",
    member_id: "",
    assigned_to_user_id: "",
    priority: "normal",
  })

  const load = async () => {
    try {
      setLoading(true)
      const res = await getOfficeCases({
        per_page: 50,
        status: status === "all" ? undefined : status,
        case_type: caseType === "all" ? undefined : caseType,
        org_unit_code: forcedOrg,
        overdue: overdueOnly ? 1 : undefined,
        q: q || undefined,
      })
      setRows(res.data?.data || res.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load cases", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    getOfficeStaffUsers()
      .then((r) => setStaff(r.data || []))
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, caseType, overdueOnly, forcedOrg])

  const handleCreate = async () => {
    if (!form.subject.trim()) {
      toast({ title: "Subject is required", variant: "destructive" })
      return
    }
    setCreating(true)
    try {
      const payload: Record<string, unknown> = {
        case_type: form.case_type,
        subject: form.subject,
        body: form.body,
        priority: form.priority,
      }
      if (form.member_id) payload.member_id = form.member_id
      if (form.assigned_to_user_id) payload.assigned_to_user_id = form.assigned_to_user_id
      const res = await createOfficeCase(payload)
      toast({ title: "Case opened", description: res.data?.case_number })
      setShowNew(false)
      load()
    } catch (e: any) {
      toast({ title: "Could not open case", description: e.message, variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New case
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input
            placeholder="Search subject or case number"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="awaiting_member">Awaiting member</SelectItem>
              <SelectItem value="pending_signature">Pending signature</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={caseType} onValueChange={setCaseType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant={overdueOnly ? "default" : "outline"} onClick={() => setOverdueOnly((v) => !v)}>
            Overdue SLA
          </Button>
          <Button variant="secondary" onClick={load}>
            Apply
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Attending</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No cases found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link className="font-medium text-primary hover:underline" href={`/admin/office/cases/${row.id}`}>
                          {row.case_number}
                        </Link>
                        <div className="text-sm text-muted-foreground line-clamp-1">{row.subject}</div>
                      </TableCell>
                      <TableCell>{TYPE_LABELS[row.case_type] || row.case_type}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{row.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {row.member?.user
                          ? `${row.member.user.first_name || ""} ${row.member.user.last_name || ""}`.trim()
                          : row.member?.member_number || "—"}
                      </TableCell>
                      <TableCell>
                        {row.assignee
                          ? `${row.assignee.first_name || ""} ${row.assignee.last_name || ""}`.trim()
                          : "Unassigned"}
                      </TableCell>
                      <TableCell>{row.due_at ? new Date(row.due_at).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Open new case</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select value={form.case_type} onValueChange={(v) => setForm((f) => ({ ...f, case_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            </div>
            <div>
              <Label>Details</Label>
              <Textarea rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
            <div>
              <Label>Member ID (optional)</Label>
              <Input
                value={form.member_id}
                onChange={(e) => setForm((f) => ({ ...f, member_id: e.target.value }))}
                placeholder="UUID"
              />
            </div>
            <div>
              <Label>Assign to</Label>
              <Select
                value={form.assigned_to_user_id || "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, assigned_to_user_id: v === "none" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name || s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Open case
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
