"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle, Loader2, RefreshCw, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { listRaPayments, rejectRaPayment, verifyRaPayment } from "@/lib/api/resident-association"

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(amount) || 0)
}

function memberName(row: any) {
	const u = row.member?.user
	if (!u) return row.member?.member_number || "—"
	return `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email || "—"
}

export default function AdminRaPaymentsPage() {
	const { toast } = useToast()
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [status, setStatus] = useState("pending")
	const [q, setQ] = useState("")
	const [busyId, setBusyId] = useState<string | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const params: Record<string, string | number | boolean | undefined | null> = {
				per_page: 50,
				q: q || undefined,
			}
			if (status === "pending") params.pending_only = true
			else if (status !== "all") params.status = status
			const res = await listRaPayments(params)
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load payments", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [q, status, toast])

	useEffect(() => {
		const t = setTimeout(() => void load(), 250)
		return () => clearTimeout(t)
	}, [load])

	const verify = async (id: string) => {
		setBusyId(id)
		try {
			await verifyRaPayment(id)
			toast({ title: "Payment verified" })
			await load()
		} catch (e: any) {
			toast({ title: "Verify failed", description: e?.message, variant: "destructive" })
		} finally {
			setBusyId(null)
		}
	}

	const reject = async (id: string) => {
		const reason = window.prompt("Rejection reason")
		if (!reason?.trim()) return
		setBusyId(id)
		try {
			await rejectRaPayment(id, { reason: reason.trim() })
			toast({ title: "Payment rejected" })
			await load()
		} catch (e: any) {
			toast({ title: "Reject failed", description: e?.message, variant: "destructive" })
		} finally {
			setBusyId(null)
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
					<p className="text-sm text-muted-foreground">Verify or reject member payment declarations</p>
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
						<Label>Status</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pending">Pending verification</SelectItem>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="verified">Verified</SelectItem>
								<SelectItem value="rejected">Rejected</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1">
						<Label>Search</Label>
						<Input placeholder="Reference, member…" value={q} onChange={(e) => setQ(e.target.value)} />
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
									<TableHead>Reference</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center text-muted-foreground">
											No payments found
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => {
										const pending =
											row.status === "pending_verification" || row.status === "pending"
										return (
											<TableRow key={row.id}>
												<TableCell className="font-medium">{memberName(row)}</TableCell>
												<TableCell>{row.estate?.name || "—"}</TableCell>
												<TableCell>{formatCurrency(row.amount)}</TableCell>
												<TableCell>{row.bank_reference || "—"}</TableCell>
												<TableCell>
													{row.payment_date
														? String(row.payment_date).slice(0, 10)
														: row.created_at
															? String(row.created_at).slice(0, 10)
															: "—"}
												</TableCell>
												<TableCell>
													<Badge variant={pending ? "secondary" : row.status === "rejected" ? "destructive" : "default"}>
														{row.status || "—"}
													</Badge>
												</TableCell>
												<TableCell className="text-right space-x-2">
													{pending ? (
														<>
															<Button
																size="sm"
																disabled={busyId === row.id}
																onClick={() => void verify(row.id)}
															>
																{busyId === row.id ? (
																	<Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
																) : (
																	<CheckCircle className="mr-1 h-3.5 w-3.5" />
																)}
																Verify
															</Button>
															<Button
																size="sm"
																variant="outline"
																disabled={busyId === row.id}
																onClick={() => void reject(row.id)}
															>
																<XCircle className="mr-1 h-3.5 w-3.5" /> Reject
															</Button>
														</>
													) : null}
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
