"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

interface Subscription {
	id: string
	business_name: string
	status: string
}

export default function CancelSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [sub, setSub] = useState<Subscription | null>(null)

	useEffect(() => {
		let c = false
		;(async () => {
			try {
				setLoading(true)
				const res = await apiFetch<{ success: boolean; subscription: Subscription }>(`/super-admin/subscriptions/${id}`)
				if (!c && res.success && res.subscription) setSub(res.subscription)
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Error"
				if (!c) {
					sonnerToast.error("Failed to load subscription", { description: msg })
					router.push("/super-admin/subscriptions")
				}
			} finally {
				if (!c) setLoading(false)
			}
		})()
		return () => {
			c = true
		}
	}, [id, router])

	const confirmCancel = async () => {
		try {
			setSubmitting(true)
			const res = await apiFetch<{ success: boolean; message?: string }>(`/super-admin/subscriptions/${id}/cancel`, {
				method: "POST",
				body: {},
			})
			if (res.success) {
				sonnerToast.success(res.message || "Subscription cancelled")
				router.push(`/super-admin/subscriptions/${id}`)
			}
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Error"
			sonnerToast.error("Cancel failed", { description: msg })
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<div className="max-w-lg mx-auto flex justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className="max-w-lg mx-auto space-y-6">
			<Button variant="ghost" size="sm" asChild>
				<Link href={`/super-admin/subscriptions/${id}`}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Link>
			</Button>
			<Card>
				<CardHeader>
					<CardTitle>Cancel subscription</CardTitle>
					<CardDescription>
						{sub ? (
							<>
								Business: <strong>{sub.business_name}</strong>
								<br />
								Status: {sub.status}
							</>
						) : (
							"Subscription not found."
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						This will mark the business subscription as cancelled. This action may not be reversible from the UI.
					</p>
					<div className="flex gap-3">
						<Button variant="outline" asChild>
							<Link href={`/super-admin/subscriptions/${id}`}>Keep subscription</Link>
						</Button>
						<Button variant="destructive" onClick={confirmCancel} disabled={!sub || submitting || sub.status !== "active"}>
							{submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
							Confirm cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
