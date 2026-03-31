"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function BusinessAdminPortalPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()

	useEffect(() => {
		router.replace(`/admin?business_id=${encodeURIComponent(id)}`)
	}, [id, router])

	return (
		<div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-muted-foreground">
			<Loader2 className="h-8 w-8 animate-spin" />
			<p className="text-sm">Opening cooperative admin…</p>
		</div>
	)
}
