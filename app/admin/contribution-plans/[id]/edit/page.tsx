"use client"

import type React from "react"
import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function EditContributionPlanPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		name: "",
		description: "",
		amount: "",
		minimum_amount: "",
		frequency: "monthly",
		is_mandatory: false,
		is_active: true,
	})

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				setLoading(true)
				const res = await apiFetch<{ success: boolean; data: Record<string, unknown> }>(
					`/admin/contribution-plans/${id}`,
				)
				if (cancelled || !res.success || !res.data) return
				const p = res.data
				setForm({
					name: String(p.name ?? ""),
					description: String(p.description ?? ""),
					amount: String(p.amount ?? ""),
					minimum_amount: String(p.minimum_amount ?? ""),
					frequency: String(p.frequency ?? "monthly"),
					is_mandatory: Boolean(p.is_mandatory),
					is_active: p.is_active !== false,
				})
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const amount = parseFloat(form.amount)
		const minimum_amount = parseFloat(form.minimum_amount)
		if (!Number.isFinite(amount) || !Number.isFinite(minimum_amount)) {
			sonnerToast.error("Enter valid amounts")
			return
		}
		if (minimum_amount > amount) {
			sonnerToast.error("Minimum cannot exceed plan amount")
			return
		}
		try {
			setSaving(true)
			const res = await apiFetch<{ success: boolean; message?: string }>(`/admin/contribution-plans/${id}`, {
				method: "PUT",
				body: {
					name: form.name,
					description: form.description || null,
					amount,
					minimum_amount,
					frequency: form.frequency,
					is_mandatory: form.is_mandatory,
					is_active: form.is_active,
				},
			})
			if (res.success) {
				sonnerToast.success(res.message || "Plan updated")
				router.push(`/admin/contribution-plans/${id}`)
			}
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Error"
			sonnerToast.error("Update failed", { description: msg })
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return (
			<div className="max-w-2xl mx-auto flex justify-center py-16">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div>
				<Button variant="ghost" size="sm" asChild>
					<Link href={`/admin/contribution-plans/${id}`}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Link>
				</Button>
				<h1 className="text-3xl font-bold mt-2">Edit contribution plan</h1>
			</div>
			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Details</CardTitle>
						<CardDescription>Update plan settings</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={form.name}
								onChange={(e) => setForm({ ...form, name: e.target.value })}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={form.description}
								onChange={(e) => setForm({ ...form, description: e.target.value })}
								rows={3}
							/>
						</div>
						<div className="grid sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="amount">Amount (₦)</Label>
								<Input
									id="amount"
									type="number"
									step="0.01"
									value={form.amount}
									onChange={(e) => setForm({ ...form, amount: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="minimum_amount">Minimum (₦)</Label>
								<Input
									id="minimum_amount"
									type="number"
									step="0.01"
									value={form.minimum_amount}
									onChange={(e) => setForm({ ...form, minimum_amount: e.target.value })}
									required
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Frequency</Label>
							<Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="monthly">Monthly</SelectItem>
									<SelectItem value="quarterly">Quarterly</SelectItem>
									<SelectItem value="annually">Annually</SelectItem>
									<SelectItem value="one_time">One time</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="mandatory">Mandatory</Label>
							<Switch
								id="mandatory"
								checked={form.is_mandatory}
								onCheckedChange={(c) => setForm({ ...form, is_mandatory: c })}
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="active">Active</Label>
							<Switch id="active" checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
						</div>
					</CardContent>
				</Card>
				<div className="flex gap-3">
					<Button type="button" variant="outline" asChild>
						<Link href={`/admin/contribution-plans/${id}`}>Cancel</Link>
					</Button>
					<Button type="submit" disabled={saving}>
						{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
						Save
					</Button>
				</div>
			</form>
		</div>
	)
}
