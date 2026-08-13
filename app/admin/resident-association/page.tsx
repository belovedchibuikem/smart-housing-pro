"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getRaEstateDashboard, listRaEstates } from "@/lib/api/resident-association"

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(amount) || 0)
}

export default function AdminRaDashboardPage() {
	const { toast } = useToast()
	const [estates, setEstates] = useState<any[]>([])
	const [estateId, setEstateId] = useState<string>("")
	const [summary, setSummary] = useState<any | null>(null)
	const [loadingEstates, setLoadingEstates] = useState(true)
	const [loadingSummary, setLoadingSummary] = useState(false)

	const loadEstates = useCallback(async () => {
		setLoadingEstates(true)
		try {
			const res = await listRaEstates({ per_page: 100 })
			const rows = res.data || []
			setEstates(rows)
			if (!estateId && rows[0]?.id) setEstateId(String(rows[0].id))
		} catch (e: any) {
			toast({ title: "Failed to load estates", description: e?.message, variant: "destructive" })
		} finally {
			setLoadingEstates(false)
		}
	}, [estateId, toast])

	const loadSummary = useCallback(async (id: string) => {
		if (!id) {
			setSummary(null)
			return
		}
		setLoadingSummary(true)
		try {
			const res = await getRaEstateDashboard(id, { year: new Date().getFullYear() })
			setSummary(res.data || null)
		} catch (e: any) {
			setSummary(null)
			toast({ title: "Failed to load revenue summary", description: e?.message, variant: "destructive" })
		} finally {
			setLoadingSummary(false)
		}
	}, [toast])

	useEffect(() => {
		void loadEstates()
	}, [loadEstates])

	useEffect(() => {
		if (estateId) void loadSummary(estateId)
	}, [estateId, loadSummary])

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Resident Association</h1>
					<p className="text-sm text-muted-foreground">Estate list and revenue summary</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => void loadEstates()}>
						<RefreshCw className="mr-2 h-4 w-4" /> Refresh
					</Button>
					<Button asChild>
						<Link href="/admin/resident-association/payments">Pending payments</Link>
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Select estate</CardTitle>
					<CardDescription>Choose an estate to view collected vs outstanding revenue</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="space-y-1">
						<Label>Estate</Label>
						<Select value={estateId} onValueChange={setEstateId} disabled={loadingEstates}>
							<SelectTrigger>
								<SelectValue placeholder={loadingEstates ? "Loading…" : "Select estate"} />
							</SelectTrigger>
							<SelectContent>
								{estates.map((e) => (
									<SelectItem key={e.id} value={String(e.id)}>
										{e.name}
										{e.code ? ` (${e.code})` : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{loadingSummary ? (
				<div className="flex min-h-[160px] items-center justify-center">
					<Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
				</div>
			) : summary ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Expected</CardTitle>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">{formatCurrency(summary.expected_revenue)}</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">{formatCurrency(summary.collected_revenue)}</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">{formatCurrency(summary.outstanding_revenue)}</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">{formatCurrency(summary.balance)}</CardContent>
					</Card>
				</div>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Estates</CardTitle>
				</CardHeader>
				<CardContent>
					{loadingEstates ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Code</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Associations</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{estates.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center text-muted-foreground">
											No estates available
										</TableCell>
									</TableRow>
								) : (
									estates.map((e) => (
										<TableRow key={e.id}>
											<TableCell className="font-medium">{e.name}</TableCell>
											<TableCell>{e.code || "—"}</TableCell>
											<TableCell>{e.location || e.city || "—"}</TableCell>
											<TableCell>
												{(e.associations || []).map((a: any) => a.name).join(", ") || "—"}
											</TableCell>
											<TableCell className="text-right">
												<Button variant="ghost" size="sm" onClick={() => setEstateId(String(e.id))}>
													View summary
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
