"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Search, ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getMemberDraftMessages, deleteMail, MailMessage } from "@/lib/api/client"
import { toast } from "sonner"

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<MailMessage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const loadDrafts = async () => {
    try {
      setLoading(true)
      const response = await getMemberDraftMessages({
        search: searchQuery || undefined,
      })
      if (response.success) {
        setDrafts(response.messages)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load drafts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDrafts()
  }, [searchQuery])

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60))
      return `${minutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const handleContinueEditing = (draftId: string) => {
    router.push(`/dashboard/mail-service/compose?draftId=${draftId}`)
  }

  const handleDelete = async (draftId: string) => {
    try {
      await deleteMail(draftId)
      toast.success("Draft deleted successfully")
      await loadDrafts()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete draft")
    }
  }

  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Drafts</h1>
          <p className="text-muted-foreground mt-1">{drafts.length} draft messages</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drafts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredDrafts.length > 0 ? (
          <div className="space-y-1">
            {filteredDrafts.map((draft) => (
              <div
                key={draft.id}
                className="group relative flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm hover:bg-accent/50 cursor-pointer"
                onClick={() => handleContinueEditing(draft.id)}
              >
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">
                      To: {draft.to || draft.recipient?.name || "No recipient"}
                    </p>
                    <span className="text-xs text-muted-foreground">• Draft</span>
                  </div>

                  <p className="text-sm font-medium mb-0.5">{draft.subject || "(No subject)"}</p>
                  <p className="text-sm text-muted-foreground truncate">{draft.preview}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(draft.updated_at)}
                  </span>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleContinueEditing(draft.id)
                    }}
                    title="Continue editing"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(draft.id)
                    }}
                    title="Delete draft"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{searchQuery ? "No drafts found" : "No drafts saved"}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
