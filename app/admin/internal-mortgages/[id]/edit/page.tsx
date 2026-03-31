"use client"

import type React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getInternalMortgagePlan, updateInternalMortgagePlan } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

export default function EditInternalMortgagePlanPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const { toast } = useToast()
	const id = params?.id
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [title, setTitle] = useState("")
	const [description, setDescription] = useState("")

	const load = useCallback(async () => {
		if (!id) return
		try {
			setLoading(true)
			const res = await getInternalMortgagePlan(id)
			if (res.success && res.data) {
				setTitle(res.data.title ?? "")
				setDescription(res.data.description ?? "")
			}
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Error"
			toast({ title: "Load failed", description: msg, variant: "destructive" })
			router.push("/admin/internal-mortgages")
		} finally {
			setLoading(false)
		}
	}, [id, router, toast])

	useEffect(() => {
		void load()
	}, [load])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!id) return
		try {
			setSaving(true)
			await updateInternalMortgagePlan(id, {
				title: title.trim(),
				description: description.trim() || null,
			})
			toast({ title: "Plan updated" })
			router.push(`/admin/internal-mortgages/${id}`)
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Error"
			toast({ title: "Save failed", description: msg, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	if (!id) return null

	if (loading) {
		return (
			<div className="max-w-xl mx-auto flex justify-center py-16">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className="max-w-xl mx-auto space-y-6">
			<div>
				<Button variant="ghost" size="sm" asChild>
					<Link href={`/admin/internal-mortgages/${id}`}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Link>
				</Button>
				<h1 className="text-3xl font-bold mt-2">Edit internal mortgage plan</h1>
				<p className="text-muted-foreground text-sm mt-1">Title and description only; terms stay as configured.</p>
			</div>
			<form onSubmit={handleSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Details</CardTitle>
						<CardDescription>Visible label for admins and members</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
						</div>
					</CardContent>
				</Card>
				<div className="flex gap-3 mt-6">
					<Button type="button" variant="outline" asChild>
						<Link href={`/admin/internal-mortgages/${id}`}>Cancel</Link>
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
