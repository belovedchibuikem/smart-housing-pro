"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

interface Loan {
  id: string
  amount: number
  status?: string
  member?: { user?: { first_name?: string; last_name?: string; email?: string } }
}

interface ProductDetail {
  id: string
  name: string
  description?: string
  min_amount: number
  max_amount: number
  interest_rate: number
  min_tenure_months: number
  max_tenure_months: number
  interest_type: string
  is_active: boolean
  processing_fee_percentage?: number | null
  late_payment_fee?: number | null
  total_loans?: number
  total_applicants?: number
  loans?: Loan[]
  created_at: string
}

export default function LoanProductDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params?.id
    if (!id) return
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiFetch<{ success: boolean; data: ProductDetail }>(`/admin/loan-products/${id}`)
        if (res.success && res.data) setProduct(res.data)
      } catch (e: any) {
        sonnerToast.error(e?.message || "Failed to load product")
        router.push("/admin/loan-products")
      } finally {
        setLoading(false)
      }
    })()
  }, [params?.id, router])

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">Product not found.</CardContent>
      </Card>
    )
  }

  const loans = product.loans ?? []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/loan-products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground mt-1">Loan product details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/loan-products/${product.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Terms</CardTitle>
          <CardDescription>Financial configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge variant={product.is_active ? "default" : "secondary"}>
              {product.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {product.interest_type} interest
            </Badge>
          </div>
          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Amount range</p>
              <p className="font-semibold">
                {formatCurrency(product.min_amount)} – {formatCurrency(product.max_amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Interest</p>
              <p className="font-semibold">{product.interest_rate}% p.a.</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tenure</p>
              <p className="font-semibold">
                {product.min_tenure_months}–{product.max_tenure_months} months
              </p>
            </div>
            {product.processing_fee_percentage != null && (
              <div>
                <p className="text-muted-foreground">Processing fee</p>
                <p className="font-semibold">{product.processing_fee_percentage}%</p>
              </div>
            )}
            {product.late_payment_fee != null && Number(product.late_payment_fee) > 0 && (
              <div>
                <p className="text-muted-foreground">Late payment fee</p>
                <p className="font-semibold">{formatCurrency(product.late_payment_fee)}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Total disbursed</p>
              <p className="font-semibold">{formatCurrency(product.total_loans ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Applicants</p>
              <p className="font-semibold">{product.total_applicants ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loans on this product</CardTitle>
          <CardDescription>{loans.length} record(s) loaded</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No loans yet.</p>
          ) : (
            loans.slice(0, 50).map((loan) => (
              <div
                key={loan.id}
                className="flex flex-wrap sm:items-center justify-between gap-2 border rounded-lg p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {loan.member?.user
                      ? `${loan.member.user.first_name ?? ""} ${loan.member.user.last_name ?? ""}`.trim()
                      : "Member"}
                  </p>
                  <p className="text-muted-foreground text-xs">{loan.member?.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(Number(loan.amount))}</p>
                  <Badge variant="outline" className="capitalize text-xs">
                    {loan.status ?? "—"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
