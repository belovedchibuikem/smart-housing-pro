"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
	createRaHouseLot,
	createRaHouseOccupant,
	listRaEstates,
	listRaHouseLots,
	listRaHouseOccupants,
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

export default function AdminRaHousesPage() {
	const { toast } = useToast()
	const [estates, setEstates] = useState<any[]>([])
	const [estateId, setEstateId] = useState<string>("all")
	const [q, setQ] = useState("")
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [active, setActive] = useState<any | null>(null)
	const [lots, setLots] = useState<any[]>([])
	const [occupants, setOccupants] = useState<any[]>([])
	const [detailLoading, setDetailLoading] = useState(false)
	const [lotLabel, setLotLabel] = useState("")
	const [occName, setOccName] = useState("")
	const [occPhone, setOccPhone] = useState("")
	const [occType, setOccType] = useState("additional")
	const [occPayer, setOccPayer] = useState(false)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		void listRaEstates({ per_page: 100 })
			.then((res) => setEstates(res.data || []))
			.catch(() => setEstates([]))
	}, [])

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await listRaHouses({
				per_page: 50,
				q: q || undefined,
				estate_id: estateId !== "all" ? estateId : undefined,
			})
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load houses", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [estateId, q, toast])

	useEffect(() => {
		const t = setTimeout(() => void load(), 250)
		return () => clearTimeout(t)
	}, [load])

	const openHouse = async (row: any) => {
		setActive(row)
		setDetailLoading(true)
		try {
			const [l, o] = await Promise.all([listRaHouseLots(row.id), listRaHouseOccupants(row.id)])
			setLots(l.data || [])
			setOccupants(o.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load house details", description: e?.message, variant: "destructive" })
		} finally {
			setDetailLoading(false)
		}
	}

	const addLot = async () => {
		if (!active || !lotLabel.trim()) return
		setSaving(true)
		try {
			await createRaHouseLot(active.id, { lot_label: lotLabel.trim() })
			setLotLabel("")
			const l = await listRaHouseLots(active.id)
			setLots(l.data || [])
			toast({ title: "Lot added" })
		} catch (e: any) {
			toast({ title: "Could not add lot", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const addOccupant = async () => {
		if (!active || !occName.trim()) return
		setSaving(true)
		try {
			await createRaHouseOccupant(active.id, {
				name: occName.trim(),
				phone: occPhone || undefined,
				occupant_type: occType,
				is_payer: occPayer,
			})
			setOccName("")
			setOccPhone("")
			setOccPayer(false)
			const o = await listRaHouseOccupants(active.id)
			setOccupants(o.data || [])
			toast({ title: "Occupant added" })
		} catch (e: any) {
			toast({ title: "Could not add occupant", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Houses</h1>
					<p className="text-sm text-muted-foreground">
						Properties in RA estates. Open a house to manage lots and occupants (including BQ / extra payers).
					</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Filters</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-2">
					<div className="space-y-1">
						<Label>Estate</Label>
						<Select value={estateId} onValueChange={setEstateId}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All estates</SelectItem>
								{estates.map((e) => (
									<SelectItem key={e.id} value={String(e.id)}>
										{e.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1">
						<Label>Search</Label>
						<Input placeholder="Title, location, member…" value={q} onChange={(e) => setQ(e.target.value)} />
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
									<TableHead>Property</TableHead>
									<TableHead>Estate</TableHead>
									<TableHead>Occupant</TableHead>
									<TableHead className="text-right">Outstanding</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center text-muted-foreground">
											No houses found
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => {
										const allottee = row.allocations?.[0]?.member
										const user = allottee?.user
										const name = user
											? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
											: allottee?.member_number || "—"
										return (
											<TableRow key={row.id}>
												<TableCell className="font-medium">{row.title || "—"}</TableCell>
												<TableCell>{row.estate?.name || "—"}</TableCell>
												<TableCell>{name}</TableCell>
												<TableCell className="text-right">{formatCurrency(row.outstanding)}</TableCell>
												<TableCell className="text-right">
													<Button size="sm" variant="outline" onClick={() => void openHouse(row)}>
														Lots & occupants
													</Button>
												</TableCell>
											</TableRow>
										)
									})
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Dialog open={Boolean(active)} onOpenChange={(open) => !open && setActive(null)}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>{active?.title || "House"}</DialogTitle>
						<DialogDescription>Lots, additional occupants, and extra payers for this property.</DialogDescription>
					</DialogHeader>
					{detailLoading ? (
						<div className="flex justify-center py-6">
							<Loader2 className="h-5 w-5 animate-spin" />
						</div>
					) : (
						<div className="space-y-5">
							<div>
								<div className="mb-2 text-sm font-medium">Lots</div>
								<ul className="mb-2 space-y-1 text-sm">
									{lots.length === 0 ? <li className="text-muted-foreground">No lots yet</li> : null}
									{lots.map((lot) => (
										<li key={lot.id}>{lot.lot_label}</li>
									))}
								</ul>
								<div className="flex gap-2">
									<Input
										placeholder="Lot label"
										value={lotLabel}
										onChange={(e) => setLotLabel(e.target.value)}
									/>
									<Button size="sm" disabled={saving} onClick={() => void addLot()}>
										Add
									</Button>
								</div>
							</div>
							<div>
								<div className="mb-2 text-sm font-medium">Occupants</div>
								<ul className="mb-2 space-y-1 text-sm">
									{occupants.length === 0 ? <li className="text-muted-foreground">No extra occupants</li> : null}
									{occupants.map((occ) => (
										<li key={occ.id}>
											{occ.name}
											{occ.phone ? ` · ${occ.phone}` : ""}
											{occ.is_payer ? " · payer" : ""}
											{occ.occupant_type ? ` · ${String(occ.occupant_type).replace(/_/g, " ")}` : ""}
										</li>
									))}
								</ul>
								<div className="grid gap-2">
									<Input placeholder="Name" value={occName} onChange={(e) => setOccName(e.target.value)} />
									<Input placeholder="Phone" value={occPhone} onChange={(e) => setOccPhone(e.target.value)} />
									<Select value={occType} onValueChange={setOccType}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="additional">Additional occupant</SelectItem>
											<SelectItem value="boys_quarters">Boys quarters</SelectItem>
										</SelectContent>
									</Select>
									<label className="flex items-center gap-2 text-sm">
										<Checkbox checked={occPayer} onCheckedChange={(v) => setOccPayer(Boolean(v))} />
										This occupant is a payer
									</label>
									<Button size="sm" disabled={saving} onClick={() => void addOccupant()}>
										Add occupant
									</Button>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
