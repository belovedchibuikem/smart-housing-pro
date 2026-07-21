"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, ArrowRightLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
	apiFetch,
	adminTransferInternalFunds,
	getAdminRefundMemberSummary,
	type InternalFundAccount,
	type AdminRefundMemberSummary,
} from "@/lib/api/client"

type MemberOption = {
	id: string
	name: string
	member_id: string
	identifier_label: string
}

function formatMemberIdentifier(member: {
	member_number?: string | null
	staff_id?: string | null
	ippis_number?: string | null
	frsc_pin?: string | null
	id?: string
}) {
	const parts = [
		member.member_number,
		member.staff_id,
		member.ippis_number ? `IPPIS: ${member.ippis_number}` : null,
		member.frsc_pin ? `PIN: ${member.frsc_pin}` : null,
	].filter(Boolean)

	return parts.length > 0 ? parts.join(" · ") : String(member.id ?? "—")
}

const accountLabel: Record<InternalFundAccount, string> = {
	wallet: "Main Wallet",
	contribution: "Contribution Wallet",
	equity: "Equity Wallet",
}

export default function AdminWalletTransferPage() {
	const [search, setSearch] = useState("")
	const [searching, setSearching] = useState(false)
	const [members, setMembers] = useState<MemberOption[]>([])
	const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null)
	const [summary, setSummary] = useState<AdminRefundMemberSummary["summary"] | null>(null)
	const [loadingSummary, setLoadingSummary] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [fromAccount, setFromAccount] = useState<InternalFundAccount>("contribution")
	const [toAccount, setToAccount] = useState<InternalFundAccount>("wallet")
	const [amount, setAmount] = useState("")
	const [note, setNote] = useState("")

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
						name: `${m?.user?.first_name ?? m?.first_name ?? ""} ${m?.user?.last_name ?? m?.last_name ?? ""}`.trim() || "Unknown Member",
						member_id: String(m?.member_number ?? m?.staff_id ?? m?.ippis_number ?? "—"),
						identifier_label: formatMemberIdentifier(m),
					}))
				)
			} catch {
				setMembers([])
			} finally {
				setSearching(false)
			}
		}, 350)
		return () => clearTimeout(id)
	}, [search, selectedMember])

	const loadSummary = async (memberId: string) => {
		setLoadingSummary(true)
		try {
			const response = await getAdminRefundMemberSummary(memberId)
			setSummary(response?.summary ?? null)
		} catch (error: any) {
			toast.error(error?.message || "Failed to load member balances")
			setSummary(null)
		} finally {
			setLoadingSummary(false)
		}
	}

	const balances = useMemo(() => {
		return {
			wallet: Number(summary?.wallet.balance ?? 0),
			contribution: Number(summary?.contribution.available ?? 0),
			equity: Number(summary?.equity_wallet.balance ?? summary?.equity_wallet.available ?? 0),
		}
	}, [summary])

	const sourceBalance = balances[fromAccount]
	const transferAmount = Number(amount)
	const canSubmit =
		!!selectedMember &&
		fromAccount !== toAccount &&
		Number.isFinite(transferAmount) &&
		transferAmount > 0 &&
		transferAmount <= sourceBalance

	const handleTransfer = async () => {
		if (!selectedMember || !canSubmit) {
			toast.error("Please select valid transfer details.")
			return
		}
		setSubmitting(true)
		try {
			const response = await adminTransferInternalFunds({
				member_id: selectedMember.id,
				from_account: fromAccount,
				to_account: toAccount,
				amount: transferAmount,
				note: note || undefined,
			})
			if (!response.success) {
				throw new Error(response.message || "Transfer failed")
			}
			if (response.balances) {
				setSummary((prev) =>
					prev
						? {
								...prev,
								wallet: { balance: response.balances!.wallet },
								contribution: { ...prev.contribution, available: response.balances!.contribution },
								equity_wallet: {
									...prev.equity_wallet,
									balance: response.balances!.equity,
									available: response.balances!.equity,
								},
							}
						: prev
				)
			}
			toast.success(response.message || "Transfer completed successfully")
			setAmount("")
			setNote("")
			await loadSummary(selectedMember.id)
		} catch (error: any) {
			toast.error(error?.message || "Failed to process transfer")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Wallet Transfer (Admin)</h1>
				<p className="text-muted-foreground mt-2">
					Move funds between a member&apos;s Main Wallet, Contribution Wallet, and Equity Wallet.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Select Member</CardTitle>
					<CardDescription>Search by name, member number, staff ID, IPPIS, or FRSC PIN.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by name, member number, staff ID, or IPPIS..."
							className="pl-10"
							disabled={!!selectedMember}
						/>
					</div>
					{selectedMember ? (
						<div className="flex items-center justify-between rounded-md border p-3">
							<div>
								<p className="font-medium">{selectedMember.name}</p>
								<p className="text-sm text-muted-foreground">{selectedMember.identifier_label}</p>
							</div>
							<Button
								variant="outline"
								onClick={() => {
									setSelectedMember(null)
									setSummary(null)
									setSearch("")
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
										onClick={() => {
											setSelectedMember(member)
											setMembers([])
											void loadSummary(member.id)
										}}
									>
										<p className="font-medium">{member.name}</p>
										<p className="text-sm text-muted-foreground">{member.identifier_label}</p>
									</button>
								))
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{selectedMember && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ArrowRightLeft className="h-4 w-4" />
							Transfer Details
						</CardTitle>
						<CardDescription>Specify source and destination accounts clearly.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-3">
							<div>
								<Label>From Account</Label>
								<Select value={fromAccount} onValueChange={(value) => setFromAccount(value as InternalFundAccount)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="wallet">{accountLabel.wallet}</SelectItem>
										<SelectItem value="contribution">{accountLabel.contribution}</SelectItem>
										<SelectItem value="equity">{accountLabel.equity}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>To Account</Label>
								<Select value={toAccount} onValueChange={(value) => setToAccount(value as InternalFundAccount)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="wallet">{accountLabel.wallet}</SelectItem>
										<SelectItem value="contribution">{accountLabel.contribution}</SelectItem>
										<SelectItem value="equity">{accountLabel.equity}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>Amount (₦)</Label>
								<Input
									type="number"
									min={1}
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="0.00"
								/>
							</div>
						</div>

						<div>
							<Label>Note (Optional)</Label>
							<Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for transfer..." />
						</div>

						<div className="grid gap-2 md:grid-cols-3">
							<Badge variant="outline">Wallet: ₦{balances.wallet.toLocaleString()}</Badge>
							<Badge variant="outline">Contribution: ₦{balances.contribution.toLocaleString()}</Badge>
							<Badge variant="outline">Equity: ₦{balances.equity.toLocaleString()}</Badge>
						</div>
						<p className="text-xs text-muted-foreground">
							Source available balance: {loadingSummary ? "Loading..." : `₦${sourceBalance.toLocaleString()}`}
						</p>

						<div className="flex justify-end">
							<Button onClick={handleTransfer} disabled={submitting || !canSubmit}>
								{submitting ? "Processing..." : "Run Transfer"}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
