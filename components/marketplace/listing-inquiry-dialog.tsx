"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitMarketplaceInquiry, submitMarketplaceViewing, type MarketplaceListing } from "@/lib/api/marketplace"
import { MessageSquare, Calendar } from "lucide-react"

type Props = {
  listing: MarketplaceListing
  triggerLabel?: string
  mode?: "inquiry" | "viewing"
}

export function ListingInquiryDialog({ listing, triggerLabel, mode = "inquiry" }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    preferred_at: "",
  })

  const isViewing = mode === "viewing"
  const isRental = listing.listing_type === "rental" || listing.is_rental

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: form.message || undefined,
        lead_type: isRental ? "rental_application" : "inquiry",
      }
      const result = isViewing
        ? await submitMarketplaceViewing(listing.tenant_slug, listing.listing_kind, listing.id, {
            ...payload,
            preferred_at: form.preferred_at || undefined,
            notes: form.message,
          })
        : await submitMarketplaceInquiry(listing.tenant_slug, listing.listing_kind, listing.id, payload)

      if (!result.ok) {
        setError(result.message || "Could not submit. Please try again.")
        return
      }
      setSuccess(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSuccess(false); setError(null) } }}>
      <DialogTrigger asChild>
        <Button variant={isViewing ? "outline" : "default"} className="w-full gap-2">
          {isViewing ? <Calendar className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          {triggerLabel || (isViewing ? "Schedule viewing" : isRental ? "Apply to rent" : "Send inquiry")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isViewing ? "Schedule a viewing" : isRental ? "Rental application" : "Contact about this listing"}</DialogTitle>
          <DialogDescription>
            {listing.agent_name
              ? `Your message will be routed to ${listing.agent_name}.`
              : `We'll forward your inquiry to ${listing.tenant_name}.`}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <p className="font-medium text-green-700">Submitted successfully!</p>
            <p className="text-sm text-muted-foreground">The vendor or agent will contact you shortly.</p>
            <Button onClick={() => setOpen(false)} className="mt-4">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inq-name">Full name</Label>
              <Input id="inq-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inq-email">Email</Label>
              <Input id="inq-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inq-phone">Phone</Label>
              <Input id="inq-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            {isViewing && (
              <div className="space-y-2">
                <Label htmlFor="inq-when">Preferred date & time</Label>
                <Input
                  id="inq-when"
                  type="datetime-local"
                  value={form.preferred_at}
                  onChange={(e) => setForm({ ...form, preferred_at: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="inq-msg">Message</Label>
              <Textarea
                id="inq-msg"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={isRental ? "Tell us about your move-in timeline…" : "I'm interested in this property…"}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? "Sending…" : "Submit"}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
