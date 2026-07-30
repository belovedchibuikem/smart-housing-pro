"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { officeAiReview, officeAiSuggest } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeAiAssistPage() {
  const { toast } = useToast()
  const [type, setType] = useState("draft")
  const [notes, setNotes] = useState("")
  const [documentId, setDocumentId] = useState("")
  const [suggestion, setSuggestion] = useState<any>(null)
  const [busy, setBusy] = useState(false)

  const run = async () => {
    try {
      setBusy(true)
      const res = await officeAiSuggest({
        suggestion_type: type,
        office_document_id: documentId || undefined,
        input: { notes, subject: notes.slice(0, 80), text: notes },
      })
      setSuggestion(res.data)
      toast({ title: "Suggestion ready", description: res.message || "Confirm before applying." })
    } catch (e: any) {
      toast({ title: "AI assist failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Assist</h1>
        <p className="text-muted-foreground">
          Draft, summarize, classify, and extract actions. Suggestions always require your confirmation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request suggestion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="h-10 w-full rounded-md border px-3 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="draft">Draft memo</option>
            <option value="summarize">Summarize</option>
            <option value="extract_actions">Extract actions</option>
            <option value="classify">Classify</option>
            <option value="duplicates">Find duplicates</option>
            <option value="route">Recommend route</option>
          </select>
          <Input
            placeholder="Optional document UUID"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
          />
          <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes / text" />
          <Button onClick={run} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate suggestion
          </Button>
        </CardContent>
      </Card>

      {suggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending confirmation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="overflow-auto rounded bg-muted p-3 text-xs">
              {JSON.stringify(suggestion.suggestion, null, 2)}
            </pre>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await officeAiReview(suggestion.id, "accepted")
                  toast({ title: "Suggestion accepted" })
                }}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await officeAiReview(suggestion.id, "rejected")
                  toast({ title: "Suggestion rejected" })
                  setSuggestion(null)
                }}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
