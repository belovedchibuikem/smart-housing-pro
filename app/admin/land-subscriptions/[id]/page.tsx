"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { Can } from "@/components/admin/can-permission"
import { AdminAssetRepaymentForm } from "@/components/admin/admin-asset-repayment-form"

type LandTenureSummary = {
	sale_price: number
	amount_paid: number
	outstanding: number
	payment_progress_percent?: number | null
	payment_status?: string | null
	tenure_status: string
	owner_label: string | null
	deed_ready: boolean
	subscription: {
		id: string
		land_slot_id?: string | null
		slot_number?: number | null
		slot_label?: string | null
		allocated_land_size?: string | null
		land?: { title?: string; land_code?: string }
		member?: { user?: { first_name?: string; last_name?: string }; member_number?: string }
	}
	payments?: Array<{
		id: string
		amount: number
		paid_on?: string
		source?: string
		reference?: string
		description?: string
	}>
}

export default function LandSubscriptionTenurePage() {
	const params = useParams()
	const subscriptionId = params?.id as string
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [summary, setSummary] = useState<LandTenureSummary | null>(null)
	const [busy, setBusy] = useState(false)
	const [overrideReason, setOverrideReason] = useState("")
	const [deedFile, setDeedFile] = useState<File | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const tenureRes = await apiFetch<{ success: boolean; data: LandTenureSummary }>(
				`/admin/property-management/tenures/lands/${subscriptionId}`,
			)
			if (tenureRes.success) setSummary(tenureRes.data)
		} catch (e) {
			toast({
				title: "Error",
				description: e instanceof Error ? e.message : "Failed to load land tenure",
				variant: "destructive",
			})
		} finally {
			setLoading(false)
		}
	}, [subscriptionId, toast])

	useEffect(() => {
		if (subscriptionId) void load()
	}, [subscriptionId, load])

	const uploadDeed = async () => {
		if (!deedFile) {
			toast({ title: "Select a deed file first", variant: "destructive" })
			return
		}
		setBusy(true)
		try {
			const form = new FormData()
			form.append("file", deedFile)
			form.append("status", "uploaded")
			const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
			const tenantSlug = localStorage.getItem("tenant_slug")
			const res = await fetch(`/api/admin/property-management/tenures/lands/${subscriptionId}/deed`, {
				method: "POST",
				headers: {
					...(token ? { Authorization: `Bearer ${token}` } : {}),
					...(tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {}),
				},
				body: form,
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.message || "Upload failed")
			toast({ title: "Deed uploaded" })
			setDeedFile(null)
			await load()
		} catch (e) {
			toast({
				title: "Error",
				description: e instanceof Error ? e.message : "Failed",
				variant: "destructive",
			})
		} finally {
			setBusy(false)
		}
	}

	const markSold = async (override = false) => {
		setBusy(true)
		try {
			await apiFetch(`/admin/property-management/tenures/lands/${subscriptionId}/mark-sold`, {
				method: "POST",
				body: JSON.stringify(
					override ? { override_deed: true, override_reason: overrideReason } : {},
				),
			})
			toast({ title: "Marked as sold — owner sequence assigned" })
			await load()
		} catch (e) {
			toast({
				title: "Error",
				description: e instanceof Error ? e.message : "Failed",
				variant: "destructive",
			})
		} finally {
			setBusy(false)
		}
	}

	if (loading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (!summary) {
		return <p className="p-6 text-muted-foreground">Land subscription not found.</p>
	}

	const memberName = [
		summary.subscription?.member?.user?.first_name,
		summary.subscription?.member?.user?.last_name,
	]
		.filter(Boolean)
		.join(" ")

	const slotLabel =
		summary.subscription?.slot_label ||
		(summary.subscription?.slot_number != null
			? `Plot #${summary.subscription.slot_number}`
			: summary.subscription?.allocated_land_size || null)

	const progressPercent =
		summary.payment_progress_percent != null
			? Math.round(Number(summary.payment_progress_percent))
			: summary.sale_price > 0
				? Math.round((Number(summary.amount_paid) / Number(summary.sale_price)) * 100)
				: null

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center gap-4">
				<Link href="/admin/lands?tab=subscriptions">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold">Land tenure & repayment</h1>
					<p className="text-muted-foreground mt-1">
						{summary.subscription?.land?.title ?? "Land parcel"}
						{slotLabel ? ` · ${slotLabel}` : ""}
						{" · "}
						{memberName || "Member"}
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Plot / slot</CardDescription>
						<CardTitle className="text-lg">{slotLabel || "—"}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total cost</CardDescription>
						<CardTitle>₦{Number(summary.sale_price).toLocaleString()}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Amount paid</CardDescription>
						<CardTitle>₦{Number(summary.amount_paid).toLocaleString()}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Outstanding</CardDescription>
						<CardTitle>₦{Number(summary.outstanding).toLocaleString()}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Progress / tenure</CardDescription>
						<CardTitle className="text-lg capitalize">
							{progressPercent != null ? `${progressPercent}%` : "—"}
							<span className="mt-1 block text-sm font-normal text-muted-foreground capitalize">
								{summary.tenure_status}
								{summary.owner_label ? ` · ${summary.owner_label}` : ""}
							</span>
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Record repayment</CardTitle>
						<CardDescription>Cash, equity wallet, or mortgage disbursement for this land slot</CardDescription>
					</CardHeader>
					<CardContent>
						<AdminAssetRepaymentForm
							assetType="land"
							tenureId={subscriptionId}
							onSuccess={() => void load()}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Deed of Assignment</CardTitle>
						<CardDescription>
							Upload executed/registered deed before marking sold (or override with reason)
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Deed ready: {summary.deed_ready ? "Yes" : "No"}
						</p>
						<Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDeedFile(e.target.files?.[0] ?? null)} />
						<Can permission="manage_property_allottees|approve_allotments">
							<Button variant="outline" onClick={uploadDeed} disabled={busy || !deedFile}>
								<Upload className="mr-2 h-4 w-4" />
								Upload deed
							</Button>
						</Can>
						{summary.tenure_status === "allocation" ? (
							<div className="space-y-3 border-t pt-4">
								<Can permission="manage_property_allottees|approve_allotments">
									<Button onClick={() => markSold(false)} disabled={busy}>
										Mark as Sold
									</Button>
								</Can>
								<div className="space-y-2">
									<Label>Override reason (if deed not uploaded)</Label>
									<Textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} rows={2} />
									<Button variant="secondary" onClick={() => markSold(true)} disabled={busy || !overrideReason.trim()}>
										Mark sold with override
									</Button>
								</div>
							</div>
						) : null}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Payments on this tenure</CardTitle>
				</CardHeader>
				<CardContent>
					{(summary.payments ?? []).length === 0 ? (
						<p className="text-sm text-muted-foreground">No payments yet.</p>
					) : (
						<ul className="space-y-2 text-sm">
							{summary.payments?.map((p) => (
								<li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2">
									<span className="font-medium">₦{Number(p.amount).toLocaleString()}</span>
									<span className="text-muted-foreground capitalize">{p.source?.replace(/_/g, " ") || "cash"}</span>
									<span className="text-muted-foreground">{p.paid_on ? new Date(p.paid_on).toLocaleDateString() : "—"}</span>
									{p.reference ? <span className="text-xs text-muted-foreground">Ref: {p.reference}</span> : null}
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
