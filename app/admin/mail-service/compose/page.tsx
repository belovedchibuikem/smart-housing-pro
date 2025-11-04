"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
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
import { composeMessage, getMessage, getUsers } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export default function AdminComposeMailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const draftId = searchParams.get('draft')
  
  const [formData, setFormData] = useState({
    recipients: "all",
    subject: "",
    message: "",
    category: "general",
    cc: "",
    bcc: "",
    is_urgent: false,
  })
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [memberSearch, setMemberSearch] = useState("")
  const [showMemberSelector, setShowMemberSelector] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [loading, setLoading] = useState(!!draftId)

  // Load draft if editing
  useEffect(() => {
    if (draftId) {
      loadDraft(draftId)
    }
  }, [draftId])

  // Auto-save draft
  useEffect(() => {
    if (!draftId && (formData.subject || formData.message)) {
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [formData.subject, formData.message, formData.recipients])

  // Load members when specific is selected
  useEffect(() => {
    if (formData.recipients === 'specific' && memberSearch.length >= 2) {
      loadMembers()
    }
  }, [memberSearch, formData.recipients])

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
          setSelectedMemberIds(draft.recipients.map((r: any) => r.id || r.recipient_id))
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load draft",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = useCallback(async () => {
    try {
      setLoadingMembers(true)
      const response = await getUsers({
        search: memberSearch,
        status: 'active',
        per_page: 20,
      })
      if (response.success) {
        setMembers(response.data || [])
      }
    } catch (error: any) {
      console.error('Failed to load members:', error)
    } finally {
      setLoadingMembers(false)
    }
  }, [memberSearch])

  const handleAutoSave = async () => {
    if (!formData.subject && !formData.message) return
    
    try {
      setIsSaving(true)
      await composeMessage({
        ...formData,
        recipient_ids: formData.recipients === 'specific' ? selectedMemberIds : undefined,
        save_as_draft: true,
        attachments: [],
      })
      // Don't show toast for auto-save to avoid spam
    } catch (error) {
      // Silently fail auto-save
    } finally {
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
      toast({
        title: "Error",
        description: "Please enter a subject or message",
        variant: "destructive",
      })
      return
    }

    if (formData.recipients === 'specific' && selectedMemberIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one member",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      const response = await composeMessage({
        ...formData,
        recipient_ids: formData.recipients === 'specific' ? selectedMemberIds : undefined,
        attachments: attachments,
        save_as_draft: false,
      })
      
      toast({
        title: "Success",
        description: response.message || "Message sent successfully",
      })
      
      router.push("/admin/mail-service/sent")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true)
      const response = await composeMessage({
        ...formData,
        recipient_ids: formData.recipients === 'specific' ? selectedMemberIds : undefined,
        attachments: attachments,
        save_as_draft: true,
      })
      
      toast({
        title: "Success",
        description: response.message || "Draft saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save draft",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addMember = (member: any) => {
    if (!selectedMemberIds.includes(member.id)) {
      setSelectedMemberIds([...selectedMemberIds, member.id])
    }
    setMemberSearch("")
    setShowMemberSelector(false)
  }

  const removeMember = (memberId: string) => {
    setSelectedMemberIds(selectedMemberIds.filter(id => id !== memberId))
  }

  const getSelectedMemberName = (id: string) => {
    const member = members.find(m => m.id === id)
    return member ? `${member.first_name} ${member.last_name}` : id
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
              onValueChange={(value) => {
                setFormData({ ...formData, recipients: value })
                if (value !== 'specific') {
                  setSelectedMemberIds([])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="active">Active Members Only</SelectItem>
                <SelectItem value="specific">Specific Member(s)</SelectItem>
              </SelectContent>
            </Select>
            
            {formData.recipients === 'specific' && (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Search members by name or email..."
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value)
                      if (e.target.value.length >= 2) {
                        setShowMemberSelector(true)
                      } else {
                        setShowMemberSelector(false)
                      }
                    }}
                    onFocus={() => {
                      if (memberSearch.length >= 2) {
                        setShowMemberSelector(true)
                      }
                    }}
                  />
                  {showMemberSelector && memberSearch.length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {loadingMembers ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                      ) : members.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No members found</div>
                      ) : (
                        members.map((member) => (
                          <div
                            key={member.id}
                            className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                            onClick={() => addMember(member)}
                          >
                            <div className="font-medium">{member.first_name} {member.last_name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                {selectedMemberIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedMemberIds.map((id) => (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {getSelectedMemberName(id)}
                        <button
                          type="button"
                          onClick={() => removeMember(id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
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

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={handleSend} disabled={isSending || isSaving}>
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Sending...' : `Send to ${formData.recipients === "all" ? "All Members" : formData.recipients === "active" ? "Active Members" : "Selected Recipients"}`}
            </Button>
            <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSending || isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Link href="/admin/mail-service">
              <Button variant="ghost" disabled={isSending || isSaving}>Cancel</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
