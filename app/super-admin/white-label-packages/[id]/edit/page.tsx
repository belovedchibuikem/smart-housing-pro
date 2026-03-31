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
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function EditWhiteLabelPackagePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		name: "",
		description: "",
		features: "",
		price: "",
		billing_cycle: "monthly",
		is_active: true,
	})

	useEffect(() => {
		let c = false
		;(async () => {
			try {
				setLoading(true)
				const res = await apiFetch<{ package: Record<string, unknown> }>(`/super-admin/white-label-packages/${id}`)
				const pkg = res.package
				if (!c && pkg) {
					const feats = Array.isArray(pkg.features) ? (pkg.features as string[]).join("\n") : ""
					setForm({
						name: String(pkg.name ?? ""),
						description: String(pkg.description ?? ""),
						features: feats,
						price: String(pkg.price ?? ""),
						billing_cycle: String(pkg.billing_cycle ?? "monthly"),
						is_active: pkg.is_active !== false,
					})
				}
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Error"
				if (!c) {
					sonnerToast.error("Failed to load package", { description: msg })
					router.push("/super-admin/white-label-packages")
				}
			} finally {
				if (!c) setLoading(false)
			}
		})()
		return () => {
			c = true
		}
	}, [id, router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const featuresArray = form.features.split("\n").map((f) => f.trim()).filter(Boolean)
		if (featuresArray.length === 0) {
			sonnerToast.error("Add at least one feature (one per line)")
			return
		}
		try {
			setSaving(true)
			await apiFetch(`/super-admin/white-label-packages/${id}`, {
				method: "PUT",
				body: {
					name: form.name,
					description: form.description,
					price: parseFloat(form.price),
					billing_cycle: form.billing_cycle,
					features: featuresArray,
					is_active: form.is_active,
				},
			})
			sonnerToast.success("Package updated")
			router.push("/super-admin/white-label-packages")
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Error"
			sonnerToast.error("Update failed", { description: msg })
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return (
			<div className="max-w-2xl mx-auto flex justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div>
				<Button variant="ghost" size="sm" asChild>
					<Link href="/super-admin/white-label-packages">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Link>
				</Button>
				<h1 className="text-3xl font-bold mt-2">Edit white label package</h1>
			</div>
			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Package</CardTitle>
						<CardDescription>All fields required by the API</CardDescription>
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
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="features">Features (one per line)</Label>
							<Textarea
								id="features"
								rows={5}
								value={form.features}
								onChange={(e) => setForm({ ...form, features: e.target.value })}
								required
							/>
						</div>
						<div className="grid sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="price">Price (₦)</Label>
								<Input
									id="price"
									type="number"
									step="0.01"
									value={form.price}
									onChange={(e) => setForm({ ...form, price: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="billing_cycle">Billing</Label>
								<select
									id="billing_cycle"
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									value={form.billing_cycle}
									onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
								>
									<option value="monthly">Monthly</option>
									<option value="quarterly">Quarterly</option>
									<option value="annually">Annually</option>
								</select>
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
						<Link href="/super-admin/white-label-packages">Cancel</Link>
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
