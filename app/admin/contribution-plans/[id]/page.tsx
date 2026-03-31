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

interface ContributionPlanDetail {
	id: string
	name: string
	description?: string | null
	amount: number
	minimum_amount: number
	frequency: string
	is_mandatory: boolean
	is_active: boolean
	total_contributions?: number
	total_members?: number
}

export default function ContributionPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [plan, setPlan] = useState<ContributionPlanDetail | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				setLoading(true)
				const res = await apiFetch<{ success: boolean; data: ContributionPlanDetail }>(
					`/admin/contribution-plans/${id}`,
				)
				if (!cancelled && res.success && res.data) setPlan(res.data)
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Error"
				if (!cancelled) {
					sonnerToast.error("Failed to load plan", { description: msg })
					router.push("/admin/contribution-plans")
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

	if (!plan) {
		return (
			<div className="max-w-3xl mx-auto">
				<p className="text-muted-foreground">Plan not found.</p>
				<Button variant="link" asChild>
					<Link href="/admin/contribution-plans">Back to list</Link>
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
					<Link href="/admin/contribution-plans">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div className="flex-1">
					<h1 className="text-3xl font-bold">{plan.name}</h1>
					<p className="text-muted-foreground text-sm capitalize">{plan.frequency.replace(/_/g, " ")}</p>
				</div>
				<Button asChild>
					<Link href={`/admin/contribution-plans/${id}/edit`}>
						<Pencil className="h-4 w-4 mr-2" />
						Edit
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Overview</CardTitle>
					<CardDescription>Contribution plan configuration and totals</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap gap-2">
						<Badge variant={plan.is_active ? "default" : "secondary"}>{plan.is_active ? "Active" : "Inactive"}</Badge>
						{plan.is_mandatory ? <Badge variant="outline">Mandatory</Badge> : <Badge variant="outline">Optional</Badge>}
					</div>
					{plan.description ? <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plan.description}</p> : null}
					<div className="grid sm:grid-cols-2 gap-4 text-sm">
						<div>
							<p className="text-muted-foreground">Plan amount</p>
							<p className="font-medium">{currency(plan.amount)}</p>
						</div>
						<div>
							<p className="text-muted-foreground">Minimum amount</p>
							<p className="font-medium">{currency(plan.minimum_amount)}</p>
						</div>
						{plan.total_contributions != null && (
							<div>
								<p className="text-muted-foreground">Total contributions</p>
								<p className="font-medium">{currency(plan.total_contributions)}</p>
							</div>
						)}
						{plan.total_members != null && (
							<div>
								<p className="text-muted-foreground">Members</p>
								<p className="font-medium">{plan.total_members}</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
