"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ClipboardList, Loader2, RefreshCw, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { listAdminChangeRequests, type ChangeRequest } from "@/lib/api/ownership"
import { Can } from "@/components/admin/can-permission"

function statusVariant(status?: string) {
	switch ((status || "").toUpperCase()) {
		case "EXECUTED":
		case "APPROVED":
			return "default" as const
		case "PENDING":
			return "secondary" as const
		case "REJECTED":
		case "EXPIRED":
		case "CANCELLED":
			return "destructive" as const
		default:
			return "outline" as const
	}
}

export default function ChangeRequestCenterPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [rows, setRows] = useState<ChangeRequest[]>([])
	const [search, setSearch] = useState("")
	const [status, setStatus] = useState("")

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await listAdminChangeRequests({ search, status, per_page: 50 })
			setRows(res.data?.data || [])
		} catch (e) {
			toast({ title: "Failed to load change requests", description: String(e), variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [search, status, toast])

	useEffect(() => {
		void load()
	}, [load])

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
						<ClipboardList className="h-6 w-6" />
						Change Request Center
					</h1>
					<p className="text-sm text-muted-foreground">
						Joint-ownership approvals, timelines, and executed property changes.
					</p>
				</div>
				<Can permission="view_change_requests">
					<Button variant="outline" onClick={() => void load()} disabled={loading}>
						{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
						<span className="ml-2">Refresh</span>
					</Button>
				</Can>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Filters</CardTitle>
					<CardDescription>Search by request number or action type</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					<div className="relative min-w-[220px] flex-1">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							className="pl-8"
							placeholder="Search…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<select
						className="h-10 rounded-md border bg-background px-3 text-sm"
						value={status}
						onChange={(e) => setStatus(e.target.value)}
					>
						<option value="">All statuses</option>
						{["PENDING", "APPROVED", "EXECUTED", "REJECTED", "CANCELLED", "EXPIRED"].map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Requests</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
							<Loader2 className="h-4 w-4 animate-spin" /> Loading…
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Request</TableHead>
									<TableHead>Asset</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Expires</TableHead>
									<TableHead />
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center text-muted-foreground py-8">
											No change requests found
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => (
										<TableRow key={row.id}>
											<TableCell className="font-medium">{row.request_number}</TableCell>
											<TableCell>
												{row.property?.title || row.land?.land_title || row.asset_type}
											</TableCell>
											<TableCell>{row.action_type}</TableCell>
											<TableCell>
												<Badge variant={statusVariant(row.status)}>{row.status}</Badge>
											</TableCell>
											<TableCell>
												{row.expires_at ? new Date(row.expires_at).toLocaleDateString() : "—"}
											</TableCell>
											<TableCell>
												<Button asChild variant="ghost" size="sm">
													<Link href={`/admin/change-requests/${row.id}`}>Open</Link>
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
