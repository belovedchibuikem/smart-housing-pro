"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Download, Eye, FileText, Loader2, RefreshCw, Stamp, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
	DOCUMENT_TYPE_LABELS,
	approveIssuedDocument,
	approveIssuedDocumentSignature,
	downloadAdminIssuedDocument,
	downloadMemberIssuedDocument,
	getPropertyDocumentLedger,
	issueAllocationDocument,
	issueLandSubscriptionDocument,
	listAllocationIssuedDocuments,
	listDocumentTemplates,
	listLandSubscriptionIssuedDocuments,
	listMemberHouseIssuedDocuments,
	listMemberLandIssuedDocuments,
	previewAllocationDocument,
	previewLandSubscriptionDocument,
	reissueIssuedDocument,
	rejectIssuedDocument,
	revokeIssuedDocument,
	uploadMemberSignedDocument,
	type IssuedDocumentRow,
} from "@/lib/api/issued-documents"

const FALLBACK_TYPES = [
	"provisional_offer_letter",
	"payment_completion_confirmation",
	"memorandum_of_acceptance",
	"allocation_letter",
	"payment_receipt",
] as const

type Scope =
	| { role: "admin"; kind: "house"; id: string }
	| { role: "admin"; kind: "land"; id: string }
	| { role: "member"; kind: "house"; id: string }
	| { role: "member"; kind: "land"; id: string }

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
	if (["issued", "downloaded", "viewed", "signed", "accepted"].includes(status)) return "default"
	if (["revoked", "cancelled", "rejected"].includes(status)) return "destructive"
	if (status === "superseded" || status === "pending_approval") return "outline"
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

export function IssuedDocumentsPanel({
	scope,
	title = "Official documents",
	description = "Issue and manage official letters for this property allocation.",
}: {
	scope: Scope
	title?: string
	description?: string
}) {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [issuing, setIssuing] = useState(false)
	const [previewing, setPreviewing] = useState(false)
	const [documents, setDocuments] = useState<IssuedDocumentRow[]>([])
	const [documentTypes, setDocumentTypes] = useState<string[]>([...FALLBACK_TYPES])
	const [documentType, setDocumentType] = useState<string>(FALLBACK_TYPES[0])
	const [requireApproval, setRequireApproval] = useState(false)
	const [previewHtml, setPreviewHtml] = useState<string | null>(null)
	const [ledger, setLedger] = useState<{
		total_price: number
		amount_paid: number
		balance: number
		receipt_count: number
		receipts: IssuedDocumentRow[]
	} | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			if (scope.role === "admin") {
				const templates = await listDocumentTemplates()
				const types = (templates.templates || [])
					.filter((t) => t.is_active)
					.map((t) => t.document_type)
				if (types.length) {
					setDocumentTypes(types)
					if (!types.includes(documentType)) setDocumentType(types[0])
				}
			}

			if (scope.role === "admin" && scope.kind === "house") {
				const res = await listAllocationIssuedDocuments(scope.id)
				setDocuments(res.data || [])
				const led = await getPropertyDocumentLedger({ property_allocation_id: scope.id })
				setLedger(led.ledger)
			} else if (scope.role === "admin" && scope.kind === "land") {
				const res = await listLandSubscriptionIssuedDocuments(scope.id)
				setDocuments(res.data || [])
				const led = await getPropertyDocumentLedger({ land_subscription_id: scope.id })
				setLedger(led.ledger)
			} else if (scope.role === "member" && scope.kind === "house") {
				const res = await listMemberHouseIssuedDocuments(scope.id)
				setDocuments(res.documents || [])
			} else {
				const res = await listMemberLandIssuedDocuments(scope.id)
				setDocuments(res.documents || [])
			}
		} catch (e) {
			toast({
				title: "Failed to load documents",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		} finally {
			setLoading(false)
		}
	}, [documentType, scope.id, scope.kind, scope.role, toast])

	useEffect(() => {
		void load()
	}, [load])

	const handlePreview = async () => {
		if (scope.role !== "admin") return
		setPreviewing(true)
		try {
			const res =
				scope.kind === "house"
					? await previewAllocationDocument(scope.id, { document_type: documentType })
					: await previewLandSubscriptionDocument(scope.id, { document_type: documentType })
			setPreviewHtml(res.preview.preview_html)
		} catch (e) {
			toast({
				title: "Preview failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		} finally {
			setPreviewing(false)
		}
	}

	const handleIssue = async () => {
		if (scope.role !== "admin") return
		setIssuing(true)
		try {
			const res =
				scope.kind === "house"
					? await issueAllocationDocument(scope.id, {
							document_type: documentType,
							require_approval: requireApproval,
						})
					: await issueLandSubscriptionDocument(scope.id, {
							document_type: documentType,
							require_approval: requireApproval,
						})
			toast({ title: res.message || "Document issued" })
			setPreviewHtml(null)
			await load()
		} catch (e) {
			toast({
				title: "Issue failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		} finally {
			setIssuing(false)
		}
	}

	const handleDownload = async (doc: IssuedDocumentRow) => {
		try {
			const blob =
				scope.role === "admin"
					? await downloadAdminIssuedDocument(doc.id)
					: await downloadMemberIssuedDocument(doc.id)
			await triggerBlobDownload(blob, `${doc.document_number}.pdf`)
		} catch (e) {
			toast({
				title: "Download failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	const handleRevoke = async (doc: IssuedDocumentRow) => {
		const reason = window.prompt("Revocation reason", "Administrative Error")
		if (!reason) return
		try {
			await revokeIssuedDocument(doc.id, reason)
			toast({ title: "Document revoked" })
			await load()
		} catch (e) {
			toast({
				title: "Revoke failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	const handleReissue = async (doc: IssuedDocumentRow) => {
		try {
			await reissueIssuedDocument(doc.id)
			toast({ title: "Document reissued" })
			await load()
		} catch (e) {
			toast({
				title: "Reissue failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	const handleApprove = async (doc: IssuedDocumentRow) => {
		try {
			await approveIssuedDocument(doc.id)
			toast({ title: "Document approved" })
			await load()
		} catch (e) {
			toast({
				title: "Approve failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	const handleReject = async (doc: IssuedDocumentRow) => {
		const reason = window.prompt("Rejection reason", "Incomplete information")
		if (!reason) return
		try {
			await rejectIssuedDocument(doc.id, reason)
			toast({ title: "Document rejected" })
			await load()
		} catch (e) {
			toast({
				title: "Reject failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	const handleApproveSignature = async (doc: IssuedDocumentRow) => {
		try {
			await approveIssuedDocumentSignature(doc.id)
			toast({ title: "Signature accepted" })
			await load()
		} catch (e) {
			toast({
				title: "Signature approval failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	const handleUploadSigned = async (doc: IssuedDocumentRow, file: File | null) => {
		if (!file) return
		try {
			await uploadMemberSignedDocument(doc.id, file)
			toast({ title: "Signed copy uploaded" })
			await load()
		} catch (e) {
			toast({
				title: "Upload failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	return (
		<div className="space-y-4">
			{scope.role === "admin" && ledger && (
				<div className="grid gap-3 md:grid-cols-4">
					{[
						{ label: "Total price", value: `₦${Number(ledger.total_price).toLocaleString()}` },
						{ label: "Amount paid", value: `₦${Number(ledger.amount_paid).toLocaleString()}` },
						{ label: "Balance", value: `₦${Number(ledger.balance).toLocaleString()}` },
						{ label: "Receipts", value: String(ledger.receipt_count) },
					].map((item) => (
						<Card key={item.label}>
							<CardHeader className="pb-2">
								<CardDescription>{item.label}</CardDescription>
								<CardTitle className="text-xl">{item.value}</CardTitle>
							</CardHeader>
						</Card>
					))}
				</div>
			)}

			<Card>
				<CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Stamp className="h-5 w-5" />
							{title}
						</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
					<Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
						<RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					{scope.role === "admin" && (
						<div className="space-y-3 rounded-md border p-3">
							<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
								<div className="flex-1 space-y-2">
									<div className="text-sm font-medium">Issue document</div>
									<Select value={documentType} onValueChange={setDocumentType}>
										<SelectTrigger>
											<SelectValue placeholder="Select document type" />
										</SelectTrigger>
										<SelectContent>
											{documentTypes.map((type) => (
												<SelectItem key={type} value={type}>
													{DOCUMENT_TYPE_LABELS[type] || type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center gap-2 pb-2">
									<Checkbox
										id="require-approval"
										checked={requireApproval}
										onCheckedChange={(v) => setRequireApproval(Boolean(v))}
									/>
									<Label htmlFor="require-approval" className="text-sm">
										Require approval
									</Label>
								</div>
								<Button variant="outline" onClick={() => void handlePreview()} disabled={previewing}>
									{previewing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
									Preview
								</Button>
								<Button onClick={() => void handleIssue()} disabled={issuing}>
									{issuing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
									Issue
								</Button>
							</div>
							{previewHtml && (
								<div className="rounded border bg-white overflow-auto max-h-[420px]">
									<iframe title="Document preview" className="w-full min-h-[400px]" srcDoc={previewHtml} />
								</div>
							)}
						</div>
					)}

					{loading ? (
						<div className="flex items-center justify-center py-10 text-muted-foreground">
							<Loader2 className="h-5 w-5 mr-2 animate-spin" />
							Loading documents…
						</div>
					) : documents.length === 0 ? (
						<div className="text-center py-10 text-muted-foreground">
							No official documents issued for this {scope.kind === "house" ? "house" : "land"} yet.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Document</TableHead>
									<TableHead>Reference</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Issued</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{documents.map((doc) => (
									<TableRow key={doc.id}>
										<TableCell>
											<div className="font-medium">{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.title}</div>
											<div className="text-xs text-muted-foreground">{doc.document_number}</div>
										</TableCell>
										<TableCell className="font-mono text-xs">{doc.reference_number || "—"}</TableCell>
										<TableCell>
											<Badge variant={statusVariant(doc.status)}>{doc.status}</Badge>
										</TableCell>
										<TableCell className="text-sm">
											{doc.issued_at ? new Date(doc.issued_at).toLocaleDateString() : "—"}
										</TableCell>
										<TableCell className="text-right space-x-1">
											<Button size="sm" variant="outline" onClick={() => void handleDownload(doc)}>
												<Download className="h-4 w-4" />
											</Button>
											{scope.role === "admin" && doc.status === "pending_approval" && (
												<>
													<Button size="sm" variant="ghost" onClick={() => void handleApprove(doc)}>
														<Check className="h-4 w-4" />
													</Button>
													<Button size="sm" variant="ghost" onClick={() => void handleReject(doc)}>
														<X className="h-4 w-4" />
													</Button>
												</>
											)}
											{scope.role === "admin" && doc.status === "signed" && (
												<Button size="sm" variant="ghost" onClick={() => void handleApproveSignature(doc)}>
													Accept sign
												</Button>
											)}
											{scope.role === "admin" &&
												!["revoked", "superseded", "cancelled", "rejected"].includes(doc.status) && (
													<>
														<Button size="sm" variant="ghost" onClick={() => void handleReissue(doc)}>
															Reissue
														</Button>
														<Button size="sm" variant="ghost" onClick={() => void handleRevoke(doc)}>
															Revoke
														</Button>
													</>
												)}
											{scope.role === "member" &&
												doc.document_type === "memorandum_of_acceptance" &&
												!doc.member_signed_at && (
													<label className="inline-flex items-center">
														<span className="sr-only">Upload signed copy</span>
														<input
															type="file"
															accept=".pdf,image/*"
															className="hidden"
															onChange={(e) => void handleUploadSigned(doc, e.target.files?.[0] || null)}
														/>
														<span className="inline-flex h-8 items-center rounded-md bg-secondary px-3 text-xs font-medium cursor-pointer">
															Upload signed
														</span>
													</label>
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
