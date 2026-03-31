"use client"

import type React from "react"
import { use, useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { useRouter } from "next/navigation"
import { toast as sonnerToast } from "sonner"

interface PackageApi {
	id: string
	name: string
	slug: string
	description: string | null
	price: number
	billing_cycle: string
	trial_days: number
	is_active: boolean
	is_featured: boolean
	limits: Record<string, unknown> | null
	modules?: Array<{ id: string }>
}

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		name: "",
		slug: "",
		description: "",
		price: "",
		billing_cycle: "monthly",
		trial_days: "14",
		is_active: true,
		is_featured: false,
		limits: {
			max_members: "",
			max_properties: "",
			max_loan_products: "",
			max_contribution_plans: "",
			max_investment_plans: "",
			max_mortgage_plans: "",
			storage_gb: "",
			max_admins: "",
			has_role_management: false,
		},
		moduleIds: [] as string[],
	})

	const load = useCallback(async () => {
		try {
			setLoading(true)
			const res = await apiFetch<{ package: PackageApi }>(`/super-admin/packages/${id}`)
			const pkg = res.package
			if (!pkg) return
			const L = pkg.limits ?? {}
			const num = (k: string) => (L[k] != null ? String(L[k]) : "")
			setFormData({
				name: pkg.name,
				slug: pkg.slug,
				description: pkg.description ?? "",
				price: String(pkg.price),
				billing_cycle: ["weekly", "monthly", "quarterly", "yearly", "lifetime", "forever"].includes(
					pkg.billing_cycle,
				)
					? pkg.billing_cycle
					: "monthly",
				trial_days: String(pkg.trial_days),
				is_active: !!pkg.is_active,
				is_featured: !!pkg.is_featured,
				limits: {
					max_members: num("max_members"),
					max_properties: num("max_properties"),
					max_loan_products: num("max_loan_products"),
					max_contribution_plans: num("max_contribution_plans"),
					max_investment_plans: num("max_investment_plans"),
					max_mortgage_plans: num("max_mortgage_plans"),
					storage_gb: num("storage_gb"),
					max_admins: num("max_admins"),
					has_role_management: Boolean(L["has_role_management"]),
				},
				moduleIds: Array.isArray(pkg.modules) ? pkg.modules.map((m) => m.id) : [],
			})
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Error"
			sonnerToast.error("Failed to load package", { description: msg })
			router.push("/super-admin/packages")
		} finally {
			setLoading(false)
		}
	}, [id, router])

	useEffect(() => {
		void load()
	}, [load])

	const handleLimitChange = (key: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			limits: { ...prev.limits, [key]: value },
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		try {
			const body = {
				name: formData.name,
				slug: formData.slug,
				description: formData.description || null,
				price: parseFloat(formData.price),
				billing_cycle: formData.billing_cycle,
				trial_days: parseInt(formData.trial_days, 10),
				is_active: formData.is_active,
				is_featured: formData.is_featured,
				limits: {
					max_members: parseInt(formData.limits.max_members, 10),
					max_properties: parseInt(formData.limits.max_properties, 10),
					max_loan_products: parseInt(formData.limits.max_loan_products, 10),
					max_contribution_plans: parseInt(formData.limits.max_contribution_plans, 10),
					max_investment_plans: parseInt(formData.limits.max_investment_plans, 10),
					max_mortgage_plans: parseInt(formData.limits.max_mortgage_plans, 10),
					storage_gb: parseInt(formData.limits.storage_gb, 10),
					max_admins: parseInt(formData.limits.max_admins, 10),
					has_role_management: formData.limits.has_role_management,
				},
				...(formData.moduleIds.length ? { modules: formData.moduleIds } : {}),
			}
			await apiFetch(`/super-admin/packages/${id}`, { method: "PUT", body })
			sonnerToast.success("Package updated")
			router.push("/super-admin/packages")
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Error"
			sonnerToast.error("Update failed", { description: msg })
		} finally {
			setIsSubmitting(false)
		}
	}

	if (loading) {
		return (
			<div className="flex justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className="space-y-8 max-w-4xl">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/super-admin/packages">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Edit package</h1>
					<p className="text-muted-foreground mt-2">Update subscription package and limits</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="space-y-6">
					<Card className="p-6">
						<h2 className="text-xl font-semibold mb-4">Basic Information</h2>
						<div className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="name">Package Name</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="slug">Slug</Label>
									<Input
										id="slug"
										value={formData.slug}
										onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									rows={3}
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								/>
							</div>
							<div className="grid gap-4 md:grid-cols-3">
								<div className="space-y-2">
									<Label htmlFor="price">Price (₦)</Label>
									<Input
										id="price"
										type="number"
										step="0.01"
										value={formData.price}
										onChange={(e) => setFormData({ ...formData, price: e.target.value })}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="billing_cycle">Billing Cycle</Label>
									<select
										id="billing_cycle"
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
										value={formData.billing_cycle}
										onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
									>
										<option value="weekly">Weekly</option>
										<option value="monthly">Monthly</option>
										<option value="quarterly">Quarterly</option>
										<option value="yearly">Yearly</option>
										<option value="lifetime">Lifetime</option>
										<option value="forever">Forever</option>
									</select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="trial_days">Trial Days</Label>
									<Input
										id="trial_days"
										type="number"
										value={formData.trial_days}
										onChange={(e) => setFormData({ ...formData, trial_days: e.target.value })}
										required
									/>
								</div>
							</div>
							<div className="flex items-center justify-between pt-4 border-t">
								<Label htmlFor="is_active">Active Package</Label>
								<Switch
									id="is_active"
									checked={formData.is_active}
									onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
								/>
							</div>
							<div className="flex items-center justify-between pt-4 border-t">
								<Label htmlFor="is_featured">Featured Package</Label>
								<Switch
									id="is_featured"
									checked={formData.is_featured}
									onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
								/>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<h2 className="text-xl font-semibold mb-4">Package Limits</h2>
						<p className="text-sm text-muted-foreground mb-4">Set -1 for unlimited access</p>
						<div className="grid gap-4 md:grid-cols-2">
							{(
								[
									["max_members", "Maximum Members"],
									["max_properties", "Maximum Properties"],
									["max_loan_products", "Maximum Loan Plans"],
									["max_contribution_plans", "Maximum Contribution Plans"],
									["max_mortgage_plans", "Maximum Mortgage Plans"],
									["max_investment_plans", "Maximum Investment Plans"],
									["storage_gb", "Storage (GB)"],
									["max_admins", "Maximum Admins"],
								] as const
							).map(([key, label]) => (
								<div key={key} className="space-y-2">
									<Label htmlFor={key}>{label}</Label>
									<Input
										id={key}
										type="number"
										value={formData.limits[key]}
										onChange={(e) => handleLimitChange(key, e.target.value)}
										required
									/>
								</div>
							))}
						</div>
						<div className="flex items-center justify-between pt-6 border-t mt-6">
							<Label htmlFor="has_role_management">Role Management Access</Label>
							<Switch
								id="has_role_management"
								checked={formData.limits.has_role_management}
								onCheckedChange={(checked) =>
									setFormData((prev) => ({
										...prev,
										limits: { ...prev.limits, has_role_management: checked },
									}))
								}

							/>
						</div>
					</Card>

					<div className="flex gap-4">
						<Button type="submit" disabled={isSubmitting}>
							<Save className="h-4 w-4 mr-2" />
							{isSubmitting ? "Saving..." : "Save changes"}
						</Button>
						<Button type="button" variant="outline" asChild>
							<Link href="/super-admin/packages">Cancel</Link>
						</Button>
					</div>
				</div>
			</form>
		</div>
	)
}
