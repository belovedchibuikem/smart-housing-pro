"use client"

import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VerifyDocumentSection({
	config,
}: {
	config?: Record<string, unknown>
}) {
	const title = (config?.title as string) || "Verify Document"
	const subtitle =
		(config?.subtitle as string) ||
		"Confirm the authenticity of official offer letters, allocation letters, receipts, and certificates."
	const cta = (config?.cta_text as string) || "Verify now"

	return (
		<section id="verify" className="py-16 md:py-20 bg-muted/40">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-3xl text-center space-y-4">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
						<ShieldCheck className="h-6 w-6" />
					</div>
					<h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
					<p className="text-muted-foreground">{subtitle}</p>
					<div className="pt-2">
						<Button asChild size="lg">
							<Link href="/verify">{cta}</Link>
						</Button>
					</div>
					<p className="text-xs text-muted-foreground">
						Public verification never exposes private member contact details or payment history.
					</p>
				</div>
			</div>
		</section>
	)
}
