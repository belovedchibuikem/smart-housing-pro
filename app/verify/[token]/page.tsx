"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { verifyDocumentByToken } from "@/lib/api/issued-documents"

export default function VerifyDocumentTokenPage() {
	const params = useParams()
	const token = typeof params?.token === "string" ? params.token : ""
	const [loading, setLoading] = useState(true)
	const [result, setResult] = useState<{
		success: boolean
		status: string
		document: Record<string, unknown> | null
		branding?: Record<string, unknown>
	} | null>(null)

	useEffect(() => {
		if (!token) return
		void (async () => {
			try {
				const res = await verifyDocumentByToken(token)
				setResult(res)
			} catch {
				setResult({ success: false, status: "not_found", document: null })
			} finally {
				setLoading(false)
			}
		})()
	}, [token])

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-muted-foreground">
				<Loader2 className="h-5 w-5 mr-2 animate-spin" />
				Verifying document…
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-slate-50 px-4 py-10">
			<div className="mx-auto max-w-xl">
				<Card>
					<CardContent className="pt-6 space-y-4">
						{result?.success ? (
							<div className="flex items-center gap-2 text-emerald-700 font-semibold">
								<CheckCircle2 className="h-5 w-5" />
								VERIFIED
							</div>
						) : (
							<div className="flex items-center gap-2 text-red-700 font-semibold">
								<ShieldAlert className="h-5 w-5" />
								{result?.status === "revoked" ? "DOCUMENT HAS BEEN REVOKED" : "DOCUMENT NOT FOUND"}
							</div>
						)}
						{result?.document && (
							<dl className="grid grid-cols-2 gap-3 text-sm">
								{[
									["Document", result.document.title],
									["Issued to", result.document.issued_to],
									["Property", result.document.property],
									["Estate", result.document.estate_name],
									["Issue date", result.document.issue_date],
									["Tenant", result.document.tenant_name],
								].map(([label, value]) => (
									<div key={String(label)}>
										<dt className="text-muted-foreground">{label}</dt>
										<dd className="font-medium">{String(value || "—")}</dd>
									</div>
								))}
							</dl>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
