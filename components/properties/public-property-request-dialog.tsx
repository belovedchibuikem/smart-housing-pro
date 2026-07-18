"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { PublicPropertyListing } from "@/lib/api/public-properties"
import { useWhiteLabel } from "@/lib/context/white-label-context"
import { useTenantSettings } from "@/lib/context/tenant-settings-context"

type RequestMode = "inquiry" | "inspection"

type Props = {
  property: PublicPropertyListing
  mode?: RequestMode
  triggerLabel?: string
  triggerVariant?: "default" | "outline" | "secondary" | "ghost"
}

type FormState = {
  fullName: string
  email: string
  phone: string
  preferredDate: string
  message: string
}

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  preferredDate: "",
  message: "",
}

export function PublicPropertyRequestDialog({
  property,
  mode = "inquiry",
  triggerLabel,
  triggerVariant = "default",
}: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)
  const { settings } = useWhiteLabel()
  const { settings: tenantSettings } = useTenantSettings()

  const supportEmail =
    settings?.support_email || tenantSettings?.support_email || tenantSettings?.site_email || "support@smarthousing.com.ng"
  const title = mode === "inspection" ? "Book inspection" : "Send inquiry"
  const actionLabel = triggerLabel || title
  const idPrefix = mode === "inspection" ? "inspection-request" : "inquiry-request"

  const defaultMessage = useMemo(
    () =>
      mode === "inspection"
        ? `I want to schedule an inspection for "${property.name}".`
        : `I am interested in "${property.name}" and would like more details.`,
    [mode, property.name]
  )

  const submitRequest = () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Name and email are required.")
      return
    }

    const lines = [
      `Request type: ${mode === "inspection" ? "Inspection booking" : "General inquiry"}`,
      `Property: ${property.name}`,
      `Property ID: ${property.id}`,
      `Listing kind: ${property.listing_kind}`,
      `Location: ${property.location}`,
      `Requester name: ${form.fullName}`,
      `Requester email: ${form.email}`,
      `Requester phone: ${form.phone || "Not provided"}`,
      mode === "inspection" ? `Preferred inspection date: ${form.preferredDate || "Flexible"}` : null,
      "",
      form.message.trim() || defaultMessage,
    ].filter(Boolean)

    const subject = `${mode === "inspection" ? "Inspection Request" : "Property Inquiry"} - ${property.name}`
    const body = lines.join("\n")
    const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto

    toast.success("Your email app has been opened to send the request.")
    setOpen(false)
    setForm(initialForm)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className="w-full">
          {actionLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fill your details and we will open your email app with a ready request to the tenant support team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-full-name`}>Full name</Label>
              <Input
                id={`${idPrefix}-full-name`}
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-email`}>Email</Label>
              <Input
                id={`${idPrefix}-email`}
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-phone`}>Phone</Label>
              <Input
                id={`${idPrefix}-phone`}
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+234..."
              />
            </div>
            {mode === "inspection" && (
              <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-date`}>Preferred date</Label>
                <Input
                  id={`${idPrefix}-date`}
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, preferredDate: e.target.value }))}
                />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-message`}>Message</Label>
            <Textarea
              id={`${idPrefix}-message`}
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder={defaultMessage}
            />
          </div>
          <Button type="button" className="w-full" onClick={submitRequest}>
            Continue and send request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
