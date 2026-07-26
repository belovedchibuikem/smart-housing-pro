"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, FileText, Loader2, Search, Settings2, ShieldCheck, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
	DOCUMENT_TYPE_LABELS,
	adminVerifyDocument,
	approveIssuedDocument,
	approveIssuedDocumentSignature,
	getIssuedDocumentsDashboard,
	rejectIssuedDocument,
	searchIssuedDocuments,
	type IssuedDocumentRow,
} from "@/lib/api/issued-documents"

export default function IssuedDocumentsDashboardPage() {
	const { toast } = useToast()
	const [stats, setStats] = useState({
		total: 0,
		issued: 0,
		pending_approval: 0,
		signed_pending: 0,
		revoked: 0,
	})
	const [recent, setRecent] = useState<IssuedDocumentRow[]>([])
	const [pendingQueue, setPendingQueue] = useState<IssuedDocumentRow[]>([])
	const [signedQueue, setSignedQueue] = useState<IssuedDocumentRow[]>([])
	const [analytics, setAnalytics] = useState<{
		total_scans: number
		success_scans: number
		failed_scans: number
		by_device?: Record<string, number>
		by_status?: Record<string, number>
	} | null>(null)
	const [loading, setLoading] = useState(true)
	const [searchQ, setSearchQ] = useState("")
	const [searchResults, setSearchResults] = useState<IssuedDocumentRow[]>([])
	const [verifyQ, setVerifyQ] = useState("")
	const [verifyResult, setVerifyResult] = useState<{
		success: boolean
		status: string
		public: Record<string, unknown> | null
	} | null>(null)

	const load = async () => {
		setLoading(true)
		try {
			const res = await getIssuedDocumentsDashboard()
			setStats({
				total: res.stats.total,
				issued: res.stats.issued,
				pending_approval: res.stats.pending_approval,
				signed_pending: (res.stats as { signed_pending?: number }).signed_pending || 0,
				revoked: res.stats.revoked,
			})
			setRecent(res.recent || [])
			setPendingQueue((res as { pending_queue?: IssuedDocumentRow[] }).pending_queue || [])
			setSignedQueue((res as { signed_queue?: IssuedDocumentRow[] }).signed_queue || [])
			setAnalytics((res as { verification_analytics?: typeof analytics }).verification_analytics || null)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void load()
	}, [])

	const runSearch = async () => {
		try {
			const res = await searchIssuedDocuments({ q: searchQ })
			setSearchResults(res.data || [])
		} catch (e) {
			toast({
				title: "Search failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	const runVerify = async () => {
		try {
			const res = await adminVerifyDocument(verifyQ)
			setVerifyResult({ success: res.success, status: res.status, public: res.public })
		} catch {
			setVerifyResult({ success: false, status: "not_found", public: null })
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Document Issuing</h1>
					<p className="text-muted-foreground">
						Issue official letters on your tenant letterhead, per house or land allocation.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button asChild>
						<Link href="/admin/bulk-upload/issued-documents">Bulk issue</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/admin/issued-documents/letterhead">
							<Settings2 className="h-4 w-4 mr-2" />
							Letterhead
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/admin/issued-documents/templates">
							<FileText className="h-4 w-4 mr-2" />
							Templates
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/verify">
							<ShieldCheck className="h-4 w-4 mr-2" />
							Public verify
						</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-5">
				{[
					{ label: "Total documents", value: stats.total },
					{ label: "Active / issued", value: stats.issued },
					{ label: "Pending approval", value: stats.pending_approval },
					{ label: "Signed awaiting accept", value: stats.signed_pending },
					{ label: "Revoked", value: stats.revoked },
				].map((item) => (
					<Card key={item.label}>
						<CardHeader className="pb-2">
							<CardDescription>{item.label}</CardDescription>
							<CardTitle className="text-3xl">{loading ? "—" : item.value}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Approval queue</CardTitle>
						<CardDescription>Documents waiting for officer approval</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{pendingQueue.length === 0 ? (
							<p className="text-sm text-muted-foreground">No pending approvals.</p>
						) : (
							pendingQueue.map((doc) => (
								<div key={doc.id} className="flex items-center justify-between gap-2 rounded border p-2 text-sm">
									<div>
										<div className="font-medium">{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.title}</div>
										<div className="text-xs text-muted-foreground">
											{doc.member_name} · {doc.reference_number}
										</div>
									</div>
									<div className="flex gap-1">
										<Button
											size="sm"
											variant="outline"
											onClick={async () => {
												await approveIssuedDocument(doc.id)
												toast({ title: "Approved" })
												await load()
											}}
										>
											<Check className="h-4 w-4" />
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onClick={async () => {
												const reason = window.prompt("Reason", "Needs correction")
												if (!reason) return
												await rejectIssuedDocument(doc.id, reason)
												toast({ title: "Rejected" })
												await load()
											}}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Signed acceptance queue</CardTitle>
						<CardDescription>Member-uploaded signed memoranda awaiting acceptance</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{signedQueue.length === 0 ? (
							<p className="text-sm text-muted-foreground">No signed documents awaiting acceptance.</p>
						) : (
							signedQueue.map((doc) => (
								<div key={doc.id} className="flex items-center justify-between gap-2 rounded border p-2 text-sm">
									<div>
										<div className="font-medium">{doc.title}</div>
										<div className="text-xs text-muted-foreground">{doc.member_name}</div>
									</div>
									<Button
										size="sm"
										onClick={async () => {
											await approveIssuedDocumentSignature(doc.id)
											toast({ title: "Signature accepted" })
											await load()
										}}
									>
										Accept
									</Button>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Search documents</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex gap-2">
							<Input
								value={searchQ}
								onChange={(e) => setSearchQ(e.target.value)}
								placeholder="Reference, document no, verification no…"
							/>
							<Button onClick={() => void runSearch()}>
								<Search className="h-4 w-4" />
							</Button>
						</div>
						{searchResults.map((doc) => (
							<div key={doc.id} className="rounded border p-2 text-sm">
								<div className="font-medium">{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.title}</div>
								<div className="text-xs text-muted-foreground">
									{doc.reference_number} · <Badge variant="secondary">{doc.status}</Badge>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Admin verification console</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex gap-2">
							<Input
								value={verifyQ}
								onChange={(e) => setVerifyQ(e.target.value)}
								placeholder="Paste verification / QR / reference"
							/>
							<Button onClick={() => void runVerify()}>Verify</Button>
						</div>
						{verifyResult && (
							<div className="rounded border p-3 text-sm space-y-1">
								<div className="font-semibold">
									{verifyResult.success ? "VERIFIED" : verifyResult.status.toUpperCase()}
								</div>
								{verifyResult.public &&
									Object.entries(verifyResult.public).map(([k, v]) => (
										<div key={k}>
											<span className="text-muted-foreground">{k}: </span>
											{String(v ?? "—")}
										</div>
									))}
							</div>
						)}
						{analytics && (
							<div className="grid grid-cols-3 gap-2 pt-2">
								<div className="rounded bg-muted p-2 text-center">
									<div className="text-lg font-semibold">{analytics.total_scans}</div>
									<div className="text-xs text-muted-foreground">Total scans</div>
								</div>
								<div className="rounded bg-muted p-2 text-center">
									<div className="text-lg font-semibold">{analytics.success_scans}</div>
									<div className="text-xs text-muted-foreground">Success</div>
								</div>
								<div className="rounded bg-muted p-2 text-center">
									<div className="text-lg font-semibold">{analytics.failed_scans}</div>
									<div className="text-xs text-muted-foreground">Failed</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent issues</CardTitle>
					<CardDescription>Latest official documents across all properties</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex items-center justify-center py-8 text-muted-foreground">
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Loading…
						</div>
					) : recent.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							No documents yet. Open a house or land subscription and use the Documents tab to issue one.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Type</TableHead>
									<TableHead>Member</TableHead>
									<TableHead>Reference</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recent.map((doc) => (
									<TableRow key={doc.id}>
										<TableCell>{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.title}</TableCell>
										<TableCell>{doc.member_name || "—"}</TableCell>
										<TableCell className="font-mono text-xs">{doc.reference_number}</TableCell>
										<TableCell>
											<Badge variant="secondary">{doc.status}</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
