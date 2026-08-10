"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Reply, Forward, Download, Loader2 } from "lucide-react"
import { getMailMessage } from "@/lib/api/client"
import { toast } from "sonner"

export default function MessageDetailPage() {
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : ""
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await getMailMessage(id)
        setMessage((res as any).mail || (res as any).data || res)
      } catch (e: any) {
        toast.error(e.message || "Failed to load message")
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    )
  }

  if (!message) {
    return (
      <div className="space-y-4 p-6">
        <Link href="/dashboard/mail-service/inbox">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <p>Message not found.</p>
      </div>
    )
  }

  const subject = message.subject || "(No subject)"
  const from = message.from || message.sender_name || message.sender?.name || "Sender"
  const body = message.content || message.body || message.preview || ""
  const attachments = message.attachments || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/mail-service/inbox">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{subject}</h1>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-lg">{from}</p>
                {message.category ? <Badge variant="outline">{message.category}</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                To: {message.to || "You"}
              </p>
              <p className="text-sm text-muted-foreground">
                {message.date || message.sent_at || message.created_at || ""}
              </p>
            </div>
          </div>
          <Separator />
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{body}</pre>
          {attachments.length > 0 ? (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium">Attachments</p>
              {attachments.map((a: any) => (
                <div key={a.id || a.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="h-4 w-4" />
                  {a.name || a.original_name || "Attachment"}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Card>

      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/dashboard/mail-service/compose?reply=${id}`}>
            <Reply className="mr-2 h-4 w-4" /> Reply
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/mail-service/compose?forward=${id}`}>
            <Forward className="mr-2 h-4 w-4" /> Forward
          </Link>
        </Button>
      </div>
    </div>
  )
}
