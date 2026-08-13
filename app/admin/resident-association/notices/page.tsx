"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Megaphone, Plus, RefreshCw, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
	createRaNotice,
	listRaAssociations,
	listRaEstates,
	listRaNotices,
	publishRaNotice,
} from "@/lib/api/resident-association"

export default function AdminRaNoticesPage() {
	const { toast } = useToast()
	const [rows, setRows] = useState<any[]>([])
	const [estates, setEstates] = useState<any[]>([])
	const [associations, setAssociations] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		association_id: "",
		estate_id: "",
		title: "",
		body: "",
		publish_now: true,
	})

	const loadMeta = useCallback(async () => {
		try {
			const [e, a] = await Promise.all([
				listRaEstates({ per_page: 100 }),
				listRaAssociations({ per_page: 100 }),
			])
			setEstates(e.data || [])
			setAssociations(a.data || [])
		} catch {
			/* ignore */
		}
	}, [])

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await listRaNotices({ per_page: 50 })
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load notices", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void loadMeta()
		void load()
	}, [load, loadMeta])

	const submit = async () => {
		if (!form.association_id || !form.estate_id || !form.title.trim() || !form.body.trim()) {
			toast({ title: "Association, estate, title and body are required", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			await createRaNotice({
				association_id: form.association_id,
				estate_id: form.estate_id,
				title: form.title.trim(),
				body: form.body.trim(),
				publish_now: form.publish_now,
			})
			toast({ title: form.publish_now ? "Notice published" : "Notice saved" })
			setForm((f) => ({ ...f, title: "", body: "" }))
			await load()
		} catch (e: any) {
			toast({ title: "Save failed", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const publish = async (id: string) => {
		try {
			await publishRaNotice(id)
			toast({ title: "Published" })
			await load()
		} catch (e: any) {
			toast({ title: "Publish failed", description: e?.message, variant: "destructive" })
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Notices</h1>
					<p className="text-sm text-muted-foreground">Estate notices for resident association members</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Plus className="h-4 w-4" /> Compose notice
					</CardTitle>
					<CardDescription>Draft or publish immediately</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-2">
					<div className="space-y-1">
						<Label>Association</Label>
						<Select
							value={form.association_id}
							onValueChange={(v) => setForm((f) => ({ ...f, association_id: v }))}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent>
								{associations.map((a) => (
									<SelectItem key={a.id} value={String(a.id)}>
										{a.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1">
						<Label>Estate</Label>
						<Select value={form.estate_id} onValueChange={(v) => setForm((f) => ({ ...f, estate_id: v }))}>
							<SelectTrigger>
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent>
								{estates.map((e) => (
									<SelectItem key={e.id} value={String(e.id)}>
										{e.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1 md:col-span-2">
						<Label>Title</Label>
						<Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
					</div>
					<div className="space-y-1 md:col-span-2">
						<Label>Body</Label>
						<Textarea
							rows={4}
							value={form.body}
							onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
						/>
					</div>
					<div className="flex items-center gap-2">
						<input
							id="publish_now"
							type="checkbox"
							checked={form.publish_now}
							onChange={(e) => setForm((f) => ({ ...f, publish_now: e.target.checked }))}
						/>
						<Label htmlFor="publish_now">Publish now</Label>
					</div>
					<div>
						<Button onClick={() => void submit()} disabled={saving}>
							{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Megaphone className="mr-2 h-4 w-4" />}
							Save notice
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-6">
					{loading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Estate</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center text-muted-foreground">
											No notices found
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => (
										<TableRow key={row.id}>
											<TableCell className="font-medium">{row.title}</TableCell>
											<TableCell>{row.estate?.name || "—"}</TableCell>
											<TableCell>
												<Badge variant={row.status === "published" ? "default" : "secondary"}>
													{row.status || "—"}
												</Badge>
											</TableCell>
											<TableCell>{row.created_at ? String(row.created_at).slice(0, 10) : "—"}</TableCell>
											<TableCell className="text-right">
												{row.status !== "published" ? (
													<Button size="sm" variant="outline" onClick={() => void publish(row.id)}>
														<Send className="mr-1 h-3.5 w-3.5" /> Publish
													</Button>
												) : null}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
