"use client"

import { useCallback, useEffect, useState, type ChangeEvent } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
	getMemberHouseAccount,
	submitHouseAccountRepayment,
	uploadHouseAccountDeed,
	type MemberHouseAccount,
} from "@/lib/api/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PropertyDocuments } from "@/components/properties/property-documents"

export default function MemberHouseAccountPage() {
	const params = useParams()
	const allocationId = typeof params?.allocationId === "string" ? params.allocationId : ""
	const { toast } = useToast()
	const [row, setRow] = useState<MemberHouseAccount | null>(null)
	const [amount, setAmount] = useState("")
	const [source, setSource] = useState("wallet")
	const [paymentDate, setPaymentDate] = useState("")
	const [description, setDescription] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [deedFile, setDeedFile] = useState<File | null>(null)
	const [uploadingDeed, setUploadingDeed] = useState(false)

	const load = useCallback(async () => {
		if (!allocationId) return
		const r = await getMemberHouseAccount(allocationId)
		if (r.success && r.data) {
			setRow(r.data)
		}
	}, [allocationId])

	useEffect(() => {
		void load()
	}, [load])

	const handleRepayment = async () => {
		const value = Number(amount)
		if (!Number.isFinite(value) || value <= 0) {
			toast({ title: "Enter a valid amount", variant: "destructive" })
			return
		}
		setSubmitting(true)
		try {
			const res = await submitHouseAccountRepayment(allocationId, {
				amount: value,
				source,
				payment_date: paymentDate || undefined,
				description: description || undefined,
			})
			toast({ title: res.message || "Repayment recorded" })
			setAmount("")
			setSource("wallet")
			setPaymentDate("")
			setDescription("")
			await load()
		} catch (e) {
			toast({
				title: "Repayment failed",
				description: e instanceof Error ? e.message : "Could not record repayment",
				variant: "destructive",
			})
		} finally {
			setSubmitting(false)
		}
	}

	const handleDeedUpload = async () => {
		if (!deedFile) {
			toast({ title: "Select a deed file first", variant: "destructive" })
			return
		}
		setUploadingDeed(true)
		try {
			const form = new FormData()
			form.append("file", deedFile)
			const res = await uploadHouseAccountDeed(allocationId, form)
			toast({ title: res.message || "Deed uploaded" })
			setDeedFile(null)
			await load()
		} catch (e) {
			toast({
				title: "Upload failed",
				description: e instanceof Error ? e.message : "Could not upload deed",
				variant: "destructive",
			})
		} finally {
			setUploadingDeed(false)
		}
	}

	if (!allocationId || !row) {
		return <div className="p-8 text-muted-foreground">Loading house account…</div>
	}

	const property = row.property
	const title = row.property_title ?? row.title ?? property?.title ?? "House"
	const payments = row.payments ?? []
	const timeline = row.timeline ?? []
	const salePrice = Number(row.sale_price ?? 0)
	const paid = Number(row.amount_paid ?? 0)
	const out = Number(row.outstanding ?? 0)
	const progress = Math.min(100, Math.max(0, Number(row.payment_progress_percent ?? 0)))
	const tenureStatus = String(row.tenure_status ?? "—")
	const slotLabel = row.slot_label || row.unit_address
	const ownerSequence = row.owner_sequence
	const isOriginalOwner = row.is_original_owner === true || Number(ownerSequence) === 1
	const handLabel = row.hand_label as string | undefined
	const propertyId = row.property_id ?? property?.id

	return (
		<div className="mx-auto max-w-4xl space-y-6 py-8">
			<Button asChild variant="ghost" size="sm">
				<Link href="/dashboard/my-property">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to my houses
				</Link>
			</Button>

			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<Badge className="mb-2">🏠 House account</Badge>
					<h1 className="text-3xl font-bold">{title}</h1>
					{property?.location && (
						<p className="text-muted-foreground">{String(property.location)}</p>
					)}
					{slotLabel && (
						<p className="mt-2 text-sm font-medium">
							Slot: {slotLabel}
							{row.slot_number != null ? ` (#${row.slot_number})` : ""}
						</p>
					)}
					<div className="mt-2 flex flex-wrap gap-2">
						<Badge variant="outline" className="capitalize">
							Tenure: {tenureStatus.replace(/_/g, " ")}
						</Badge>
						{row.payment_status && (
							<Badge variant="secondary" className="capitalize">
								{String(row.payment_status).replace(/_/g, " ")}
							</Badge>
						)}
						{isOriginalOwner ? (
							<Badge variant="secondary">Original owner</Badge>
						) : handLabel ? (
							<Badge variant="secondary">{handLabel}</Badge>
						) : null}
					</div>
				</div>
				{propertyId && (
					<Button asChild variant="outline" size="sm">
						<Link href={`/dashboard/properties/${propertyId}`}>Property details</Link>
					</Button>
				)}
			</div>

			<Card>
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between text-sm">
						<CardTitle className="text-sm font-medium text-muted-foreground">Payment progress</CardTitle>
						<span className="font-semibold">{progress.toFixed(0)}%</span>
					</div>
				</CardHeader>
				<CardContent>
					<Progress value={progress} className="h-2" />
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Sale price</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">₦{salePrice.toLocaleString()}</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Amount paid</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">₦{paid.toLocaleString()}</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-semibold text-primary">₦{out.toLocaleString()}</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Tenure status</CardTitle>
					</CardHeader>
					<CardContent className="text-xl font-semibold capitalize">
						{tenureStatus.replace(/_/g, " ")}
					</CardContent>
				</Card>
			</div>

			{out > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Record repayment</CardTitle>
						<CardDescription>Submit a repayment against this house slot account.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="house-repay-amount">Amount</Label>
							<Input
								id="house-repay-amount"
								type="number"
								min={0.01}
								step="0.01"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0.00"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="house-repay-date">Payment date (optional)</Label>
							<Input
								id="house-repay-date"
								type="date"
								value={paymentDate}
								onChange={(e) => setPaymentDate(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="house-repay-source">Payment source</Label>
							<Select value={source} onValueChange={setSource}>
								<SelectTrigger id="house-repay-source">
									<SelectValue placeholder="Select source" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="wallet">Main wallet</SelectItem>
									<SelectItem value="contribution">Contribution wallet</SelectItem>
									<SelectItem value="equity_wallet">Equity wallet</SelectItem>
									<SelectItem value="cash">Cash / bank transfer</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="house-repay-desc">Description (optional)</Label>
							<Textarea
								id="house-repay-desc"
								rows={2}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Bank transfer reference, etc."
							/>
						</div>
						<div className="md:col-span-2">
							<Button onClick={handleRepayment} disabled={submitting || !amount}>
								{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Submit repayment
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Deed of Assignment</CardTitle>
					<CardDescription>Upload your house deed if it is not already on file.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{row.deed ? (
						<div className="flex flex-wrap items-center gap-3">
							<Badge>Deed on file</Badge>
							<span className="text-sm capitalize text-muted-foreground">
								Status: {String(row.deed.status).replace(/_/g, " ")}
							</span>
							{row.deed.file_url && (
								<Button asChild variant="outline" size="sm">
									<a href={row.deed.file_url} target="_blank" rel="noreferrer">
										View deed
									</a>
								</Button>
							)}
						</div>
					) : (
						<>
							<div className="space-y-2">
								<Label htmlFor="house-deed-file">Deed file (PDF or image)</Label>
								<Input
									id="house-deed-file"
									type="file"
									accept=".pdf,image/jpeg,image/png,image/jpg"
									onChange={(e: ChangeEvent<HTMLInputElement>) => setDeedFile(e.target.files?.[0] ?? null)}
								/>
							</div>
							<Button variant="outline" onClick={handleDeedUpload} disabled={uploadingDeed || !deedFile}>
								{uploadingDeed ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Upload className="mr-2 h-4 w-4" />
								)}
								Upload deed
							</Button>
						</>
					)}
				</CardContent>
			</Card>

			{row.property_id ? (
				<PropertyDocuments
					propertyId={row.property_id}
					canUpload
					allowDelete={false}
					role="member"
					memberId={undefined}
					propertySlotId={row.property_slot_id ?? null}
					propertyAllocationId={row.allocation_id || row.id || allocationId}
					title={`${row.slot_label || "Slot"} documents`}
					description="View and upload documents for your property slot / block."
				/>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle>Payment history</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Amount</TableHead>
								<TableHead>Description</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{payments.length === 0 ? (
								<TableRow>
									<TableCell colSpan={3} className="text-muted-foreground">
										No payments yet.
									</TableCell>
								</TableRow>
							) : (
								payments.map((p) => (
									<TableRow key={p.id}>
										<TableCell>{p.paid_on ?? "—"}</TableCell>
										<TableCell>₦{Number(p.amount ?? 0).toLocaleString()}</TableCell>
										<TableCell>{p.description ?? "—"}</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Ownership timeline</CardTitle>
					<CardDescription>Events for this slot / allocation.</CardDescription>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>When</TableHead>
								<TableHead>Event</TableHead>
								<TableHead>Notes</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{timeline.length === 0 ? (
								<TableRow>
									<TableCell colSpan={3} className="text-muted-foreground">
										No timeline events yet.
									</TableCell>
								</TableRow>
							) : (
								timeline.map((event, index) => {
									const key =
										String(event.id ?? `${event.event_type ?? "event"}-${index}`)
									const when =
										String(
											event.occurred_at ??
												event.created_at ??
												event.date ??
												"—",
										)
									const label = String(
										event.label ??
											event.event_type ??
											event.type ??
											"Event",
									).replace(/_/g, " ")
									const notes = String(
										event.notes ?? event.description ?? event.summary ?? "—",
									)
									return (
										<TableRow key={key}>
											<TableCell>{when}</TableCell>
											<TableCell className="capitalize">{label}</TableCell>
											<TableCell>{notes}</TableCell>
										</TableRow>
									)
								})
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
