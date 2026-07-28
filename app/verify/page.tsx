"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
	ArrowLeft,
	CheckCircle2,
	Loader2,
	Lock,
	ShieldAlert,
	ShieldCheck,
	Stamp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	getVerifyDocumentBranding,
	verifyDocumentByToken,
	verifyDocumentPublic,
} from "@/lib/api/issued-documents"

function VerifyDocumentPageInner() {
	const router = useRouter()
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
	const secondary = (branding?.secondary_color as string) || "#0f766e"
	const accent = (branding?.accent_color as string) || secondary
	const tenantName =
		(branding?.tenant_name as string) || "Official Document Verification Portal"

	const handleBack = () => {
		if (typeof window !== "undefined" && window.history.length > 1) {
			router.back()
			return
		}
		router.push("/")
	}

	const resultRows: Array<[string, unknown]> = result?.document
		? [
				[
					"Document type",
					result.document.is_receipt
						? "Official Payment Receipt"
						: result.document.title || result.document.document_type,
				],
				["Document number", result.document.document_number],
				...(result.document.is_receipt
					? ([
							["Payment amount", result.document.payment_amount],
							["Payment date", result.document.payment_date],
							["Payment category", result.document.payment_category],
						] as Array<[string, unknown]>)
					: []),
				["Issued to", result.document.issued_to],
				["Property", result.document.property],
				["Estate", result.document.estate_name],
				["Issue date", result.document.issue_date],
				["Status", result.document.status],
				["Issued by", result.document.issued_by],
				["Organization", result.document.tenant_name],
				["Integrity hash", result.document.hash_verified ? "Verified" : "Failed"],
				["Digital seal", result.document.digital_signature_status],
				["Verification no.", result.document.verification_number],
			]
		: []

	return (
		<div
			className="min-h-screen relative overflow-hidden"
			style={{
				background: `linear-gradient(165deg, ${primary}12 0%, #ffffff 45%, ${secondary}10 100%)`,
			}}
		>
			{/* Subtle formal pattern */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.035]"
				style={{
					backgroundImage: `radial-gradient(circle at 1px 1px, ${primary} 1px, transparent 0)`,
					backgroundSize: "22px 22px",
				}}
			/>

			{/* Top accent bar */}
			<div
				className="h-1.5 w-full"
				style={{
					background: `linear-gradient(90deg, ${primary}, ${secondary}, ${primary})`,
				}}
			/>

			<div className="relative mx-auto max-w-2xl px-4 py-8 md:py-12">
				{/* Back + portal badge */}
				<div className="mb-8 flex items-center justify-between gap-3">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleBack}
						className="bg-white/90 backdrop-blur shadow-sm hover:bg-white"
						style={{ borderColor: `${primary}55`, color: primary }}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<span
						className="inline-flex items-center gap-1.5 rounded-full border bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wider shadow-sm"
						style={{ borderColor: `${secondary}55`, color: secondary }}
					>
						<Lock className="h-3 w-3" />
						Secure Portal
					</span>
				</div>

				{/* Crest / branding */}
				<div className="mb-8 text-center space-y-3">
					{(branding?.logo_url as string) ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={branding.logo_url as string}
							alt={tenantName}
							className="mx-auto h-20 w-20 object-contain drop-shadow-sm"
						/>
					) : (
						<div
							className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white shadow-sm"
							style={{ borderColor: primary, color: primary }}
						>
							<Stamp className="h-7 w-7" />
						</div>
					)}
					<div className="space-y-1">
						<p
							className="text-[11px] font-semibold uppercase tracking-[0.22em]"
						style={{ color: accent }}
						>
							Document Authentication
						</p>
						<h1
							className="text-3xl md:text-4xl font-semibold tracking-tight"
							style={{
								color: primary,
								fontFamily: "Georgia, 'Times New Roman', serif",
							}}
						>
							Verify Document
						</h1>
						<p className="text-sm md:text-base font-medium uppercase tracking-wide text-slate-600 max-w-md mx-auto">
							{tenantName}
						</p>
					</div>
					<div
						className="mx-auto h-px w-28"
						style={{ background: `linear-gradient(90deg, transparent, ${primary}, transparent)` }}
					/>
				</div>

				{/* Verification certificate card */}
				<div
					className="rounded-sm border bg-white shadow-[0_20px_50px_-28px_rgba(15,23,42,0.45)] overflow-hidden"
					style={{ borderColor: `${primary}55` }}
				>
					<div
						className="px-6 py-3 border-b flex items-center justify-between gap-3"
						style={{ background: `${primary}12`, borderColor: `${primary}40` }}
					>
						<div className="flex items-center gap-2 text-sm font-semibold" style={{ color: primary }}>
							<ShieldCheck className="h-4 w-4" />
							Official Verification Desk
						</div>
						<span className="text-[10px] uppercase tracking-widest text-slate-500">
							SHA-256 Protected
						</span>
					</div>

					<div className="p-6 md:p-8 space-y-6">
						<div>
							<h2
								className="text-lg font-semibold"
								style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: primary }}
							>
								Enter verification details
							</h2>
							<p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
								Enter a verification number, document number, or reference number.
								Sensitive personal data is never disclosed publicly.
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="query" className="text-slate-700">
								Verification Code
							</Label>
							<Input
								id="query"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") void runVerify(query)
								}}
								placeholder="e.g. SH-2026-ORZ-8DJ3K91A"
								className="h-12 text-base focus-visible:ring-offset-0 font-mono tracking-wide"
								style={{ boxShadow: "inset 0 1px 2px rgba(15,23,42,0.04)", borderColor: `${primary}66` }}
							/>
						</div>

						<Button
							className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
							style={{ backgroundColor: primary }}
							onClick={() => void runVerify(query)}
							disabled={loading || !query.trim()}
						>
							{loading ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<ShieldCheck className="h-4 w-4 mr-2" />
							)}
							{loading ? "Authenticating…" : "Verify Authenticity"}
						</Button>

						{result && (
							<div
								className={`rounded-sm border p-5 space-y-4 ${
									result.success
										? "border"
										: "border-red-300 bg-red-50/70"
								}`}
								style={
									result.success
										? { borderColor: `${primary}66`, backgroundColor: `${primary}10` }
										: undefined
								}
							>
								{result.success ? (
									<div className="flex items-start gap-3">
										<div
											className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
											style={{ backgroundColor: primary }}
										>
											<CheckCircle2 className="h-5 w-5" />
										</div>
										<div>
											<p className="font-semibold tracking-wide" style={{ color: primary }}>
												DOCUMENT AUTHENTIC
											</p>
											<p className="text-sm" style={{ color: secondary }}>
												Status: {String(result.status).replace(/_/g, " ").toUpperCase()}
											</p>
										</div>
									</div>
								) : (
									<div className="flex items-start gap-3">
										<div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
											<ShieldAlert className="h-5 w-5" />
										</div>
										<div>
											<p className="font-semibold text-red-900 tracking-wide">
												{result.status === "revoked"
													? "DOCUMENT REVOKED"
													: result.status === "cancelled"
														? "DOCUMENT CANCELLED"
														: result.status === "integrity_failed"
															? "TAMPERED / INTEGRITY FAILED"
															: "DOCUMENT NOT FOUND"}
											</p>
											<p className="text-sm text-red-800/80">
												This code could not be authenticated against official records.
											</p>
										</div>
									</div>
								)}

								{result.document && (
									<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 border-t pt-4" style={{ borderColor: `${primary}33` }}>
										{resultRows.map(([label, value]) => (
											<div key={String(label)} className="min-w-0">
												<dt className="text-[11px] uppercase tracking-wider text-slate-500">
													{label}
												</dt>
												<dd className="mt-0.5 text-sm font-medium text-slate-900 break-words">
													{String(value || "—")}
												</dd>
											</div>
										))}
									</dl>
								)}
							</div>
						)}
					</div>

					<div
						className="border-t px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500"
						style={{ borderColor: `${primary}33`, backgroundColor: `${secondary}08` }}
					>
						<span>Official records · QR & hash verified</span>
						<Link href="/" className="underline underline-offset-2 hover:text-slate-800">
							Return to homepage
						</Link>
					</div>
				</div>

				<p className="mt-6 text-center text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
					This portal confirms document authenticity only. It never exposes private member contact
					details, full payment history, or confidential account information.
				</p>
			</div>
		</div>
	)
}

export default function VerifyDocumentPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center text-muted-foreground bg-[#f7f4ef]">
					<Loader2 className="h-5 w-5 mr-2 animate-spin" />
					Loading verification portal…
				</div>
			}
		>
			<VerifyDocumentPageInner />
		</Suspense>
	)
}
