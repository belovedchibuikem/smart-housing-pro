'use client'

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
	AlertCircle,
	ArrowRight,
	BadgeCheck,
	Clock,
	Download,
	FileText,
	Info,
	Upload,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DocumentDownloadCard } from "@/components/document-download-card"
import { useMemberKyc } from "@/lib/hooks/use-member-kyc"
import { useMemberDocuments } from "@/lib/hooks/use-member-documents"
import { useToast } from "@/hooks/use-toast"
import { downloadDocument } from "@/lib/api/documents"
import { getStorageUrl } from "@/lib/api/config"

const DOCUMENT_LABELS: Record<
	string,
	{
		title: string
		description: string
	}
> = {
	passport: {
		title: "Passport Photograph",
		description: "A recent passport-sized photograph with a plain background.",
    },
	national_id: {
		title: "National Identity",
		description: "Upload a clear copy of your National ID or any government-issued ID.",
	},
	drivers_license: {
		title: "Driver's License",
		description: "Upload a valid driver's license (front page).",
    },
	utility_bill: {
      title: "Proof of Address",
		description: "Recent utility bill or tenancy agreement not older than 3 months.",
	},
	bank_statement: {
		title: "Bank Statement",
		description: "Your most recent bank statement (last 3 months).",
	},
}

const STORAGE_BASE_URL = getStorageUrl()

export default function DocumentsPage() {
	const { toast } = useToast()
	const { status, rejection_reason, documents, requiredDocuments, isLoading, error, uploadDocument, resubmit } =
		useMemberKyc()
	const {
		documents: memberDocuments,
		isLoading: isLoadingDocuments,
		error: documentsError,
		refresh: refreshDocuments,
	} = useMemberDocuments({ per_page: 100 })
	const [uploadingType, setUploadingType] = useState<string | null>(null)
	const hiddenFileInputs = useRef<Record<string, HTMLInputElement | null>>({})

	const documentStatus = useMemo(() => {
		return requiredDocuments.map((type) => {
			const existing = documents.find((doc) => doc.type === type)
			return {
				type,
				exists: Boolean(existing),
				uploaded_at: existing?.uploaded_at ?? null,
				path: existing?.path ?? null,
			}
		})
	}, [documents, requiredDocuments])

	const missingDocuments = documentStatus.filter((doc) => !doc.exists)

	const categorizedDocuments = useMemo(() => {
		const kycTypes = new Set(requiredDocuments)
		const supportDocs = memberDocuments.filter((doc) => !kycTypes.has(doc.type))
		const byCategory = {
			loan: [] as typeof supportDocs,
			investment: [] as typeof supportDocs,
			property: [] as typeof supportDocs,
			other: [] as typeof supportDocs,
		}

		supportDocs.forEach((doc) => {
			const type = doc.type.toLowerCase()
			if (type.includes("loan")) {
				byCategory.loan.push(doc)
			} else if (type.includes("invest")) {
				byCategory.investment.push(doc)
			} else if (type.includes("property") || type.includes("mortgage")) {
				byCategory.property.push(doc)
			} else {
				byCategory.other.push(doc)
			}
		})

		return byCategory
	}, [memberDocuments, requiredDocuments])

	const buildStorageUrl = (path?: string | null) => {
		if (!path) return null
		if (path.startsWith("http://") || path.startsWith("https://")) {
			return path
		}
		return `${STORAGE_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`
	}

	const handleUploadClick = (type: string) => {
		if (!hiddenFileInputs.current[type]) return
		hiddenFileInputs.current[type]?.click()
	}

	const handleFileChange = async (type: string, files: FileList | null) => {
		if (!files || files.length === 0) return
		const file = files[0]
		setUploadingType(type)
		try {
			await uploadDocument(type, file)
			refreshDocuments()
			toast({
				title: "Document uploaded",
				description: `${DOCUMENT_LABELS[type]?.title ?? "Document"} uploaded successfully.`,
			})
		} catch (err: any) {
			toast({
				title: "Upload failed",
				description: err?.message ?? "Please try again.",
				variant: "destructive",
			})
		} finally {
			setUploadingType(null)
			if (hiddenFileInputs.current[type]) {
				hiddenFileInputs.current[type]!.value = ""
			}
		}
	}

	const handleResubmit = async () => {
		try {
			await resubmit()
			refreshDocuments()
			toast({
				title: "KYC submitted",
				description: "Your KYC documents were submitted for review.",
			})
		} catch (err: any) {
			toast({
				title: "Unable to submit KYC",
				description: err?.message ?? "Please try again later.",
				variant: "destructive",
			})
		}
	}

	const handleDownloadDocument = async (documentId: string) => {
		try {
			const data = await downloadDocument(documentId)
			if (data.download_url) {
				window.open(data.download_url, "_blank", "noopener,noreferrer")
			} else {
				throw new Error("Download URL not provided by the server.")
			}
		} catch (err: any) {
			toast({
				title: "Unable to download document",
				description: err?.message ?? "Please try again later.",
				variant: "destructive",
			})
		}
	}

	const renderStatusBanner = () => {
		if (status === "verified") {
        return (
				<div className="flex items-start gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
					<BadgeCheck className="mt-0.5 h-5 w-5 text-green-600" />
					<div>
						<p className="font-medium text-green-900">KYC Verified</p>
						<p className="mt-1 text-sm text-green-700">
							Your identity has been verified. You have full access to all platform features.
						</p>
					</div>
				</div>
        )
		}

		if (status === "rejected") {
        return (
				<div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
					<AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
					<div>
						<p className="font-medium text-red-900">KYC Rejected</p>
						<p className="mt-1 text-sm text-red-700">
							Please review the rejection reason below, update your documents, and resubmit your KYC.
						</p>
						{rejection_reason ? (
							<p className="mt-2 rounded-md bg-white/60 p-3 text-sm text-red-800">
								<strong>Reason:</strong> {rejection_reason}
							</p>
						) : null}
						<Button className="mt-3" size="sm" onClick={handleResubmit} disabled={uploadingType !== null}>
							Resubmit KYC
						</Button>
					</div>
				</div>
        )
		}

		if (status === "submitted" || status === "pending") {
        return (
				<div className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
					<Clock className="mt-0.5 h-5 w-5 text-yellow-600" />
					<div>
						<p className="font-medium text-yellow-900">Under Review</p>
						<p className="mt-1 text-sm text-yellow-700">
							Your KYC submission is currently under review. This usually takes 1-2 business days.
						</p>
					</div>
				</div>
			)
		}

        return (
			<div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
				<Info className="mt-0.5 h-5 w-5 text-blue-600" />
				<div>
					<p className="font-medium text-blue-900">Action Required</p>
					<p className="mt-1 text-sm text-blue-700">
						Please upload the required documents to complete your KYC verification.
					</p>
				</div>
			</div>
		)
  }

  return (
    <div className="space-y-6">
      <div>
				<h1 className="text-3xl font-bold">Documents &amp; KYC</h1>
				<p className="mt-2 text-muted-foreground">Manage your identity verification documents and track status.</p>
      </div>

			{error || documentsError ? (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="py-6">
						<div className="flex items-center gap-3 text-sm text-red-700">
							<AlertCircle className="h-4 w-4" />
							<span>{error ?? documentsError}</span>
						</div>
					</CardContent>
				</Card>
			) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>KYC Verification Status</CardTitle>
							<CardDescription>Your identity verification progress</CardDescription>
            </div>
						<Badge
							variant="outline"
							className={
								status === "verified"
									? "border-green-500 text-green-700"
									: status === "rejected"
									? "border-red-500 text-red-700"
									: "border-yellow-500 text-yellow-700"
							}
						>
							{status.toUpperCase()}
						</Badge>
          </div>
        </CardHeader>
        <CardContent>
					{isLoading ? <Skeleton className="h-24 w-full" /> : renderStatusBanner()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
					<CardTitle>Required Documents</CardTitle>
					<CardDescription>Upload each requested document to complete your KYC verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
						{documentStatus.map((doc) => {
							const label = DOCUMENT_LABELS[doc.type] ?? {
								title: doc.type,
								description: "",
							}
							const isUploading = uploadingType === doc.type
							const fileUrl = buildStorageUrl(doc.path ?? undefined)

							return (
              <div
									key={doc.type}
									className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
									<div className="flex flex-1 items-start gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
											<p className="font-medium">{label.title}</p>
											<p className="text-sm text-muted-foreground">{label.description}</p>
											{doc.uploaded_at ? (
												<p className="mt-1 text-xs text-muted-foreground">
													Uploaded {new Date(doc.uploaded_at).toLocaleString()}
                    </p>
											) : (
												<p className="mt-1 text-xs text-muted-foreground">Not uploaded</p>
											)}
                  </div>
                </div>
									<div className="flex items-center gap-2">
										{doc.exists ? (
											<Badge className="bg-green-500/10 text-green-700">Uploaded</Badge>
										) : (
											<Badge className="bg-gray-500/10 text-gray-700">Missing</Badge>
										)}
										{doc.exists && fileUrl ? (
											<Button size="sm" variant="outline" asChild>
												<Link href={fileUrl} target="_blank" rel="noopener noreferrer">
													<Download className="mr-2 h-4 w-4" />
													View
												</Link>
                    </Button>
										) : null}
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleUploadClick(doc.type)}
											disabled={isUploading}
										>
											{isUploading ? (
												<>
													<ArrowRight className="mr-2 h-4 w-4 animate-pulse" />
													Uploading...
												</>
                  ) : (
                    <>
													<Upload className="mr-2 h-4 w-4" />
													{doc.exists ? "Replace" : "Upload"}
                    </>
                  )}
										</Button>
										<input
											ref={(ref) => {
												hiddenFileInputs.current[doc.type] = ref
											}}
											type="file"
											accept=".pdf,.jpg,.jpeg,.png"
											className="hidden"
											onChange={(event) => handleFileChange(doc.type, event.target.files)}
										/>
                </div>
              </div>
							)
						})}
					</div>
					{missingDocuments.length > 0 ? (
						<p className="mt-4 text-sm text-muted-foreground">
							Please upload all missing documents before submitting your KYC.
						</p>
					) : null}
					<div className="mt-6 flex justify-end">
						<Button
							onClick={handleResubmit}
							disabled={uploadingType !== null || missingDocuments.length > 0 || isLoading}
						>
							Submit for Review
						</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
					<CardTitle>Loan &amp; Transaction Documents</CardTitle>
					<CardDescription>Download agreements, statements, receipts, and other supporting documents.</CardDescription>
        </CardHeader>
        <CardContent>
					{isLoadingDocuments ? (
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton key={`documents-skeleton-${index}`} className="h-20 w-full" />
							))}
						</div>
					) : memberDocuments.length === 0 ? (
						<p className="text-sm text-muted-foreground">You have not uploaded or received any documents yet.</p>
					) : (
						<div className="space-y-6">
							{(["loan", "property", "investment", "other"] as const).map((category) => {
								const docs = categorizedDocuments[category]
								if (!docs.length) return null
								const heading =
									category === "loan"
										? "Loan Documents"
										: category === "property"
										? "Property Documents"
										: category === "investment"
										? "Investment Documents"
										: "Other Documents"
								return (
									<div key={category} className="space-y-3">
										<h3 className="text-sm font-semibold text-muted-foreground">{heading}</h3>
          <div className="space-y-4">
											{docs.map((doc) => (
												<DocumentDownloadCard
													key={doc.id}
													document={{
														id: doc.id,
														title: doc.title,
														type: doc.type,
														description: doc.description,
														fileSize: doc.file_size_human,
														uploadDate: doc.created_at
															? new Date(doc.created_at).toLocaleString()
															: undefined,
														status: doc.status,
													}}
													onDownload={handleDownloadDocument}
												/>
            ))}
          </div>
									</div>
								)
							})}
          </div>
					)}
        </CardContent>
      </Card>
    </div>
  )
}
