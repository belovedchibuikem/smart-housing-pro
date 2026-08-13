"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"
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
	createRaBankAccount,
	deleteRaBankAccount,
	listRaAssociations,
	listRaBankAccounts,
	listRaEstates,
} from "@/lib/api/resident-association"

export default function AdminRaBankAccountsPage() {
	const { toast } = useToast()
	const [rows, setRows] = useState<any[]>([])
	const [associations, setAssociations] = useState<any[]>([])
	const [estates, setEstates] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		association_id: "",
		estate_id: "",
		bank_name: "",
		account_name: "",
		account_number: "",
		payment_instructions: "",
		payment_contact: "",
	})

	const loadMeta = useCallback(async () => {
		try {
			const [a, e] = await Promise.all([
				listRaAssociations({ per_page: 100 }),
				listRaEstates({ per_page: 100 }),
			])
			setAssociations(a.data || [])
			setEstates(e.data || [])
		} catch {
			/* ignore */
		}
	}, [])

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await listRaBankAccounts({ per_page: 50 })
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load bank accounts", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void loadMeta()
		void load()
	}, [load, loadMeta])

	const submit = async () => {
		if (!form.association_id || !form.bank_name || !form.account_name || !form.account_number) {
			toast({ title: "Association and account details are required", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			await createRaBankAccount({
				association_id: form.association_id,
				estate_id: form.estate_id || undefined,
				bank_name: form.bank_name.trim(),
				account_name: form.account_name.trim(),
				account_number: form.account_number.trim(),
				payment_instructions: form.payment_instructions || undefined,
				payment_contact: form.payment_contact || undefined,
			})
			toast({ title: "Bank account created" })
			setForm({
				association_id: form.association_id,
				estate_id: "",
				bank_name: "",
				account_name: "",
				account_number: "",
				payment_instructions: "",
				payment_contact: "",
			})
			await load()
		} catch (e: any) {
			toast({ title: "Create failed", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const remove = async (id: string) => {
		if (!window.confirm("Delete this bank account?")) return
		try {
			await deleteRaBankAccount(id)
			toast({ title: "Deleted" })
			await load()
		} catch (e: any) {
			toast({ title: "Delete failed", description: e?.message, variant: "destructive" })
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Bank Accounts</h1>
					<p className="text-sm text-muted-foreground">Payment destinations shown to members</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Plus className="h-4 w-4" /> New bank account
					</CardTitle>
					<CardDescription>Optional estate scoping; leave blank for association-wide</CardDescription>
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
						<Label>Estate (optional)</Label>
						<Select
							value={form.estate_id || "none"}
							onValueChange={(v) => setForm((f) => ({ ...f, estate_id: v === "none" ? "" : v }))}
						>
							<SelectTrigger>
								<SelectValue placeholder="Association-wide" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">Association-wide</SelectItem>
								{estates.map((e) => (
									<SelectItem key={e.id} value={String(e.id)}>
										{e.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1">
						<Label>Bank name</Label>
						<Input
							value={form.bank_name}
							onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
						/>
					</div>
					<div className="space-y-1">
						<Label>Account name</Label>
						<Input
							value={form.account_name}
							onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))}
						/>
					</div>
					<div className="space-y-1">
						<Label>Account number</Label>
						<Input
							value={form.account_number}
							onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))}
						/>
					</div>
					<div className="space-y-1">
						<Label>Payment contact</Label>
						<Input
							value={form.payment_contact}
							onChange={(e) => setForm((f) => ({ ...f, payment_contact: e.target.value }))}
						/>
					</div>
					<div className="space-y-1 md:col-span-2">
						<Label>Payment instructions</Label>
						<Textarea
							value={form.payment_instructions}
							onChange={(e) => setForm((f) => ({ ...f, payment_instructions: e.target.value }))}
						/>
					</div>
					<div>
						<Button onClick={() => void submit()} disabled={saving}>
							{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							Create
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
									<TableHead>Bank</TableHead>
									<TableHead>Account</TableHead>
									<TableHead>Association</TableHead>
									<TableHead>Estate</TableHead>
									<TableHead>Status</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center text-muted-foreground">
											No bank accounts found
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => (
										<TableRow key={row.id}>
											<TableCell className="font-medium">{row.bank_name}</TableCell>
											<TableCell>
												<div>{row.account_name}</div>
												<div className="text-xs text-muted-foreground">{row.account_number}</div>
											</TableCell>
											<TableCell>{row.association?.name || "—"}</TableCell>
											<TableCell>{row.estate?.name || "All"}</TableCell>
											<TableCell>
												<Badge variant={row.is_active ? "default" : "secondary"}>
													{row.is_active ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<Button variant="ghost" size="sm" onClick={() => void remove(row.id)}>
													<Trash2 className="h-4 w-4" />
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
		</div>
	)
}
