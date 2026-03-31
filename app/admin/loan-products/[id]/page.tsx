"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Pencil } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

interface LoanProductDetail {
	id: string
	name: string
	description?: string | null
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
}

export default function LoanProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [product, setProduct] = useState<LoanProductDetail | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				setLoading(true)
				const res = await apiFetch<{ success: boolean; data: LoanProductDetail }>(`/admin/loan-products/${id}`)
				if (!cancelled && res.success && res.data) setProduct(res.data)
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Error"
				if (!cancelled) {
					sonnerToast.error("Failed to load product", { description: msg })
					router.push("/admin/loan-products")
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [id, router])

	if (loading) {
		return (
			<div className="max-w-3xl mx-auto space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		)
	}

	if (!product) {
		return (
			<div className="max-w-3xl mx-auto">
				<p className="text-muted-foreground">Product not found.</p>
				<Button variant="link" asChild>
					<Link href="/admin/loan-products">Back</Link>
				</Button>
			</div>
		)
	}

	const currency = (n: number) =>
		new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n)

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link href="/admin/loan-products">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div className="flex-1">
					<h1 className="text-3xl font-bold">{product.name}</h1>
					<p className="text-muted-foreground text-sm">{product.interest_type} interest</p>
				</div>
				<Button asChild>
					<Link href={`/admin/loan-products/${id}/edit`}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Loan product</CardTitle>
					<CardDescription>Terms and usage</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Badge variant={product.is_active ? "default" : "secondary"}>
						{product.is_active ? "Active" : "Inactive"}
					</Badge>
					{product.description ? (
						<p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
					) : null}
					<div className="grid sm:grid-cols-2 gap-4 text-sm">
						<div>
							<p className="text-muted-foreground">Amount range</p>
							<p className="font-medium">
								{currency(product.min_amount)} – {currency(product.max_amount)}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground">Interest rate</p>
							<p className="font-medium">{product.interest_rate}%</p>
						</div>
						<div>
							<p className="text-muted-foreground">Tenure (months)</p>
							<p className="font-medium">
								{product.min_tenure_months} – {product.max_tenure_months}
							</p>
						</div>
						{product.total_loans != null && (
							<div>
								<p className="text-muted-foreground">Total disbursed</p>
								<p className="font-medium">{currency(product.total_loans)}</p>
							</div>
						)}
						{product.total_applicants != null && (
							<div>
								<p className="text-muted-foreground">Applicants</p>
								<p className="font-medium">{product.total_applicants}</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
