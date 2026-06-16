"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

/** Legacy URL — redirects to browse or my-property without breaking live bookmarks. */
export default function PropertiesLegacyRedirectPage() {
	const router = useRouter()
	const searchParams = useSearchParams()

	useEffect(() => {
		const params = new URLSearchParams(searchParams?.toString() ?? "")
		const tab = params.get("tab")

		if (tab === "mine") {
			params.delete("tab")
			const land = params.get("listing") === "land"
			if (land) params.set("tab", "land")
			const query = params.toString()
			router.replace(`/dashboard/my-property${query ? `?${query}` : ""}`)
			return
		}

		if (params.has("type") && !params.has("listing")) {
			params.set("listing", params.get("type")!)
			params.delete("type")
		}
		const query = params.toString()
		router.replace(`/dashboard/browse-properties${query ? `?${query}` : ""}`)
	}, [router, searchParams])

	return (
		<div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
			<Loader2 className="mr-2 h-5 w-5 animate-spin" />
			Redirecting…
		</div>
	)
}
