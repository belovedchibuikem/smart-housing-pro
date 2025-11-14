"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Save, Paperclip, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bold, Italic, Underline, List, LinkIcon, X } from "lucide-react"
import { composeMail, getMailMessage, getAvailableRecipients, MailMessage } from "@/lib/api/client"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function ComposeMailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get("draftId")

  const [formData, setFormData] = useState({
    to: "",
    cc: [] as string[],
    bcc: [] as string[],
    subject: "",
    message: "",
  })
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recipients, setRecipients] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [loadingRecipients, setLoadingRecipients] = useState(false)

  // Load recipients
  useEffect(() => {
    const loadRecipients = async () => {
      setLoadingRecipients(true)
      try {
        const response = await getAvailableRecipients()
        if (response.success && response.users) {
          setRecipients(response.users)
        }
      } catch (error: any) {
        console.error("Failed to load recipients:", error)
        toast.error("Failed to load recipients")
      } finally {
        setLoadingRecipients(false)
      }
    }
    loadRecipients()
  }, [])

  // Load draft if draftId is provided
  useEffect(() => {
    if (draftId) {
      loadDraft(draftId)
    }
  }, [draftId])

  const loadDraft = async (id: string) => {
    setLoading(true)
    try {
      const response = await getMailMessage(id)
      if (response.success && response.mail) {
        const mail = response.mail
        setFormData({
          to: mail.recipient_id || "",
          cc: Array.isArray(mail.cc) ? mail.cc : [],
          bcc: Array.isArray(mail.bcc) ? mail.bcc : [],
          subject: mail.subject || "",
          message: mail.body || "",
        })
        if (mail.cc && mail.cc.length > 0) setShowCc(true)
        if (mail.bcc && mail.bcc.length > 0) setShowBcc(true)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load draft")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!formData.to || !formData.message) {
      toast.error("Please fill in recipient and message")
      return
    }

    setIsSending(true)
    try {
      await composeMail({
        recipient_id: formData.to,
        subject: formData.subject,
        body: formData.message,
        cc: formData.cc.length > 0 ? formData.cc : undefined,
        bcc: formData.bcc.length > 0 ? formData.bcc : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        status: "sent",
      })

      toast.success("Mail sent successfully!")
      router.push("/dashboard/mail-service/sent")
    } catch (error: any) {
      toast.error(error.message || "Failed to send mail")
    } finally {
      setIsSending(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSaveDraft = async () => {
    if (!formData.message) {
      toast.error("Please enter a message to save as draft")
      return
    }

    setIsSaving(true)
    try {
      await composeMail({
        recipient_id: formData.to || undefined,
        subject: formData.subject,
        body: formData.message,
        save_as_draft: true,
        attachments: attachments.length > 0 ? attachments : undefined,
      })

      toast.success("Draft saved successfully!")
      router.push("/dashboard/mail-service/drafts")
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/mail-service">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Compose Mail</h1>
          <p className="text-muted-foreground mt-1">Send a message to Housing Admin</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="to">To *</Label>
            <Select
              value={formData.to}
              onValueChange={(value) => setFormData({ ...formData, to: value })}
              disabled={loadingRecipients}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingRecipients ? "Loading recipients..." : "Select recipient"} />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((recipient) => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.name} ({recipient.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-2">
              {!showCc && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCc(true)}>
                  + Cc
                </Button>
              )}
              {!showBcc && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowBcc(true)}>
                  + Bcc
                </Button>
              )}
            </div>
          </div>

          {showCc && (
            <div className="space-y-2">
              <Label htmlFor="cc">Cc</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !formData.cc.includes(value)) {
                    setFormData({ ...formData, cc: [...formData.cc, value] })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient to add to Cc" />
                </SelectTrigger>
                <SelectContent>
                  {recipients
                    .filter((r) => r.id !== formData.to && !formData.cc.includes(r.id) && !formData.bcc.includes(r.id))
                    .map((recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        {recipient.name} ({recipient.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formData.cc.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.cc.map((id) => {
                    const recipient = recipients.find((r) => r.id === id)
                    return recipient ? (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {recipient.name}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, cc: formData.cc.filter((i) => i !== id) })}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
          )}

          {showBcc && (
            <div className="space-y-2">
              <Label htmlFor="bcc">Bcc</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !formData.bcc.includes(value)) {
                    setFormData({ ...formData, bcc: [...formData.bcc, value] })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient to add to Bcc" />
                </SelectTrigger>
                <SelectContent>
                  {recipients
                    .filter((r) => r.id !== formData.to && !formData.cc.includes(r.id) && !formData.bcc.includes(r.id))
                    .map((recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        {recipient.name} ({recipient.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formData.bcc.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.bcc.map((id) => {
                    const recipient = recipients.find((r) => r.id === id)
                    return recipient ? (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {recipient.name}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, bcc: formData.bcc.filter((i) => i !== id) })}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <div className="flex items-center gap-1 p-2 border rounded-t-lg bg-accent/50">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                <Bold className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                <Italic className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                <Underline className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                <List className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              rows={12}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="rounded-t-none"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileSelect} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
              </Button>
              <span className="text-sm text-muted-foreground">
                {attachments.length === 0 ? "No files attached" : `${attachments.length} file(s) attached`}
              </span>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border bg-accent/50">
                    <span className="text-sm">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={handleSend} disabled={!formData.to || !formData.message || isSending || isSaving}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isSending}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </>
              )}
            </Button>
            <Link href="/dashboard/mail-service">
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
