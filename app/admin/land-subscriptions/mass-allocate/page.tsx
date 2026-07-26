"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Can } from "@/components/admin/can-permission"
import { SearchableSelect, propertiesToSearchableOptions } from "@/components/ui/searchable-select"
import { normalizeAdminMembersList } from "@/lib/api/normalize-admin-members"
import { apiFetch, massAllocateLandSubscriptions } from "@/lib/api/client"
import { formatMemberDisplayIdentifier } from "@/hooks/use-sidebar-navigation"

type Member = {
	id: string
	user?: { first_name?: string; last_name?: string; email?: string }
	member_number?: string
	staff_id?: string
	ippis_number?: string
}

type LandOption = {
	id: string
	land_title?: string | null
	land_code?: string | null
	location?: string | null
	slots_available?: number | null
	total_slots?: number | null
}

const CHUNK = 100

export default function MassAllocateLandPage() {
	const { toast } = useToast()
	const [loadingData, setLoadingData] = useState(true)
	const [members, setMembers] = useState<Member[]>([])
	const [lands, setLands] = useState<LandOption[]>([])
	const [landId, setLandId] = useState("")
	const [memberSearch, setMemberSearch] = useState("")
	const [selected, setSelected] = useState<Record<string, boolean>>({})
	const [executing, setExecuting] = useState(false)
	const [report, setReport] = useState<Array<{ member_id: string; status: string; message: string }> | null>(null)

	useEffect(() => {
		void (async () => {
			try {
				const [membersRes, landsRes] = await Promise.all([
					apiFetch<{ success: boolean }>("/admin/members?per_page=1000"),
					apiFetch<{ success: boolean; data: LandOption[] }>("/admin/lands?per_page=1000"),
				])
				setMembers(normalizeAdminMembersList(membersRes) as Member[])
				setLands(landsRes.data || [])
			} catch {
				toast({ title: "Failed to load data", variant: "destructive" })
			} finally {
				setLoadingData(false)
			}
		})()
	}, [toast])

	const filteredMembers = useMemo(() => {
		const q = memberSearch.trim().toLowerCase()
		if (!q) return members
		return members.filter((m) => {
			const name = `${m.user?.first_name ?? ""} ${m.user?.last_name ?? ""}`.toLowerCase()
			const id = (formatMemberDisplayIdentifier(m) ?? "").toLowerCase()
			return name.includes(q) || id.includes(q) || (m.user?.email ?? "").toLowerCase().includes(q)
		})
	}, [members, memberSearch])

	const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected])

	const landOptions = useMemo(
		() =>
			propertiesToSearchableOptions(
				lands.map((l) => ({
					id: l.id,
					title: l.land_title || l.land_code || "Land",
					location: l.location || undefined,
					type_label: "Land",
					total_slots: l.total_slots,
					slots_available: l.slots_available,
				})),
			),
		[lands],
	)

	const toggle = (id: string, checked: boolean) => {
		setSelected((prev) => ({ ...prev, [id]: checked }))
	}

	const togglePage = (checked: boolean) => {
		setSelected((prev) => {
			const next = { ...prev }
			filteredMembers.forEach((m) => {
				next[m.id] = checked
			})
			return next
		})
	}

	const execute = useCallback(async () => {
		if (!landId || selectedIds.length === 0) {
			toast({ title: "Select a land parcel and at least one member", variant: "destructive" })
			return
		}
		setExecuting(true)
		setReport(null)
		let success = 0
		let failed = 0
		const allResults: Array<{ member_id: string; status: string; message: string }> = []
		try {
			for (let i = 0; i < selectedIds.length; i += CHUNK) {
				const chunk = selectedIds.slice(i, i + CHUNK)
				const res = await massAllocateLandSubscriptions({
					land_id: landId,
					items: chunk.map((member_id) => ({ member_id })),
				})
				success += res.data.success_count
				failed += res.data.failed_count
				allResults.push(...res.data.results)
			}
			setReport(allResults)
			toast({
				title: "Mass allocate finished",
				description: `${success} succeeded, ${failed} failed`,
			})
			if (failed === 0) setSelected({})
		} catch (e) {
			toast({
				title: "Mass allocate failed",
				description: e instanceof Error ? e.message : "Unknown error",
				variant: "destructive",
			})
		} finally {
			setExecuting(false)
		}
	}, [landId, selectedIds, toast])

	if (loadingData) {
		return (
			<div className="flex items-center justify-center py-20 text-muted-foreground">
				<Loader2 className="h-5 w-5 mr-2 animate-spin" />
				Loading…
			</div>
		)
	}

	return (
		<Can permission="manage_property_allottees|approve_allotments" fallback={<p className="p-6">No permission.</p>}>
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<Button asChild variant="ghost" size="sm">
						<Link href="/admin/lands?tab=subscriptions">
							<ArrowLeft className="h-4 w-4 mr-1" />
							Back
						</Link>
					</Button>
					<div>
						<h1 className="text-2xl font-semibold">Mass Allocate Land</h1>
						<p className="text-muted-foreground text-sm">
							Select members and assign them to available slots on one land parcel.
						</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Target land</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 max-w-xl">
							<Label>Land parcel</Label>
							<SearchableSelect
								options={landOptions}
								value={landId}
								onValueChange={setLandId}
								placeholder="Select land"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="text-base flex items-center gap-2">
								<Users className="h-4 w-4" />
								Members ({selectedIds.length} selected)
							</CardTitle>
							<CardDescription>Slots are auto-claimed in order for each selected member.</CardDescription>
						</div>
						<Button onClick={() => void execute()} disabled={executing || !landId || selectedIds.length === 0}>
							{executing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
							Allocate selected
						</Button>
					</CardHeader>
					<CardContent className="space-y-3">
						<Input
							placeholder="Filter members…"
							value={memberSearch}
							onChange={(e) => setMemberSearch(e.target.value)}
						/>
						<div className="rounded border max-h-[480px] overflow-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-10">
											<Checkbox
												checked={
													filteredMembers.length > 0 &&
													filteredMembers.every((m) => selected[m.id])
												}
												onCheckedChange={(v) => togglePage(Boolean(v))}
											/>
										</TableHead>
										<TableHead>Member</TableHead>
										<TableHead>ID</TableHead>
										<TableHead>Email</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredMembers.map((m) => (
										<TableRow key={m.id}>
											<TableCell>
												<Checkbox
													checked={Boolean(selected[m.id])}
													onCheckedChange={(v) => toggle(m.id, Boolean(v))}
												/>
											</TableCell>
											<TableCell>
												{`${m.user?.first_name ?? ""} ${m.user?.last_name ?? ""}`.trim() || "—"}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{formatMemberDisplayIdentifier(m)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">{m.user?.email || "—"}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>

				{report && (
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Results</CardTitle>
						</CardHeader>
						<CardContent className="rounded border max-h-[320px] overflow-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Member ID</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Message</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{report.map((row, idx) => (
										<TableRow key={`${row.member_id}-${idx}`}>
											<TableCell className="font-mono text-xs">{row.member_id}</TableCell>
											<TableCell>{row.status}</TableCell>
											<TableCell>{row.message}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}
			</div>
		</Can>
	)
}
