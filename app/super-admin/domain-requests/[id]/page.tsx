"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

interface DomainRequestDetail {
	id: string
	tenant_id: string
	business_name: string
	business_email?: string
	business_address?: string
	full_domain: string
	status: string
	verification_token?: string
	dns_records: Array<{ type: string; name: string; value: string }>
	requested_at: string
	admin_notes?: string
	verified_at?: string
	activated_at?: string
}

export default function DomainRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [req, setReq] = useState<DomainRequestDetail | null>(null)

	useEffect(() => {
		let c = false
		;(async () => {
			try {
				setLoading(true)
				const res = await apiFetch<{ request: DomainRequestDetail }>(`/super-admin/domain-requests/${id}`)
				if (!c && res.request) setReq(res.request)
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Error"
				if (!c) {
					sonnerToast.error("Failed to load request", { description: msg })
					router.push("/super-admin/domain-requests")
				}
			} finally {
				if (!c) setLoading(false)
			}
		})()
		return () => {
			c = true
		}
	}, [id, router])

	if (loading) {
		return (
			<div className="max-w-3xl mx-auto flex justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (!req) {
		return (
			<div className="max-w-3xl mx-auto">
				<p className="text-muted-foreground">Request not found.</p>
				<Button variant="link" asChild>
					<Link href="/super-admin/domain-requests">Back</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<Button variant="ghost" size="sm" asChild>
				<Link href="/super-admin/domain-requests">
					<ArrowLeft className="h-4 w-4 mr-2" />
					All requests
				</Link>
			</Button>

			<div>
				<h1 className="text-3xl font-bold">{req.full_domain}</h1>
				<p className="text-muted-foreground mt-1">{req.business_name}</p>
				<Badge className="mt-2" variant="outline">
					{req.status}
				</Badge>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Business</CardTitle>
					<CardDescription>Cooperative contact details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					{req.business_email ? (
						<p>
							<span className="text-muted-foreground">Email: </span>
							{req.business_email}
						</p>
					) : null}
					{req.business_address ? (
						<p>
							<span className="text-muted-foreground">Address: </span>
							{req.business_address}
						</p>
					) : null}
					<p>
						<span className="text-muted-foreground">Cooperative ID: </span>
						<span className="font-mono">{req.tenant_id}</span>
					</p>
					<p>
						<span className="text-muted-foreground">Requested: </span>
						{new Date(req.requested_at).toLocaleString()}
					</p>
					{req.verified_at && (
						<p>
							<span className="text-muted-foreground">Verified: </span>
							{new Date(req.verified_at).toLocaleString()}
						</p>
					)}
					{req.activated_at && (
						<p>
							<span className="text-muted-foreground">Activated: </span>
							{new Date(req.activated_at).toLocaleString()}
						</p>
					)}
				</CardContent>
			</Card>

			{req.verification_token ? (
				<Card>
					<CardHeader>
						<CardTitle>Verification token</CardTitle>
						<CardDescription>For DNS configuration</CardDescription>
					</CardHeader>
					<CardContent>
						<code className="text-xs break-all block p-3 bg-muted rounded-md">{req.verification_token}</code>
					</CardContent>
				</Card>
			) : null}

			{req.dns_records?.length ? (
				<Card>
					<CardHeader>
						<CardTitle>DNS records</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{req.dns_records.map((r, i) => (
							<div key={i} className="text-sm border rounded-md p-3 space-y-1">
								<p>
									<span className="text-muted-foreground">Type:</span> {r.type}
								</p>
								<p>
									<span className="text-muted-foreground">Name:</span> {r.name}
								</p>
								<p className="break-all">
									<span className="text-muted-foreground">Value:</span> {r.value}
								</p>
							</div>
						))}
					</CardContent>
				</Card>
			) : null}

			{req.admin_notes ? (
				<Card>
					<CardHeader>
						<CardTitle>Admin notes</CardTitle>
					</CardHeader>
					<CardContent className="text-sm whitespace-pre-wrap">{req.admin_notes}</CardContent>
				</Card>
			) : null}
		</div>
	)
}
