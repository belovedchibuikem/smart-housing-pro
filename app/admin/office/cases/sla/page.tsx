"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getOfficeCaseSlaSettings, updateOfficeCaseSlaSettings } from "@/lib/api/office"
import { ArrowLeft, Loader2 } from "lucide-react"

const TYPE_LABELS: Record<string, string> = {
  letter: "Letter",
  application: "Application",
  complaint: "Complaint",
  stoppage_of_deduction: "Stoppage of Deduction",
  schedule: "Schedule",
  general: "General",
  other: "Other",
  technical: "Technical Issue",
  property: "Housing / Property",
  finance: "Finance / Payment",
  investment: "Investment",
  document: "Document",
  account: "Account / Membership",
  enquiry: "General Enquiry",
}

export default function OfficeCaseSlaSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hours, setHours] = useState<Record<string, number>>({})
  const [defaults, setDefaults] = useState<Record<string, number>>({})

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getOfficeCaseSlaSettings()
        const data = res.data || {}
        setDefaults(data.defaults || {})
        setHours({ ...(data.defaults || {}), ...(data.effective || {}) })
      } catch (e: any) {
        toast({ title: "Failed to load SLA settings", description: e.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await updateOfficeCaseSlaSettings(hours)
      const data = res.data || {}
      setHours({ ...(data.defaults || {}), ...(data.effective || {}) })
      setDefaults(data.defaults || {})
      toast({ title: "SLA settings saved" })
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const keys = Object.keys({ ...defaults, ...hours }).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/office/cases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case SLA settings</h1>
          <p className="text-muted-foreground">
            Response hours by case type. Clock pauses while status is awaiting member.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hours by type</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {keys.map((key) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`sla-${key}`}>{TYPE_LABELS[key] || key}</Label>
              <Input
                id={`sla-${key}`}
                type="number"
                min={1}
                max={720}
                value={hours[key] ?? defaults[key] ?? 48}
                onChange={(e) =>
                  setHours((prev) => ({
                    ...prev,
                    [key]: Math.max(1, Math.min(720, Number(e.target.value) || 1)),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">Default: {defaults[key] ?? "—"}h</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save SLA hours
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/office/reports">View case reports</Link>
        </Button>
      </div>
    </div>
  )
}
