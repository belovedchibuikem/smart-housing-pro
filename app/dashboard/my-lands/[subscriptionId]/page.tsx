"use client"

import { useCallback, useEffect, useState, type ChangeEvent } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
	getMemberLandSubscriptionDetail,
	submitLandRepayment,
	uploadLandDeed,
} from "@/lib/api/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function MemberLandAccountPage() {
	const params = useParams()
	const subscriptionId = typeof params?.subscriptionId === "string" ? params.subscriptionId : ""
	const { toast } = useToast()
	const [row, setRow] = useState<Record<string, unknown> | null>(null)
	const [amount, setAmount] = useState("")
	const [source, setSource] = useState("wallet")
	const [paymentDate, setPaymentDate] = useState("")
	const [description, setDescription] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [deedFile, setDeedFile] = useState<File | null>(null)
	const [uploadingDeed, setUploadingDeed] = useState(false)

	const load = useCallback(async () => {
		if (!subscriptionId) return
		const r = await getMemberLandSubscriptionDetail(subscriptionId)
		if (r.success && r.data) {
			setRow(r.data as Record<string, unknown>)
		}
	}, [subscriptionId])

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
			const res = await submitLandRepayment(subscriptionId, {
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
			const res = await uploadLandDeed(subscriptionId, form)
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

	if (!subscriptionId || !row) {
		return <div className="p-8 text-muted-foreground">Loading land account…</div>
	}

	const land = (row.land as Record<string, unknown>) || {}
	const payments =
		(row.payments as Array<{ id: string; amount: unknown; paid_on?: string; description?: string | null }>) ||
		[]

	const salePrice = Number(row.sale_price ?? row.total_cost ?? 0)
	const paid = Number(row.amount_paid ?? 0)
	const out = Number(row.outstanding_balance ?? row.outstanding ?? 0)
	const tenureStatus = String(row.tenure_status ?? "—")
	const ownerSequence = row.owner_sequence
	const isOriginalOwner = row.is_original_owner === true || Number(ownerSequence) === 1
	const handLabel = row.hand_label as string | undefined

	return (
		<div className="mx-auto max-w-4xl space-y-6 py-8">
			<Button asChild variant="ghost" size="sm">
				<Link href="/dashboard/browse-properties?listing=land">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back to land portfolio
				</Link>
			</Button>

			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<Badge className="mb-2">🌍 Land account</Badge>
					<h1 className="text-3xl font-bold">{String(land.land_title ?? "Land")}</h1>
					<p className="font-mono text-muted-foreground">{String(land.land_code ?? "")}</p>
					<p className="mt-2 text-sm text-muted-foreground">
						Allocated: {String(row.allocated_land_size ?? "—")}
					</p>
					{row.slot_label != null && String(row.slot_label).length > 0 && (
						<p className="mt-1 text-sm font-medium">
							Slot: {String(row.slot_label)}
							{row.slot_number != null ? ` (#${String(row.slot_number)})` : ""}
						</p>
					)}
					<div className="mt-2 flex flex-wrap gap-2">
						<Badge variant="outline" className="capitalize">
							Tenure: {tenureStatus.replace(/_/g, " ")}
						</Badge>
						{isOriginalOwner ? (
							<Badge variant="secondary">Original owner</Badge>
						) : handLabel ? (
							<Badge variant="secondary">{handLabel}</Badge>
						) : null}
					</div>
				</div>
			</div>

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
						<CardDescription>Submit a land repayment against this subscription.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="land-repay-amount">Amount</Label>
							<Input
								id="land-repay-amount"
								type="number"
								min={0.01}
								step="0.01"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0.00"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="land-repay-date">Payment date (optional)</Label>
							<Input
								id="land-repay-date"
								type="date"
								value={paymentDate}
								onChange={(e) => setPaymentDate(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="land-repay-source">Payment source</Label>
							<Select value={source} onValueChange={setSource}>
								<SelectTrigger id="land-repay-source">
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
							<Label htmlFor="land-repay-desc">Description (optional)</Label>
							<Textarea
								id="land-repay-desc"
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
					<CardDescription>Upload your land deed if it is not already on file.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-2">
						<Label htmlFor="land-deed-file">Deed file (PDF or image)</Label>
						<Input
							id="land-deed-file"
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
				</CardContent>
			</Card>

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
		</div>
	)
}
