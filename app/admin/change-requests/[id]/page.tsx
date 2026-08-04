"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
	cancelAdminChangeRequest,
	getAdminChangeRequest,
	type ChangeRequest,
} from "@/lib/api/ownership"

export default function ChangeRequestDetailPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [row, setRow] = useState<ChangeRequest | null>(null)
	const [timeline, setTimeline] = useState<Array<Record<string, unknown>>>([])

	useEffect(() => {
		const id = params?.id
		if (!id) return
		;(async () => {
			setLoading(true)
			try {
				const res = await getAdminChangeRequest(id)
				setRow(res.data)
				setTimeline(res.timeline || [])
			} catch (e) {
				toast({ title: "Failed to load request", description: String(e), variant: "destructive" })
			} finally {
				setLoading(false)
			}
		})()
	}, [params?.id, toast])

	const cancel = async () => {
		if (!row) return
		try {
			const res = await cancelAdminChangeRequest(row.id, "Cancelled by admin")
			setRow(res.data)
			toast({ title: "Request cancelled" })
		} catch (e) {
			toast({ title: "Cancel failed", description: String(e), variant: "destructive" })
		}
	}

	if (loading) {
		return (
			<div className="p-6 flex items-center gap-2 text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" /> Loading…
			</div>
		)
	}

	if (!row) {
		return <div className="p-6">Request not found</div>
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" onClick={() => router.push("/admin/change-requests")}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-semibold">{row.request_number}</h1>
						<p className="text-sm text-muted-foreground">{row.action_type}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge>{row.status}</Badge>
					{row.status === "PENDING" ? (
						<Button variant="destructive" onClick={() => void cancel()}>
							Cancel
						</Button>
					) : null}
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Requested changes</CardTitle>
						<CardDescription>Old vs new values</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4 text-sm">
						<div>
							<div className="font-medium mb-1">Old values</div>
							<pre className="rounded-md bg-muted p-3 overflow-auto text-xs">
								{JSON.stringify(row.old_values || {}, null, 2)}
							</pre>
						</div>
						<div>
							<div className="font-medium mb-1">New values</div>
							<pre className="rounded-md bg-muted p-3 overflow-auto text-xs">
								{JSON.stringify(row.new_values || {}, null, 2)}
							</pre>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Approvers</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{(row.approvals || []).map((a) => (
							<div key={a.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
								<div>
									<div className="font-medium">{a.member?.user?.name || a.member_id}</div>
									<div className="text-muted-foreground text-xs">{a.comment || "—"}</div>
								</div>
								<Badge variant="outline">{a.decision}</Badge>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Approval timeline</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{timeline.map((event, idx) => (
						<div key={idx} className="flex gap-3 text-sm">
							<div className="mt-1 h-2 w-2 rounded-full bg-foreground/70" />
							<div>
								<div className="font-medium capitalize">{String(event.event || "")}</div>
								<div className="text-muted-foreground">
									{String(event.actor || "")}
									{event.at ? ` · ${new Date(String(event.at)).toLocaleString()}` : ""}
								</div>
								{event.detail ? <div className="text-xs mt-1">{String(event.detail)}</div> : null}
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	)
}
