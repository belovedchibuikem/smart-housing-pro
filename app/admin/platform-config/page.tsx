"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Database, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
	backfillOwnershipPrimaries,
	getOwnershipSettings,
	updateOwnershipSettings,
} from "@/lib/api/ownership"
import { Can } from "@/components/admin/can-permission"

export default function PlatformConfigPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [backfilling, setBackfilling] = useState(false)
	const [lastBackfill, setLastBackfill] = useState<{
		property_owners: number
		land_owners: number
	} | null>(null)
	const [settings, setSettings] = useState<Record<string, any>>({})

	useEffect(() => {
		;(async () => {
			try {
				const res = await getOwnershipSettings()
				setSettings(res.data || {})
			} catch (e) {
				toast({ title: "Failed to load settings", description: String(e), variant: "destructive" })
			} finally {
				setLoading(false)
			}
		})()
	}, [toast])

	const save = async () => {
		setSaving(true)
		try {
			const res = await updateOwnershipSettings(settings)
			setSettings(res.data || settings)
			toast({ title: "Platform configuration saved" })
		} catch (e) {
			toast({ title: "Save failed", description: String(e), variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const runBackfill = async () => {
		const confirmed = window.confirm(
			"Seed SOLE primary owners from active house allocations and land subscriptions?\n\nExisting active owners are left in place; missing primaries are created at 100%.",
		)
		if (!confirmed) return

		setBackfilling(true)
		try {
			const res = await backfillOwnershipPrimaries()
			setLastBackfill(res.data)
			toast({
				title: "Ownership backfill complete",
				description: `Processed ${res.data?.property_owners ?? 0} house allocation(s) and ${res.data?.land_owners ?? 0} land subscription(s).`,
			})
		} catch (e) {
			toast({ title: "Backfill failed", description: String(e), variant: "destructive" })
		} finally {
			setBackfilling(false)
		}
	}

	if (loading) {
		return (
			<div className="p-6 flex items-center gap-2 text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" /> Loading…
			</div>
		)
	}

	return (
		<div className="space-y-6 p-6 max-w-3xl">
			<div>
				<h1 className="text-2xl font-semibold">Platform Configuration</h1>
				<p className="text-sm text-muted-foreground">
					Ownership approval rules, document issuance delays, and links to related admin modules.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Ownership & consent</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label>Feature enabled</Label>
						<Switch
							checked={Boolean(settings.ownership_feature_enabled)}
							onCheckedChange={(v) => setSettings((s) => ({ ...s, ownership_feature_enabled: v }))}
						/>
					</div>
					<div className="flex items-center justify-between">
						<Label>Joint consent required</Label>
						<Switch
							checked={Boolean(settings.ownership_joint_consent_enabled)}
							onCheckedChange={(v) => setSettings((s) => ({ ...s, ownership_joint_consent_enabled: v }))}
						/>
					</div>
					<div className="flex items-center justify-between">
						<Label>Require OTP/PIN for sensitive approvals</Label>
						<Switch
							checked={Boolean(settings.ownership_require_otp_for_approvals)}
							onCheckedChange={(v) =>
								setSettings((s) => ({ ...s, ownership_require_otp_for_approvals: v }))
							}
						/>
					</div>
					<div>
						<Label>Approval expiry (days)</Label>
						<Input
							type="number"
							value={settings.ownership_approval_expiry_days ?? 7}
							onChange={(e) =>
								setSettings((s) => ({ ...s, ownership_approval_expiry_days: Number(e.target.value) }))
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Ownership data backfill</CardTitle>
					<CardDescription>
						Same as <code className="text-xs">php artisan ownership:backfill-primaries</code> for this
						tenant. Creates a SOLE primary owner (100%) for each active allocation/subscription that does
						not already have one.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{lastBackfill ? (
						<p className="text-sm text-muted-foreground">
							Last run: {lastBackfill.property_owners} house allocation(s),{" "}
							{lastBackfill.land_owners} land subscription(s) processed.
						</p>
					) : null}
					<Can permission="manage_ownership">
						<Button onClick={() => void runBackfill()} disabled={backfilling}>
							{backfilling ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<Database className="h-4 w-4 mr-2" />
							)}
							Backfill primary owners
						</Button>
					</Can>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Document issuance workflow</CardTitle>
					<CardDescription>Configurable delays instead of hardcoded schedules</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<Label>Auto-issue receipts</Label>
						<Switch
							checked={Boolean(settings.document_auto_issue_receipts)}
							onCheckedChange={(v) => setSettings((s) => ({ ...s, document_auto_issue_receipts: v }))}
						/>
					</div>
					<div>
						<Label>Offer letter delay (hours)</Label>
						<Input
							type="number"
							value={settings.document_offer_letter_delay_hours ?? 24}
							onChange={(e) =>
								setSettings((s) => ({
									...s,
									document_offer_letter_delay_hours: Number(e.target.value),
								}))
							}
						/>
					</div>
					<div>
						<Label>Allocation letter delay (hours)</Label>
						<Input
							type="number"
							value={settings.document_allocation_letter_delay_hours ?? 48}
							onChange={(e) =>
								setSettings((s) => ({
									...s,
									document_allocation_letter_delay_hours: Number(e.target.value),
								}))
							}
						/>
					</div>
					<Button onClick={() => void save()} disabled={saving}>
						{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
						Save configuration
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Related modules</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-2">
					<Button asChild variant="outline" size="sm">
						<Link href="/admin/change-requests">Change requests</Link>
					</Button>
					<Button asChild variant="outline" size="sm">
						<Link href="/admin/payment-routing">Payment routing</Link>
					</Button>
					<Button asChild variant="outline" size="sm">
						<Link href="/admin/contact-centre">Contact centre</Link>
					</Button>
					<Button asChild variant="outline" size="sm">
						<Link href="/admin/property-improvements">Improvements</Link>
					</Button>
					<Button asChild variant="outline" size="sm">
						<Link href="/admin/valuations">Valuations</Link>
					</Button>
					<Button asChild variant="outline" size="sm">
						<Link href="/admin/settings">All settings</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
