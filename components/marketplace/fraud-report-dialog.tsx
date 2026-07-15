"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle } from "lucide-react"
import { fraudReportSchema } from "@/lib/schemas/marketplace"
import { submitFraudReport, type MarketplaceListing } from "@/lib/api/marketplace"

export function FraudReportDialog({ listing }: { listing: MarketplaceListing }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ reason: "suspicious_listing", details: "", reporter_email: "" })

  const submit = async () => {
    const parsed = fraudReportSchema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input")
      return
    }
    setLoading(true)
    setError(null)
    const res = await submitFraudReport(listing.tenant_slug, listing.listing_kind, listing.id, parsed.data)
    setLoading(false)
    if (res.ok) {
      setDone(true)
    } else {
      setError(res.message || "Could not submit report")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-destructive border-destructive/30">
          <AlertTriangle className="h-4 w-4" />
          Report listing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report suspicious listing</DialogTitle>
          <DialogDescription>
            Help keep SmartHousing trustworthy. Reports are reviewed by our trust team.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <p className="text-sm text-muted-foreground">Thank you. Your report was received.</p>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                rows={4}
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Your email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={form.reporter_email}
                onChange={(e) => setForm((f) => ({ ...f, reporter_email: e.target.value }))}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
        <DialogFooter>
          {!done && (
            <Button onClick={submit} disabled={loading}>
              {loading ? "Sending…" : "Submit report"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
