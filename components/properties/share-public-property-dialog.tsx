"use client"

import { useState, type ReactNode } from "react"
import { Copy, Check, Share2 } from "lucide-react"
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
import { propertyDetailPath, type PublicPropertyListing } from "@/lib/api/public-properties"

type Props = {
  property: PublicPropertyListing
  children?: ReactNode
}

export function SharePublicPropertyDialog({ property, children }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const path = propertyDetailPath(property)
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : `https://smarthousing.com.ng${path}`
  const text = `Check out this property on Smart Housing: ${property.name}`

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share property
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this property</DialogTitle>
          <DialogDescription>Post this listing directly to social media in one click.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={url} readOnly />
            <Button type="button" variant="secondary" onClick={copy} aria-label="Copy property link">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noreferrer">
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
