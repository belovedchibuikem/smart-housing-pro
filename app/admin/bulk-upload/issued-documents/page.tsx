"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Search } from "lucide-react"
import { useBulkUploadPermission } from "@/lib/admin/bulk-upload-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import {
	DOCUMENT_TYPE_LABELS,
	executeBulkIssueDocuments,
	listBulkIssueCandidates,
	listDocumentTemplates,
	previewBulkIssueDocuments,
	type BulkIssueCandidate,
	type BulkIssuePagination,
	type BulkIssuePreviewRow,
} from "@/lib/api/issued-documents"

type AssetTypeFilter = "all" | "house" | "land"

const PER_PAGE = 50
const EXECUTE_CHUNK = 100

export default function BulkIssuedDocumentsPage() {
	const canUpload = useBulkUploadPermission("issued-documents")
	const { toast } = useToast()

	const [searchInput, setSearchInput] = useState("")
	const [search, setSearch] = useState("")
	const [assetType, setAssetType] = useState<AssetTypeFilter>("all")
	const [status, setStatus] = useState("all")
	const [propertyId, setPropertyId] = useState("")
	const [landId, setLandId] = useState("")
	const [documentType, setDocumentType] = useState("provisional_offer_letter")
	const [missingOnly, setMissingOnly] = useState(true)
	const [requireApproval, setRequireApproval] = useState(false)
	const [notifyMembers, setNotifyMembers] = useState(false)
	const [templates, setTemplates] = useState<Array<{ document_type: string; name: string }>>([])
	const [page, setPage] = useState(1)
	const [candidates, setCandidates] = useState<BulkIssueCandidate[]>([])
	const [pagination, setPagination] = useState<BulkIssuePagination>({
		page: 1,
		per_page: PER_PAGE,
		total: 0,
		last_page: 1,
	})
	const [meta, setMeta] = useState<{ scanned_houses?: number; scanned_lands?: number } | null>(null)
	const [loading, setLoading] = useState(false)
	const [selected, setSelected] = useState<Record<string, BulkIssueCandidate>>({})
	const [previewRows, setPreviewRows] = useState<BulkIssuePreviewRow[] | null>(null)
	const [previewCounts, setPreviewCounts] = useState({
		will_issue_count: 0,
		skipped_count: 0,
		invalid_count: 0,
	})
	const [previewing, setPreviewing] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [executing, setExecuting] = useState(false)
	const [executeProgress, setExecuteProgress] = useState("")
	const [executeTotals, setExecuteTotals] = useState<{
		issued: number
		skipped: number
		failed: number
		results: BulkIssuePreviewRow[]
	} | null>(null)
	const [selectingAll, setSelectingAll] = useState(false)

	const selectedList = useMemo(() => Object.values(selected), [selected])
	const selectedCount = selectedList.length
	const selectedKeys = useMemo(() => selectedList.map((r) => r.row_key), [selectedList])

	const documentTypeOptions = useMemo(() => {
		if (templates.length > 0) {
			return templates.map((t) => ({
				value: t.document_type,
				label: DOCUMENT_TYPE_LABELS[t.document_type] || t.name || t.document_type,
			}))
		}
		return Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))
	}, [templates])

	const loadTemplates = useCallback(async () => {
		try {
			const res = await listDocumentTemplates()
			setTemplates((res.templates || []).filter((t) => t.is_active))
		} catch {
			// Fall back to static labels
		}
	}, [])

	const loadCandidates = useCallback(async () => {
		setLoading(true)
		setPreviewRows(null)
		setExecuteTotals(null)
		try {
			const res = await listBulkIssueCandidates({
				search,
				asset_type: assetType,
				property_id: propertyId,
				land_id: landId,
				status,
				missing_document_type: missingOnly ? documentType : undefined,
				page,
				per_page: PER_PAGE,
			})
			setCandidates(res.data?.candidates ?? [])
			setPagination(
				res.data?.pagination ?? {
					page,
					per_page: PER_PAGE,
					total: 0,
					last_page: 1,
				},
			)
			setMeta(res.data?.meta ?? null)
		} catch (e) {
			toast({
				variant: "destructive",
				title: "Failed to load holdings",
				description: e instanceof Error ? e.message : "Unknown error",
			})
			setCandidates([])
			setMeta(null)
		} finally {
			setLoading(false)
		}
	}, [search, assetType, propertyId, landId, status, missingOnly, documentType, page, toast])

	useEffect(() => {
		void loadTemplates()
	}, [loadTemplates])

	useEffect(() => {
		const t = setTimeout(() => {
			setSearch(searchInput.trim())
			setPage(1)
		}, 350)
		return () => clearTimeout(t)
	}, [searchInput])

	useEffect(() => {
		void loadCandidates()
	}, [loadCandidates])

	const pageSelectedCount = candidates.filter((c) => selected[c.row_key]).length
	const allPageSelected = candidates.length > 0 && pageSelectedCount === candidates.length

	const toggleRow = (row: BulkIssueCandidate, checked: boolean) => {
		setSelected((prev) => {
			const next = { ...prev }
			if (checked) next[row.row_key] = row
			else delete next[row.row_key]
			return next
		})
	}

	const togglePage = (checked: boolean) => {
		setSelected((prev) => {
			const next = { ...prev }
			candidates.forEach((c) => {
				if (checked) next[c.row_key] = c
				else delete next[c.row_key]
			})
			return next
		})
	}

	const clearSelection = () => setSelected({})

	const selectAllMatching = async () => {
		setSelectingAll(true)
		try {
			const res = await listBulkIssueCandidates({
				search,
				asset_type: assetType,
				property_id: propertyId,
				land_id: landId,
				status,
				missing_document_type: missingOnly ? documentType : undefined,
				page: 1,
				per_page: PER_PAGE,
				keys_only: true,
			})
			const list = res.data?.candidates ?? []
			const next: Record<string, BulkIssueCandidate> = {}
			list.forEach((c) => {
				next[c.row_key] = c
			})
			setSelected(next)
			toast({
				title: "Selection updated",
				description: `${list.length} holding(s) selected across all filtered pages`,
			})
		} catch (e) {
			toast({
				variant: "destructive",
				title: "Could not select all",
				description: e instanceof Error ? e.message : "Unknown error",
			})
		} finally {
			setSelectingAll(false)
		}
	}

	const handlePreview = async () => {
		if (selectedCount === 0) {
			toast({ variant: "destructive", title: "Select at least one holding" })
			return
		}
		if (!documentType) {
			toast({ variant: "destructive", title: "Choose a document type" })
			return
		}

		setPreviewing(true)
		setExecuteTotals(null)
		try {
			const res = await previewBulkIssueDocuments({
				keys: selectedKeys,
				document_type: documentType,
			})
			setPreviewRows(res.data.rows)
			setPreviewCounts({
				will_issue_count: res.data.will_issue_count,
				skipped_count: res.data.skipped_count,
				invalid_count: res.data.invalid_count,
			})
			toast({
				title: "Preview ready",
				description: `${res.data.will_issue_count} will issue, ${res.data.skipped_count} skipped`,
			})
		} catch (e) {
			toast({
				variant: "destructive",
				title: "Preview failed",
				description: e instanceof Error ? e.message : "Unknown error",
			})
		} finally {
			setPreviewing(false)
		}
	}

	const handleExecute = async () => {
		const keysToIssue =
			previewRows
				?.filter((r) => r.status === "will_issue")
				.map((r) => r.row_key) ?? selectedKeys

		if (keysToIssue.length === 0) {
			toast({ variant: "destructive", title: "Nothing to issue" })
			return
		}

		setExecuting(true)
		let issued = 0
		let skipped = 0
		let failed = 0
		const results: BulkIssuePreviewRow[] = []

		try {
			const chunks: string[][] = []
			for (let i = 0; i < keysToIssue.length; i += EXECUTE_CHUNK) {
				chunks.push(keysToIssue.slice(i, i + EXECUTE_CHUNK))
			}

			for (let i = 0; i < chunks.length; i++) {
				setExecuteProgress(`Processing chunk ${i + 1} of ${chunks.length}…`)
				const res = await executeBulkIssueDocuments({
					keys: chunks[i],
					document_type: documentType,
					require_approval: requireApproval,
					notify_members: notifyMembers,
				})
				issued += res.data.issued
				skipped += res.data.skipped
				failed += res.data.failed
				results.push(...(res.data.results || []))
			}

			setExecuteTotals({ issued, skipped, failed, results })
			setConfirmOpen(false)
			toast({
				title: "Bulk issue finished",
				description: `${issued} issued, ${skipped} skipped, ${failed} failed`,
			})
			clearSelection()
			setPreviewRows(null)
			await loadCandidates()
		} catch (e) {
			toast({
				variant: "destructive",
				title: "Execute failed",
				description: e instanceof Error ? e.message : "Unknown error",
			})
		} finally {
			setExecuting(false)
			setExecuteProgress("")
		}
	}

	const downloadReport = () => {
		const rows = executeTotals?.results ?? previewRows ?? []
		if (rows.length === 0) return
		const header = [
			"row_key",
			"asset_type",
			"member_number",
			"member_name",
			"asset_label",
			"status",
			"result",
			"message",
			"document_number",
		]
		const lines = [
			header.join(","),
			...rows.map((r) =>
				[
					r.row_key,
					r.asset_type,
					r.member_number ?? "",
					JSON.stringify(r.member_name ?? ""),
					JSON.stringify(r.asset_label ?? ""),
					r.status ?? "",
					r.result ?? "",
					JSON.stringify(r.message ?? r.skip_reason ?? ""),
					r.document_number ?? "",
				].join(","),
			),
		]
		const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `bulk-issue-${documentType}-${Date.now()}.csv`
		a.click()
		URL.revokeObjectURL(url)
	}

	if (!canUpload) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>You do not have permission to bulk-issue documents.</AlertDescription>
			</Alert>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Bulk Document Issuance</h1>
				<p className="mt-2 text-muted-foreground">
					Filter house/land holdings, select many at once, preview, then issue one document type with the
					existing letterhead pipeline. Notifications are off by default for migration runs.
				</p>
			</div>

			<Card>
				<CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
					<div>
						<CardTitle>1. Select holdings</CardTitle>
						<CardDescription>
							{pagination.total} matching · scanned houses {meta?.scanned_houses ?? 0}, lands{" "}
							{meta?.scanned_lands ?? 0}
						</CardDescription>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" onClick={() => void loadCandidates()} disabled={loading}>
							{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
							<span className="ml-2">Refresh</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => void selectAllMatching()}
							disabled={selectingAll || pagination.total === 0}
						>
							{selectingAll ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
							Select all matching ({pagination.total})
						</Button>
						<Button variant="ghost" size="sm" onClick={clearSelection} disabled={selectedCount === 0}>
							Clear ({selectedCount})
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
						<div className="space-y-2">
							<Label>Document type</Label>
							<Select value={documentType} onValueChange={(v) => { setDocumentType(v); setPage(1) }}>
								<SelectTrigger>
									<SelectValue placeholder="Document type" />
								</SelectTrigger>
								<SelectContent>
									{documentTypeOptions.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Asset type</Label>
							<Select value={assetType} onValueChange={(v) => { setAssetType(v as AssetTypeFilter); setPage(1) }}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Houses &amp; lands</SelectItem>
									<SelectItem value="house">Houses only</SelectItem>
									<SelectItem value="land">Lands only</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Status</Label>
							<Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All active</SelectItem>
									<SelectItem value="approved">Approved</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Search</Label>
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									className="pl-8"
									placeholder="Member, property, land, ID…"
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Property ID (optional)</Label>
							<Input value={propertyId} onChange={(e) => { setPropertyId(e.target.value); setPage(1) }} />
						</div>
						<div className="space-y-2">
							<Label>Land ID (optional)</Label>
							<Input value={landId} onChange={(e) => { setLandId(e.target.value); setPage(1) }} />
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-6">
						<label className="flex items-center gap-2 text-sm">
							<Checkbox checked={missingOnly} onCheckedChange={(v) => { setMissingOnly(Boolean(v)); setPage(1) }} />
							Only holdings missing this document type
						</label>
						<label className="flex items-center gap-2 text-sm">
							<Checkbox checked={requireApproval} onCheckedChange={(v) => setRequireApproval(Boolean(v))} />
							Require approval before issue
						</label>
						<label className="flex items-center gap-2 text-sm">
							<Checkbox checked={notifyMembers} onCheckedChange={(v) => setNotifyMembers(Boolean(v))} />
							Notify members (email / push / in-app)
						</label>
					</div>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-10">
										<Checkbox
											checked={allPageSelected}
											onCheckedChange={(v) => togglePage(Boolean(v))}
											aria-label="Select page"
										/>
									</TableHead>
									<TableHead>Member</TableHead>
									<TableHead>Asset</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
											<Loader2 className="inline h-4 w-4 animate-spin mr-2" />
											Loading…
										</TableCell>
									</TableRow>
								) : candidates.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
											No matching holdings.
										</TableCell>
									</TableRow>
								) : (
									candidates.map((row) => (
										<TableRow key={row.row_key}>
											<TableCell>
												<Checkbox
													checked={Boolean(selected[row.row_key])}
													onCheckedChange={(v) => toggleRow(row, Boolean(v))}
												/>
											</TableCell>
											<TableCell>
												<div className="font-medium">{row.member_name}</div>
												<div className="text-xs text-muted-foreground">{row.member_number || row.member_id}</div>
											</TableCell>
											<TableCell>{row.asset_label}</TableCell>
											<TableCell>
												<Badge variant="outline">{row.asset_type}</Badge>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">{row.status || "—"}</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{pagination.last_page > 1 ? (
						<Pagination
							currentPage={pagination.page}
							totalPages={pagination.last_page}
							onPageChange={setPage}
						/>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>2. Preview &amp; execute</CardTitle>
					<CardDescription>
						Issuing: {DOCUMENT_TYPE_LABELS[documentType] || documentType} · {selectedCount} selected
						{!notifyMembers ? " · notifications off" : " · notifications on"}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap gap-2">
						<Button onClick={() => void handlePreview()} disabled={previewing || selectedCount === 0}>
							{previewing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
							Preview
						</Button>
						<Button
							onClick={() => setConfirmOpen(true)}
							disabled={!previewRows || previewCounts.will_issue_count === 0 || executing}
						>
							Execute ({previewCounts.will_issue_count})
						</Button>
						{(previewRows || executeTotals) && (
							<Button variant="outline" onClick={downloadReport}>
								Download report CSV
							</Button>
						)}
					</div>

					{previewRows ? (
						<div className="flex flex-wrap gap-3 text-sm">
							<Badge variant="secondary">Will issue: {previewCounts.will_issue_count}</Badge>
							<Badge variant="outline">Skipped: {previewCounts.skipped_count}</Badge>
							<Badge variant="destructive">Invalid: {previewCounts.invalid_count}</Badge>
						</div>
					) : null}

					{executeTotals ? (
						<Alert>
							<CheckCircle2 className="h-4 w-4" />
							<AlertDescription>
								Finished: {executeTotals.issued} issued, {executeTotals.skipped} skipped,{" "}
								{executeTotals.failed} failed.
							</AlertDescription>
						</Alert>
					) : null}

					{(executeTotals?.results || previewRows) && (
						<div className="rounded-md border max-h-[360px] overflow-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Member</TableHead>
										<TableHead>Asset</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Result</TableHead>
										<TableHead>Message</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{(executeTotals?.results || previewRows || []).map((row) => (
										<TableRow key={`${row.row_key}-${row.result || row.status}`}>
											<TableCell>{row.member_name}</TableCell>
											<TableCell>{row.asset_label}</TableCell>
											<TableCell>{row.status}</TableCell>
											<TableCell>{row.result || "—"}</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{row.message || row.skip_reason || "—"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm bulk issue</DialogTitle>
						<DialogDescription>
							Issue {DOCUMENT_TYPE_LABELS[documentType] || documentType} for{" "}
							{previewCounts.will_issue_count} holding(s)
							{requireApproval ? " (pending approval)" : ""}.
							{notifyMembers
								? " Members will be notified."
								: " Members will not be notified."}
						</DialogDescription>
					</DialogHeader>
					{executeProgress ? <p className="text-sm text-muted-foreground">{executeProgress}</p> : null}
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={executing}>
							Cancel
						</Button>
						<Button onClick={() => void handleExecute()} disabled={executing}>
							{executing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
							Confirm issue
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
