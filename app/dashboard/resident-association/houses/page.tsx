"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getMemberRaHouses } from "@/lib/api/resident-association"

export default function MemberRaHousesPage() {
	const { toast } = useToast()
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await getMemberRaHouses()
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load houses", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void load()
	}, [load])

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-3xl font-bold">My Houses</h1>
					<p className="mt-1 text-muted-foreground">Allocations linked to resident association estates</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Houses</CardTitle>
				</CardHeader>
				<CardContent>
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
									<TableHead>Association</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center text-muted-foreground">
											No RA-linked houses found
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => (
										<TableRow key={row.id}>
											<TableCell className="font-medium">{row.property?.title || "—"}</TableCell>
											<TableCell>{row.property?.estate?.name || "—"}</TableCell>
											<TableCell>
												{(row.property?.estate?.associations || []).map((a: any) => a.name).join(", ") ||
													"—"}
											</TableCell>
											<TableCell>
												<Badge variant="secondary">{row.status || "—"}</Badge>
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
