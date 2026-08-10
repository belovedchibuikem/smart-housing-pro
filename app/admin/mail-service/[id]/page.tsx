"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Reply, Forward, Loader2, Briefcase } from "lucide-react"
import { Can } from "@/components/admin/can-permission"
import { getMessage } from "@/lib/api/client"
import { convertMailToOfficeCase } from "@/lib/api/office"
import { useToast } from "@/hooks/use-toast"

export default function AdminMessageDetailPage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : ""
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await getMessage(id)
        setMessage(res.data)
      } catch (e: any) {
        toast({ title: "Failed to load message", description: e.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const convertToCase = async () => {
    if (!id) return
    setBusy(true)
    try {
      const res = await convertMailToOfficeCase(id)
      toast({
        title: "Converted to case",
        description: res.data?.case_number || res.message,
      })
      const caseId = res.data?.case_id
      if (caseId) router.push(`/admin/office/cases/${caseId}`)
    } catch (e: any) {
      toast({ title: "Convert failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading message…
      </div>
    )
  }

  if (!message) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/mail-service/inbox">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to inbox
          </Link>
        </Button>
        <p>Message not found.</p>
      </div>
    )
  }

  const body = message.content || message.preview || message.body || ""

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/mail-service/inbox">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{message.subject || "(No subject)"}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Can permission="view_office_cases|manage_office_cases|create_office_cases">
            <Button variant="secondary" disabled={busy} onClick={convertToCase}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Briefcase className="mr-2 h-4 w-4" />}
              Convert to case
            </Button>
          </Can>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{message.from || "Unknown"}</CardTitle>
                {message.category ? <Badge variant="outline">{message.category}</Badge> : null}
                {message.is_urgent ? <Badge variant="destructive">Urgent</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">{message.from_email}</p>
              <p className="text-sm text-muted-foreground">To: {message.to}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">{message.date}</p>
              <p className="text-muted-foreground">{message.time}</p>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{body}</pre>
          </div>
          {(message.attachments || []).length > 0 ? (
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium">Attachments</p>
              <ul className="text-sm text-muted-foreground">
                {(message.attachments || []).map((a: any) => (
                  <li key={a.id || a.name}>{a.name || a.original_name || "File"}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Can permission="reply_mail|compose_mail">
          <Button asChild>
            <Link href={`/admin/mail-service/compose?reply=${message.id}`}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </Link>
          </Button>
        </Can>
        <Can permission="compose_mail">
          <Button variant="outline" asChild>
            <Link href={`/admin/mail-service/compose?forward=${message.id}`}>
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Link>
          </Button>
        </Can>
      </div>
    </div>
  )
}
