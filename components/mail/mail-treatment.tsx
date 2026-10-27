"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

type RecipientRow = {
  id?: string
  name?: string
  email?: string
  type?: string
  is_treated?: boolean
  treatment_comment?: string | null
  treated_at?: string | null
}

type Viewer = {
  is_recipient?: boolean
  is_sender?: boolean
  is_treated?: boolean
  treatment_comment?: string | null
  treated_at?: string | null
}

export function MailTreatment({
  viewer,
  recipients,
  onTreat,
}: {
  viewer?: Viewer | null
  recipients?: RecipientRow[] | null
  onTreat: (comment: string) => Promise<void>
}) {
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const rows = recipients || []
  const canTreat = Boolean(viewer?.is_recipient) && !viewer?.is_treated

  const submit = async () => {
    const value = comment.trim()
    if (!value) {
      toast.error("Add a comment describing what you did with this email.")
      return
    }
    try {
      setSaving(true)
      await onTreat(value)
      setComment("")
    } catch (error: any) {
      toast.error(error?.message || "Could not mark this email as treated.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Treatment</h2>
          <p className="text-xs text-muted-foreground">
            {canTreat
              ? "Write what you did, then mark this email as treated."
              : "Treatment notes from the people on this email."}
          </p>
        </div>
        {canTreat && (
          <Button type="button" onClick={submit} disabled={saving}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Mark as treated"}
          </Button>
        )}
      </div>

      <div className="space-y-4 p-4">
        {canTreat && (
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What did you do with this email?"
            rows={3}
          />
        )}

        {viewer?.is_treated && (
          <div className="rounded-md border bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="font-medium">You marked this as treated</p>
            {viewer.treatment_comment ? <p className="mt-1">{viewer.treatment_comment}</p> : null}
          </div>
        )}

        {rows.length > 0 && (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.id || row.email || row.name} className="rounded-md border bg-background px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{row.name || row.email || "Recipient"}</span>
                  <span className={row.is_treated ? "text-emerald-700" : "text-muted-foreground"}>
                    {row.is_treated ? "Treated" : "Not treated"}
                  </span>
                </div>
                {row.treatment_comment ? <p className="mt-1 text-muted-foreground">{row.treatment_comment}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
