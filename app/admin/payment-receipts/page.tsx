"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
	Download,
	FileText,
	Loader2,
	RefreshCw,
	Search,
	Settings2,
	ShieldCheck,
	Send,
	Ban,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
	downloadPaymentReceipt,
	exportPaymentReceipts,
	bulkReissuePaymentReceipts,
	getPaymentReceiptSettings,
	getPaymentReceiptsDashboard,
	resendPaymentReceipt,
	searchPaymentReceipts,
	updatePaymentReceiptSettings,
	verifyPaymentReceipt,
	voidPaymentReceipt,
	type PaymentReceiptRow,
	type PaymentReceiptSettings,
} from "@/lib/api/payment-receipts"

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
	if (["issued", "downloaded", "viewed", "signed", "accepted"].includes(status)) return "default"
	if (["revoked", "cancelled"].includes(status)) return "destructive"
	return "secondary"
}

async function triggerBlobDownload(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

export default function PaymentReceiptsPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [stats, setStats] = useState({ total: 0, today: 0, this_month: 0, this_year: 0, active: 0, revoked: 0 })
	const [receipts, setReceipts] = useState<PaymentReceiptRow[]>([])
	const [settings, setSettings] = useState<PaymentReceiptSettings | null>(null)
	const [searchQ, setSearchQ] = useState("")
	const [verifyQ, setVerifyQ] = useState("")
	const [verifyResult, setVerifyResult] = useState<{ success: boolean; status: string; document: Record<string, unknown> | null } | null>(null)
	const [settingsOpen, setSettingsOpen] = useState(false)
	const [savingSettings, setSavingSettings] = useState(false)
	const [reissuingLegacy, setReissuingLegacy] = useState(false)
	const [reissueProgress, setReissueProgress] = useState<string | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const [dash, list, settingsRes] = await Promise.all([
				getPaymentReceiptsDashboard(),
				searchPaymentReceipts({ per_page: 50 }),
				getPaymentReceiptSettings(),
			])
			setStats(dash.stats)
			setReceipts(list.data || dash.recent || [])
			setSettings(settingsRes.settings)
		} catch (e) {
			toast({ title: "Failed to load receipts", description: String(e), variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void load()
	}, [load])

	const runSearch = async () => {
		try {
			const res = await searchPaymentReceipts({ q: searchQ, per_page: 50 })
			setReceipts(res.data || [])
		} catch (e) {
			toast({ title: "Search failed", description: String(e), variant: "destructive" })
		}
	}

	const handleDownload = async (row: PaymentReceiptRow) => {
		try {
			const blob = await downloadPaymentReceipt(row.id)
			await triggerBlobDownload(blob, `${row.document_number}.pdf`)
		} catch (e) {
			toast({ title: "Download failed", description: String(e), variant: "destructive" })
		}
	}

	const handleExport = async () => {
		try {
			const blob = await exportPaymentReceipts("csv", searchQ ? { q: searchQ } : undefined)
			await triggerBlobDownload(blob, `payment-receipts-${new Date().toISOString().slice(0, 10)}.csv`)
		} catch (e) {
			toast({ title: "Export failed", description: String(e), variant: "destructive" })
		}
	}

	const handleBulkReissue = async () => {
		const confirmed = window.confirm(
			"Refresh active receipt PDFs with the current receipt design?\n\n" +
				"PDFs are regenerated in small batches on the same receipt records — no new receipt numbers " +
				"are created and the receipt count will not increase. Members are not notified.\n\n" +
				"This can take several minutes on large tenants; keep this tab open.",
		)
		if (!confirmed) return

		setReissuingLegacy(true)
		setReissueProgress("Starting…")
		try {
			const batchSize = 10
			let offset = 0
			let regenerated = 0
			let failed = 0
			let hasMore = true
			let catalogTotal: number | null = null
			const sampleFailures: string[] = []

			while (hasMore) {
				const res = await bulkReissuePaymentReceipts(batchSize, offset)
				regenerated += res.data.regenerated ?? res.data.reissued
				failed += res.data.failed
				catalogTotal = res.data.total ?? catalogTotal
				hasMore = Boolean(res.data.has_more)
				offset = res.data.next_offset ?? offset + batchSize

				for (const failure of res.data.failures ?? []) {
					if (sampleFailures.length < 3) {
						sampleFailures.push(failure.message)
					}
				}

				const through = res.data.processed_through ?? offset
				setReissueProgress(
					catalogTotal != null
						? `Refreshed ${through} of ${catalogTotal}… (${regenerated} ok, ${failed} failed)`
						: `Refreshed ${through}… (${regenerated} ok, ${failed} failed)`,
				)
			}

			toast({
				title: "Receipt PDFs refreshed",
				description:
					`${regenerated} PDF(s) regenerated, ${failed} failed. Receipt count unchanged.` +
					(sampleFailures.length ? ` First errors: ${sampleFailures.join("; ")}` : ""),
			})
			await load()
		} catch (e) {
			toast({
				title: "PDF refresh failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		} finally {
			setReissuingLegacy(false)
			setReissueProgress(null)
		}
	}

	const handleVerify = async () => {
		if (!verifyQ.trim()) return
		try {
			const res = await verifyPaymentReceipt(verifyQ.trim())
			setVerifyResult(res)
		} catch {
			setVerifyResult({ success: false, status: "not_found", document: null })
		}
	}

	const saveSettings = async () => {
		if (!settings) return
		setSavingSettings(true)
		try {
			const res = await updatePaymentReceiptSettings(settings)
			setSettings(res.settings)
			toast({ title: "Receipt settings saved" })
			setSettingsOpen(false)
		} catch (e) {
			toast({ title: "Save failed", description: String(e), variant: "destructive" })
		} finally {
			setSavingSettings(false)
		}
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold">Payment Receipts</h1>
					<p className="text-muted-foreground text-sm">
						Official payment receipts — auto-generated after every successful payment, property-scoped.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
						<RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
					<Button variant="outline" size="sm" onClick={() => void handleExport()}>
						<Download className="h-4 w-4 mr-2" />
						Export CSV
					</Button>
					<Button variant="outline" size="sm" onClick={() => void handleBulkReissue()} disabled={reissuingLegacy}>
						{reissuingLegacy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
						{reissueProgress ?? "Refresh receipt PDFs"}
					</Button>
					<Button variant="outline" size="sm" onClick={() => setSettingsOpen((v) => !v)}>
						<Settings2 className="h-4 w-4 mr-2" />
						Settings
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link href="/admin/issued-documents">All Documents</Link>
					</Button>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
				{[
					["Total", stats.total],
					["Today", stats.today],
					["This Month", stats.this_month],
					["This Year", stats.this_year],
					["Active", stats.active],
					["Revoked", stats.revoked],
				].map(([label, value]) => (
					<Card key={String(label)}>
						<CardHeader className="pb-2">
							<CardDescription>{label}</CardDescription>
							<CardTitle className="text-2xl">{value}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>

			{settingsOpen && settings && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Receipt Settings</CardTitle>
						<CardDescription>
							Logo, signature, and stamp come from Letterhead and Housing Certificate settings.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label>Receipt Prefix</Label>
							<Input
								value={settings.receipt_prefix}
								onChange={(e) => setSettings({ ...settings, receipt_prefix: e.target.value })}
								placeholder="FRSC"
							/>
						</div>
						<div className="space-y-2">
							<Label>Number Format</Label>
							<Input
								value={settings.receipt_number_format}
								onChange={(e) => setSettings({ ...settings, receipt_number_format: e.target.value })}
								placeholder="{PREFIX}-RCP-{YEAR}-{SERIAL}"
							/>
						</div>
						<div className="space-y-2">
							<Label>Theme Color</Label>
							<Input
								type="color"
								value={settings.receipt_theme_color || "#1B5E20"}
								onChange={(e) => setSettings({ ...settings, receipt_theme_color: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label>Footer Text</Label>
							<Input
								value={settings.receipt_footer_text || ""}
								onChange={(e) => setSettings({ ...settings, receipt_footer_text: e.target.value })}
							/>
						</div>
						<div className="flex items-center justify-between sm:col-span-2">
							<div>
								<Label>Enable Public Receipt Verification</Label>
								<p className="text-muted-foreground text-xs">When off, public verify portal hides receipts.</p>
							</div>
							<Switch
								checked={settings.receipt_enable_public_verification}
								onCheckedChange={(v) =>
									setSettings({ ...settings, receipt_enable_public_verification: v })
								}
							/>
						</div>
						<div className="sm:col-span-2">
							<Button onClick={() => void saveSettings()} disabled={savingSettings}>
								{savingSettings && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Save Settings
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Search Receipts</CardTitle>
					</CardHeader>
					<CardContent className="flex gap-2">
						<Input
							value={searchQ}
							onChange={(e) => setSearchQ(e.target.value)}
							placeholder="Receipt number, verification code, reference…"
							onKeyDown={(e) => e.key === "Enter" && void runSearch()}
						/>
						<Button onClick={() => void runSearch()}>
							<Search className="h-4 w-4" />
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Verify Receipt</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex gap-2">
							<Input
								value={verifyQ}
								onChange={(e) => setVerifyQ(e.target.value)}
								placeholder="Verification or receipt number"
							/>
							<Button variant="outline" onClick={() => void handleVerify()}>
								<ShieldCheck className="h-4 w-4" />
							</Button>
						</div>
						{verifyResult && (
							<p className={`text-sm font-medium ${verifyResult.success ? "text-emerald-700" : "text-red-700"}`}>
								{verifyResult.success ? "Receipt Valid" : verifyResult.status.toUpperCase()}
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<FileText className="h-4 w-4" />
						Receipt Ledger
					</CardTitle>
					<CardDescription>Newest first — each payment generates its own permanent receipt.</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex justify-center py-8 text-muted-foreground">
							<Loader2 className="h-5 w-5 animate-spin mr-2" />
							Loading…
						</div>
					) : receipts.length === 0 ? (
						<p className="text-muted-foreground text-sm py-6 text-center">No payment receipts yet.</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Receipt No.</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Member</TableHead>
									<TableHead>Property</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{receipts.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="font-mono text-xs">{row.document_number}</TableCell>
										<TableCell>{row.issued_at ? new Date(row.issued_at).toLocaleDateString() : "—"}</TableCell>
										<TableCell>{row.member_name || "—"}</TableCell>
										<TableCell>
											{row.plot_number ? `Plot ${row.plot_number}` : "—"}
											{row.estate_name ? ` · ${row.estate_name}` : ""}
										</TableCell>
										<TableCell>{row.payment_category || "—"}</TableCell>
										<TableCell className="font-medium">{row.payment_amount || "—"}</TableCell>
										<TableCell>
											<Badge variant={statusVariant(row.status)}>{row.status}</Badge>
										</TableCell>
										<TableCell className="text-right space-x-1">
											<Button variant="ghost" size="icon" onClick={() => void handleDownload(row)} title="Download">
												<Download className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => void resendPaymentReceipt(row.id).then(() => toast({ title: "Notification sent" }))}
												title="Resend"
											>
												<Send className="h-4 w-4" />
											</Button>
											{row.status !== "revoked" && (
												<Button
													variant="ghost"
													size="icon"
													onClick={() => {
														const reason = prompt("Reason for voiding this receipt:")
														if (reason) void voidPaymentReceipt(row.id, reason).then(() => load())
													}}
													title="Void"
												>
													<Ban className="h-4 w-4" />
												</Button>
											)}
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
