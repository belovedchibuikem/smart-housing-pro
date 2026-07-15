"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImageIcon, Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { resolveStorageUrl } from "@/lib/api/config"
import { PropertyLocationPicker } from "@/components/admin/property-location-picker"
import type { GeoCoordinates } from "@/lib/geo/coordinates"

function splitToArray(raw: string): string[] {
  return raw
    .split(/[|,]/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function NewLandPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<Array<{ url: string; preview?: string; name?: string }>>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [form, setForm] = useState({
    land_title: "",
    land_description: "",
    land_size: "",
    cost: "",
    suitable_for: "",
    infrastructure_plan: "",
    land_features: "",
    title_documents: "",
    location: "",
    address: "",
    city: "",
    state: "",
    status: "available",
    total_slots: "",
    cost_includes_infrastructure: false,
  })
  const [coordinates, setCoordinates] = useState<GeoCoordinates>(null)

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview) URL.revokeObjectURL(image.preview)
      })
    }
  }, [images])

  const handleFilesUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploadError(null)
    setUploadingImages(true)

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Unsupported file type. Please upload image files only.")
        continue
      }
      const previewUrl = URL.createObjectURL(file)
      try {
        const payload = new FormData()
        payload.append("image", file)
        const res = await apiFetch<{ success: boolean; url?: string; message?: string }>(
          "/admin/properties/upload-image",
          { method: "POST", body: payload },
        )
        if (res.success && res.url) {
          setImages((prev) => [...prev, { url: res.url as string, preview: previewUrl, name: file.name }])
        } else {
          URL.revokeObjectURL(previewUrl)
          setUploadError(res.message || "Failed to upload image.")
        }
      } catch (err: unknown) {
        URL.revokeObjectURL(previewUrl)
        setUploadError(err instanceof Error ? err.message : "Failed to upload image.")
      }
    }

    setUploadingImages(false)
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev]
      const [removed] = next.splice(index, 1)
      if (removed?.preview) URL.revokeObjectURL(removed.preview)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.land_title.trim() || !form.cost.trim()) {
      toast({
        title: "Validation",
        description: "Land title and land cost are required.",
        variant: "destructive",
      })
      return
    }

    const costNum = Number(form.cost)
    if (!Number.isFinite(costNum) || costNum < 0) {
      toast({ title: "Validation", description: "Cost must be a valid number.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const body = {
        land_title: form.land_title.trim(),
        land_description: form.land_description.trim() || null,
        land_size: form.land_size.trim() || null,
        cost: costNum,
        suitable_for: form.suitable_for.trim() || null,
        infrastructure_plan: splitToArray(form.infrastructure_plan),
        land_features: splitToArray(form.land_features),
        title_documents: splitToArray(form.title_documents),
        location: form.location.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        status: form.status || "available",
        total_slots:
          form.total_slots.trim() === ""
            ? null
            : Number.isFinite(Number(form.total_slots))
              ? parseInt(form.total_slots, 10)
              : null,
        cost_includes_infrastructure: form.cost_includes_infrastructure,
        images: images.map((image) => image.url),
        ...(coordinates ? { coordinates } : {}),
      }

      const res = await apiFetch<{ success: boolean; data?: { land_code?: string }; message?: string }>(
        "/admin/lands",
        { method: "POST", body },
      )

      if (res.success) {
        toast({
          title: "Land created",
          description: res.data?.land_code ? `Land ID: ${res.data.land_code}` : "Saved successfully.",
        })
        router.push("/admin/lands")
      }
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not save land parcel",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link href="/admin/lands" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to land list
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Upload land parcel</h1>
        <p className="text-muted-foreground mt-1">
          A unique Land ID (e.g. <span className="font-mono">LND-2026-00001</span>) is generated automatically after save.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Core details</CardTitle>
            <CardDescription>Required fields capture the parcel for listings and allocations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="land_title">Land title *</Label>
              <Input
                id="land_title"
                value={form.land_title}
                onChange={(e) => setForm((s) => ({ ...s, land_title: e.target.value }))}
                placeholder="e.g. Orozo Land"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="land_description">Description</Label>
              <Textarea
                id="land_description"
                rows={4}
                value={form.land_description}
                onChange={(e) => setForm((s) => ({ ...s, land_description: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="land_size">Land size</Label>
                <Input
                  id="land_size"
                  value={form.land_size}
                  onChange={(e) => setForm((s) => ({ ...s, land_size: e.target.value }))}
                  placeholder="e.g. 2 hectares"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Land cost (NGN) *</Label>
                <Input
                  id="cost"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.cost}
                  onChange={(e) => setForm((s) => ({ ...s, cost: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_slots">Total slots (optional)</Label>
              <Input
                id="total_slots"
                type="number"
                min={1}
                value={form.total_slots}
                onChange={(e) => setForm((s) => ({ ...s, total_slots: e.target.value }))}
                placeholder="Leave empty for unlimited"
              />
              <p className="text-xs text-muted-foreground">
                Each approved allocation/subscription consumes one slot.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((s) => ({ ...s, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <Checkbox
                id="infra_incl"
                checked={form.cost_includes_infrastructure}
                onCheckedChange={(v) =>
                  setForm((s) => ({ ...s, cost_includes_infrastructure: v === true }))
                }
              />
              <Label htmlFor="infra_incl" className="text-sm font-normal leading-snug">
                Cost is inclusive of infrastructure
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="suitable_for">Suitable for</Label>
              <Input
                id="suitable_for"
                value={form.suitable_for}
                onChange={(e) => setForm((s) => ({ ...s, suitable_for: e.target.value }))}
                placeholder="e.g. Two bedroom bungalow"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Land images</CardTitle>
            <CardDescription>Use the same upload flow as house/building listings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/40 p-8 text-center transition hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = "copy"
              }}
              onDrop={(event) => {
                event.preventDefault()
                void handleFilesUpload(event.dataTransfer.files)
              }}
            >
              <Upload className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each. Upload multiple images.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => void handleFilesUpload(event.target.files)}
              />
              {uploadingImages ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 text-xs text-muted-foreground">
                  Uploading images...
                </div>
              ) : null}
            </div>
            {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
            {images.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {images.map((image, index) => (
                  <div key={`${image.url}-${index}`} className="group relative overflow-hidden rounded-lg border">
                    {image.preview || image.url ? (
                      <img
                        src={image.preview || resolveStorageUrl(image.url)}
                        alt={image.name || `Land image ${index + 1}`}
                        className="h-32 w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-muted/40 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t bg-background px-3 py-2 text-xs">
                      <span className="truncate">{image.name || `Image ${index + 1}`}</span>
                      <button
                        type="button"
                        className="rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition group-hover:opacity-100"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plans &amp; documents</CardTitle>
            <CardDescription>Use commas or pipes to separate multiple values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="infrastructure_plan">Infrastructure plan</Label>
              <Textarea
                id="infrastructure_plan"
                rows={2}
                value={form.infrastructure_plan}
                onChange={(e) => setForm((s) => ({ ...s, infrastructure_plan: e.target.value }))}
                placeholder="drainages, roads, water, electricity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="land_features">Land features</Label>
              <Textarea
                id="land_features"
                rows={2}
                value={form.land_features}
                onChange={(e) => setForm((s) => ({ ...s, land_features: e.target.value }))}
                placeholder="green area, fence, schools, ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_documents">Title documents (types)</Label>
              <Input
                id="title_documents"
                value={form.title_documents}
                onChange={(e) => setForm((s) => ({ ...s, title_documents: e.target.value }))}
                placeholder="C of O, Survey Plan"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location">Location label</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" rows={2} value={form.address} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state} onChange={(e) => setForm((s) => ({ ...s, state: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <PropertyLocationPicker value={coordinates} onChange={setCoordinates} />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild disabled={loading}>
            <Link href="/admin/lands">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save land parcel
          </Button>
        </div>
      </form>
    </div>
  )
}
