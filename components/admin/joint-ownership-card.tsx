"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import {
	cancelAdminOwnershipInvitation,
	getAdminJointLandOwnership,
	getAdminJointPropertyOwnership,
	inviteAdminLandCoOwner,
	inviteAdminPropertyCoOwner,
	type JointOwnershipDashboard,
} from "@/lib/api/ownership"

interface JointOwnershipCardProps {
	assetType: "house" | "land"
	assetId: string
	slotId?: string | null
}

export function JointOwnershipCard({ assetType, assetId, slotId }: JointOwnershipCardProps) {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [inviting, setInviting] = useState(false)
	const [data, setData] = useState<JointOwnershipDashboard | null>(null)
	const [inviteeMemberId, setInviteeMemberId] = useState("")
	const [inviteePercentage, setInviteePercentage] = useState("50")
	const [message, setMessage] = useState("")

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res =
				assetType === "house"
					? await getAdminJointPropertyOwnership(assetId, slotId || undefined)
					: await getAdminJointLandOwnership(assetId, slotId || undefined)
			setData(res.data)
		} catch {
			setData(null)
		} finally {
			setLoading(false)
		}
	}, [assetType, assetId, slotId])

	useEffect(() => {
		void load()
	}, [load])

	const searchMembers = useCallback(async (query: string): Promise<SearchableSelectOption[]> => {
		const res = await apiFetch<{
			data?: Array<{ id: string; member_number?: string; user?: { first_name?: string; last_name?: string; email?: string } }>
			members?: Array<{ id: string; member_number?: string; user?: { first_name?: string; last_name?: string; email?: string } }>
		}>(`/admin/members?search=${encodeURIComponent(query)}&per_page=50`)
		const rows = res.data || res.members || []
		return rows.map((m) => {
			const name = `${m.user?.first_name || ""} ${m.user?.last_name || ""}`.trim() || m.member_number || m.id
			const email = m.user?.email ? ` · ${m.user.email}` : " · no email on file"
			return { value: m.id, label: `${name}${email}` }
		})
	}, [])

	const sendInvite = async () => {
		if (!inviteeMemberId) {
			toast({ title: "Select a member to invite", variant: "destructive" })
			return
		}
		const pct = Number(inviteePercentage)
		if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
			toast({ title: "Invitee share must be between 0 and 100", variant: "destructive" })
			return
		}
		setInviting(true)
		try {
			const body = {
				invitee_member_id: inviteeMemberId,
				invitee_percentage: pct,
				primary_percentage: 100 - pct,
				message: message || undefined,
				...(assetType === "house"
					? { property_slot_id: slotId || data?.slot?.id || undefined }
					: { land_slot_id: slotId || data?.slot?.id || undefined }),
			}
			const res =
				assetType === "house"
					? await inviteAdminPropertyCoOwner(assetId, body)
					: await inviteAdminLandCoOwner(assetId, body)
			const channels = res.channels || {}
			toast({
				title: "Invitation sent",
				description: channels.email
					? "Delivered in-app and email was attempted."
					: "Delivered in-app. Invitee has no usable email — they can still accept in the member area.",
			})
			setInviteeMemberId("")
			setMessage("")
			await load()
		} catch (e) {
			toast({ title: "Invite failed", description: String(e), variant: "destructive" })
		} finally {
			setInviting(false)
		}
	}

	const cancelInvite = async (invitationId: string) => {
		try {
			await cancelAdminOwnershipInvitation(invitationId)
			toast({ title: "Invitation cancelled" })
			await load()
		} catch (e) {
			toast({ title: "Cancel failed", description: String(e), variant: "destructive" })
		}
	}

	if (loading) {
		return <Skeleton className="h-40 w-full" />
	}

	if (!data) {
		return null
	}

	const pendingInvites = data.pending_invitations || []

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-3">
				<div>
					<CardTitle>Joint ownership</CardTitle>
					<CardDescription>
						Primary is seeded on allotment. Invite co-owners by member account — in-app first, email when available.
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
						<p className="text-muted-foreground">None yet</p>
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

				{pendingInvites.length > 0 && (
					<div className="space-y-2 rounded-md border border-dashed p-3">
						<p className="text-xs font-medium text-muted-foreground">Pending invitations</p>
						{pendingInvites.map((inv) => (
							<div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
								<span>
									{inv.invitee_name || inv.invitee_member_id} · {inv.invitee_percentage}%
									{inv.channels_delivered?.email_skipped_reason ? " · in-app only" : ""}
								</span>
								<Button type="button" size="sm" variant="ghost" onClick={() => void cancelInvite(inv.id)}>
									Cancel
								</Button>
							</div>
						))}
					</div>
				)}

				<div className="space-y-3 rounded-md border bg-muted/20 p-3">
					<p className="text-sm font-medium">Invite co-owner</p>
					<p className="text-xs text-muted-foreground">
						Invitation is tied to the member account and always appears in their notifications / Ownership page.
						Email is optional and used only when a valid address is on file.
					</p>
					<div className="space-y-2">
						<Label>Member</Label>
						<SearchableSelect
							value={inviteeMemberId}
							onValueChange={setInviteeMemberId}
							options={[]}
							onSearch={searchMembers}
							placeholder="Search member name, number, or email"
						/>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>Invitee share %</Label>
							<Input
								type="number"
								min={1}
								max={99}
								step="0.01"
								value={inviteePercentage}
								onChange={(e) => setInviteePercentage(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label>Primary keeps %</Label>
							<Input value={String(100 - (Number(inviteePercentage) || 0))} readOnly />
						</div>
					</div>
					<div className="space-y-2">
						<Label>Message (optional)</Label>
						<Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} />
					</div>
					<Button type="button" onClick={() => void sendInvite()} disabled={inviting || !data.primary_owner}>
						{inviting ? "Sending…" : "Send invitation"}
					</Button>
					{!data.primary_owner ? (
						<p className="text-xs text-destructive">
							No primary owner yet. Allot the slot or run ownership backfill first.
						</p>
					) : null}
				</div>

				<div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
					<p className="text-muted-foreground">
						{data.pending_requests?.length || 0} pending change request(s)
					</p>
					<Button asChild variant="outline" size="sm">
						<Link href="/admin/change-requests">Open Change Request Center</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
