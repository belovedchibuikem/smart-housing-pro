"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { listRaDiscrepancies, listRaEstates } from "@/lib/api/resident-association"

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(amount) || 0)
}

export default function AdminRaDiscrepanciesPage() {
	const { toast } = useToast()
	const [estates, setEstates] = useState<any[]>([])
	const [estateId, setEstateId] = useState("all")
	const [status, setStatus] = useState("all")
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
			const res = await listRaDiscrepancies({
				per_page: 50,
				estate_id: estateId !== "all" ? estateId : undefined,
				status: status !== "all" ? status : undefined,
			})
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load discrepancies", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [estateId, status, toast])

	useEffect(() => {
		void load()
	}, [load])

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Payment discrepancies</h1>
					<p className="text-sm text-muted-foreground">
						Member reports are routed to Digital Office. Resolve them from the workflow task.
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
						<Label>Status</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="open">Open</SelectItem>
								<SelectItem value="resolved">Resolved</SelectItem>
								<SelectItem value="rejected">Rejected</SelectItem>
							</SelectContent>
						</Select>
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
									<TableHead>Member</TableHead>
									<TableHead>Estate</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Message</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center text-muted-foreground">
											No discrepancies
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => {
										const user = row.member?.user
										const name = user
											? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
											: row.member?.member_number || "—"
										return (
											<TableRow key={row.id}>
												<TableCell className="font-medium">{name}</TableCell>
												<TableCell>{row.estate?.name || "—"}</TableCell>
												<TableCell>{row.amount != null ? formatCurrency(row.amount) : "—"}</TableCell>
												<TableCell className="max-w-sm truncate">{row.message || "—"}</TableCell>
												<TableCell>
													<Badge
														variant={
															row.status === "open"
																? "secondary"
																: row.status === "rejected"
																	? "destructive"
																	: "default"
														}
													>
														{row.status || "—"}
													</Badge>
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
		</div>
	)
}
