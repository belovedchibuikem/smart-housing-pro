"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
	getAdminJointLandOwnership,
	getAdminJointPropertyOwnership,
	type JointOwnershipDashboard,
} from "@/lib/api/ownership"

interface JointOwnershipCardProps {
	assetType: "house" | "land"
	assetId: string
	slotId?: string | null
}

export function JointOwnershipCard({ assetType, assetId, slotId }: JointOwnershipCardProps) {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState<JointOwnershipDashboard | null>(null)

	useEffect(() => {
		let cancelled = false
		;(async () => {
			setLoading(true)
			try {
				const res =
					assetType === "house"
						? await getAdminJointPropertyOwnership(assetId, slotId || undefined)
						: await getAdminJointLandOwnership(assetId, slotId || undefined)
				if (!cancelled) setData(res.data)
			} catch {
				if (!cancelled) setData(null)
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [assetType, assetId, slotId])

	if (loading) {
		return <Skeleton className="h-40 w-full" />
	}

	if (!data) {
		return null
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-3">
				<div>
					<CardTitle>Joint ownership</CardTitle>
					<CardDescription>
						Ownership type, co-owners, verification, and pending consent requests
					</CardDescription>
				</div>
				<Badge variant={data.ownership_type === "JOINT" ? "default" : "secondary"}>
					{data.ownership_type}
				</Badge>
			</CardHeader>
			<CardContent className="space-y-4 text-sm">
				<div className="grid gap-3 sm:grid-cols-2">
					<div>
						<p className="text-xs text-muted-foreground">Primary owner</p>
						<p className="font-medium">
							{data.primary_owner?.name || "—"}{" "}
							{data.primary_owner ? `(${data.primary_owner.ownership_percentage}%)` : ""}
						</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Verification</p>
						<p className="font-medium capitalize">{data.verification_status}</p>
					</div>
				</div>

				<div>
					<p className="text-xs text-muted-foreground mb-2">Co-owners</p>
					{data.co_owners.length === 0 ? (
						<p className="text-muted-foreground">None</p>
					) : (
						<div className="space-y-2">
							{data.co_owners.map((o) => (
								<div key={o.id} className="flex items-center justify-between rounded-md border px-3 py-2">
									<span>{o.name || o.member_id}</span>
									<span>{o.ownership_percentage}%</span>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
					<p className="text-muted-foreground">
						{data.pending_requests?.length || 0} pending request(s)
					</p>
					<Button asChild variant="outline" size="sm">
						<Link href="/admin/change-requests">Open Change Request Center</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
