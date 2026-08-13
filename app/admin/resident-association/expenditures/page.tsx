"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
	createRaExpenditure,
	listRaAssociations,
	listRaEstates,
	listRaExpenditures,
} from "@/lib/api/resident-association"

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(amount) || 0)
}

export default function AdminRaExpendituresPage() {
	const { toast } = useToast()
	const [rows, setRows] = useState<any[]>([])
	const [estates, setEstates] = useState<any[]>([])
	const [associations, setAssociations] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		association_id: "",
		estate_id: "",
		description: "",
		amount: "",
		expense_date: new Date().toISOString().slice(0, 10),
		category: "other",
		payee: "",
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
			const res = await listRaExpenditures({ per_page: 50 })
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load expenditures", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void loadMeta()
		void load()
	}, [load, loadMeta])

	const submit = async () => {
		if (!form.association_id || !form.estate_id || !form.description.trim() || !form.amount) {
			toast({ title: "Required fields missing", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			await createRaExpenditure({
				association_id: form.association_id,
				estate_id: form.estate_id,
				description: form.description.trim(),
				amount: Number(form.amount),
				expense_date: form.expense_date,
				category: form.category,
				payee: form.payee || undefined,
			})
			toast({ title: "Expenditure recorded" })
			setForm((f) => ({ ...f, description: "", amount: "", payee: "" }))
			await load()
		} catch (e: any) {
			toast({ title: "Save failed", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Expenditure</h1>
					<p className="text-sm text-muted-foreground">Record estate association spending</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Plus className="h-4 w-4" /> New expenditure
					</CardTitle>
					<CardDescription>Logged against an association and estate</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
					<div className="space-y-1">
						<Label>Description</Label>
						<Input
							value={form.description}
							onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
						/>
					</div>
					<div className="space-y-1">
						<Label>Amount</Label>
						<Input
							type="number"
							min="0.01"
							step="0.01"
							value={form.amount}
							onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
						/>
					</div>
					<div className="space-y-1">
						<Label>Date</Label>
						<Input
							type="date"
							value={form.expense_date}
							onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
						/>
					</div>
					<div className="space-y-1">
						<Label>Payee</Label>
						<Input value={form.payee} onChange={(e) => setForm((f) => ({ ...f, payee: e.target.value }))} />
					</div>
					<div className="flex items-end">
						<Button onClick={() => void submit()} disabled={saving}>
							{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							Save
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
									<TableHead>Date</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Estate</TableHead>
									<TableHead>Payee</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center text-muted-foreground">
											No expenditures found
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => (
										<TableRow key={row.id}>
											<TableCell>{String(row.expense_date || "").slice(0, 10) || "—"}</TableCell>
											<TableCell className="font-medium">{row.description}</TableCell>
											<TableCell>{row.estate?.name || "—"}</TableCell>
											<TableCell>{row.payee || "—"}</TableCell>
											<TableCell>{formatCurrency(row.amount)}</TableCell>
											<TableCell>
												<Badge variant="secondary">{row.status || "—"}</Badge>
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
