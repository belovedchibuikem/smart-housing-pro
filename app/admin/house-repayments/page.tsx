"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Home, LandPlot, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { apiFetch, getMemberPropertyHoldings, type MemberPropertyHolding } from "@/lib/api/client"
import { AdminAssetRepaymentForm } from "@/components/admin/admin-asset-repayment-form"

type MemberOption = {
	id: string
	name: string
	member_id: string
}

export default function AdminHouseRepaymentsPage() {
	const [search, setSearch] = useState("")
	const [searching, setSearching] = useState(false)
	const [members, setMembers] = useState<MemberOption[]>([])
	const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null)
	const [holdings, setHoldings] = useState<MemberPropertyHolding[]>([])
	const [loadingHoldings, setLoadingHoldings] = useState(false)
	const [activeTenureId, setActiveTenureId] = useState<string | null>(null)
	const [activeAssetType, setActiveAssetType] = useState<"house" | "land">("house")

	useEffect(() => {
		if (!search.trim() || selectedMember) {
			setMembers([])
			return
		}
		const id = setTimeout(async () => {
			setSearching(true)
			try {
				const response = await apiFetch<any>(`/admin/members?search=${encodeURIComponent(search.trim())}`).catch(() => ({ members: [] }))
				const list: any[] = Array.isArray(response?.members)
					? response.members
					: Array.isArray(response?.data)
						? response.data
						: []
				setMembers(
					list.map((m) => ({
						id: String(m.id ?? ""),
						name: `${m?.user?.first_name ?? ""} ${m?.user?.last_name ?? ""}`.trim() || "Unknown Member",
						member_id: String(m?.member_number ?? m?.staff_id ?? "—"),
					})),
				)
			} catch {
				setMembers([])
			} finally {
				setSearching(false)
			}
		}, 350)
		return () => clearTimeout(id)
	}, [search, selectedMember])

	const loadHoldings = async (memberId: string) => {
		setLoadingHoldings(true)
		try {
			const response = await getMemberPropertyHoldings(memberId)
			setHoldings(response.success ? (response.data?.holdings ?? []) : [])
		} catch {
			toast.error("Failed to load member properties")
			setHoldings([])
		} finally {
			setLoadingHoldings(false)
		}
	}

	const selectMember = async (member: MemberOption) => {
		setSelectedMember(member)
		setMembers([])
		setSearch("")
		setActiveTenureId(null)
		await loadHoldings(member.id)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">House & Land Repayments</h1>
				<p className="text-muted-foreground mt-2">
					Record repayments for a member&apos;s house block or land slot using cash, equity wallet, or mortgage disbursement.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Select member</CardTitle>
					<CardDescription>Search by name, member number, or staff ID</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search member..."
							className="pl-10"
							disabled={!!selectedMember}
						/>
					</div>
					{selectedMember ? (
						<div className="flex items-center justify-between rounded-md border p-3">
							<div>
								<p className="font-medium">{selectedMember.name}</p>
								<p className="text-sm text-muted-foreground">{selectedMember.member_id}</p>
							</div>
							<Button
								variant="outline"
								onClick={() => {
									setSelectedMember(null)
									setHoldings([])
									setActiveTenureId(null)
								}}
							>
								Change
							</Button>
						</div>
					) : (
						<div className="space-y-2 max-h-56 overflow-y-auto">
							{searching ? (
								<p className="text-sm text-muted-foreground">Searching...</p>
							) : (
								members.map((member) => (
									<button
										key={member.id}
										type="button"
										className="w-full rounded-md border p-3 text-left hover:bg-muted"
										onClick={() => void selectMember(member)}
									>
										<p className="font-medium">{member.name}</p>
										<p className="text-sm text-muted-foreground">{member.member_id}</p>
									</button>
								))
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{selectedMember && (
				<div className="grid gap-6 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Properties & slots</CardTitle>
							<CardDescription>Select a block or land slot to repay</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{loadingHoldings ? (
								<p className="text-sm text-muted-foreground">Loading holdings...</p>
							) : holdings.length === 0 ? (
								<p className="text-sm text-muted-foreground">No active house or land holdings for this member.</p>
							) : (
								holdings.map((holding) => {
									const Icon = holding.asset_type === "land" ? LandPlot : Home
									const isActive = activeTenureId === holding.holding_id
									return (
										<button
											key={`${holding.asset_type}-${holding.holding_id}`}
											type="button"
											onClick={() => {
												setActiveTenureId(holding.holding_id)
												setActiveAssetType(holding.asset_type)
											}}
											className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
												isActive ? "border-primary bg-primary/5" : "hover:bg-muted/50"
											}`}
										>
											<div className="rounded-md bg-muted p-2">
												<Icon className="h-5 w-5 text-primary" />
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-medium">{holding.title}</p>
												<p className="text-sm text-muted-foreground">
													{holding.slot_label || holding.identifier} · {holding.type_label}
												</p>
												<div className="mt-2 flex flex-wrap gap-2">
													<Badge variant="outline" className="capitalize">
														{holding.status}
													</Badge>
													{holding.hand_label ? <Badge variant="secondary">{holding.hand_label}</Badge> : null}
												</div>
											</div>
											<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
										</button>
									)
								})
							)}
							{selectedMember ? (
								<Link href={`/admin/members/${selectedMember.id}`} className="inline-block text-sm text-primary hover:underline">
									Open full member profile
								</Link>
							) : null}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Repayment</CardTitle>
							<CardDescription>
								{activeTenureId
									? `Recording against ${activeAssetType === "land" ? "land subscription" : "house allocation"}`
									: "Select a property slot on the left"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{activeTenureId ? (
								<AdminAssetRepaymentForm
									assetType={activeAssetType}
									tenureId={activeTenureId}
									memberId={selectedMember.id}
									onSuccess={() => void loadHoldings(selectedMember.id)}
								/>
							) : (
								<p className="text-sm text-muted-foreground">Choose a house block or land slot to continue.</p>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	)
}
