"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, CheckCircle2, ExternalLink, Download, Search, Loader2, AlertCircle, Copy, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
	getBlockchainStats,
	getBlockchainTransactions,
	getPropertyOwnership,
	type BlockchainTransaction,
	type PropertyOwnershipRecord,
} from "@/lib/api/client"
import { toast } from "sonner"
import Link from "next/link"

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount)
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	})
}

function getStatusBadge(status: string) {
	switch (status) {
		case "confirmed":
			return <Badge className="bg-green-500">Confirmed</Badge>
		case "pending":
			return <Badge className="bg-yellow-500">Pending</Badge>
		case "failed":
			return <Badge className="bg-red-500">Failed</Badge>
		default:
			return <Badge variant="secondary">{status}</Badge>
	}
}

function getTransactionTypeLabel(type: string): string {
	const labels: Record<string, string> = {
		contribution: "Contribution",
		loan: "Loan",
		investment: "Investment",
		payment: "Property Payment",
		transfer: "Transfer",
	}
	return labels[type] || type
}

function truncateHash(hash: string, length = 10): string {
	if (hash.length <= length) return hash
	return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`
}

export default function BlockchainLedgerPage() {
	const [loading, setLoading] = useState(true)
	const [statsLoading, setStatsLoading] = useState(true)
	const [ownershipLoading, setOwnershipLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState("")
	const [stats, setStats] = useState<any>(null)
	const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
	const [ownershipRecords, setOwnershipRecords] = useState<PropertyOwnershipRecord[]>([])
	const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
	const [error, setError] = useState<string | null>(null)

	const fetchStats = useCallback(async () => {
		try {
			setStatsLoading(true)
			const response = await getBlockchainStats()
			setStats(response.stats)
		} catch (err: any) {
			console.error("Failed to fetch stats:", err)
		} finally {
			setStatsLoading(false)
		}
	}, [])

	const fetchTransactions = useCallback(async (search?: string) => {
		try {
			setLoading(true)
			setError(null)
			const response = await getBlockchainTransactions({
				search: search || undefined,
				page: pagination.current_page,
				per_page: pagination.per_page,
			})
			setTransactions(response.transactions)
			setPagination(response.pagination)
		} catch (err: any) {
			const errorMessage = err?.message || "Failed to load blockchain transactions"
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setLoading(false)
		}
	}, [pagination.current_page, pagination.per_page])

	const fetchOwnership = useCallback(async () => {
		try {
			setOwnershipLoading(true)
			const response = await getPropertyOwnership()
			setOwnershipRecords(response.ownership_records)
		} catch (err: any) {
			console.error("Failed to fetch ownership:", err)
		} finally {
			setOwnershipLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchStats()
		fetchOwnership()
	}, [fetchStats, fetchOwnership])

	useEffect(() => {
		fetchTransactions()
	}, [pagination.current_page, fetchTransactions])

	const handleSearch = () => {
		fetchTransactions(searchQuery)
	}

	const handleCopyHash = (hash: string) => {
		navigator.clipboard.writeText(hash)
		toast.success("Hash copied to clipboard")
	}

	const getBlockchainExplorerUrl = (hash: string) => {
		const network = stats?.network_info?.network || "Ethereum"
		if (network === "Ethereum") {
			return `https://etherscan.io/tx/${hash}`
		}
		return `#`
	}

	const verifiedCount = ownershipRecords.filter((r) => r.is_verified).length

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Blockchain Property Ledger</h1>
					<p className="text-muted-foreground mt-1">Immutable record of property ownership and transactions</p>
				</div>
				<Button variant="outline" disabled>
					<Download className="mr-2 h-4 w-4" />
					Export Records
				</Button>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Blockchain Status */}
			<Card className="border-green-500/20 bg-green-500/5">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="h-5 w-5 text-green-500" />
						<CardTitle>Blockchain Verification Status</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					{statsLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-3">
							<div>
								<p className="text-sm text-muted-foreground">Total Properties</p>
								<p className="text-2xl font-bold text-foreground">{ownershipRecords.length}</p>
								<Badge className={`mt-2 ${verifiedCount === ownershipRecords.length ? "bg-green-500" : "bg-yellow-500"}`}>
									{verifiedCount === ownershipRecords.length ? "All Verified" : `${verifiedCount} Verified`}
								</Badge>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Blockchain Network</p>
								<p className="text-2xl font-bold text-foreground">{stats?.network_info?.network || "Ethereum"}</p>
								<p className="text-sm text-muted-foreground mt-1">{stats?.network_info?.network_type || "Mainnet"}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Last Sync</p>
								<p className="text-2xl font-bold text-foreground">{stats?.network_info?.last_sync || "2 mins ago"}</p>
								<div className="flex items-center gap-1 mt-1">
									<CheckCircle2 className="h-3 w-3 text-green-500" />
									<p className="text-sm text-muted-foreground">Synced</p>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Search */}
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by property ID, transaction hash, or address..."
						className="pl-9"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSearch()
							}
						}}
					/>
				</div>
				<Button onClick={handleSearch} disabled={loading}>
					{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
					Search
				</Button>
			</div>

			{/* Property Ownership Records */}
			<Card>
				<CardHeader>
					<CardTitle>Your Property Ownership Records</CardTitle>
					<CardDescription>Blockchain-verified property ownership certificates</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{ownershipLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : ownershipRecords.length === 0 ? (
						<div className="text-center py-12">
							<AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No property ownership records found</p>
						</div>
					) : (
						<div className="space-y-4">
							{ownershipRecords.map((record) => (
								<Card key={record.property_id} className={record.is_verified ? "border-green-500/20" : "border-yellow-500/20"}>
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="space-y-1 flex-1">
												<div className="flex items-center gap-2 flex-wrap">
													<CardTitle className="text-lg">{record.property_title}</CardTitle>
													{record.is_verified ? (
														<Badge className="bg-green-500">
															<CheckCircle2 className="mr-1 h-3 w-3" />
															Verified
														</Badge>
													) : (
														<Badge className="bg-yellow-500">
															<XCircle className="mr-1 h-3 w-3" />
															Pending Verification
														</Badge>
													)}
												</div>
												<CardDescription>
													{record.property_type} • {record.property_location}
												</CardDescription>
											</div>
											<div className="text-right ml-4">
												<p className="text-lg font-bold text-foreground">{record.ownership_percentage.toFixed(1)}% Ownership</p>
												<p className="text-sm text-muted-foreground">{formatCurrency(record.amount_paid)}</p>
											</div>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<p className="text-sm text-muted-foreground">Blockchain Hash</p>
												{record.blockchain_hash ? (
													<div className="flex items-center gap-2 mt-1">
														<code className="text-xs bg-muted px-2 py-1 rounded flex-1">{truncateHash(record.blockchain_hash)}</code>
														<Button
															size="sm"
															variant="ghost"
															onClick={() => handleCopyHash(record.blockchain_hash!)}
															title="Copy hash"
														>
															<Copy className="h-3 w-3" />
														</Button>
														<Button
															size="sm"
															variant="ghost"
															asChild
															title="View on blockchain explorer"
														>
															<a href={getBlockchainExplorerUrl(record.blockchain_hash)} target="_blank" rel="noopener noreferrer">
																<ExternalLink className="h-3 w-3" />
															</a>
														</Button>
													</div>
												) : (
													<p className="text-sm text-muted-foreground mt-1">Not yet recorded on blockchain</p>
												)}
											</div>
											<div>
												<p className="text-sm text-muted-foreground">Certificate Date</p>
												<p className="font-medium text-foreground mt-1">{formatDate(record.certificate_date)}</p>
											</div>
										</div>

										{record.transactions.length > 0 && (
											<div className="rounded-lg bg-muted p-3 space-y-2">
												<p className="text-sm font-semibold text-foreground">Transaction History</p>
												<div className="space-y-1 text-xs">
													{record.transactions.map((tx, idx) => (
														<div key={idx} className="flex justify-between items-center">
															<span className="text-muted-foreground">
																{getTransactionTypeLabel("payment")} - {formatDate(tx.date)}
															</span>
															<div className="flex items-center gap-2">
																<span className="text-foreground">{formatCurrency(tx.amount)}</span>
																{getStatusBadge(tx.status)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										<div className="flex gap-2">
											<Button size="sm" variant="outline" asChild>
												<Link href={`/dashboard/properties/${record.property_id}`}>View Property</Link>
											</Button>
											{record.blockchain_hash && (
												<Button
													size="sm"
													variant="outline"
													asChild
												>
													<a href={getBlockchainExplorerUrl(record.blockchain_hash)} target="_blank" rel="noopener noreferrer">
														<ExternalLink className="mr-2 h-3 w-3" />
														View on Blockchain
													</a>
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Recent Blockchain Transactions */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Blockchain Transactions</CardTitle>
					<CardDescription>All property-related transactions recorded on the blockchain</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : transactions.length === 0 ? (
						<div className="text-center py-12">
							<AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No blockchain transactions found</p>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Hash</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{transactions.map((tx) => (
										<TableRow key={tx.id}>
											<TableCell>{formatDate(tx.created_at)}</TableCell>
											<TableCell>{getTransactionTypeLabel(tx.type)}</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<code className="text-xs bg-muted px-2 py-1 rounded">{truncateHash(tx.hash, 8)}</code>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleCopyHash(tx.hash)}
														title="Copy hash"
													>
														<Copy className="h-3 w-3" />
													</Button>
												</div>
											</TableCell>
											<TableCell>{formatCurrency(tx.amount)}</TableCell>
											<TableCell>{getStatusBadge(tx.status)}</TableCell>
											<TableCell>
												<Button size="sm" variant="ghost" asChild>
													<a href={getBlockchainExplorerUrl(tx.hash)} target="_blank" rel="noopener noreferrer">
														<ExternalLink className="h-3 w-3" />
													</a>
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							{pagination.last_page > 1 && (
								<div className="flex items-center justify-between mt-4">
									<p className="text-sm text-muted-foreground">
										Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
									</p>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											disabled={pagination.current_page === 1}
											onClick={() => {
												setPagination({ ...pagination, current_page: pagination.current_page - 1 })
											}}
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											disabled={pagination.current_page === pagination.last_page}
											onClick={() => {
												setPagination({ ...pagination, current_page: pagination.current_page + 1 })
											}}
										>
											Next
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
