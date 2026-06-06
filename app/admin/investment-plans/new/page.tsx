"use client"

import type React from "react"
import { useState } from "react"
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
import { createInvestmentPlan } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"
import { Can } from "@/components/admin/can-permission"

export default function NewInvestmentPlanPage() {
	const router = useRouter()
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		name: "",
		description: "",
		min_amount: "",
		max_amount: "",
		expected_return_rate: "",
		min_duration_months: "12",
		max_duration_months: "60",
		return_type: "annual",
		risk_level: "medium",
		is_active: true,
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			setSaving(true)
			const res = await createInvestmentPlan({
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
				sonnerToast.success(res.message || "Investment plan created")
				router.push("/admin/investment-plans")
			}
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Error"
			sonnerToast.error("Create failed", { description: msg })
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div>
				<Button variant="ghost" size="sm" asChild>
					<Link href="/admin/investment-plans">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Link>
				</Button>
				<h1 className="text-3xl font-bold mt-2">Create investment plan</h1>
				<p className="text-muted-foreground mt-1">Set up a plan members can subscribe to and invest in</p>
			</div>
			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Plan details</CardTitle>
						<CardDescription>Define amounts, duration, and return terms</CardDescription>
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
									min="0"
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
									min="0"
									value={form.max_amount}
									onChange={(e) => setForm({ ...form, max_amount: e.target.value })}
									required
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Expected return (% p.a.)</Label>
							<Input
								type="number"
								step="0.1"
								min="0"
								max="100"
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
									min="1"
									value={form.min_duration_months}
									onChange={(e) => setForm({ ...form, min_duration_months: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Max duration (months)</Label>
								<Input
									type="number"
									min="1"
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
							<Label htmlFor="active">Active (visible to members)</Label>
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
						<Link href="/admin/investment-plans">Cancel</Link>
					</Button>
					<Can permission="create_investment_plans">
						<Button type="submit" disabled={saving}>
							{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
							Create plan
						</Button>
					</Can>
				</div>
			</form>
		</div>
	)
}
