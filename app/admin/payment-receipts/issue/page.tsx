"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { issuePaymentReceipt } from "@/lib/api/payment-receipts"

type Member = { id: string; member_number?: string; user?: { first_name?: string; last_name?: string; email?: string } }

export default function IssueMissingReceiptPage() {
	const router = useRouter()
	const { toast } = useToast()
	const [members, setMembers] = useState<Member[]>([])
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({ member_id: "", amount: "", payment_date: new Date().toISOString().slice(0, 10), payment_method: "Bank transfer", reference: "", category: "", narration: "", notify_member: true })

	useEffect(() => {
		void apiFetch<{ data?: Member[]; members?: Member[] }>("/admin/members?per_page=100")
			.then((r) => setMembers(r.data || r.members || []))
			.catch(() => toast({ title: "Could not load members", description: "Enter from the member list and retry.", variant: "destructive" }))
	}, [toast])

	const selectedMember = useMemo(() => members.find((member) => member.id === form.member_id), [form.member_id, members])
	const label = (member: Member) => {
		const user = member.user
		const name = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email : "Member"
		return `${name}${member.member_number ? ` · ${member.member_number}` : ""}`
	}

	const issue = async () => {
		if (!form.member_id || !Number(form.amount) || Number(form.amount) <= 0) {
			toast({ title: "Member and valid payment amount are required", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			const result = await issuePaymentReceipt({ ...form, amount: Number(form.amount), receipt_type: "payment_receipt" })
			toast({ title: "Receipt issued", description: `${result.receipt.document_number} was issued to ${selectedMember ? label(selectedMember) : "the selected member"}.` })
			router.push("/admin/payment-receipts")
		} catch (error: any) {
			toast({ title: "Receipt could not be issued", description: error?.message || String(error), variant: "destructive" })
		} finally { setSaving(false) }
	}

	return <div className="mx-auto max-w-3xl space-y-6 p-6">
		<div><h1 className="text-2xl font-semibold">Issue missing receipt</h1><p className="text-sm text-muted-foreground">Use only for a confirmed payment where an automatic receipt is missing. The action is auditable and notifies the payer.</p></div>
		<Card><CardHeader><CardTitle className="text-base">Payment and payer</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
			<div className="space-y-1 md:col-span-2"><Label>Subscriber who made the payment</Label><Select value={form.member_id} onValueChange={(member_id) => setForm({ ...form, member_id })}><SelectTrigger><SelectValue placeholder="Select a member" /></SelectTrigger><SelectContent>{members.map((member) => <SelectItem key={member.id} value={member.id}>{label(member)}</SelectItem>)}</SelectContent></Select></div>
			<div className="space-y-1"><Label>Amount paid</Label><Input type="number" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
			<div className="space-y-1"><Label>Payment date</Label><Input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} /></div>
			<div className="space-y-1"><Label>Payment method</Label><Input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} /></div>
			<div className="space-y-1"><Label>Bank / transaction reference</Label><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
			<div className="space-y-1"><Label>Category</Label><Input placeholder="e.g. Estate levy" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
			<div className="space-y-1"><Label>Narration</Label><Input value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} /></div>
			<label className="flex items-center gap-3 text-sm md:col-span-2"><Switch checked={form.notify_member} onCheckedChange={(notify_member) => setForm({ ...form, notify_member })} />Notify the payer by in-app and push notification</label>
			<div className="flex gap-2 md:col-span-2"><Button onClick={() => void issue()} disabled={saving}>{saving ? "Issuing…" : "Issue receipt"}</Button><Button variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button></div>
		</CardContent></Card>
	</div>
}
