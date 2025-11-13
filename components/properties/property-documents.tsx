"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
	deletePropertyDocument,
	getPropertyDocuments,
	type PropertyDocument,
	uploadPropertyDocument,
} from "@/lib/api/client"
import { Loader2, Trash2, Upload, FileText } from "lucide-react"

const documentTypeOptions = [
	{ value: "eoi", label: "Expression of Interest" },
	{ value: "payment_proof", label: "Payment Proof" },
	{ value: "mortgage_agreement", label: "Mortgage Agreement" },
	{ value: "certificate", label: "Certificate / Completion" },
	{ value: "other", label: "Other" },
]

export interface PropertyDocumentsProps {
	propertyId: string
	canUpload?: boolean
	allowDelete?: boolean
	memberId?: string | null
	memberOptions?: Array<{ id: string; label: string }>
	role?: "member" | "admin"
}

export function PropertyDocuments({
	propertyId,
	canUpload = false,
	allowDelete = false,
	memberId,
	memberOptions = [],
	role = "member",
}: PropertyDocumentsProps) {
	const { toast } = useToast()
	const [documents, setDocuments] = useState<PropertyDocument[]>([])
	const [loading, setLoading] = useState(true)
	const [uploading, setUploading] = useState(false)
	const [file, setFile] = useState<File | null>(null)
	const [title, setTitle] = useState("")
	const [documentType, setDocumentType] = useState<string>("other")
	const [selectedMember, setSelectedMember] = useState<string>(memberId ?? "")

	useEffect(() => {
		void loadDocuments()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [propertyId])

	const loadDocuments = async () => {
		try {
			setLoading(true)
			const response = await getPropertyDocuments(propertyId, { per_page: 50 })
			if (response.success) {
				setDocuments(response.data ?? [])
			}
		} catch (error: any) {
			toast({
				title: "Unable to fetch documents",
				description: error?.message ?? "Please try again later.",
				variant: "destructive",
			})
		} finally {
			setLoading(false)
		}
	}

	const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!file) {
			toast({
				title: "File required",
				description: "Please select a file to upload.",
				variant: "destructive",
			})
			return
		}

		try {
			setUploading(true)
			const formData = new FormData()
			formData.append("property_id", propertyId)
			if (role === "admin" && selectedMember) {
				formData.append("member_id", selectedMember)
			}
			formData.append("title", title.trim() || file.name)
			if (documentType) {
				formData.append("document_type", documentType)
			}
			formData.append("file", file)

			const response = await uploadPropertyDocument(formData)

			if (!response.success) {
				toast({
					title: "Upload failed",
					description: response.message ?? "Please verify the form and try again.",
					variant: "destructive",
				})
				return
			}

			toast({
				title: "Document uploaded",
				description: "The document is now available in the repository.",
			})

			setFile(null)
			setTitle("")
			setDocumentType("other")
			await loadDocuments()
		} catch (error: any) {
			toast({
				title: "Upload failed",
				description: error?.message ?? "Something went wrong while uploading the document.",
				variant: "destructive",
			})
		} finally {
			setUploading(false)
		}
	}

	const handleDelete = async (documentId: string) => {
		if (!window.confirm("Delete this document? This action cannot be undone.")) {
			return
		}

		try {
			const response = await deletePropertyDocument(documentId)
			if (!response.success) {
				toast({
					title: "Delete failed",
					description: response.message ?? "Unable to delete the document.",
					variant: "destructive",
				})
				return
			}

			toast({
				title: "Document deleted",
				description: "The document has been removed from the repository.",
			})

			setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
		} catch (error: any) {
			toast({
				title: "Delete failed",
				description: error?.message ?? "Unable to delete the document.",
				variant: "destructive",
			})
		}
	}

	const sortedDocuments = useMemo(() => {
		return [...documents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
	}, [documents])

	const renderUploaderInfo = (document: PropertyDocument) => {
		if (document.uploaded_by_role === "admin") {
			return "Uploaded by Admin"
		}
		if (document.uploaded_by_role === "member") {
			return "Uploaded by Member"
		}
		return "System Document"
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Property Documents</CardTitle>
				<CardDescription>
					Access all files linked to this property: expression of interest, payment proofs, mortgage agreements, completion
					certificates, and more.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{canUpload && (
					<form onSubmit={handleUpload} className="space-y-4 rounded-md border border-dashed p-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="document-title">Title</Label>
								<Input
									id="document-title"
									value={title}
									onChange={(event) => setTitle(event.target.value)}
									placeholder="e.g., Payment evidence (July)"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="document-type">Document Type</Label>
								<Select value={documentType} onValueChange={setDocumentType}>
									<SelectTrigger id="document-type">
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{documentTypeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							{role === "admin" && memberOptions.length > 0 && (
								<div className="space-y-2">
									<Label htmlFor="member-select">Assign to Member (optional)</Label>
									<Select value={selectedMember} onValueChange={setSelectedMember}>
										<SelectTrigger id="member-select">
											<SelectValue placeholder="Select member" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">All Members</SelectItem>
											{memberOptions.map((option) => (
												<SelectItem key={option.id} value={option.id}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="document-file">File</Label>
							<Input
								id="document-file"
								type="file"
								onChange={(event) => setFile(event.target.files?.[0] ?? null)}
								required
							/>
						</div>
						<Button type="submit" disabled={uploading}>
							{uploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Upload Document
								</>
							)}
						</Button>
					</form>
				)}

				<Separator />

				{loading ? (
					<div className="flex items-center gap-2 text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>Loading documents...</span>
					</div>
				) : sortedDocuments.length === 0 ? (
					<div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
						No documents uploaded yet. {canUpload ? "Use the form above to add the first document." : ""}
					</div>
				) : (
					<div className="space-y-4">
						{sortedDocuments.map((document) => (
							<div
								key={document.id}
								className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
							>
								<div className="flex flex-1 items-start gap-3">
									<div className="rounded-md bg-primary/10 p-2">
										<FileText className="h-5 w-5 text-primary" />
									</div>
									<div className="space-y-1 text-sm">
										<div className="flex flex-wrap items-center gap-2 text-base font-semibold">
											<span>{document.title}</span>
											{document.document_type && (
												<Badge variant="secondary" className="capitalize">
													{document.document_type.replace(/_/g, " ")}
												</Badge>
											)}
										</div>
										{document.description && (
											<p className="text-muted-foreground">{document.description}</p>
										)}
										<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
											<span>{renderUploaderInfo(document)}</span>
											{document.file_size && (
												<span>{(document.file_size / 1024).toFixed(1)} KB</span>
											)}
											{document.created_at && (
												<span>{new Date(document.created_at).toLocaleString()}</span>
											)}
										</div>
										<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
											{document.file_url && (
												<a
													href={document.file_url}
													target="_blank"
													rel="noopener noreferrer"
													className="font-medium text-primary hover:underline"
												>
													Download
												</a>
											)}
											{document.metadata?.notes && <span>Notes: {document.metadata.notes}</span>}
										</div>
									</div>
								</div>
								{allowDelete && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDelete(document.id)}
										className="text-destructive hover:text-destructive"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}


