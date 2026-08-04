"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Loader2, RefreshCw, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
	decideMemberChangeRequest,
	getMemberOwnershipAssets,
	getMemberPendingApprovals,
	type ChangeRequestApproval,
} from "@/lib/api/ownership"

export default function MemberOwnershipPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [assets, setAssets] = useState<{ properties: unknown[]; lands: unknown[] }>({
		properties: [],
		lands: [],
	})
	const [pending, setPending] = useState<ChangeRequestApproval[]>([])
	const [pin, setPin] = useState("")
	const [comment, setComment] = useState("")
	const [actingId, setActingId] = useState<string | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const [a, p] = await Promise.all([getMemberOwnershipAssets(), getMemberPendingApprovals()])
			setAssets(a.data || { properties: [], lands: [] })
			setPending(p.data || [])
		} catch (e) {
			toast({ title: "Failed to load ownership", description: String(e), variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void load()
	}, [load])

	const decide = async (approval: ChangeRequestApproval, decision: string) => {
		const requestId = (approval as ChangeRequestApproval & { change_request?: { id?: string }; property_change_request_id?: string })
			.change_request?.id
			|| (approval as { property_change_request_id?: string }).property_change_request_id
		if (!requestId) {
			toast({ title: "Missing request id", variant: "destructive" })
			return
		}
		setActingId(approval.id)
		try {
			await decideMemberChangeRequest(requestId, {
				decision,
				comment: comment || undefined,
				auth_method: pin ? "pin" : "biometric",
				pin: pin || undefined,
			})
			toast({ title: decision === "APPROVED" ? "Approved" : "Decision saved" })
			setComment("")
			await load()
		} catch (e) {
			toast({ title: "Decision failed", description: String(e), variant: "destructive" })
		} finally {
			setActingId(null)
		}
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold">My Ownership</h1>
					<p className="text-sm text-muted-foreground">
						Properties you own or co-own, plus pending joint-approval requests.
					</p>
				</div>
				<Button variant="outline" onClick={() => void load()} disabled={loading}>
					{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
					<span className="ml-2">Refresh</span>
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Properties</CardTitle>
						<CardDescription>{assets.properties.length} ownership link(s)</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{assets.properties.length === 0 ? (
							<p className="text-sm text-muted-foreground">No property ownership records yet.</p>
						) : (
							assets.properties.map((row: any, idx) => (
								<div key={idx} className="rounded-md border p-3 text-sm">
									<div className="font-medium">{row.property?.title || "Property"}</div>
									<div className="text-muted-foreground">
										{row.ownership?.ownership_role} · {row.ownership?.ownership_percentage}%
										{row.slot?.label ? ` · ${row.slot.label}` : ""}
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Lands</CardTitle>
						<CardDescription>{assets.lands.length} ownership link(s)</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{assets.lands.length === 0 ? (
							<p className="text-sm text-muted-foreground">No land ownership records yet.</p>
						) : (
							assets.lands.map((row: any, idx) => (
								<div key={idx} className="rounded-md border p-3 text-sm">
									<div className="font-medium">{row.land?.land_title || "Land"}</div>
									<div className="text-muted-foreground">
										{row.ownership?.ownership_role} · {row.ownership?.ownership_percentage}%
										{row.slot?.label ? ` · ${row.slot.label}` : ""}
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Pending approvals</CardTitle>
					<CardDescription>Sensitive joint-ownership changes awaiting your decision</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-3 md:grid-cols-2">
						<div>
							<Label htmlFor="pin">PIN / OTP (required for sensitive actions)</Label>
							<Input id="pin" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter PIN or OTP" />
						</div>
						<div>
							<Label htmlFor="comment">Comment</Label>
							<Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
						</div>
					</div>

					{pending.length === 0 ? (
						<p className="text-sm text-muted-foreground">No pending approvals.</p>
					) : (
						pending.map((approval) => {
							const cr = (approval as any).change_request
							return (
								<div key={approval.id} className="rounded-md border p-4 space-y-3">
									<div className="flex items-start justify-between gap-3">
										<div>
											<div className="font-medium">{cr?.request_number || "Change request"}</div>
											<div className="text-sm text-muted-foreground">{cr?.action_type}</div>
										</div>
										<Badge>{approval.decision}</Badge>
									</div>
									<div className="flex flex-wrap gap-2">
										<Button
											size="sm"
											disabled={actingId === approval.id}
											onClick={() => void decide(approval, "APPROVED")}
										>
											<Check className="h-4 w-4 mr-1" /> Approve
										</Button>
										<Button
											size="sm"
											variant="destructive"
											disabled={actingId === approval.id}
											onClick={() => void decide(approval, "REJECTED")}
										>
											<X className="h-4 w-4 mr-1" /> Reject
										</Button>
										<Button
											size="sm"
											variant="outline"
											disabled={actingId === approval.id}
											onClick={() => void decide(approval, "MODIFICATION_REQUESTED")}
										>
											Request modification
										</Button>
									</div>
								</div>
							)
						})
					)}
				</CardContent>
			</Card>
		</div>
	)
}
