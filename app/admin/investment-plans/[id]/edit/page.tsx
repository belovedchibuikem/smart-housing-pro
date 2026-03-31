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
import { getInvestmentPlan, updateInvestmentPlan } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function EditInvestmentPlanPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		name: "",
		description: "",
		min_amount: "",
		max_amount: "",
		expected_return_rate: "",
		min_duration_months: "",
		max_duration_months: "",
		return_type: "monthly",
		risk_level: "medium",
		is_active: true,
	})

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				setLoading(true)
				const res = await getInvestmentPlan(id)
				if (cancelled || !res.success || !res.data) return
				const p = res.data as Record<string, unknown>
				setForm({
					name: String(p.name ?? ""),
					description: String(p.description ?? ""),
					min_amount: String(p.min_amount ?? ""),
					max_amount: String(p.max_amount ?? ""),
					expected_return_rate: String(p.expected_return_rate ?? ""),
					min_duration_months: String(p.min_duration_months ?? ""),
					max_duration_months: String(p.max_duration_months ?? ""),
					return_type: String(p.return_type ?? "monthly"),
					risk_level: String(p.risk_level ?? "medium"),
					is_active: p.is_active !== false,
				})
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Error"
				if (!cancelled) {
					sonnerToast.error("Failed to load plan", { description: msg })
					router.push("/admin/investment-plans")
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
		try {
			setSaving(true)
			const res = await updateInvestmentPlan(id, {
				name: form.name,
				description: form.description || null,
				min_amount: parseFloat(form.min_amount),
				max_amount: parseFloat(form.max_amount),
				expected_return_rate: parseFloat(form.expected_return_rate),
				min_duration_months: parseInt(form.min_duration_months, 10),
				max_duration_months: parseInt(form.max_duration_months, 10),
				return_type: form.return_type,
				risk_level: form.risk_level,
				is_active: form.is_active,
			})
			if (res.success) {
				sonnerToast.success(res.message || "Plan updated")
				router.push(`/admin/investment-plans/${id}`)
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
					<Link href={`/admin/investment-plans/${id}`}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Link>
				</Button>
				<h1 className="text-3xl font-bold mt-2">Edit investment plan</h1>
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
								rows={3}
								value={form.description}
								onChange={(e) => setForm({ ...form, description: e.target.value })}
							/>
						</div>
						<div className="grid sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Min amount (₦)</Label>
								<Input
									type="number"
									step="0.01"
									value={form.min_amount}
									onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Max amount (₦)</Label>
								<Input
									type="number"
									step="0.01"
									value={form.max_amount}
									onChange={(e) => setForm({ ...form, max_amount: e.target.value })}
									required
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Expected return (%)</Label>
							<Input
								type="number"
								step="0.1"
								value={form.expected_return_rate}
								onChange={(e) => setForm({ ...form, expected_return_rate: e.target.value })}
								required
							/>
						</div>
						<div className="grid sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Min duration (months)</Label>
								<Input
									type="number"
									value={form.min_duration_months}
									onChange={(e) => setForm({ ...form, min_duration_months: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Max duration (months)</Label>
								<Input
									type="number"
									value={form.max_duration_months}
									onChange={(e) => setForm({ ...form, max_duration_months: e.target.value })}
									required
								/>
							</div>
						</div>
						<div className="grid sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Return type</Label>
								<Select value={form.return_type} onValueChange={(v) => setForm({ ...form, return_type: v })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="monthly">Monthly</SelectItem>
										<SelectItem value="quarterly">Quarterly</SelectItem>
										<SelectItem value="annual">Annual</SelectItem>
										<SelectItem value="lump_sum">Lump sum</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Risk level</Label>
								<Select value={form.risk_level} onValueChange={(v) => setForm({ ...form, risk_level: v })}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="active">Active</Label>
							<Switch
								id="active"
								checked={form.is_active}
								onCheckedChange={(c) => setForm({ ...form, is_active: c })}
							/>
						</div>
					</CardContent>
				</Card>
				<div className="flex gap-3">
					<Button type="button" variant="outline" asChild>
						<Link href={`/admin/investment-plans/${id}`}>Cancel</Link>
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
