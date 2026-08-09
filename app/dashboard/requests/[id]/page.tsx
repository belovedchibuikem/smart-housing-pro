"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getMemberOfficeCase, replyMemberOfficeCase } from "@/lib/api/member-office-cases"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function MemberRequestDetailPage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : ""
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [caseData, setCaseData] = useState<any>(null)
  const [reply, setReply] = useState("")
  const [busy, setBusy] = useState(false)

  const load = async () => {
    if (!id) return
    try {
      setLoading(true)
      const res = await getMemberOfficeCase(id)
      setCaseData(res.data)
    } catch (e: any) {
      toast({ title: "Failed to load request", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const sendReply = async () => {
    if (!reply.trim()) return
    setBusy(true)
    try {
      await replyMemberOfficeCase(id, reply)
      setReply("")
      toast({ title: "Message sent" })
      await load()
    } catch (e: any) {
      toast({ title: "Failed to reply", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  if (loading || !caseData) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const closed = ["closed", "rejected", "resolved"].includes(caseData.status)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/requests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{caseData.case_number}</h1>
            <Badge>{caseData.status}</Badge>
          </div>
          <p className="text-muted-foreground">{caseData.subject}</p>
          <p className="text-sm mt-1">
            Attended by:{" "}
            {caseData.assignee
              ? `${caseData.assignee.first_name || ""} ${caseData.assignee.last_name || ""}`.trim()
              : "Awaiting assignment"}
          </p>
        </div>
      </div>

      {caseData.resolution_summary && (
        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
          <CardContent className="pt-6">
            <p className="font-medium">Resolution</p>
            <p className="text-sm mt-1 whitespace-pre-wrap">{caseData.resolution_summary}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(caseData.events || []).map((ev: any) => (
            <div key={ev.id} className="border-l-2 pl-4">
              <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                <span className="font-medium text-foreground">{ev.event_type}</span>
                <span>{ev.created_at ? new Date(ev.created_at).toLocaleString() : ""}</span>
                <span>
                  {ev.actor_user
                    ? `${ev.actor_user.first_name || ""} ${ev.actor_user.last_name || ""}`.trim()
                    : "You"}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap mt-1">{ev.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {!closed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} />
            <Button onClick={sendReply} disabled={busy || !reply.trim()}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
