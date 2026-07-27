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
import { apiFetch, massAllocatePropertyAllottees } from "@/lib/api/client"
import { getPropertyTypeLabel } from "@/lib/properties/property-type-label"
import { formatMemberIdentifierDetails } from "@/hooks/use-sidebar-navigation"

type Member = {
	id: string
	first_name?: string
	last_name?: string
	email?: string
	user?: { first_name?: string; last_name?: string; email?: string }
	member_number?: string
	staff_id?: string
	ippis_number?: string
	frsc_pin?: string
}

type PropertyOption = {
	id: string
	title: string
	location?: string
	type?: string
	type_label?: string
	slots_available?: number | null
}

const CHUNK = 100

function memberName(m: Member) {
	return (
		`${m.user?.first_name ?? m.first_name ?? ""} ${m.user?.last_name ?? m.last_name ?? ""}`.trim() || "—"
	)
}

function memberEmail(m: Member) {
	return m.user?.email || m.email || "—"
}

export default function MassAllocateHousesPage() {
	const { toast } = useToast()
	const [loadingData, setLoadingData] = useState(true)
	const [searchLoading, setSearchLoading] = useState(false)
	const [baseMembers, setBaseMembers] = useState<Member[]>([])
	const [searchResults, setSearchResults] = useState<Member[] | null>(null)
	const [properties, setProperties] = useState<PropertyOption[]>([])
	const [propertyId, setPropertyId] = useState("")
	const [allocationDate, setAllocationDate] = useState(() => new Date().toISOString().slice(0, 10))
	const [memberSearch, setMemberSearch] = useState("")
	const [selected, setSelected] = useState<Record<string, boolean>>({})
	const [executing, setExecuting] = useState(false)
	const [report, setReport] = useState<Array<{ member_id: string; status: string; message: string }> | null>(null)

	useEffect(() => {
		void (async () => {
			try {
				const [membersRes, propsRes] = await Promise.all([
					apiFetch<{ success: boolean }>("/admin/members?per_page=100"),
					apiFetch<{ success: boolean; data: PropertyOption[] }>("/admin/properties?per_page=1000"),
				])
				setBaseMembers(normalizeAdminMembersList(membersRes) as Member[])
				setProperties((propsRes.data || []).filter((p) => p.type !== "land"))
			} catch {
				toast({ title: "Failed to load data", variant: "destructive" })
			} finally {
				setLoadingData(false)
			}
		})()
	}, [toast])

	// Server-side search so IPPIS / staff ID / member no work across the full member directory
	useEffect(() => {
		const q = memberSearch.trim()
		if (!q) {
			setSearchResults(null)
			return
		}
		const handle = window.setTimeout(() => {
			void (async () => {
				setSearchLoading(true)
				try {
					const res = await apiFetch<{ success: boolean }>(
						`/admin/members?search=${encodeURIComponent(q)}&per_page=100`,
					)
					setSearchResults(normalizeAdminMembersList(res) as Member[])
				} catch {
					toast({ title: "Member search failed", variant: "destructive" })
				} finally {
					setSearchLoading(false)
				}
			})()
		}, 300)
		return () => window.clearTimeout(handle)
	}, [memberSearch, toast])

	const displayedMembers = searchResults ?? baseMembers
	const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected])

	const propertyOptions = useMemo(
		() =>
			propertiesToSearchableOptions(
				properties.map((p) => ({ ...p, type_label: p.type_label || getPropertyTypeLabel(p) })),
			),
		[properties],
	)

	const toggle = (id: string, checked: boolean) => {
		setSelected((prev) => ({ ...prev, [id]: checked }))
	}

	const togglePage = (checked: boolean) => {
		setSelected((prev) => {
			const next = { ...prev }
			displayedMembers.forEach((m) => {
				next[m.id] = checked
			})
			return next
		})
	}

	const execute = useCallback(async () => {
		if (!propertyId || selectedIds.length === 0) {
			toast({ title: "Select a property and at least one member", variant: "destructive" })
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
				const res = await massAllocatePropertyAllottees({
					property_id: propertyId,
					allocation_date: allocationDate,
					status: "completed",
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
	}, [allocationDate, propertyId, selectedIds, toast])

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
						<Link href="/admin/property-management/allottees">
							<ArrowLeft className="h-4 w-4 mr-1" />
							Back
						</Link>
					</Button>
					<div>
						<h1 className="text-2xl font-semibold">Mass Allocate Houses</h1>
						<p className="text-muted-foreground text-sm">
							Select members and assign them to available slots on one property.
						</p>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Target property</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Property</Label>
							<SearchableSelect
								options={propertyOptions}
								value={propertyId}
								onValueChange={setPropertyId}
								placeholder="Select property"
							/>
						</div>
						<div className="space-y-2">
							<Label>Allocation date</Label>
							<Input type="date" value={allocationDate} onChange={(e) => setAllocationDate(e.target.value)} />
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
						<Button onClick={() => void execute()} disabled={executing || !propertyId || selectedIds.length === 0}>
							{executing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
							Allocate selected
						</Button>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="relative">
							<Input
								placeholder="Search by IPPIS, member no, staff ID, name, or email…"
								value={memberSearch}
								onChange={(e) => setMemberSearch(e.target.value)}
							/>
							{searchLoading ? (
								<Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
							) : null}
						</div>
						<div className="rounded border max-h-[480px] overflow-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-10">
											<Checkbox
												checked={
													displayedMembers.length > 0 &&
													displayedMembers.every((m) => selected[m.id])
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
									{displayedMembers.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} className="text-center text-muted-foreground py-8">
												{memberSearch.trim()
													? "No members match that search (try IPPIS, member no, or staff ID)."
													: "No members found."}
											</TableCell>
										</TableRow>
									) : (
										displayedMembers.map((m) => (
											<TableRow key={m.id}>
												<TableCell>
													<Checkbox
														checked={Boolean(selected[m.id])}
														onCheckedChange={(v) => toggle(m.id, Boolean(v))}
													/>
												</TableCell>
												<TableCell>{memberName(m)}</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{formatMemberIdentifierDetails(m) || "—"}
												</TableCell>
												<TableCell className="text-sm text-muted-foreground">{memberEmail(m)}</TableCell>
											</TableRow>
										))
									)}
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
