"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getMemberRaHouses, reportMemberRaDiscrepancy } from "@/lib/api/resident-association"

export default function MemberRaDiscrepancyPage() {
	const { toast } = useToast()
	const [houses, setHouses] = useState<any[]>([])
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		estate_id: "",
		property_id: "",
		amount: "",
		payment_date: "",
		bank_reference: "",
		message: "",
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

	const loadHouses = useCallback(async () => {
		try {
			const res = await getMemberRaHouses()
			const rows = res.data || []
			setHouses(rows)
			const firstEstate = rows[0]?.property?.estate?.id
			if (firstEstate) setForm((f) => (f.estate_id ? f : { ...f, estate_id: String(firstEstate) }))
		} catch (e: any) {
			toast({ title: "Failed to load estates", description: e?.message, variant: "destructive" })
		}
	}, [toast])

	useEffect(() => {
		void loadHouses()
	}, [loadHouses])

	const submit = async () => {
		if (!form.estate_id || !form.message.trim()) {
			toast({ title: "Estate and message are required", variant: "destructive" })
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
			await reportMemberRaDiscrepancy({
				estate_id: form.estate_id,
				property_id: form.property_id || undefined,
				amount: form.amount ? Number(form.amount) : undefined,
				payment_date: form.payment_date || undefined,
				bank_reference: form.bank_reference || undefined,
				message: form.message.trim(),
				evidence,
			})
			toast({ title: "Issue reported" })
			setForm((f) => ({
				...f,
				amount: "",
				payment_date: "",
				bank_reference: "",
				message: "",
				evidence_urls: "",
			}))
		} catch (e: any) {
			toast({ title: "Report failed", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Report Issue</h1>
				<p className="mt-1 text-muted-foreground">
					Report a payment discrepancy for follow-up by the association office
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Discrepancy details</CardTitle>
					<CardDescription>Describe the issue clearly so staff can investigate</CardDescription>
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
						<Label>Amount (optional)</Label>
						<Input
							type="number"
							min="0"
							step="0.01"
							value={form.amount}
							onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
						/>
					</div>
					<div className="space-y-1">
						<Label>Payment date (optional)</Label>
						<Input
							type="date"
							value={form.payment_date}
							onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
						/>
					</div>
					<div className="space-y-1 md:col-span-2">
						<Label>Bank reference (optional)</Label>
						<Input
							value={form.bank_reference}
							onChange={(e) => setForm((f) => ({ ...f, bank_reference: e.target.value }))}
						/>
					</div>
					<div className="space-y-1 md:col-span-2">
						<Label>Message</Label>
						<Textarea
							rows={5}
							value={form.message}
							onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
						/>
					</div>
					<div className="space-y-1 md:col-span-2">
						<Label>Evidence URLs (optional JSON array)</Label>
						<Textarea
							placeholder='["https://example.com/proof.pdf"]'
							value={form.evidence_urls}
							onChange={(e) => setForm((f) => ({ ...f, evidence_urls: e.target.value }))}
						/>
					</div>
					<div>
						<Button onClick={() => void submit()} disabled={saving}>
							{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							Submit report
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
