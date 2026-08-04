"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Megaphone, RefreshCw, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
	createAnnouncement,
	publishAnnouncement,
	searchAnnouncements,
	type AnnouncementRow,
} from "@/lib/api/announcements"
import { Can } from "@/components/admin/can-permission"

const CATEGORIES = [
	"new_investment_plans",
	"new_properties",
	"new_lands",
	"new_houses",
	"company_news",
	"maintenance",
	"promotions",
	"emergency",
	"general_updates",
	"events",
	"documents",
	"policy_changes",
]

export default function AnnouncementsAdminPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [rows, setRows] = useState<AnnouncementRow[]>([])
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		title: "",
		category: "general_updates",
		priority: "normal",
		summary: "",
		body: "",
		show_banner: false,
		show_popup: false,
		is_pinned: false,
		publish_now: true,
	})

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await searchAnnouncements({ per_page: 50 })
			setRows(res.data || [])
		} catch (e) {
			toast({ title: "Failed to load announcements", description: String(e), variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void load()
	}, [load])

	const submit = async () => {
		if (!form.title.trim()) {
			toast({ title: "Title is required", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			await createAnnouncement({
				...form,
				channels: ["web", "in_app", "email"],
				audience_filters: ["everyone"],
			})
			toast({ title: form.publish_now ? "Announcement published" : "Announcement saved as draft" })
			setForm({
				title: "",
				category: "general_updates",
				priority: "normal",
				summary: "",
				body: "",
				show_banner: false,
				show_popup: false,
				is_pinned: false,
				publish_now: true,
			})
			await load()
		} catch (e) {
			toast({ title: "Save failed", description: String(e), variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const publish = async (id: string) => {
		try {
			await publishAnnouncement(id)
			toast({ title: "Published" })
			await load()
		} catch (e) {
			toast({ title: "Publish failed", description: String(e), variant: "destructive" })
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Public Notices</h1>
					<p className="text-muted-foreground text-sm">Announcements across web, in-app, and email</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Can permission="create_announcement|publish_announcement">
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<Megaphone className="h-4 w-4" /> Compose announcement
						</CardTitle>
						<CardDescription>Immediate publish or save as draft</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 md:grid-cols-2">
						<div className="space-y-1 md:col-span-2">
							<Label>Title</Label>
							<Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
						</div>
						<div className="space-y-1">
							<Label>Category</Label>
							<Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map((c) => (
										<SelectItem key={c} value={c}>
											{c.replaceAll("_", " ")}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label>Priority</Label>
							<Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{["low", "normal", "high", "emergency"].map((p) => (
										<SelectItem key={p} value={p}>
											{p}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1 md:col-span-2">
							<Label>Summary</Label>
							<Input value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
						</div>
						<div className="space-y-1 md:col-span-2">
							<Label>Body</Label>
							<Textarea
								rows={5}
								value={form.body}
								onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
							/>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								checked={form.show_banner}
								onCheckedChange={(v) => setForm((f) => ({ ...f, show_banner: v }))}
							/>
							<Label>Show banner</Label>
						</div>
						<div className="flex items-center gap-2">
							<Switch checked={form.show_popup} onCheckedChange={(v) => setForm((f) => ({ ...f, show_popup: v }))} />
							<Label>Show popup</Label>
						</div>
						<div className="flex items-center gap-2">
							<Switch checked={form.is_pinned} onCheckedChange={(v) => setForm((f) => ({ ...f, is_pinned: v }))} />
							<Label>Pinned</Label>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								checked={form.publish_now}
								onCheckedChange={(v) => setForm((f) => ({ ...f, publish_now: v }))}
							/>
							<Label>Publish immediately</Label>
						</div>
						<div className="md:col-span-2">
							<Button onClick={() => void submit()} disabled={saving}>
								{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
								{form.publish_now ? "Publish" : "Save draft"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</Can>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">All announcements</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
							<Loader2 className="h-4 w-4 animate-spin" /> Loading…
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Priority</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="font-medium">{row.title}</TableCell>
										<TableCell>{row.category.replaceAll("_", " ")}</TableCell>
										<TableCell>{row.priority}</TableCell>
										<TableCell>
											<Badge variant={row.status === "published" ? "default" : "secondary"}>{row.status}</Badge>
										</TableCell>
										<TableCell className="text-right">
											{row.status !== "published" && (
												<Can permission="publish_announcement">
													<Button size="sm" variant="outline" onClick={() => void publish(row.id)}>
														Publish
													</Button>
												</Can>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
