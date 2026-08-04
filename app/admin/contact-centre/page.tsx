"use client"

import { useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

export default function ContactCentrePage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState({
		office_address: "",
		phone_numbers: "",
		email_addresses: "",
		whatsapp: "",
		facebook: "",
		instagram: "",
		twitter: "",
		linkedin: "",
		website: "",
		google_maps_url: "",
		support_ticket_link: "",
		business_hours_text: "",
	})

	useEffect(() => {
		;(async () => {
			try {
				const res = await apiFetch<{ success: boolean; data: Record<string, any> }>("/admin/contact-centre")
				const d = res.data || {}
				setForm({
					office_address: d.office_address || "",
					phone_numbers: (d.phone_numbers || []).join(", "),
					email_addresses: (d.email_addresses || []).join(", "),
					whatsapp: d.whatsapp || "",
					facebook: d.facebook || "",
					instagram: d.instagram || "",
					twitter: d.twitter || "",
					linkedin: d.linkedin || "",
					website: d.website || "",
					google_maps_url: d.google_maps_url || "",
					support_ticket_link: d.support_ticket_link || "",
					business_hours_text: d.business_hours
						? Object.entries(d.business_hours)
								.map(([k, v]) => `${k}: ${v}`)
								.join("\n")
						: "",
				})
			} catch (e) {
				toast({ title: "Failed to load contact centre", description: String(e), variant: "destructive" })
			} finally {
				setLoading(false)
			}
		})()
	}, [toast])

	const save = async () => {
		setSaving(true)
		try {
			const hours: Record<string, string> = {}
			form.business_hours_text
				.split("\n")
				.map((l) => l.trim())
				.filter(Boolean)
				.forEach((line) => {
					const [k, ...rest] = line.split(":")
					if (k && rest.length) hours[k.trim()] = rest.join(":").trim()
				})
			await apiFetch("/admin/contact-centre", {
				method: "PUT",
				body: JSON.stringify({
					office_address: form.office_address || null,
					phone_numbers: form.phone_numbers
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean),
					email_addresses: form.email_addresses
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean),
					whatsapp: form.whatsapp || null,
					facebook: form.facebook || null,
					instagram: form.instagram || null,
					twitter: form.twitter || null,
					linkedin: form.linkedin || null,
					website: form.website || null,
					google_maps_url: form.google_maps_url || null,
					support_ticket_link: form.support_ticket_link || null,
					business_hours: hours,
				}),
			})
			toast({ title: "Contact centre saved" })
		} catch (e) {
			toast({ title: "Save failed", description: String(e), variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return (
			<div className="p-6 flex items-center gap-2 text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" /> Loading…
			</div>
		)
	}

	return (
		<div className="space-y-6 p-6 max-w-3xl">
			<div>
				<h1 className="text-2xl font-semibold">Contact Centre</h1>
				<p className="text-sm text-muted-foreground">
					Populates website, mobile app, receipts, and email templates.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Public contact details</CardTitle>
					<CardDescription>Also available at GET /api/public/contact-centre</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<Label>Office address</Label>
						<Textarea
							value={form.office_address}
							onChange={(e) => setForm((f) => ({ ...f, office_address: e.target.value }))}
						/>
					</div>
					<div className="grid gap-3 md:grid-cols-2">
						<div>
							<Label>Phone numbers (comma-separated)</Label>
							<Input
								value={form.phone_numbers}
								onChange={(e) => setForm((f) => ({ ...f, phone_numbers: e.target.value }))}
							/>
						</div>
						<div>
							<Label>Emails (comma-separated)</Label>
							<Input
								value={form.email_addresses}
								onChange={(e) => setForm((f) => ({ ...f, email_addresses: e.target.value }))}
							/>
						</div>
					</div>
					<div className="grid gap-3 md:grid-cols-2">
						{(
							[
								["whatsapp", "WhatsApp"],
								["facebook", "Facebook"],
								["instagram", "Instagram"],
								["twitter", "X (Twitter)"],
								["linkedin", "LinkedIn"],
								["website", "Website"],
							] as const
						).map(([key, label]) => (
							<div key={key}>
								<Label>{label}</Label>
								<Input
									value={(form as any)[key]}
									onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
								/>
							</div>
						))}
					</div>
					<div>
						<Label>Google Maps URL</Label>
						<Input
							value={form.google_maps_url}
							onChange={(e) => setForm((f) => ({ ...f, google_maps_url: e.target.value }))}
						/>
					</div>
					<div>
						<Label>Support ticket link</Label>
						<Input
							value={form.support_ticket_link}
							onChange={(e) => setForm((f) => ({ ...f, support_ticket_link: e.target.value }))}
						/>
					</div>
					<div>
						<Label>Business hours (one per line: key: value)</Label>
						<Textarea
							rows={4}
							value={form.business_hours_text}
							onChange={(e) => setForm((f) => ({ ...f, business_hours_text: e.target.value }))}
						/>
					</div>
					<Button onClick={() => void save()} disabled={saving}>
						{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
						Save
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
