"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminDraftsPage() {
  // Mock data - replace with actual data fetching
  const drafts = [
    {
      id: "1",
      to: "Loan Applicants",
      subject: "Loan Application Update",
      preview: "We are writing to inform you about the status of your...",
      lastEdited: "2024-01-12",
      time: "03:15 PM",
    },
    {
      id: "2",
      to: "Property Investors",
      subject: "Investment Opportunity",
      preview: "A new investment opportunity is now available...",
      lastEdited: "2024-01-11",
      time: "05:30 PM",
    },
    {
      id: "3",
      to: "",
      subject: "",
      preview: "Draft started but not completed...",
      lastEdited: "2024-01-10",
      time: "02:00 PM",
    },
  ]

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([])

  const handleBulkDelete = () => {
    console.log("Deleting drafts:", selectedDrafts)
    setSelectedDrafts([])
  }

  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.to.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Drafts</h1>
        <p className="text-muted-foreground">Manage your unsent messages</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drafts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {selectedDrafts.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {selectedDrafts.length} draft(s)
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Draft Messages ({filteredDrafts.length})</CardTitle>
          <CardDescription>Continue editing or send your draft messages</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No draft messages</p>
              <Button asChild>
                <Link href="/admin/mail-service/compose">
                  <Edit className="h-4 w-4 mr-2" />
                  Compose New Message
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className={`p-4 rounded-lg border transition-colors hover:bg-accent ${
                    selectedDrafts.includes(draft.id) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedDrafts.includes(draft.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDrafts([...selectedDrafts, draft.id])
                        } else {
                          setSelectedDrafts(selectedDrafts.filter((id) => id !== draft.id))
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {draft.to ? (
                          <span className="font-semibold">To: {draft.to}</span>
                        ) : (
                          <span className="text-muted-foreground italic">No recipient</span>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Draft
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {draft.subject || <span className="text-muted-foreground italic">No subject</span>}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{draft.preview}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {draft.lastEdited} {draft.time}
                      </span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="default" asChild>
                          <Link href={`/admin/mail-service/compose?draft=${draft.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            // Handle delete
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
