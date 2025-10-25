"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Member {
	id: string
	first_name?: string
	last_name?: string
	email?: string
	status?: string
}

export default function AdminMembersPage() {
	const [members, setMembers] = useState<Member[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [query, setQuery] = useState("")
	const [page, setPage] = useState(1)
	const [lastPage, setLastPage] = useState(1)

	useEffect(() => {
		async function load() {
			try {
				setLoading(true)
				setError(null)
				const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || ""
				const url = new URL(`${base}/members`)
				url.searchParams.set("page", String(page))
				if (query) url.searchParams.set("search", query)
				const res = await fetch(url.toString(), { headers: { Accept: "application/json" }, cache: "no-store" })
				const data = await res.json()
				if (!res.ok) throw new Error(data?.message || "Failed to load members")
				const collection = Array.isArray(data?.data) ? data?.data : data?.members?.data || []
				setMembers(collection)
				setLastPage(data?.last_page || data?.members?.last_page || 1)
			} catch (e) {
				setError(e instanceof Error ? e.message : "Failed to load members")
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [page, query])

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Members</h1>
				<div className="flex gap-2">
					<Input placeholder="Search members" value={query} onChange={(e) => setQuery(e.target.value)} />
					<Button variant="outline" onClick={() => setPage(1)}>Search</Button>
				</div>
			</div>
			<Card className="p-0 overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead className="bg-muted/50">
						<tr>
							<th className="text-left p-3 font-medium">Name</th>
							<th className="text-left p-3 font-medium">Email</th>
							<th className="text-left p-3 font-medium">Status</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="p-3" colSpan={3}>Loading...</td></tr>
						) : error ? (
							<tr><td className="p-3 text-red-600" colSpan={3}>{error}</td></tr>
						) : members.length === 0 ? (
							<tr><td className="p-3 text-muted-foreground" colSpan={3}>No members found.</td></tr>
						) : (
							members.map((m) => (
								<tr key={m.id} className="border-t">
									<td className="p-3">{[m.first_name, m.last_name].filter(Boolean).join(" ") || m.id}</td>
									<td className="p-3">{m.email || "-"}</td>
									<td className="p-3 capitalize">{m.status || "active"}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</Card>
			<div className="flex items-center justify-between">
				<Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
				<div className="text-sm text-muted-foreground">Page {page} of {lastPage}</div>
				<Button variant="outline" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
			</div>
		</div>
	)
}