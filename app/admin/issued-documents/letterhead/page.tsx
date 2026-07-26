"use client"

import { useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
	getDocumentLetterhead,
	updateDocumentLetterhead,
	uploadDocumentLetterheadAsset,
} from "@/lib/api/issued-documents"

const TEXT_FIELDS: Array<{ key: string; label: string; textarea?: boolean }> = [
	{ key: "letterhead_full_name", label: "Tenant full name" },
	{ key: "letterhead_short_name", label: "Short name (footer)" },
	{ key: "letterhead_parent_org", label: "Parent / ministry line" },
	{ key: "letterhead_hq_label", label: "HQ / estate label" },
	{ key: "letterhead_address", label: "Address", textarea: true },
	{ key: "letterhead_phone_1", label: "Phone 1" },
	{ key: "letterhead_phone_2", label: "Phone 2" },
	{ key: "letterhead_email", label: "Email" },
	{ key: "letterhead_website", label: "Website" },
	{ key: "letterhead_social_handle", label: "Social handle" },
	{ key: "letterhead_facebook", label: "Facebook" },
	{ key: "letterhead_instagram", label: "Instagram" },
	{ key: "letterhead_twitter", label: "X / Twitter" },
	{ key: "letterhead_linkedin", label: "LinkedIn" },
	{ key: "letterhead_youtube", label: "YouTube" },
	{ key: "letterhead_whatsapp", label: "WhatsApp" },
	{ key: "letterhead_document_prefix", label: "Document prefix" },
	{ key: "letterhead_reference_pattern", label: "Reference pattern" },
	{ key: "letterhead_verification_prefix", label: "Verification prefix" },
	{ key: "letterhead_estate_code", label: "Default estate code" },
	{ key: "letterhead_primary_color", label: "Primary color" },
	{ key: "letterhead_secondary_color", label: "Secondary color" },
	{ key: "letterhead_accent_color", label: "Accent color" },
	{ key: "letterhead_watermark_opacity", label: "Watermark opacity (0.08–0.12)" },
	{ key: "letterhead_footer_text", label: "Footer text", textarea: true },
	{ key: "letterhead_legal_disclaimer", label: "Legal disclaimer", textarea: true },
	{ key: "letterhead_acceptance_days", label: "Offer acceptance days" },
	{ key: "letterhead_construction_months", label: "Construction months" },
	{ key: "letterhead_building_approval_fee", label: "Building approval fee" },
	{ key: "letterhead_header_height", label: "Header height (px)" },
	{ key: "letterhead_footer_height", label: "Footer height (px)" },
]

export default function LetterheadSettingsPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState<Record<string, string>>({})
	const [previewLogo, setPreviewLogo] = useState<string | null>(null)

	useEffect(() => {
		void (async () => {
			try {
				const res = await getDocumentLetterhead()
				const lh = res.letterhead || {}
				const next: Record<string, string> = {}
				for (const field of TEXT_FIELDS) {
					next[field.key] = String(lh[field.key] ?? "")
				}
				setForm(next)
				setPreviewLogo((lh.primary_logo_url as string) || null)
			} catch (e) {
				toast({
					title: "Failed to load letterhead",
					description: e instanceof Error ? e.message : "Please try again",
					variant: "destructive",
				})
			} finally {
				setLoading(false)
			}
		})()
	}, [toast])

	const save = async () => {
		setSaving(true)
		try {
			await updateDocumentLetterhead(form)
			toast({ title: "Letterhead saved" })
		} catch (e) {
			toast({
				title: "Save failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		} finally {
			setSaving(false)
		}
	}

	const upload = async (field: "secondary_logo" | "official_seal", file: File | null) => {
		if (!file) return
		try {
			await uploadDocumentLetterheadAsset(field, file)
			toast({ title: "Upload successful" })
		} catch (e) {
			toast({
				title: "Upload failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20 text-muted-foreground">
				<Loader2 className="h-5 w-5 mr-2 animate-spin" />
				Loading letterhead…
			</div>
		)
	}

	return (
		<div className="space-y-6 max-w-4xl">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold">Letterhead settings</h1>
					<p className="text-muted-foreground">
						Primary logo and signatory come from White Label / Certificate settings. Configure the rest here.
					</p>
				</div>
				<Button onClick={() => void save()} disabled={saving}>
					{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
					Save
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Live letterhead preview</CardTitle>
					<CardDescription>Primary logo/signatory come from White Label / Certificate settings.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						{previewLogo ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={previewLogo} alt="Logo" className="h-16 w-16 object-contain border rounded" />
						) : (
							<div className="h-16 w-16 border rounded flex items-center justify-center text-xs text-muted-foreground">
								No logo
							</div>
						)}
						<div className="space-y-2">
							<Label>Secondary logo</Label>
							<Input type="file" accept="image/*" onChange={(e) => void upload("secondary_logo", e.target.files?.[0] || null)} />
							<Label>Official seal</Label>
							<Input type="file" accept="image/*" onChange={(e) => void upload("official_seal", e.target.files?.[0] || null)} />
						</div>
					</div>
					<div
						className="rounded border bg-[#fffef9] p-4"
						style={{ borderTopColor: form.letterhead_primary_color || "#1B5E20", borderTopWidth: 3 }}
					>
						<div className="grid grid-cols-[80px_1fr_180px] gap-3 border-b border-black pb-3 mb-3">
							<div className="text-xs text-muted-foreground">
								{previewLogo ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={previewLogo} alt="Logo" className="h-14 w-14 object-contain" />
								) : (
									"Logo"
								)}
							</div>
							<div>
								<div className="font-bold uppercase text-sm" style={{ color: form.letterhead_primary_color || "#1B5E20" }}>
									{form.letterhead_full_name || "Tenant full name"}
								</div>
								<div className="text-sm" style={{ color: form.letterhead_secondary_color || "#1565C0" }}>
									{form.letterhead_parent_org || "Parent organization"}
								</div>
								<div className="text-xs font-semibold uppercase" style={{ color: form.letterhead_accent_color || "#C62828" }}>
									{form.letterhead_hq_label || "HQ label"}
								</div>
							</div>
							<div className="text-xs border-l pl-2 whitespace-pre-wrap">
								{form.letterhead_address || "Address"}
								{"\n"}
								{form.letterhead_phone_1 || "Phone"}
								{"\n"}
								{form.letterhead_email || "Email"}
							</div>
						</div>
						<div className="relative min-h-[120px] flex items-center justify-center text-muted-foreground text-sm">
							<span
								className="absolute inset-0 flex items-center justify-center pointer-events-none"
								style={{ opacity: Number(form.letterhead_watermark_opacity || 0.1) }}
							>
								{previewLogo ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={previewLogo} alt="" className="h-24 w-24 object-contain" />
								) : (
									"Watermark"
								)}
							</span>
							Document body appears here
						</div>
						<div className="mt-3 border-t pt-2 text-xs space-y-1">
							<div className="flex justify-between gap-2" style={{ color: form.letterhead_secondary_color || "#1565C0" }}>
								<span style={{ color: form.letterhead_accent_color || "#C62828" }}>
									{form.letterhead_short_name || "Short name"}
								</span>
								<span>
									{form.letterhead_social_handle || "@handle"} | {form.letterhead_email || "email"}
								</span>
								<span>QR</span>
							</div>
							<div className="flex flex-wrap justify-center gap-1.5">
								{(() => {
									const platforms = [
										["Facebook", form.letterhead_facebook, "#1877F2", "f"],
										["Instagram", form.letterhead_instagram, "#E4405F", "ig"],
										["LinkedIn", form.letterhead_linkedin, "#0A66C2", "in"],
										["X", form.letterhead_twitter, "#111111", "X"],
										["YouTube", form.letterhead_youtube, "#FF0000", "yt"],
										["WhatsApp", form.letterhead_whatsapp, "#25D366", "wa"],
									] as const
									const filled = platforms.filter(([, value]) => Boolean(value && String(value).trim()))
									const handleSet = Boolean(form.letterhead_social_handle?.trim())
									const icons = filled.length > 0 ? filled : handleSet ? platforms : []
									if (icons.length === 0) {
										return <span className="text-muted-foreground text-[11px]">Social icons appear here</span>
									}
									return icons.map(([label, , color, abbr]) => (
										<span
											key={label}
											title={label}
											className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
											style={{ background: color }}
										>
											{abbr}
										</span>
									))
								})()}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Letterhead fields</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					{TEXT_FIELDS.map((field) => (
						<div key={field.key} className={field.textarea ? "md:col-span-2 space-y-2" : "space-y-2"}>
							<Label htmlFor={field.key}>{field.label}</Label>
							{field.textarea ? (
								<Textarea
									id={field.key}
									value={form[field.key] || ""}
									onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
									rows={3}
								/>
							) : (
								<Input
									id={field.key}
									value={form[field.key] || ""}
									onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
								/>
							)}
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	)
}
