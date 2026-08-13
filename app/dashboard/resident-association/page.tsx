"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getMemberRaDashboard } from "@/lib/api/resident-association"

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(amount) || 0)
}

export default function MemberRaDashboardPage() {
	const { toast } = useToast()
	const [summary, setSummary] = useState<any | null>(null)
	const [loading, setLoading] = useState(true)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await getMemberRaDashboard()
			setSummary(res.data || null)
		} catch (e: any) {
			toast({ title: "Failed to load commitment summary", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void load()
	}, [load])

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-3xl font-bold">Resident Association</h1>
					<p className="mt-1 text-muted-foreground">
						Your commitment summary{summary?.year ? ` for ${summary.year}` : ""}
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => void load()}>
						<RefreshCw className="mr-2 h-4 w-4" /> Refresh
					</Button>
					<Button asChild>
						<Link href="/dashboard/resident-association/payments">Declare payment</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total commitment</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(summary?.total_commitment || 0)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(summary?.paid || 0)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">Pending verification</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(summary?.pending_verification || 0)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(summary?.outstanding || 0)}</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>By charge</CardTitle>
					<CardDescription>Breakdown of commitments by charge type</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Charge</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Paid</TableHead>
								<TableHead>Pending</TableHead>
								<TableHead>Outstanding</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{(summary?.lines || []).length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center text-muted-foreground">
										No commitment lines for this year
									</TableCell>
								</TableRow>
							) : (
								(summary?.lines || []).map((line: any) => (
									<TableRow key={line.charge_id || line.name}>
										<TableCell className="font-medium">{line.name || "—"}</TableCell>
										<TableCell>{formatCurrency(line.amount)}</TableCell>
										<TableCell>{formatCurrency(line.paid)}</TableCell>
										<TableCell>{formatCurrency(line.pending_verification)}</TableCell>
										<TableCell>{formatCurrency(line.outstanding)}</TableCell>
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
