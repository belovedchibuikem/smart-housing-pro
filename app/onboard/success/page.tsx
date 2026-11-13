"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"

function OnboardSuccessContent() {
	const params = useSearchParams()
	const paid = params.get("paid") === "1"
	const reference = params.get("reference")
	const slug = params.get("slug")

	return (
		<div className="mx-auto max-w-lg space-y-4 px-4 py-16">
			<h1 className="text-3xl font-bold">{paid ? "Payment confirmed" : "Payment not confirmed"}</h1>
			<p className="text-muted-foreground">
				{paid
					? "The first payment succeeded. Your cooperative database and admin user are created from that payment. Sign in on your cooperative address with the admin email you registered."
					: "The payment was not confirmed, so the cooperative database was not created. You can return to registration and try again, or complete a bank transfer and wait for approval."}
			</p>
			{reference ? <p className="text-sm">Reference: {reference}</p> : null}
			{slug ? <p className="text-sm">Workspace address slug: {slug}</p> : null}
			<Link href="/onboard" className="text-primary underline">
				Back to registration
			</Link>
		</div>
	)
}

export default function OnboardSuccessPage() {
	return (
		<Suspense fallback={<div className="px-4 py-16">Checking payment…</div>}>
			<OnboardSuccessContent />
		</Suspense>
	)
}
