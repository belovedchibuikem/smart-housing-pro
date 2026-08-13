"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getMemberRaNotices } from "@/lib/api/resident-association"

export default function MemberRaNoticesPage() {
	const { toast } = useToast()
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await getMemberRaNotices({ per_page: 50 })
			setRows(res.data || [])
		} catch (e: any) {
			toast({ title: "Failed to load notices", description: e?.message, variant: "destructive" })
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
					<h1 className="text-3xl font-bold">Notices</h1>
					<p className="mt-1 text-muted-foreground">Published notices from your resident association</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Notices</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : rows.length === 0 ? (
						<p className="py-6 text-center text-sm text-muted-foreground">No notices available</p>
					) : (
						<div className="space-y-4">
							{rows.map((row) => (
								<div key={row.id} className="rounded-md border p-4">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<h2 className="font-semibold">{row.title}</h2>
										<div className="flex items-center gap-2">
											{row.estate?.name ? <Badge variant="secondary">{row.estate.name}</Badge> : null}
											<span className="text-xs text-muted-foreground">
												{row.publish_at
													? String(row.publish_at).slice(0, 10)
													: row.created_at
														? String(row.created_at).slice(0, 10)
														: ""}
											</span>
										</div>
									</div>
									<p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{row.body}</p>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
