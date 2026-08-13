"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getMemberRaReceipts } from "@/lib/api/resident-association"

export default function MemberRaReceiptsPage() {
	const { toast } = useToast()
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await getMemberRaReceipts({ per_page: 50 })
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load receipts", description: e?.message, variant: "destructive" })
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
					<h1 className="text-3xl font-bold">Receipts</h1>
					<p className="mt-1 text-muted-foreground">Issued documents for verified RA payments</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Receipts</CardTitle>
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
									<TableHead>Title</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Reference</TableHead>
									<TableHead>Date</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="text-center text-muted-foreground">
											No receipts yet
										</TableCell>
									</TableRow>
								) : (
									rows.map((row) => (
										<TableRow key={row.id}>
											<TableCell className="font-medium">{row.title || row.subject || "—"}</TableCell>
											<TableCell>{row.document_type || "—"}</TableCell>
											<TableCell>{row.reference_number || row.document_number || "—"}</TableCell>
											<TableCell>{row.created_at ? String(row.created_at).slice(0, 10) : "—"}</TableCell>
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
