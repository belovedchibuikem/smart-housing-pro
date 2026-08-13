"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
	declareMemberRaPayment,
	getMemberRaBankInstructions,
	getMemberRaHouses,
	getMemberRaPayments,
} from "@/lib/api/resident-association"

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(amount) || 0)
}

export default function MemberRaPaymentsPage() {
	const { toast } = useToast()
	const [houses, setHouses] = useState<any[]>([])
	const [payments, setPayments] = useState<any[]>([])
	const [instructions, setInstructions] = useState<any | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		estate_id: "",
		property_id: "",
		amount: "",
		bank_reference: "",
		payment_date: new Date().toISOString().slice(0, 10),
		description: "",
		evidence_urls: "",
	})

	const estateOptions = useMemo(() => {
		const map = new Map<string, { id: string; name: string }>()
		for (const h of houses) {
			const estate = h.property?.estate
			if (estate?.id) map.set(String(estate.id), { id: String(estate.id), name: estate.name || "Estate" })
		}
		return Array.from(map.values())
	}, [houses])

	const propertyOptions = useMemo(() => {
		return houses
			.filter((h) => !form.estate_id || String(h.property?.estate?.id) === form.estate_id)
			.map((h) => ({
				id: String(h.property?.id || ""),
				title: h.property?.title || "Property",
			}))
			.filter((p) => p.id)
	}, [form.estate_id, houses])

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const [h, p] = await Promise.all([getMemberRaHouses(), getMemberRaPayments({ per_page: 50 })])
			setHouses(h.data || [])
			setPayments(p.data || [])
			const firstEstate = h.data?.[0]?.property?.estate?.id
			if (firstEstate && !form.estate_id) {
				setForm((f) => ({ ...f, estate_id: String(firstEstate) }))
			}
		} catch (e: any) {
			toast({ title: "Failed to load payments", description: e?.message, variant: "destructive" })
		} finally {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toast])

	useEffect(() => {
		void load()
	}, [load])

	useEffect(() => {
		if (!form.estate_id) {
			setInstructions(null)
			return
		}
		void getMemberRaBankInstructions(form.estate_id)
			.then((res) => setInstructions(res.data || null))
			.catch(() => setInstructions(null))
	}, [form.estate_id])

	const submit = async () => {
		if (!form.estate_id || !form.amount) {
			toast({ title: "Estate and amount are required", variant: "destructive" })
			return
		}
		let evidence: string[] | undefined
		if (form.evidence_urls.trim()) {
			try {
				const parsed = JSON.parse(form.evidence_urls)
				if (!Array.isArray(parsed)) throw new Error("Evidence must be a JSON array of URLs")
				evidence = parsed.map(String)
			} catch (e: any) {
				toast({
					title: "Invalid evidence JSON",
					description: e?.message || "Use a JSON array of URL strings",
					variant: "destructive",
				})
				return
			}
		}
		setSaving(true)
		try {
			await declareMemberRaPayment({
				estate_id: form.estate_id,
				property_id: form.property_id || undefined,
				amount: Number(form.amount),
				bank_reference: form.bank_reference || undefined,
				payment_date: form.payment_date || undefined,
				description: form.description || undefined,
				evidence,
			})
			toast({ title: "Payment declared" })
			setForm((f) => ({ ...f, amount: "", bank_reference: "", description: "", evidence_urls: "" }))
			await load()
		} catch (e: any) {
			toast({ title: "Declare failed", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-3xl font-bold">Payments</h1>
					<p className="mt-1 text-muted-foreground">Bank instructions and payment declarations</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					<RefreshCw className="mr-2 h-4 w-4" /> Refresh
				</Button>
			</div>

			{loading ? (
				<div className="flex min-h-[200px] items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<>
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Declare payment</CardTitle>
							<CardDescription>Submit after transferring to the association account</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-3 md:grid-cols-2">
							<div className="space-y-1">
								<Label>Estate</Label>
								<Select
									value={form.estate_id}
									onValueChange={(v) => setForm((f) => ({ ...f, estate_id: v, property_id: "" }))}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select estate" />
									</SelectTrigger>
									<SelectContent>
										{estateOptions.map((e) => (
											<SelectItem key={e.id} value={e.id}>
												{e.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1">
								<Label>Property (optional)</Label>
								<Select
									value={form.property_id || "none"}
									onValueChange={(v) => setForm((f) => ({ ...f, property_id: v === "none" ? "" : v }))}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select property" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None</SelectItem>
										{propertyOptions.map((p) => (
											<SelectItem key={p.id} value={p.id}>
												{p.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1">
								<Label>Amount</Label>
								<Input
									type="number"
									min="0.01"
									step="0.01"
									value={form.amount}
									onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
								/>
							</div>
							<div className="space-y-1">
								<Label>Bank reference</Label>
								<Input
									value={form.bank_reference}
									onChange={(e) => setForm((f) => ({ ...f, bank_reference: e.target.value }))}
								/>
							</div>
							<div className="space-y-1">
								<Label>Payment date</Label>
								<Input
									type="date"
									value={form.payment_date}
									onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
								/>
							</div>
							<div className="space-y-1 md:col-span-2">
								<Label>Description</Label>
								<Input
									value={form.description}
									onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
								/>
							</div>
							<div className="space-y-1 md:col-span-2">
								<Label>Evidence URLs (optional JSON array)</Label>
								<Textarea
									placeholder='["https://example.com/receipt.pdf"]'
									value={form.evidence_urls}
									onChange={(e) => setForm((f) => ({ ...f, evidence_urls: e.target.value }))}
								/>
							</div>
							<div>
								<Button onClick={() => void submit()} disabled={saving}>
									{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
									Declare payment
								</Button>
							</div>
						</CardContent>
					</Card>

					{instructions ? (
						<Card>
							<CardHeader>
								<CardTitle className="text-base">
									Bank instructions
									{instructions.association?.name ? ` — ${instructions.association.name}` : ""}
								</CardTitle>
								<CardDescription>Transfer to one of these accounts before declaring</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{(instructions.accounts || []).length === 0 ? (
									<p className="text-sm text-muted-foreground">No active bank accounts for this estate.</p>
								) : (
									(instructions.accounts || []).map((acc: any) => (
										<div key={acc.id} className="rounded-md border p-3 text-sm">
											<div className="font-medium">
												{acc.bank_name} — {acc.account_name}
											</div>
											<div className="text-muted-foreground">{acc.account_number}</div>
											{acc.payment_instructions ? (
												<p className="mt-2 whitespace-pre-wrap">{acc.payment_instructions}</p>
											) : null}
											{acc.payment_contact ? (
												<p className="mt-1 text-muted-foreground">Contact: {acc.payment_contact}</p>
											) : null}
										</div>
									))
								)}
							</CardContent>
						</Card>
					) : null}

					<Card>
						<CardHeader>
							<CardTitle className="text-base">My declarations</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Estate</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Reference</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{payments.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="text-center text-muted-foreground">
												No payments declared yet
											</TableCell>
										</TableRow>
									) : (
										payments.map((row) => (
											<TableRow key={row.id}>
												<TableCell>
													{row.payment_date
														? String(row.payment_date).slice(0, 10)
														: row.created_at
															? String(row.created_at).slice(0, 10)
															: "—"}
												</TableCell>
												<TableCell>{row.estate?.name || "—"}</TableCell>
												<TableCell>{formatCurrency(row.amount)}</TableCell>
												<TableCell>{row.bank_reference || "—"}</TableCell>
												<TableCell>
													<Badge variant="secondary">{row.status || "—"}</Badge>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	)
}
