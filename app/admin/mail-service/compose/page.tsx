"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, Paperclip } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminComposeMailPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    recipients: "all",
    subject: "",
    message: "",
    category: "general",
    cc: "",
    bcc: "",
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleAutoSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      console.log("Draft auto-saved")
      setIsSaving(false)
    }, 1000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSend = () => {
    // Handle send logic
    router.push("/admin/mail-service")
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
          <h1 className="text-3xl font-bold">Send Announcement</h1>
          <p className="text-muted-foreground mt-1">Send messages to members</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients</Label>
            <Select
              value={formData.recipients}
              onValueChange={(value) => setFormData({ ...formData, recipients: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="active">Active Members Only</SelectItem>
                <SelectItem value="specific">Specific Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  placeholder="Carbon copy recipients"
                  value={formData.cc}
                  onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bcc">BCC</Label>
                <Input
                  id="bcc"
                  placeholder="Blind carbon copy recipients"
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
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value })
                  handleAutoSave()
                }}
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
            <Checkbox id="urgent" />
            <label
              htmlFor="urgent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as urgent
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Send to {formData.recipients === "all" ? "All Members" : "Selected Recipients"}
            </Button>
            <Link href="/admin/mail-service">
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
