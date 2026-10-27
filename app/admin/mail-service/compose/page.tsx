"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, Paperclip, Save } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { composeMessage, getAdminMailRecipients, getMessage } from "@/lib/api/client"
import { RecipientPicker, recipientSendLabel, type MailPerson } from "@/components/mail/recipient-picker"
import { toast } from "sonner"
import { Can } from "@/components/admin/can-permission"

export default function AdminComposeMailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')
  
  const [formData, setFormData] = useState({
    recipients: "specific",
    subject: "",
    message: "",
    category: "general",
    cc: "",
    bcc: "",
    is_urgent: false,
  })
  const [selectedPeople, setSelectedPeople] = useState<MailPerson[]>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [loading, setLoading] = useState(!!draftId)
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null)
  const draftIdRef = useRef<string | null>(draftId)
  const sendingRef = useRef(false)
  const saveLock = useRef(false)

  const report = (tone: "error" | "success", text: string) => {
    setNotice({ tone, text })
    if (tone === "error") toast.error(text)
    else toast.success(text)
  }

  // Load draft if editing
  useEffect(() => {
    if (draftId) {
      loadDraft(draftId)
    }
  }, [draftId])

  // Auto-save draft into the same row so typing does not create a new draft each time.
  useEffect(() => {
    if (isSending || (!formData.subject && !formData.message)) return
    if (formData.recipients === "specific" && selectedPeople.length === 0) return
    const timer = setTimeout(() => {
      void handleAutoSave()
    }, 2000)
    return () => clearTimeout(timer)
  }, [formData.subject, formData.message, formData.recipients, selectedPeople.length])

  const loadPeople = useCallback(async (search: string, audience?: string) => {
    const response = await getAdminMailRecipients({ search, audience })
    return response.users || []
  }, [])

  const loadDraft = async (id: string) => {
    try {
      setLoading(true)
      const response = await getMessage(id)
      if (response.success && response.data) {
        const draft = response.data
        setFormData({
          recipients: draft.recipient_type || 'all',
          subject: draft.subject || '',
          message: draft.content || draft.body || '',
          category: draft.category || 'general',
          cc: Array.isArray(draft.cc) ? draft.cc.join(', ') : (draft.cc || ''),
          bcc: Array.isArray(draft.bcc) ? draft.bcc.join(', ') : (draft.bcc || ''),
          is_urgent: draft.is_urgent || false,
        })
        if (draft.recipient_type === 'specific' && draft.recipients) {
          setSelectedPeople(draft.recipients.map((person: any) => ({
            id: person.id || person.recipient_id,
            name: person.name || person.email || "Recipient",
            email: person.email,
            audience: person.audience,
          })))
        }
      }
    } catch (error: any) {
      report("error", error.message || "Failed to load draft")
    } finally {
      setLoading(false)
    }
  }

  const rememberDraft = (id?: string) => {
    if (!id) return
    draftIdRef.current = id
  }

  const handleAutoSave = async () => {
    if (sendingRef.current || saveLock.current) return
    if (!formData.subject && !formData.message) return
    if (formData.recipients === "specific" && selectedPeople.length === 0) return
    
    saveLock.current = true
    try {
      setIsSaving(true)
      const response = await composeMessage({
        ...formData,
        recipient_ids: formData.recipients === 'specific' ? selectedPeople.map((person) => person.id) : undefined,
        save_as_draft: true,
        draft_id: draftIdRef.current || undefined,
        attachments: [],
      })
      rememberDraft(response.data?.id)
    } catch {
      // Keep typing uninterrupted. Send and Save Draft still report errors.
    } finally {
      saveLock.current = false
      setIsSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    if (!formData.subject && !formData.message) {
      report("error", "Enter a subject or a message before sending.")
      return
    }

    if (formData.recipients === 'specific' && selectedPeople.length === 0) {
      report("error", "Select at least one admin, manager, or member.")
      return
    }

    try {
      sendingRef.current = true
      setIsSending(true)
      setNotice(null)
      const response = await composeMessage({
        ...formData,
        recipient_ids: formData.recipients === 'specific' ? selectedPeople.map((person) => person.id) : undefined,
        attachments: attachments,
        save_as_draft: false,
        draft_id: draftIdRef.current || undefined,
      })

      const text = response.message || "Email sent."
      toast.success(text)
      router.push("/admin/mail-service/sent")
    } catch (error: any) {
      report("error", error.message || "Failed to send the email.")
    } finally {
      sendingRef.current = false
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!formData.subject && !formData.message) {
      report("error", "Enter a subject or a message before saving a draft.")
      return
    }
    if (formData.recipients === "specific" && selectedPeople.length === 0) {
      report("error", "Select at least one person before saving a draft.")
      return
    }

    try {
      setIsSaving(true)
      const response = await composeMessage({
        ...formData,
        recipient_ids: formData.recipients === 'specific' ? selectedPeople.map((person) => person.id) : undefined,
        attachments: attachments,
        save_as_draft: true,
        draft_id: draftIdRef.current || undefined,
      })
      rememberDraft(response.data?.id)
      report("success", response.message || "Draft saved.")
    } catch (error: any) {
      report("error", error.message || "Failed to save the draft.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading draft...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/mail-service">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Send email</h1>
          <p className="text-muted-foreground mt-1">Choose admins, managers, members, or specific people</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <RecipientPicker
            audience={formData.recipients}
            onAudienceChange={(value) => {
              setFormData({ ...formData, recipients: value })
              if (value !== "specific") setSelectedPeople([])
            }}
            selected={selectedPeople}
            onSelectedChange={setSelectedPeople}
            loadPeople={loadPeople}
          />

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="contribution">Contribution</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
                <SelectItem value="property">Property</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCcBcc(!showCcBcc)}>
              {showCcBcc ? "Hide" : "Show"} CC/BCC
            </Button>
            {isSaving && <span className="text-sm text-muted-foreground">Saving draft...</span>}
          </div>

          {showCcBcc && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cc">CC (comma-separated emails)</Label>
                <Input
                  id="cc"
                  placeholder="email1@example.com, email2@example.com"
                  value={formData.cc}
                  onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bcc">BCC (comma-separated emails)</Label>
                <Input
                  id="bcc"
                  placeholder="email1@example.com, email2@example.com"
                  value={formData.bcc}
                  onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <div className="border rounded-lg">
              <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
                <Button type="button" variant="ghost" size="sm" title="Bold">
                  <strong>B</strong>
                </Button>
                <Button type="button" variant="ghost" size="sm" title="Italic">
                  <em>I</em>
                </Button>
                <Button type="button" variant="ghost" size="sm" title="Underline">
                  <u>U</u>
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button type="button" variant="ghost" size="sm" title="Bullet List">
                  •
                </Button>
                <Button type="button" variant="ghost" size="sm" title="Numbered List">
                  1.
                </Button>
              </div>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                rows={12}
                className="border-0 focus-visible:ring-0"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileChange} />
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
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="urgent" 
              checked={formData.is_urgent}
              onCheckedChange={(checked) => setFormData({ ...formData, is_urgent: !!checked })}
            />
            <label
              htmlFor="urgent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as urgent
            </label>
          </div>

          {notice && (
            <div
              role="status"
              className={`rounded-md border px-3 py-2 text-sm ${
                notice.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {notice.text}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t">
            <Can permission="compose_mail|bulk_mail">
              <Button onClick={handleSend} disabled={isSending || isSaving}>
                <Send className="h-4 w-4 mr-2" />
                {isSending ? "Sending..." : `Send to ${recipientSendLabel(formData.recipients, selectedPeople.length)}`}
              </Button>
            </Can>
            <Can permission="compose_mail">
              <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSending || isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
            </Can>
            <Link href="/admin/mail-service">
              <Button variant="ghost" disabled={isSending || isSaving}>Cancel</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
