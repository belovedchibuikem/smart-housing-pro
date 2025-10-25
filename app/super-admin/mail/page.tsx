"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Mail, FileText, History } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { toast } from "sonner"

interface MailTemplate {
  id: string
  name: string
  subject: string
  content: string
  usage: number
}

interface SentMail {
  id: string
  subject: string
  recipient_type: string
  sent_count: number
  sent_at: string
  status: string
}

interface Business {
  id: string
  name: string
  email: string
}

interface MailData {
  templates: MailTemplate[]
  sent_mails: SentMail[]
  businesses: Business[]
}

export default function SuperAdminMailPage() {
  const [recipientType, setRecipientType] = useState<"all_admins" | "specific_business" | "all_members">("all_admins")
  const [selectedBusiness, setSelectedBusiness] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [templates, setTemplates] = useState<MailTemplate[]>([])
  const [sentMails, setSentMails] = useState<SentMail[]>([])
  const [templatesLoaded, setTemplatesLoaded] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [activeTab, setActiveTab] = useState("compose")
  
  const { isLoading, data, error, loadData } = usePageLoading<MailData>()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<MailData>("/super-admin/mail")
      return response
    })
  }, [loadData])

  const loadTemplates = async () => {
    try {
      const response = await apiFetch<{ templates: MailTemplate[] }>("/super-admin/mail/templates")
      return response.templates
    } catch (e: any) {
      console.error("Failed to load templates:", e.message)
      return []
    }
  }

  const loadHistory = async () => {
    try {
      const response = await apiFetch<{ sent_mails: SentMail[] }>("/super-admin/mail/history")
      return response.sent_mails
    } catch (e: any) {
      console.error("Failed to load history:", e.message)
      return []
    }
  }

  const handleTemplatesTab = async () => {
    if (!templatesLoaded) {
      const templatesData = await loadTemplates()
      setTemplates(templatesData)
      setTemplatesLoaded(true)
    }
  }

  const handleHistoryTab = async () => {
    if (!historyLoaded) {
      const historyData = await loadHistory()
      setSentMails(historyData)
      setHistoryLoaded(true)
    }
  }

  const handleSendMail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    if (recipientType === "specific_business" && !selectedBusiness) {
      toast.error("Please select a business")
      return
    }

    setIsSending(true)
    try {
      await apiFetch("/super-admin/mail/send", {
        method: 'POST',
        body: {
          recipient_type: recipientType,
          business_id: recipientType === "specific_business" ? selectedBusiness : null,
          subject,
          message
        }
      })
      toast.success("Mail sent successfully!")
      setSubject("")
      setMessage("")
      setSelectedBusiness("")
      setTemplateName("")
      // Reload history if it was already loaded
      if (historyLoaded) {
        const historyData = await loadHistory()
        setSentMails(historyData)
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to send mail")
    } finally {
      setIsSending(false)
    }
  }

  const handleUseTemplate = (template: MailTemplate) => {
    setSubject(template.subject)
    setMessage(template.content)
    setActiveTab("compose")
  }

  const handleEditTemplate = (template: MailTemplate) => {
    setSubject(template.subject)
    setMessage(template.content)
    setTemplateName(template.name)
    // Switch to compose tab to show the template content for editing
    setActiveTab("compose")
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill in template name, subject, and message")
      return
    }

    setIsSavingTemplate(true)
    try {
      await apiFetch("/super-admin/mail/save-template", {
        method: 'POST',
        body: {
          name: templateName,
          subject,
          content: message
        }
      })
      toast.success("Template saved successfully!")
      setTemplateName("")
      // Reload templates
      if (templatesLoaded) {
        const templatesData = await loadTemplates()
        setTemplates(templatesData)
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save template")
    } finally {
      setIsSavingTemplate(false)
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  const businesses = data?.businesses || []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mail Service</h1>
        <p className="text-muted-foreground mt-1">Send emails to business admins and members</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value)
        if (value === "templates" && !templatesLoaded) {
          handleTemplatesTab()
        } else if (value === "history" && !historyLoaded) {
          handleHistoryTab()
        }
      }} className="space-y-6">
        <TabsList>
          <TabsTrigger value="compose">
            <Send className="h-4 w-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Recipients</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                >
                  <option value="all_admins">All Business Admins</option>
                  <option value="specific_business">Specific Business</option>
                  <option value="all_members">All Members (All Businesses)</option>
                </select>
              </div>

              {recipientType === "specific_business" && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Select Business</Label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md"
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                  >
                    <option value="">Select a business</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium mb-2 block">Subject</Label>
                <Input 
                  type="text" 
                  className="w-full" 
                  placeholder="Email subject" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Message</Label>
                <Textarea
                  className="w-full"
                  rows={10}
                  placeholder="Compose your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="template_name">Template Name (Optional)</Label>
                  <Input 
                    id="template_name"
                    placeholder="e.g., Welcome Email Template"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleSendMail} disabled={isSending}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? "Sending..." : "Send Email"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSaveTemplate}
                    disabled={isSavingTemplate || !templateName.trim() || !subject.trim() || !message.trim()}
                  >
                    {isSavingTemplate ? "Saving..." : "Save as Template"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid gap-4">
            {templates.length > 0 ? (
              templates.map((template) => (
                <Card key={template.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
                      <p className="text-sm text-muted-foreground mt-2">Used {template.usage} times</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No templates found</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first email template</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-4">
            {sentMails.length > 0 ? (
              sentMails.map((mail) => (
                <Card key={mail.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{mail.subject}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">
                            To: {mail.recipient_type.replace("_", " ")}
                          </span>
                          <span className="text-sm text-muted-foreground">Sent to {mail.sent_count} recipients</span>
                          <span className="text-sm text-muted-foreground">{mail.sent_at}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No email history found</p>
                <p className="text-sm text-muted-foreground mt-1">Send your first email to see history here</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
