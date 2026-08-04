"use client"

import { useCallback, useEffect, useState } from "react"
import { Calculator, Download, Loader2, RefreshCw, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
	downloadValuationReport,
	runPropertyValuation,
	searchValuations,
	type ValuationRow,
} from "@/lib/api/valuations"
import { Can } from "@/components/admin/can-permission"

function money(n?: number | null) {
	if (n == null || Number.isNaN(Number(n))) return "—"
	return `₦${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export default function ValuationsAdminPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [rows, setRows] = useState<ValuationRow[]>([])
	const [search, setSearch] = useState("")
	const [propertyId, setPropertyId] = useState("")
	const [running, setRunning] = useState(false)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await searchValuations({ search, per_page: 50 })
			setRows(res.data || [])
		} catch (e) {
			toast({ title: "Failed to load valuations", description: String(e), variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [search, toast])

	useEffect(() => {
		void load()
	}, [load])

	const run = async () => {
		if (!propertyId.trim()) {
			toast({ title: "Enter a property ID", variant: "destructive" })
			return
		}
		setRunning(true)
		try {
			await runPropertyValuation(propertyId.trim())
			toast({ title: "Valuation completed" })
			await load()
		} catch (e) {
			toast({ title: "Valuation failed", description: String(e), variant: "destructive" })
		} finally {
			setRunning(false)
		}
	}

	const downloadReport = async (id: string) => {
		try {
			const blob = await downloadValuationReport(id)
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = `valuation-${id}.pdf`
			a.click()
			URL.revokeObjectURL(url)
		} catch (e) {
			toast({ title: "Report download failed", description: String(e), variant: "destructive" })
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Property Valuations</h1>
					<p className="text-muted-foreground text-sm">
						Hybrid market, comparable, AI, and rule-based valuations
					</p>
				</div>
				<Button variant="outline" onClick={() => void load()} disabled={loading}>
					{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
					<span className="ml-2">Refresh</span>
				</Button>
			</div>

			<Can permission="run_valuation|view_valuations">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Run valuation</CardTitle>
						<CardDescription>Trigger a hybrid valuation for a property UUID</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-3">
						<div className="min-w-[240px] flex-1 space-y-1">
							<Label htmlFor="propertyId">Property ID</Label>
							<Input
								id="propertyId"
								value={propertyId}
								onChange={(e) => setPropertyId(e.target.value)}
								placeholder="Property UUID"
							/>
						</div>
						<div className="flex items-end">
							<Button onClick={() => void run()} disabled={running}>
								{running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
								Value property
							</Button>
						</div>
					</CardContent>
				</Card>
			</Can>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
					<div>
						<CardTitle className="text-base">Recent valuations</CardTitle>
						<CardDescription>{rows.length} records</CardDescription>
					</div>
					<div className="flex gap-2">
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search method / recommendation"
							className="w-56"
						/>
						<Button variant="secondary" onClick={() => void load()}>
							<Search className="h-4 w-4" />
						</Button>
					</div>
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
									<TableHead>Asset</TableHead>
									<TableHead>Value</TableHead>
									<TableHead>Confidence</TableHead>
									<TableHead>Growth</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Date</TableHead>
									<TableHead className="text-right">Report</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} className="text-muted-foreground text-center">
											No valuations yet.
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => (
										<TableRow key={row.id}>
											<TableCell className="font-medium">
												{row.asset_type || "property"}
												<div className="text-muted-foreground text-xs">
													{(row.property_id || row.land_id || "").slice(0, 8)}…
												</div>
											</TableCell>
											<TableCell>{money(row.estimated_value ?? row.current_value)}</TableCell>
											<TableCell>{row.confidence_score ?? "—"}%</TableCell>
											<TableCell>
												{row.predicted_growth != null ? `${Number(row.predicted_growth).toFixed(1)}%` : "—"}
											</TableCell>
											<TableCell>
												<Badge variant="secondary">{row.status}</Badge>
											</TableCell>
											<TableCell className="text-sm">
												{row.valuation_date ? new Date(row.valuation_date).toLocaleDateString() : "—"}
											</TableCell>
											<TableCell className="text-right">
												<Button size="sm" variant="ghost" onClick={() => void downloadReport(row.id)}>
													<Download className="h-4 w-4" />
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
