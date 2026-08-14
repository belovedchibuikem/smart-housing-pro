"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	SearchableSelect,
	type SearchableSelectOption,
} from "@/components/ui/searchable-select"
import { useToast } from "@/hooks/use-toast"
import {
	assignRaAssociationEstates,
	createRaAssociation,
	listRaAssociations,
	listRaEstates,
	registerRaExecutive,
	removeRaExecutive,
} from "@/lib/api/resident-association"
import { getOfficeStaffUsers } from "@/lib/api/office"

const TITLES = ["Chairman", "Secretary", "Treasurer", "Vice Chairman", "Ex-Officio", "Executive"]

function personName(user?: { first_name?: string; last_name?: string; email?: string } | null) {
	if (!user) return "—"
	const name = `${user.first_name || ""} ${user.last_name || ""}`.trim()
	return name || user.email || "—"
}

export default function AdminRaAssociationsPage() {
	const { toast } = useToast()
	const [rows, setRows] = useState<any[]>([])
	const [estates, setEstates] = useState<any[]>([])
	const [staffOptions, setStaffOptions] = useState<SearchableSelectOption[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [q, setQ] = useState("")
	const [form, setForm] = useState({ name: "", code: "", status: "active" })
	const [createEstateIds, setCreateEstateIds] = useState<string[]>([])
	const [active, setActive] = useState<any | null>(null)
	const [estateIds, setEstateIds] = useState<string[]>([])
	const [staffId, setStaffId] = useState("")
	const [execTitle, setExecTitle] = useState("Chairman")
	const [newExec, setNewExec] = useState({
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
		password: "",
		title: "Chairman",
	})
	const [tempPassword, setTempPassword] = useState<string | null>(null)

	const loadEstates = useCallback(async () => {
		try {
			const res = await listRaEstates({ per_page: 200 })
			setEstates(res.data || [])
		} catch {
			setEstates([])
		}
	}, [])

	const loadStaff = useCallback(async (query = "") => {
		try {
			const users = await getOfficeStaffUsers(query || undefined, { excludeSelf: false })
			const options = (users.data || []).map((u) => ({
				value: u.id,
				label: u.name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
				description: u.email,
				searchText: [u.name, u.email, u.first_name, u.last_name].filter(Boolean).join(" "),
			}))
			setStaffOptions(options)
			return options
		} catch {
			return []
		}
	}, [])

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
		void loadEstates()
		void loadStaff()
	}, [loadEstates, loadStaff])

	useEffect(() => {
		const t = setTimeout(() => void load(), 250)
		return () => clearTimeout(t)
	}, [load])

	const toggleId = (list: string[], id: string, on: boolean) =>
		on ? Array.from(new Set([...list, id])) : list.filter((x) => x !== id)

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
				estate_ids: createEstateIds,
			})
			toast({ title: "Association created" })
			setForm({ name: "", code: "", status: "active" })
			setCreateEstateIds([])
			await load()
		} catch (e: any) {
			toast({ title: "Create failed", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const openManage = (row: any) => {
		setActive(row)
		setEstateIds((row.estates || []).map((e: any) => String(e.id)))
		setStaffId("")
		setTempPassword(null)
		setNewExec({
			first_name: "",
			last_name: "",
			email: "",
			phone: "",
			password: "",
			title: "Chairman",
		})
	}

	const saveEstates = async () => {
		if (!active) return
		setSaving(true)
		try {
			const res = await assignRaAssociationEstates(active.id, estateIds)
			setActive(res.data)
			toast({ title: "Estates assigned" })
			await load()
		} catch (e: any) {
			toast({ title: "Could not assign estates", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const assignExisting = async () => {
		if (!active || !staffId) {
			toast({ title: "Select a staff user", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			const res = await registerRaExecutive(active.id, {
				user_id: staffId,
				title: execTitle,
			})
			setActive(res.data)
			setStaffId("")
			toast({ title: "Executive assigned" })
			await load()
		} catch (e: any) {
			toast({ title: "Could not assign executive", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const registerNew = async () => {
		if (!active) return
		if (!newExec.first_name.trim() || !newExec.last_name.trim() || !newExec.email.trim()) {
			toast({ title: "First name, last name and email are required", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			const res = await registerRaExecutive(active.id, {
				first_name: newExec.first_name.trim(),
				last_name: newExec.last_name.trim(),
				email: newExec.email.trim(),
				phone: newExec.phone.trim() || undefined,
				password: newExec.password.trim() || undefined,
				title: newExec.title,
			})
			setActive(res.data)
			setTempPassword(res.executive?.temporary_password || null)
			setNewExec({
				first_name: "",
				last_name: "",
				email: "",
				phone: "",
				password: "",
				title: "Chairman",
			})
			toast({
				title: "Executive registered",
				description: res.executive?.temporary_password
					? "Copy the temporary password below and share it with the executive."
					: "They can sign in with their existing staff account.",
			})
			await load()
		} catch (e: any) {
			toast({ title: "Could not register executive", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const removeExec = async (userId: string) => {
		if (!active) return
		setSaving(true)
		try {
			const res = await removeRaExecutive(active.id, userId)
			setActive(res.data)
			toast({ title: "Executive removed" })
			await load()
		} catch (e: any) {
			toast({ title: "Could not remove executive", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const executives = useMemo(() => active?.users || [], [active])

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Associations</h1>
					<p className="text-sm text-muted-foreground">
						Create the association, assign estates, then register executives. Executives only see those estates.
					</p>
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
					<CardDescription>Assign estates now, or add them later when you register executives.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-3 md:grid-cols-3">
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
					</div>
					<div className="space-y-2">
						<Label>Estates for this association</Label>
						<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 rounded-md border p-3 max-h-48 overflow-auto">
							{estates.length === 0 ? (
								<p className="text-sm text-muted-foreground">No estates found. Create estates first.</p>
							) : (
								estates.map((estate) => (
									<label key={estate.id} className="flex items-center gap-2 text-sm">
										<Checkbox
											checked={createEstateIds.includes(String(estate.id))}
											onCheckedChange={(v) =>
												setCreateEstateIds((ids) => toggleId(ids, String(estate.id), Boolean(v)))
											}
										/>
										{estate.name}
									</label>
								))
							)}
						</div>
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
									<TableHead>Executives</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center text-muted-foreground">
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
											<TableCell>
												{(row.users || [])
													.map((u: any) => u.title || personName(u.user))
													.join(", ") || "—"}
											</TableCell>
											<TableCell className="text-right">
												<Button size="sm" variant="outline" onClick={() => openManage(row)}>
													Estates & executives
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
				<DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{active?.name || "Association"}</DialogTitle>
						<DialogDescription>
							Assign estates first. Then register an executive or attach existing staff. Dedicated executives only
							see the estates on this association.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6">
						<section className="space-y-3">
							<h3 className="text-sm font-medium">Estates</h3>
							<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 rounded-md border p-3 max-h-56 overflow-auto">
								{estates.map((estate) => (
									<label key={estate.id} className="flex items-center gap-2 text-sm">
										<Checkbox
											checked={estateIds.includes(String(estate.id))}
											onCheckedChange={(v) =>
												setEstateIds((ids) => toggleId(ids, String(estate.id), Boolean(v)))
											}
										/>
										{estate.name}
									</label>
								))}
							</div>
							<Button size="sm" disabled={saving} onClick={() => void saveEstates()}>
								Save estates
							</Button>
						</section>

						<section className="space-y-3">
							<h3 className="text-sm font-medium">Current executives</h3>
							{executives.length === 0 ? (
								<p className="text-sm text-muted-foreground">None yet.</p>
							) : (
								<ul className="space-y-2">
									{executives.map((row: any) => (
										<li
											key={row.id || row.user_id}
											className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
										>
											<div>
												<div className="font-medium">{personName(row.user)}</div>
												<div className="text-muted-foreground">
													{[row.title, row.user?.email].filter(Boolean).join(" · ")}
												</div>
											</div>
											<Button
												size="sm"
												variant="outline"
												disabled={saving}
												onClick={() => void removeExec(row.user_id || row.user?.id)}
											>
												Remove
											</Button>
										</li>
									))}
								</ul>
							)}
						</section>

						<section className="space-y-3">
							<h3 className="text-sm font-medium">Assign existing staff</h3>
							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1">
									<Label>Staff user</Label>
									<SearchableSelect
										value={staffId}
										onValueChange={setStaffId}
										options={staffOptions}
										onSearch={loadStaff}
										allowEmpty
										placeholder="Search staff…"
									/>
								</div>
								<div className="space-y-1">
									<Label>Title</Label>
									<Select value={execTitle} onValueChange={setExecTitle}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{TITLES.map((t) => (
												<SelectItem key={t} value={t}>
													{t}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<Button size="sm" disabled={saving} onClick={() => void assignExisting()}>
								Assign staff
							</Button>
						</section>

						<section className="space-y-3">
							<h3 className="text-sm font-medium">Register a new executive</h3>
							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1">
									<Label>First name</Label>
									<Input
										value={newExec.first_name}
										onChange={(e) => setNewExec((f) => ({ ...f, first_name: e.target.value }))}
									/>
								</div>
								<div className="space-y-1">
									<Label>Last name</Label>
									<Input
										value={newExec.last_name}
										onChange={(e) => setNewExec((f) => ({ ...f, last_name: e.target.value }))}
									/>
								</div>
								<div className="space-y-1">
									<Label>Email</Label>
									<Input
										type="email"
										value={newExec.email}
										onChange={(e) => setNewExec((f) => ({ ...f, email: e.target.value }))}
									/>
								</div>
								<div className="space-y-1">
									<Label>Phone</Label>
									<Input
										value={newExec.phone}
										onChange={(e) => setNewExec((f) => ({ ...f, phone: e.target.value }))}
									/>
								</div>
								<div className="space-y-1">
									<Label>Title</Label>
									<Select
										value={newExec.title}
										onValueChange={(v) => setNewExec((f) => ({ ...f, title: v }))}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{TITLES.map((t) => (
												<SelectItem key={t} value={t}>
													{t}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1">
									<Label>Password (optional)</Label>
									<Input
										type="password"
										placeholder="Leave blank to auto-generate"
										value={newExec.password}
										onChange={(e) => setNewExec((f) => ({ ...f, password: e.target.value }))}
									/>
								</div>
							</div>
							<Button size="sm" disabled={saving} onClick={() => void registerNew()}>
								Register executive
							</Button>
							{tempPassword ? (
								<div className="rounded-md border bg-muted/40 p-3 text-sm">
									<p className="font-medium">Temporary password</p>
									<p className="mt-1 font-mono break-all">{tempPassword}</p>
									<p className="mt-1 text-muted-foreground">
										Share this once. They should change it after first login.
									</p>
								</div>
							) : null}
						</section>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
