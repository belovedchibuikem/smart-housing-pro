"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { fetchListingReviews, submitListingReview, type MarketplaceListing, type MarketplaceReview } from "@/lib/api/marketplace"

type Review = MarketplaceReview

export function ListingReviews({ listing }: { listing: MarketplaceListing }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ rating: 5, body: "", author_name: "" })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    fetchListingReviews(listing.tenant_slug, listing.listing_kind, listing.id)
      .then(setReviews)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [listing.tenant_slug, listing.listing_kind, listing.id])

  const submit = async () => {
    setSubmitting(true)
    const res = await submitListingReview(listing.tenant_slug, listing.listing_kind, listing.id, form)
    setSubmitting(false)
    if (res.ok) {
      setForm({ rating: 5, body: "", author_name: "" })
      load()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-sm mt-1">{r.body}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.author_name || "Verified visitor"}
                  {r.created_at ? ` · ${new Date(r.created_at).toLocaleDateString()}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="rounded-lg border p-4 space-y-3">
          <Label>Leave a review</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Your name"
              value={form.author_name}
              onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
            />
            <Input
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) || 5 }))}
            />
          </div>
          <Textarea
            placeholder="Share your experience…"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          <Button size="sm" onClick={submit} disabled={submitting}>
            {submitting ? "Posting…" : "Post review"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
