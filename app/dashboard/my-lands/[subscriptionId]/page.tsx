"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getMemberLandSubscriptionDetail } from "@/lib/api/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function MemberLandAccountPage() {
	const params = useParams()
	const subscriptionId = typeof params?.subscriptionId === "string" ? params.subscriptionId : ""
	const [row, setRow] = useState<Record<string, unknown> | null>(null)

	useEffect(() => {
		if (!subscriptionId) return
		void getMemberLandSubscriptionDetail(subscriptionId).then((r) => {
			if (r.success && r.data) {
				setRow(r.data as Record<string, unknown>)
			}
		})
	}, [subscriptionId])

	if (!subscriptionId || !row) {
		return <div className="p-8 text-muted-foreground">Loading land account…</div>
	}

	const land = (row.land as Record<string, unknown>) || {}
	const payments = (row.payments as Array<{ id: string; amount: unknown; paid_on?: string; description?: string | null }>) || []

	const totalCost = Number(row.total_cost ?? 0)
	const paid = Number(row.amount_paid ?? 0)
	const out = Number(row.outstanding_balance ?? 0)

	return (
		<div className="mx-auto max-w-4xl space-y-6 py-8">
			<Button asChild variant="ghost" size="sm">
				<Link href="/dashboard/properties?listing=land">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to land portfolio
				</Link>
			</Button>

			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<Badge className="mb-2">🌍 Land account</Badge>
					<h1 className="text-3xl font-bold">{String(land.land_title ?? "Land")}</h1>
					<p className="font-mono text-muted-foreground">{String(land.land_code ?? "")}</p>
					<p className="mt-2 text-sm text-muted-foreground">Allocated: {String(row.allocated_land_size ?? "—")}</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total cost</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">₦{totalCost.toLocaleString()}</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Amount paid</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">₦{paid.toLocaleString()}</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold text-primary">₦{out.toLocaleString()}</CardContent>
				</Card>
			</div>

			<p className="text-xs text-muted-foreground">
				Balance is derived from subscriptions and uploaded payments managed by administrators.
			</p>

			<Card>
				<CardHeader>
					<CardTitle>Payment history</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Description</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{payments.length === 0 ? (
								<TableRow>
									<TableCell colSpan={3} className="text-muted-foreground">
										No payments yet.
									</TableCell>
								</TableRow>
							) : (
								payments.map((p) => (
									<TableRow key={p.id}>
										<TableCell>{p.paid_on ?? "—"}</TableCell>
										<TableCell>₦{Number(p.amount ?? 0).toLocaleString()}</TableCell>
										<TableCell>{p.description ?? "—"}</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
