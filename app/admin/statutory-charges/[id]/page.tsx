"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2 } from "lucide-react"
import { getStatutoryCharge } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function StatutoryChargeDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [charge, setCharge] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params?.id
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await getStatutoryCharge(id)
        if (res.success && res.data) setCharge(res.data)
      } catch (e: any) {
        toast({ title: "Error", description: e?.message || "Failed to load charge", variant: "destructive" })
        router.push("/admin/statutory-charges")
      } finally {
        setLoading(false)
      }
    })()
  }, [params?.id, router, toast])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!charge) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">Charge not found.</CardContent>
      </Card>
    )
  }

  const u = charge.member?.user
  const payments = charge.payments ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/statutory-charges">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Statutory charge</h1>
            <p className="text-muted-foreground mt-1 capitalize">{charge.type}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/statutory-charges/${charge.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Amount and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              {charge.status ?? "—"}
            </Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-semibold text-lg">{format(charge.amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Due date</p>
              <p className="font-semibold">
                {charge.due_date ? new Date(charge.due_date).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
          {charge.description && (
            <div>
              <p className="text-muted-foreground text-sm">Description</p>
              <p className="text-sm">{charge.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {u ? (
            <div className="space-y-1">
              <p className="font-medium">
                {u.first_name} {u.last_name}
              </p>
              <p className="text-muted-foreground">{u.email}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">No member linked</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>{payments.length} record(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">None recorded.</p>
          ) : (
            payments.map((p: any) => (
              <div key={p.id} className="flex justify-between border rounded-md p-2 text-sm">
                <span className="capitalize">{p.status ?? "—"}</span>
                <span className="font-medium">{format(p.amount)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function format(n: unknown) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(
    Number(n) || 0,
  )
}
