"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { createRaAssociation, listRaAssociations } from "@/lib/api/resident-association"

export default function AdminRaAssociationsPage() {
	const { toast } = useToast()
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [q, setQ] = useState("")
	const [form, setForm] = useState({ name: "", code: "", status: "active" })

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await listRaAssociations({ per_page: 50, q: q || undefined })
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load associations", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [q, toast])

	useEffect(() => {
		const t = setTimeout(() => void load(), 250)
		return () => clearTimeout(t)
	}, [load])

	const submit = async () => {
		if (!form.name.trim()) {
			toast({ title: "Name is required", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			await createRaAssociation({
				name: form.name.trim(),
				code: form.code.trim() || undefined,
				status: form.status,
			})
			toast({ title: "Association created" })
			setForm({ name: "", code: "", status: "active" })
			await load()
		} catch (e: any) {
			toast({ title: "Create failed", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Associations</h1>
					<p className="text-sm text-muted-foreground">Resident association orgs linked to estates</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Plus className="h-4 w-4" /> New association
					</CardTitle>
					<CardDescription>Create an association, then assign estates from the API or later screens</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-3">
					<div className="space-y-1">
						<Label>Name</Label>
						<Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
					</div>
					<div className="space-y-1">
						<Label>Code</Label>
						<Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
					</div>
					<div className="flex items-end">
						<Button onClick={() => void submit()} disabled={saving}>
							{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							Create
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
					<CardTitle className="text-base">All associations</CardTitle>
					<Input
						className="max-w-xs"
						placeholder="Search name or code…"
						value={q}
						onChange={(e) => setQ(e.target.value)}
					/>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Code</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Estates</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center text-muted-foreground">
											No associations found
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => (
										<TableRow key={row.id}>
											<TableCell className="font-medium">{row.name}</TableCell>
											<TableCell>{row.code || "—"}</TableCell>
											<TableCell>
												<Badge variant={row.status === "active" ? "default" : "secondary"}>
													{row.status || "—"}
												</Badge>
											</TableCell>
											<TableCell>
												{(row.estates || []).map((e: any) => e.name).join(", ") || "—"}
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
