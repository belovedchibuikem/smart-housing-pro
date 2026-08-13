"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function AdminRaRevenuePage() {
	const { toast } = useToast()
	const [estates, setEstates] = useState<any[]>([])
	const [estateId, setEstateId] = useState("")
	const [summary, setSummary] = useState<any | null>(null)
	const [loading, setLoading] = useState(true)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await listRaEstates({ per_page: 100 })
			const rows = res.data || []
			setEstates(rows)
			const id = estateId || (rows[0]?.id ? String(rows[0].id) : "")
			if (!estateId && id) setEstateId(id)
			if (id) {
				const dash = await getRaEstateDashboard(id, { year: new Date().getFullYear() })
				setSummary(dash.data || null)
			}
		} catch (e: any) {
			toast({ title: "Failed to load revenue", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [estateId, toast])

	useEffect(() => {
		void load()
	}, [load])

	useEffect(() => {
		if (!estateId) return
		void getRaEstateDashboard(estateId, { year: new Date().getFullYear() })
			.then((res) => setSummary(res.data || null))
			.catch((e: any) =>
				toast({ title: "Failed to load estate revenue", description: e?.message, variant: "destructive" })
			)
	}, [estateId, toast])

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Revenue</h1>
					<p className="text-sm text-muted-foreground">Collected, outstanding, and expenditure balance</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Estate</CardTitle>
					<CardDescription>Revenue figures for the selected estate</CardDescription>
				</CardHeader>
				<CardContent className="max-w-md space-y-1">
					<Label>Select estate</Label>
					<Select value={estateId} onValueChange={setEstateId}>
						<SelectTrigger>
							<SelectValue placeholder="Select estate" />
						</SelectTrigger>
						<SelectContent>
							{estates.map((e) => (
								<SelectItem key={e.id} value={String(e.id)}>
									{e.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{loading && !summary ? (
				<div className="flex min-h-[160px] items-center justify-center">
					<Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
				</div>
			) : summary ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
							<CardTitle className="text-sm font-medium text-muted-foreground">Pending verification</CardTitle>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">{formatCurrency(summary.pending_verification)}</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Expenditure</CardTitle>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">{formatCurrency(summary.expenditure)}</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">{formatCurrency(summary.balance)}</CardContent>
					</Card>
				</div>
			) : (
				<p className="text-sm text-muted-foreground">Select an estate to view revenue.</p>
			)}
		</div>
	)
}
