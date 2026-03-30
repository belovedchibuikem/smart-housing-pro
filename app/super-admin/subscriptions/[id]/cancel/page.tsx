"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

export default function CancelSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const handleCancel = async () => {
    try {
      setSubmitting(true)
      await apiFetch(`/super-admin/subscriptions/${id}/cancel`, { method: "POST" })
      toast.success("Subscription cancelled")
      router.push(`/super-admin/subscriptions/${id}`)
    } catch (e: any) {
      toast.error(e?.message || "Failed to cancel subscription")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/super-admin/subscriptions/${id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to subscription
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Cancel subscription
          </CardTitle>
          <CardDescription>
            This marks the business subscription as cancelled in the platform. Confirm only if the tenant should no
            longer be billed on this plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button variant="destructive" onClick={handleCancel} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling…
              </>
            ) : (
              "Confirm cancellation"
            )}
          </Button>
          <Button variant="outline" asChild disabled={submitting}>
            <Link href={`/super-admin/subscriptions/${id}`}>Keep subscription</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
