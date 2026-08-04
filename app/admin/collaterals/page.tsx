"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Plus, RefreshCw, ShieldCheck } from "lucide-react"
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
	createCollateral,
	listCollateralContracts,
	searchCollaterals,
	verifyCollateral,
	type CollateralContractRow,
	type CollateralRow,
} from "@/lib/api/collaterals"
import { Can } from "@/components/admin/can-permission"

const TYPES = ["land", "house", "apartment", "vehicle", "document", "equipment", "digital_asset", "other"]

export default function CollateralsAdminPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [rows, setRows] = useState<CollateralRow[]>([])
	const [contracts, setContracts] = useState<CollateralContractRow[]>([])
	const [form, setForm] = useState({
		name: "",
		collateral_type: "land",
		estimated_value: "",
		description: "",
		owner_member_id: "",
	})
	const [saving, setSaving] = useState(false)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const [list, contractList] = await Promise.all([
				searchCollaterals({ per_page: 50 }),
				listCollateralContracts({ per_page: 20 }),
			])
			setRows(list.data || [])
			setContracts(contractList.data || [])
		} catch (e) {
			toast({ title: "Failed to load collateral", description: String(e), variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void load()
	}, [load])

	const create = async () => {
		if (!form.name.trim()) {
			toast({ title: "Name is required", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			await createCollateral({
				name: form.name,
				collateral_type: form.collateral_type,
				estimated_value: form.estimated_value ? Number(form.estimated_value) : undefined,
				description: form.description || undefined,
				owner_member_id: form.owner_member_id || undefined,
			})
			toast({ title: "Collateral created" })
			setForm({ name: "", collateral_type: "land", estimated_value: "", description: "", owner_member_id: "" })
			await load()
		} catch (e) {
			toast({ title: "Create failed", description: String(e), variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const setStatus = async (id: string, status: string) => {
		try {
			await verifyCollateral(id, { status })
			toast({ title: `Marked ${status}` })
			await load()
		} catch (e) {
			toast({ title: "Update failed", description: String(e), variant: "destructive" })
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Investment Collateral</h1>
					<p className="text-muted-foreground text-sm">Verify assets that secure collateral investments</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Can permission="create_collateral">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Register collateral</CardTitle>
						<CardDescription>Only verified collateral can secure investments</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 md:grid-cols-2">
						<div className="space-y-1">
							<Label>Name</Label>
							<Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
						</div>
						<div className="space-y-1">
							<Label>Type</Label>
							<Select
								value={form.collateral_type}
								onValueChange={(v) => setForm((f) => ({ ...f, collateral_type: v }))}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{TYPES.map((t) => (
										<SelectItem key={t} value={t}>
											{t.replaceAll("_", " ")}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label>Estimated value</Label>
							<Input
								type="number"
								value={form.estimated_value}
								onChange={(e) => setForm((f) => ({ ...f, estimated_value: e.target.value }))}
							/>
						</div>
						<div className="space-y-1">
							<Label>Owner member ID</Label>
							<Input
								value={form.owner_member_id}
								onChange={(e) => setForm((f) => ({ ...f, owner_member_id: e.target.value }))}
								placeholder="Optional UUID"
							/>
						</div>
						<div className="space-y-1 md:col-span-2">
							<Label>Description</Label>
							<Textarea
								value={form.description}
								onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
							/>
						</div>
						<div>
							<Button onClick={() => void create()} disabled={saving}>
								{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
								Create
							</Button>
						</div>
					</CardContent>
				</Card>
			</Can>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Collateral register</CardTitle>
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
									<TableHead>Name</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Value</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="font-medium">{row.name}</TableCell>
										<TableCell>{row.collateral_type}</TableCell>
										<TableCell>
											{row.market_value ?? row.estimated_value
												? `₦${Number(row.market_value ?? row.estimated_value).toLocaleString()}`
												: "—"}
										</TableCell>
										<TableCell>
											<Badge variant="secondary">{row.verification_status}</Badge>
										</TableCell>
										<TableCell className="space-x-1 text-right">
											<Can permission="verify_collateral">
												<Button size="sm" variant="outline" onClick={() => void setStatus(row.id, "verified")}>
													<ShieldCheck className="mr-1 h-3 w-3" /> Verify
												</Button>
												<Button size="sm" variant="ghost" onClick={() => void setStatus(row.id, "rejected")}>
													Reject
												</Button>
											</Can>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Collateral contracts</CardTitle>
					<CardDescription>Linked investment agreements</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Collateral</TableHead>
								<TableHead>Investment</TableHead>
								<TableHead>Principal</TableHead>
								<TableHead>Risk</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{contracts.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-muted-foreground text-center">
										No contracts yet.
									</TableCell>
								</TableRow>
							) : (
								contracts.map((c) => (
									<TableRow key={c.id}>
										<TableCell>{c.collateral?.name || c.collateral_id.slice(0, 8)}</TableCell>
										<TableCell className="text-xs">{c.investment_id.slice(0, 8)}…</TableCell>
										<TableCell>
											{c.principal_amount != null ? `₦${Number(c.principal_amount).toLocaleString()}` : "—"}
										</TableCell>
										<TableCell>{c.default_risk || "—"}</TableCell>
										<TableCell>
											<Badge variant="outline">{c.status}</Badge>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
