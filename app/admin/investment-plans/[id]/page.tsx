"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Pencil } from "lucide-react"
import { getInvestmentPlan } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function InvestmentPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [plan, setPlan] = useState<Record<string, unknown> | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let c = false
		;(async () => {
			try {
				setLoading(true)
				const res = await getInvestmentPlan(id)
				if (!c && res.success && res.data) setPlan(res.data as Record<string, unknown>)
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Error"
				if (!c) {
					sonnerToast.error("Failed to load plan", { description: msg })
					router.push("/admin/investment-plans")
				}
			} finally {
				if (!c) setLoading(false)
			}
		})()
		return () => {
			c = true
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

	if (!plan) {
		return (
			<div className="max-w-3xl mx-auto">
				<p className="text-muted-foreground">Plan not found.</p>
				<Button variant="link" asChild>
					<Link href="/admin/investment-plans">Back</Link>
				</Button>
			</div>
		)
	}

	const cur = (n: unknown) =>
		new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(n) || 0)
	const name = String(plan.name ?? "")
	const risk = String(plan.risk_level ?? "")
	const active = plan.is_active !== false

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link href="/admin/investment-plans">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div className="flex-1">
					<h1 className="text-3xl font-bold">{name}</h1>
					<p className="text-muted-foreground text-sm capitalize">{risk} risk</p>
				</div>
				<Button asChild>
					<Link href={`/admin/investment-plans/${id}/edit`}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Investment plan</CardTitle>
					<CardDescription>Returns and duration</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap gap-2">
						<Badge variant={active ? "default" : "secondary"}>{active ? "Active" : "Inactive"}</Badge>
						<Badge variant="outline">{formatReturnType(plan.return_type)}</Badge>
					</div>
					{plan.description ? (
						<p className="text-sm text-muted-foreground whitespace-pre-wrap">{String(plan.description)}</p>
					) : null}
					<div className="grid sm:grid-cols-2 gap-4 text-sm">
						<div>
							<p className="text-muted-foreground">Amount range</p>
							<p className="font-medium">
								{cur(plan.min_amount)} – {cur(plan.max_amount)}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground">Expected return</p>
							<p className="font-medium">{String(plan.expected_return_rate ?? 0)}%</p>
						</div>
						<div>
							<p className="text-muted-foreground">Duration (months)</p>
							<p className="font-medium">
								{String(plan.min_duration_months)} – {String(plan.max_duration_months)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function formatReturnType(v: unknown) {
	return String(v ?? "").replace(/_/g, " ")
}
