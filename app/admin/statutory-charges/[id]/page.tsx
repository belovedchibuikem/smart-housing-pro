"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Pencil } from "lucide-react"
import { getStatutoryCharge } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function StatutoryChargeDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [charge, setCharge] = useState<Record<string, unknown> | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				setLoading(true)
				const res = await getStatutoryCharge(id)
				if (!cancelled && res.success && res.data) setCharge(res.data as Record<string, unknown>)
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Error"
				if (!cancelled) {
					sonnerToast.error("Failed to load charge", { description: msg })
					router.push("/admin/statutory-charges")
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

	if (!charge) {
		return (
			<div className="max-w-3xl mx-auto">
				<p className="text-muted-foreground">Charge not found.</p>
				<Button variant="link" asChild>
					<Link href="/admin/statutory-charges">Back</Link>
				</Button>
			</div>
		)
	}

	const amount = typeof charge.amount === "number" ? charge.amount : parseFloat(String(charge.amount ?? 0))
	const currency = (n: number) =>
		new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n)

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link href="/admin/statutory-charges">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div className="flex-1">
					<h1 className="text-3xl font-bold">Statutory charge</h1>
					<p className="text-muted-foreground text-sm">{String(charge.type ?? "—")}</p>
				</div>
				<Button asChild>
					<Link href={`/admin/statutory-charges/${id}/edit`}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Details</CardTitle>
					<CardDescription>Member charge record</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Badge variant="outline">{String(charge.status ?? "pending")}</Badge>
					{charge.description ? (
						<p className="text-sm text-muted-foreground whitespace-pre-wrap">{String(charge.description)}</p>
					) : null}
					<div className="grid sm:grid-cols-2 gap-4 text-sm">
						<div>
							<p className="text-muted-foreground">Amount</p>
							<p className="font-medium">{currency(Number.isFinite(amount) ? amount : 0)}</p>
						</div>
						{charge.due_date && (
							<div>
								<p className="text-muted-foreground">Due date</p>
								<p className="font-medium">{String(charge.due_date)}</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
