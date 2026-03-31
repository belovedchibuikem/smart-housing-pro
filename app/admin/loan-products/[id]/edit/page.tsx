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

export default function EditLoanProductPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [isActive, setIsActive] = useState(true)
	const [form, setForm] = useState({
		name: "",
		description: "",
		min_amount: "",
		max_amount: "",
		interest_rate: "",
		min_tenure_months: "",
		max_tenure_months: "",
		interest_type: "simple",
		processing_fee_percentage: "",
		late_payment_fee: "",
	})

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				setLoading(true)
				const res = await apiFetch<{ success: boolean; data: Record<string, unknown> }>(`/admin/loan-products/${id}`)
				if (cancelled || !res.success || !res.data) return
				const p = res.data
				setForm({
					name: String(p.name ?? ""),
					description: String(p.description ?? ""),
					min_amount: String(p.min_amount ?? ""),
					max_amount: String(p.max_amount ?? ""),
					interest_rate: String(p.interest_rate ?? ""),
					min_tenure_months: String(p.min_tenure_months ?? ""),
					max_tenure_months: String(p.max_tenure_months ?? ""),
					interest_type: String(p.interest_type ?? "simple"),
					processing_fee_percentage:
						p.processing_fee_percentage != null ? String(p.processing_fee_percentage) : "",
					late_payment_fee: p.late_payment_fee != null ? String(p.late_payment_fee) : "",
				})
				setIsActive(Boolean(p.is_active))
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Error"
				if (!cancelled) {
					sonnerToast.error("Failed to load product", { description: msg })
					router.push("/admin/loan-products")
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
			const res = await apiFetch<{ success: boolean; message?: string }>(`/admin/loan-products/${id}`, {
				method: "PUT",
				body: {
					name: form.name,
					description: form.description || null,
					min_amount: parseFloat(form.min_amount),
					max_amount: parseFloat(form.max_amount),
					interest_rate: parseFloat(form.interest_rate),
					min_tenure_months: parseInt(form.min_tenure_months, 10),
					max_tenure_months: parseInt(form.max_tenure_months, 10),
					interest_type: form.interest_type,
					processing_fee_percentage: form.processing_fee_percentage
						? parseInt(form.processing_fee_percentage, 10)
						: null,
					late_payment_fee: form.late_payment_fee ? parseFloat(form.late_payment_fee) : null,
					eligibility_criteria: [],
					required_documents: [],
					is_active: isActive,
				},
			})
			if (res.success) {
				sonnerToast.success(res.message || "Product updated")
				router.push(`/admin/loan-products/${id}`)
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
			<div className="max-w-4xl mx-auto flex justify-center py-16">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div>
				<Button variant="ghost" size="sm" asChild>
					<Link href={`/admin/loan-products/${id}`}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Link>
				</Button>
				<h1 className="text-3xl font-bold mt-2">Edit loan product</h1>
			</div>
			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Basics</CardTitle>
						<CardDescription>Name and terms</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
						<div className="flex items-center justify-between border rounded-md p-3">
							<Label htmlFor="active">Active</Label>
							<Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
						</div>
						<div className="grid md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Min amount (₦)</Label>
								<Input
									type="number"
									value={form.min_amount}
									onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Max amount (₦)</Label>
								<Input
									type="number"
									value={form.max_amount}
									onChange={(e) => setForm({ ...form, max_amount: e.target.value })}
									required
								/>
							</div>
						</div>
						<div className="grid md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Interest (%)</Label>
								<Input
									type="number"
									step="0.1"
									value={form.interest_rate}
									onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Interest type</Label>
								<Select
									value={form.interest_type}
									onValueChange={(v) => setForm({ ...form, interest_type: v })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="simple">Simple</SelectItem>
										<SelectItem value="compound">Compound</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Min tenure (months)</Label>
								<Input
									type="number"
									value={form.min_tenure_months}
									onChange={(e) => setForm({ ...form, min_tenure_months: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label>Max tenure (months)</Label>
								<Input
									type="number"
									value={form.max_tenure_months}
									onChange={(e) => setForm({ ...form, max_tenure_months: e.target.value })}
									required
								/>
							</div>
						</div>
						<div className="grid md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Processing fee (%)</Label>
								<Input
									type="number"
									value={form.processing_fee_percentage}
									onChange={(e) => setForm({ ...form, processing_fee_percentage: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label>Late payment fee (₦)</Label>
								<Input
									type="number"
									value={form.late_payment_fee}
									onChange={(e) => setForm({ ...form, late_payment_fee: e.target.value })}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
				<div className="flex gap-3">
					<Button type="button" variant="outline" asChild>
						<Link href={`/admin/loan-products/${id}`}>Cancel</Link>
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
