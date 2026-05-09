"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Loader2 } from "lucide-react"

import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AppVersionResponse {
  success: boolean
  version: {
    id: number
    platform: "android" | "ios" | "both"
    version_name: string
    version_code: number
    min_required_version: string
    min_required_version_code: number
    is_active: boolean
    is_force_update: boolean
    store_url_android?: string | null
    store_url_ios?: string | null
    release_title?: string | null
    release_notes?: string | null
    force_update_message?: string | null
    optional_update_message?: string | null
    release_date?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
}

export default function AppVersionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState<AppVersionResponse["version"] | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiFetch<AppVersionResponse>(`/super-admin/app-versions/${id}`)
        if (!mounted) return
        setVersion(res.version)
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "Failed to load app version.")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !version) {
    return <div className="p-6 text-red-600">{error ?? "Version not found."}</div>
  }

  const detailRows: Array<{ label: string; value: string }> = [
    { label: "Platform", value: version.platform.toUpperCase() },
    { label: "Version", value: version.version_name },
    { label: "Version Code", value: String(version.version_code) },
    { label: "Minimum Required Version", value: version.min_required_version },
    { label: "Minimum Required Code", value: String(version.min_required_version_code) },
    { label: "Release Date", value: version.release_date ?? "-" },
    { label: "Play Store URL", value: version.store_url_android ?? "-" },
    { label: "App Store URL", value: version.store_url_ios ?? "-" },
    { label: "Release Title", value: version.release_title ?? "-" },
    { label: "Force Message", value: version.force_update_message ?? "-" },
    { label: "Optional Message", value: version.optional_update_message ?? "-" },
    { label: "Created At", value: version.created_at ?? "-" },
    { label: "Updated At", value: version.updated_at ?? "-" },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/super-admin/app-versions">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">App Version #{version.id}</h1>
            <p className="text-muted-foreground">Detailed app update configuration.</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/super-admin/app-versions/${version.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Badge variant={version.is_active ? "default" : "secondary"}>{version.is_active ? "Active" : "Inactive"}</Badge>
        {version.is_force_update ? <Badge variant="destructive">Force Update</Badge> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {detailRows.map((row) => (
              <div key={row.label}>
                <div className="text-xs text-muted-foreground">{row.label}</div>
                <div className="text-sm font-medium break-all">{row.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Release Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{version.release_notes ?? "-"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
