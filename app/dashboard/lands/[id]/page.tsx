"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TenantLandBrowseDetailPage() {
	const params = useParams()
	const id = typeof params?.id === "string" ? params.id : ""
	const [data, setData] = useState<Record<string, unknown> | null>(null)

	useEffect(() => {
		if (!id) return
		void (async () => {
			try {
				const res = await apiFetch<{ success: boolean; land: Record<string, unknown> }>(`/lands/${id}`)
				setData(res.land ?? null)
			} catch {
				setData(null)
			}
		})()
	}, [id])

	if (!data) {
		return (
			<div className="mx-auto max-w-3xl py-12 text-muted-foreground">
				{!id ? "Invalid land reference." : "Loading land details…"}
			</div>
		)
	}

	const title = String(data.land_title ?? "Land parcel")
	const code = String(data.land_code ?? "")

	return (
		<div className="mx-auto max-w-3xl space-y-6 py-8">
			<div className="flex flex-wrap items-center gap-3">
				<Button asChild variant="ghost" size="sm">
					<Link href="/dashboard/properties?listing=land">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Link>
				</Button>
				<Badge variant="outline">🌍 Land</Badge>
				{code ? (
					<Badge variant="secondary" className="font-mono">
						{code}
					</Badge>
				) : null}
			</div>
			<h1 className="text-3xl font-bold">{title}</h1>

			<Card>
				<CardHeader>
					<CardTitle>Overview</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					{data.land_description ? <p>{String(data.land_description)}</p> : null}
					<p className="text-muted-foreground">
						<strong>Size:</strong> {data.land_size ? String(data.land_size) : "—"}
					</p>
					<p className="text-muted-foreground">
						<strong>Total cost:</strong> ₦{Number(data.cost ?? 0).toLocaleString()}
						{(data.cost_includes_infrastructure as boolean) ? " (includes infrastructure)" : ""}
					</p>
					<p className="text-muted-foreground">
						<strong>Location:</strong> {data.location ? String(data.location) : "—"}
					</p>
				</CardContent>
			</Card>

			{(data.infrastructure_plan as unknown[])?.length ? (
				<Card>
					<CardHeader>
						<CardTitle>Infrastructure plan</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						{(data.infrastructure_plan as string[]).map((x: string) => (
							<Badge key={x} variant="secondary">
								{x}
							</Badge>
						))}
					</CardContent>
				</Card>
			) : null}

			{(data.land_features as unknown[])?.length ? (
				<Card>
					<CardHeader>
						<CardTitle>Land features</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						{(data.land_features as string[]).map((x: string) => (
							<Badge key={x}>{x}</Badge>
						))}
					</CardContent>
				</Card>
			) : null}

			{(data.title_documents as unknown[])?.length ? (
				<Card>
					<CardHeader>
						<CardTitle>Title documents</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="list-disc space-y-1 pl-5 text-sm">
							{(data.title_documents as string[]).map((x: string) => (
								<li key={x}>{x}</li>
							))}
						</ul>
					</CardContent>
				</Card>
			) : null}

			<p className="text-xs text-muted-foreground">
				Need payment information? Open <strong>Properties</strong>, filter <strong>Land</strong>, then <strong>My portfolio</strong> for your land account.
			</p>
		</div>
	)
}
