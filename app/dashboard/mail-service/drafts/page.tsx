"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Search, ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState([
    {
      id: 1,
      to: "Housing Admin",
      subject: "Question about Property Allocation",
      preview: "I have some questions regarding the property allocation process...",
      lastEdited: "2024-01-15 04:20 PM",
    },
    {
      id: 2,
      to: "Accounts Department",
      subject: "",
      preview: "Dear Accounts Team, I would like to...",
      lastEdited: "2024-01-14 01:30 PM",
    },
    {
      id: 3,
      to: "Loan Department",
      subject: "Loan Extension Request",
      preview: "I am writing to request an extension on my loan repayment...",
      lastEdited: "2024-01-12 10:15 AM",
    },
  ])
  const [searchQuery, setSearchQuery] = useState("")

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

  const handleContinueEditing = (draftId: number) => {
    // In a real app, this would pass the draft data to the compose page
    router.push(`/dashboard/mail-service/compose?draftId=${draftId}`)
  }

  const handleDelete = (draftId: number) => {
    setDrafts(drafts.filter((d) => d.id !== draftId))
  }

  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
                  {/* Recipient */}
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">To: {draft.to}</p>
                    <span className="text-xs text-muted-foreground">• Draft</span>
                  </div>

                  {/* Subject and preview */}
                  <p className="text-sm font-medium mb-0.5">{draft.subject || "(No subject)"}</p>
                  <p className="text-sm text-muted-foreground truncate">{draft.preview}</p>
                </div>

                {/* Last edited time */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(draft.lastEdited)}
                  </span>
                </div>

                {/* Action buttons on hover */}
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
