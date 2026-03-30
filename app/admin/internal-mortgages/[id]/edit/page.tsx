"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getInternalMortgagePlan, updateInternalMortgagePlan } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function EditInternalMortgagePlanPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await getInternalMortgagePlan(id)
        if (res.success && res.data) {
          setTitle(res.data.title ?? "")
          setDescription((res.data.description as string) ?? "")
        }
      } catch (e: any) {
        toast({ title: "Error", description: e?.message || "Failed to load plan", variant: "destructive" })
        router.push("/admin/internal-mortgages")
      } finally {
        setLoading(false)
      }
    })()
  }, [id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" })
      return
    }
    try {
      setSaving(true)
      const res = await updateInternalMortgagePlan(id, { title: title.trim(), description: description || null })
      if (res.success) {
        toast({ title: "Saved", description: res.message })
        router.push(`/admin/internal-mortgages/${id}`)
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Update failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/admin/internal-mortgages/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit internal mortgage</h1>
        <p className="text-muted-foreground mt-1">
          Update the title and description. Principal, rate, and schedule are fixed after approval.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Plan label</CardTitle>
            <CardDescription>Shown in lists and on the detail page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
