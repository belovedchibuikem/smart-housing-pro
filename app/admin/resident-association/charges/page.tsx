"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Plus, RefreshCw, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
	createRaCharge,
	generateRaChargeObligations,
	listRaAssociations,
	listRaCharges,
	listRaEstates,
	listRaHouses,
} from "@/lib/api/resident-association"

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(amount) || 0)
}

export default function AdminRaChargesPage() {
	const { toast } = useToast()
	const [rows, setRows] = useState<any[]>([])
	const [estates, setEstates] = useState<any[]>([])
	const [associations, setAssociations] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		association_id: "",
		estate_id: "",
		name: "",
		amount: "",
		frequency: "annual",
		house_property_id: "",
		house_amount: "",
	})
	const [houses, setHouses] = useState<any[]>([])

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
			const res = await listRaCharges({ per_page: 50 })
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load charges", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void loadMeta()
		void load()
	}, [load, loadMeta])

	useEffect(() => {
		if (!form.estate_id) {
			setHouses([])
			return
		}
		void listRaHouses({ estate_id: form.estate_id, per_page: 100 })
			.then((res) => setHouses(res.data || []))
			.catch(() => setHouses([]))
	}, [form.estate_id])

	const submit = async () => {
		if (!form.association_id || !form.estate_id || !form.name.trim() || !form.amount) {
			toast({ title: "Association, estate, name and amount are required", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			await createRaCharge({
				association_id: form.association_id,
				estate_id: form.estate_id,
				name: form.name.trim(),
				amount: Number(form.amount),
				frequency: form.frequency,
				generate_obligations: true,
				house_rates:
					form.house_property_id && form.house_amount
						? [
								{
									property_id: form.house_property_id,
									amount: Number(form.house_amount),
									estate_id: form.estate_id,
								},
							]
						: undefined,
			})
			toast({ title: "Charge created" })
			setForm((f) => ({ ...f, name: "", amount: "", house_property_id: "", house_amount: "" }))
			await load()
		} catch (e: any) {
			toast({ title: "Create failed", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const generate = async (id: string) => {
		try {
			await generateRaChargeObligations(id)
			toast({ title: "Obligations generated" })
			await load()
		} catch (e: any) {
			toast({ title: "Generate failed", description: e?.message, variant: "destructive" })
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Charges</h1>
					<p className="text-sm text-muted-foreground">Estate dues and obligation generation</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Plus className="h-4 w-4" /> New charge
					</CardTitle>
					<CardDescription>Creates a charge and optionally generates obligations</CardDescription>
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
						<Label>Name</Label>
						<Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
					</div>
					<div className="space-y-1">
						<Label>Amount</Label>
						<Input
							type="number"
							min="0"
							step="0.01"
							value={form.amount}
							onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
						/>
					</div>
					<div className="space-y-1">
						<Label>Frequency</Label>
						<Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{["one_time", "monthly", "quarterly", "annual", "custom"].map((f) => (
									<SelectItem key={f} value={f}>
										{f.replaceAll("_", " ")}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1">
						<Label>House-specific amount (optional)</Label>
						<Select
							value={form.house_property_id || "none"}
							onValueChange={(v) => setForm((f) => ({ ...f, house_property_id: v === "none" ? "" : v }))}
						>
							<SelectTrigger>
								<SelectValue placeholder="All houses use default amount" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">All houses (default amount)</SelectItem>
								{houses.map((h) => (
									<SelectItem key={h.id} value={String(h.id)}>
										{h.title || h.id}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{form.house_property_id ? (
						<div className="space-y-1">
							<Label>Override amount for selected house</Label>
							<Input
								type="number"
								min="0"
								step="0.01"
								value={form.house_amount}
								onChange={(e) => setForm((f) => ({ ...f, house_amount: e.target.value }))}
							/>
						</div>
					) : null}
					<div className="flex items-end">
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
									<TableHead>Name</TableHead>
									<TableHead>Estate</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Frequency</TableHead>
									<TableHead>Status</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center text-muted-foreground">
											No charges found
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => (
										<TableRow key={row.id}>
											<TableCell className="font-medium">{row.name}</TableCell>
											<TableCell>{row.estate?.name || "—"}</TableCell>
											<TableCell>{formatCurrency(row.amount)}</TableCell>
											<TableCell>{row.frequency || "—"}</TableCell>
											<TableCell>
												<Badge variant="secondary">{row.status || "—"}</Badge>
											</TableCell>
											<TableCell className="text-right">
												<Button variant="outline" size="sm" onClick={() => void generate(row.id)}>
													<Sparkles className="mr-1 h-3.5 w-3.5" /> Obligations
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
