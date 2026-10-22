"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"

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
    if (!value) return
    try {
      setSaving(true)
      await onTreat(value)
      setComment("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <div>
        <h2 className="text-sm font-semibold">Treatment</h2>
        <p className="text-xs text-muted-foreground">Recipients can mark this email as treated and leave a comment after reading it.</p>
      </div>

      {canTreat && (
        <div className="space-y-2">
          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What did you do with this email?"
            rows={3}
          />
          <Button type="button" onClick={submit} disabled={saving || comment.trim() === ""}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Mark as treated"}
          </Button>
        </div>
      )}

      {viewer?.is_treated && (
        <div className="rounded-md border bg-background p-3 text-sm">
          <p className="font-medium">You marked this as treated</p>
          {viewer.treatment_comment ? <p className="mt-1 text-muted-foreground">{viewer.treatment_comment}</p> : null}
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
  )
}
