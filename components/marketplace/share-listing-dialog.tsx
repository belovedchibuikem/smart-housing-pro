"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Share2, Copy, Check } from "lucide-react"
import type { MarketplaceListing } from "@/lib/api/marketplace"
import { marketplaceListingPath } from "@/lib/api/marketplace"

export function ShareListingDialog({ listing }: { listing: MarketplaceListing }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const path = marketplaceListingPath(listing)
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${path}`
      : `https://smarthousing.com.ng${path}`
  const text = `Check out this verified ${listing.listing_kind === "house" ? "house" : "land"} on Smart Housing: ${listing.name}`

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this listing</DialogTitle>
          <DialogDescription>Promote verified properties on other platforms with confidence.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={url} readOnly />
            <Button type="button" variant="secondary" onClick={copy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noreferrer"
              >
                X / Twitter
              </a>
            </Button>
            <Button asChild variant="outline">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
