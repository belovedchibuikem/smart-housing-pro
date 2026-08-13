"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { listRaEstates, listRaHouses } from "@/lib/api/resident-association"

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

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Houses</h1>
					<p className="text-sm text-muted-foreground">Properties in RA estates with outstanding dues</p>
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
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center text-muted-foreground">
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
											</TableRow>
										)
									})
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
