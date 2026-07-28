"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, ShieldAlert, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	getVerifyDocumentBranding,
	verifyDocumentByToken,
	verifyDocumentPublic,
} from "@/lib/api/issued-documents"

function VerifyDocumentPageInner() {
	const searchParams = useSearchParams()
	const [query, setQuery] = useState("")
	const [loading, setLoading] = useState(false)
	const [branding, setBranding] = useState<Record<string, unknown> | null>(null)
	const [result, setResult] = useState<{
		success: boolean
		status: string
		document: Record<string, unknown> | null
	} | null>(null)

	useEffect(() => {
		void getVerifyDocumentBranding()
			.then((res) => setBranding(res.branding || null))
			.catch(() => undefined)
	}, [])

	useEffect(() => {
		const token = searchParams.get("code") || searchParams.get("token")
		if (!token) return
		setQuery(token)
		void runVerify(token, true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams])

	const runVerify = async (value: string, byToken = false) => {
		const trimmed = value.trim()
		if (!trimmed) return
		setLoading(true)
		try {
			const res = byToken ? await verifyDocumentByToken(trimmed) : await verifyDocumentPublic(trimmed)
			setResult({ success: res.success, status: res.status, document: res.document })
			if (res.branding) setBranding(res.branding)
		} catch {
			setResult({ success: false, status: "not_found", document: null })
		} finally {
			setLoading(false)
		}
	}

	const primary = (branding?.primary_color as string) || "#1B5E20"

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
			<div className="mx-auto max-w-xl space-y-6">
				<div className="text-center space-y-2">
					{(branding?.logo_url as string) && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={branding.logo_url as string}
							alt="Logo"
							className="mx-auto h-16 w-16 object-contain"
						/>
					)}
					<h1 className="text-2xl font-semibold" style={{ color: primary }}>
						Verify Document
					</h1>
					<p className="text-muted-foreground text-sm">
						{(branding?.tenant_name as string) || "Official document verification"}
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Enter verification details</CardTitle>
						<CardDescription>
							Verification number, document number, or reference number. Sensitive personal data is never shown.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="query">Code</Label>
							<Input
								id="query"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="e.g. SH-2026-ORZ-8DJ3K91A"
							/>
						</div>
						<Button className="w-full" onClick={() => void runVerify(query)} disabled={loading}>
							{loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
							Verify
						</Button>
					</CardContent>
				</Card>

				{result && (
					<Card>
						<CardContent className="pt-6 space-y-3">
							{result.success ? (
								<div className="flex items-center gap-2 text-emerald-700 font-semibold">
									<CheckCircle2 className="h-5 w-5" />
									VERIFIED ({result.status.toUpperCase()})
								</div>
							) : (
								<div className="flex items-center gap-2 text-red-700 font-semibold">
									<ShieldAlert className="h-5 w-5" />
									{result.status === "revoked"
										? "DOCUMENT HAS BEEN REVOKED"
										: result.status === "cancelled"
											? "DOCUMENT HAS BEEN CANCELLED"
											: "DOCUMENT NOT FOUND"}
								</div>
							)}

							{result.document && (
								<dl className="grid grid-cols-2 gap-3 text-sm">
									{[
										["Document type", result.document.is_receipt ? "Official Payment Receipt" : (result.document.title || result.document.document_type)],
										["Receipt number", result.document.document_number],
										...(result.document.is_receipt
											? [
													["Payment amount", result.document.payment_amount],
													["Payment date", result.document.payment_date],
													["Payment category", result.document.payment_category],
												]
											: []),
										["Issued to", result.document.issued_to],
										["Property", result.document.property],
										["Estate", result.document.estate_name],
										["Issue date", result.document.issue_date],
										["Status", result.document.status],
										["Issued by", result.document.issued_by],
										["Tenant", result.document.tenant_name],
										["Hash verified", result.document.hash_verified ? "Yes" : "No"],
										["Digital signature", result.document.digital_signature_status],
										["Verification no.", result.document.verification_number],
									].map(([label, value]) => (
										<div key={String(label)}>
											<dt className="text-muted-foreground">{label}</dt>
											<dd className="font-medium break-words">{String(value || "—")}</dd>
										</div>
									))}
								</dl>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}

export default function VerifyDocumentPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center text-muted-foreground">
					<Loader2 className="h-5 w-5 mr-2 animate-spin" />
					Loading…
				</div>
			}
		>
			<VerifyDocumentPageInner />
		</Suspense>
	)
}
