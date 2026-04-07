"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { toast } from "sonner"
import { submitMembershipWithdrawalRequest } from "@/lib/api/client"
import { useI18n } from "@/lib/i18n/i18n-provider"

export default function WithdrawMembershipPage() {
  const { t } = useI18n()
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await submitMembershipWithdrawalRequest({ notes: notes.trim() || undefined })
      if (res.success) {
        toast.success(t("withdraw.success"), { description: res.message })
        setNotes("")
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">{t("withdraw.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("withdraw.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <CardTitle>{t("withdraw.noticeTitle")}</CardTitle>
              <CardDescription className="text-base mt-2">{t("withdraw.noticeBody")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">{t("withdraw.requirements")}</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
              <li>{t("withdraw.req1")}</li>
              <li>{t("withdraw.req2")}</li>
              <li>{t("withdraw.req3")}</li>
              <li>{t("withdraw.req4")}</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdraw-notes">{t("withdraw.notes")}</Label>
            <Textarea
              id="withdraw-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder=""
              disabled={submitting}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t("withdraw.submitting") : t("withdraw.submit")}
            </Button>
            <Button variant="outline" type="button" asChild disabled={submitting}>
              <Link href="/dashboard/settings">{t("nav.settings")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
