"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePageLoading } from "@/hooks/use-loading"
import {
	getAdminInvestmentWithdrawalRequests,
	getAdminInvestmentWithdrawalStats,
	approveInvestmentWithdrawalRequest,
	rejectInvestmentWithdrawalRequest,
	processInvestmentWithdrawalRequest,
	type AdminInvestmentWithdrawalRequest,
} from "@/lib/api/client"
import {
	Search,
	Eye,
	CheckCircle2,
	XCircle,
	Clock,
	Loader2,
	Filter,
	TrendingUp,
	DollarSign,
	User,
} from "lucide-react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { formatDistanceToNow, parseISO } from "date-fns"

const currencyFormatter = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	minimumFractionDigits: 0,
})

export default function AdminInvestmentWithdrawalRequestsPage() {
	const { isLoading, loadData } = usePageLoading()
	const [withdrawals, setWithdrawals] = useState<AdminInvestmentWithdrawalRequest[]>([])
	const [stats, setStats] = useState<any>(null)
	const [searchQuery, setSearchQuery] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminInvestmentWithdrawalRequest | null>(null)
	const [approveDialogOpen, setApproveDialogOpen] = useState(false)
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
	const [processDialogOpen, setProcessDialogOpen] = useState(false)
	const [adminResponse, setAdminResponse] = useState("")
	const [rejectionReason, setRejectionReason] = useState("")
	const [processImmediately, setProcessImmediately] = useState(false)
	const [processing, setProcessing] = useState(false)

	const statusColors: Record<string, string> = {
		pending: "bg-yellow-100 text-yellow-800",
		approved: "bg-blue-100 text-blue-800",
		rejected: "bg-red-100 text-red-800",
		processing: "bg-purple-100 text-purple-800",
		completed: "bg-green-100 text-green-800",
	}

	const loadWithdrawals = useCallback(async () => {
		try {
			const response = await loadData(() =>
				getAdminInvestmentWithdrawalRequests({
					status: statusFilter !== "all" ? statusFilter : undefined,
					search: searchQuery || undefined,
					page: currentPage,
					per_page: 15,
				})
			)
			if (response) {
				setWithdrawals(response.withdrawals)
				setTotalPages(response.pagination.last_page)
			}
		} catch (error: any) {
			toast.error(error.message || "Failed to load withdrawal requests")
		}
	}, [statusFilter, searchQuery, currentPage, loadData])

	const loadStats = useCallback(async () => {
		try {
			const response = await getAdminInvestmentWithdrawalStats()
			setStats(response.stats)
		} catch (error: any) {
			console.error("Failed to load stats:", error)
		}
	}, [])

	useEffect(() => {
		loadWithdrawals()
		loadStats()
	}, [loadWithdrawals, loadStats])

	const handleApprove = async () => {
		if (!selectedWithdrawal) return

		setProcessing(true)
		try {
			await approveInvestmentWithdrawalRequest(selectedWithdrawal.id, {
				admin_response: adminResponse || undefined,
				process_immediately: processImmediately,
			})
			toast.success("Withdrawal request approved successfully")
			setApproveDialogOpen(false)
			setSelectedWithdrawal(null)
			setAdminResponse("")
			setProcessImmediately(false)
			loadWithdrawals()
			loadStats()
		} catch (error: any) {
			toast.error(error.message || "Failed to approve withdrawal request")
		} finally {
			setProcessing(false)
		}
	}

	const handleReject = async () => {
		if (!selectedWithdrawal || !rejectionReason.trim()) {
			toast.error("Please provide a rejection reason")
			return
		}

		setProcessing(true)
		try {
			await rejectInvestmentWithdrawalRequest(selectedWithdrawal.id, rejectionReason)
			toast.success("Withdrawal request rejected successfully")
			setRejectDialogOpen(false)
			setSelectedWithdrawal(null)
			setRejectionReason("")
			loadWithdrawals()
			loadStats()
		} catch (error: any) {
			toast.error(error.message || "Failed to reject withdrawal request")
		} finally {
			setProcessing(false)
		}
	}

	const handleProcess = async () => {
		if (!selectedWithdrawal) return

		setProcessing(true)
		try {
			await processInvestmentWithdrawalRequest(selectedWithdrawal.id)
			toast.success("Withdrawal processed successfully")
			setProcessDialogOpen(false)
			setSelectedWithdrawal(null)
			loadWithdrawals()
			loadStats()
		} catch (error: any) {
			toast.error(error.message || "Failed to process withdrawal")
		} finally {
			setProcessing(false)
		}
	}

	const formatTimeAgo = (dateString: string | null) => {
		if (!dateString) return "N/A"
		try {
			return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
		} catch {
			return dateString
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Investment Withdrawal Requests</h1>
					<p className="text-muted-foreground">Manage investment withdrawal requests from members</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Requests</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.total_requests ?? 0}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.pending ?? 0}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Pending Amount</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{currencyFormatter.format(stats?.total_amount_pending ?? 0)}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.completed ?? 0}</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle>Filter Requests</CardTitle>
					<CardDescription>Search and filter withdrawal requests by status</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by member name or investment ID..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="approved">Approved</SelectItem>
								<SelectItem value="rejected">Rejected</SelectItem>
								<SelectItem value="processing">Processing</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Withdrawal Requests Table */}
			<Card>
				<CardHeader>
					<CardTitle>Withdrawal Requests</CardTitle>
					<CardDescription>Review and process investment withdrawal requests</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Member</TableHead>
									<TableHead>Investment</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Requested</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-8">
											<Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
											<p className="text-muted-foreground mt-2">Loading withdrawal requests...</p>
										</TableCell>
									</TableRow>
								) : withdrawals.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
											No withdrawal requests found.
										</TableCell>
									</TableRow>
								) : (
									withdrawals.map((withdrawal) => (
										<TableRow key={withdrawal.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-muted-foreground" />
													<div>
														<div className="font-medium">
															{withdrawal.member?.user
																? `${withdrawal.member.user.first_name} ${withdrawal.member.user.last_name}`
																: "N/A"}
														</div>
														<div className="text-sm text-muted-foreground">{withdrawal.member?.user?.email}</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													<div className="font-medium">#{withdrawal.investment_id.slice(0, 8)}</div>
													{withdrawal.investment && (
														<div className="text-muted-foreground">{currencyFormatter.format(withdrawal.investment.amount)}</div>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="font-semibold">{currencyFormatter.format(withdrawal.amount)}</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline" className="capitalize">
													{withdrawal.withdrawal_type}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge className={statusColors[withdrawal.status] || "bg-gray-100 text-gray-800"}>
													{withdrawal.status}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													<div>{formatTimeAgo(withdrawal.requested_at)}</div>
													{withdrawal.reason && (
														<div className="text-muted-foreground line-clamp-1">{withdrawal.reason}</div>
													)}
												</div>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => {
															setSelectedWithdrawal(withdrawal)
														}}
													>
														<Eye className="h-4 w-4" />
													</Button>
													{withdrawal.status === "pending" && (
														<>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => {
																	setSelectedWithdrawal(withdrawal)
																	setApproveDialogOpen(true)
																}}
															>
																<CheckCircle2 className="h-4 w-4 text-green-600" />
															</Button>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => {
																	setSelectedWithdrawal(withdrawal)
																	setRejectDialogOpen(true)
																}}
															>
																<XCircle className="h-4 w-4 text-red-600" />
															</Button>
														</>
													)}
													{withdrawal.status === "approved" && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setSelectedWithdrawal(withdrawal)
																setProcessDialogOpen(true)
															}}
														>
															<DollarSign className="h-4 w-4" />
														</Button>
													)}
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex justify-end space-x-2 mt-4">
							<Button
								variant="outline"
								onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
								disabled={currentPage === 1 || isLoading}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
								disabled={currentPage === totalPages || isLoading}
							>
								Next
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* View Withdrawal Dialog */}
			<Dialog open={!!selectedWithdrawal && !approveDialogOpen && !rejectDialogOpen && !processDialogOpen} onOpenChange={() => setSelectedWithdrawal(null)}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Withdrawal Request Details</DialogTitle>
						<DialogDescription>View full details of the withdrawal request</DialogDescription>
					</DialogHeader>
					{selectedWithdrawal && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Member</Label>
									<p className="text-sm font-medium">
										{selectedWithdrawal.member?.user
											? `${selectedWithdrawal.member.user.first_name} ${selectedWithdrawal.member.user.last_name}`
											: "N/A"}
									</p>
									<p className="text-xs text-muted-foreground">{selectedWithdrawal.member?.user?.email}</p>
								</div>
								<div>
									<Label>Amount</Label>
									<p className="text-sm font-semibold">{currencyFormatter.format(selectedWithdrawal.amount)}</p>
								</div>
								<div>
									<Label>Type</Label>
									<Badge variant="outline" className="capitalize">
										{selectedWithdrawal.withdrawal_type}
									</Badge>
								</div>
								<div>
									<Label>Status</Label>
									<Badge className={statusColors[selectedWithdrawal.status] || "bg-gray-100 text-gray-800"}>
										{selectedWithdrawal.status}
									</Badge>
								</div>
								<div>
									<Label>Requested</Label>
									<p className="text-sm">{formatTimeAgo(selectedWithdrawal.requested_at)}</p>
								</div>
								{selectedWithdrawal.approved_at && (
									<div>
										<Label>Approved</Label>
										<p className="text-sm">{formatTimeAgo(selectedWithdrawal.approved_at)}</p>
									</div>
								)}
								{selectedWithdrawal.rejected_at && (
									<div>
										<Label>Rejected</Label>
										<p className="text-sm">{formatTimeAgo(selectedWithdrawal.rejected_at)}</p>
									</div>
								)}
								{selectedWithdrawal.completed_at && (
									<div>
										<Label>Completed</Label>
										<p className="text-sm">{formatTimeAgo(selectedWithdrawal.completed_at)}</p>
									</div>
								)}
							</div>
							{selectedWithdrawal.reason && (
								<div>
									<Label>Reason</Label>
									<p className="text-sm text-muted-foreground">{selectedWithdrawal.reason}</p>
								</div>
							)}
							{selectedWithdrawal.admin_response && (
								<div>
									<Label>Admin Response</Label>
									<p className="text-sm text-muted-foreground">{selectedWithdrawal.admin_response}</p>
								</div>
							)}
							{selectedWithdrawal.rejection_reason && (
								<div>
									<Label>Rejection Reason</Label>
									<p className="text-sm text-red-600">{selectedWithdrawal.rejection_reason}</p>
								</div>
							)}
							{selectedWithdrawal.investment && (
								<div>
									<Label>Investment Details</Label>
									<div className="text-sm space-y-1">
										<p>
											<span className="text-muted-foreground">Amount:</span>{" "}
											{currencyFormatter.format(selectedWithdrawal.investment.amount)}
										</p>
										<p>
											<span className="text-muted-foreground">Status:</span> {selectedWithdrawal.investment.status}
										</p>
									</div>
								</div>
							)}
						</div>
					)}
					<DialogFooter>
						{selectedWithdrawal?.status === "pending" && (
							<>
								<Button
									variant="outline"
									onClick={() => {
										setApproveDialogOpen(true)
									}}
								>
									Approve
								</Button>
								<Button
									variant="destructive"
									onClick={() => {
										setRejectDialogOpen(true)
									}}
								>
									Reject
								</Button>
							</>
						)}
						{selectedWithdrawal?.status === "approved" && (
							<Button onClick={() => setProcessDialogOpen(true)}>Process Withdrawal</Button>
						)}
						<Button variant="outline" onClick={() => setSelectedWithdrawal(null)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Approve Dialog */}
			<Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Approve Withdrawal Request</DialogTitle>
						<DialogDescription>Approve this withdrawal request and optionally process it immediately</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{selectedWithdrawal && (
							<div className="space-y-2">
								<p className="text-sm">
									<strong>Member:</strong>{" "}
									{selectedWithdrawal.member?.user
										? `${selectedWithdrawal.member.user.first_name} ${selectedWithdrawal.member.user.last_name}`
										: "N/A"}
								</p>
								<p className="text-sm">
									<strong>Amount:</strong> {currencyFormatter.format(selectedWithdrawal.amount)}
								</p>
								<p className="text-sm">
									<strong>Type:</strong> <span className="capitalize">{selectedWithdrawal.withdrawal_type}</span>
								</p>
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="admin_response">Admin Response (Optional)</Label>
							<Textarea
								id="admin_response"
								placeholder="Add a response message for the member..."
								value={adminResponse}
								onChange={(e) => setAdminResponse(e.target.value)}
								rows={3}
							/>
						</div>
						<div className="flex items-center space-x-2">
							<Switch id="process_immediately" checked={processImmediately} onCheckedChange={setProcessImmediately} />
							<Label htmlFor="process_immediately" className="cursor-pointer">
								Process withdrawal immediately
							</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleApprove} disabled={processing}>
							{processing ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Processing...
								</>
							) : (
								"Approve"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reject Dialog */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Withdrawal Request</DialogTitle>
						<DialogDescription>Provide a reason for rejecting this withdrawal request</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{selectedWithdrawal && (
							<div className="space-y-2">
								<p className="text-sm">
									<strong>Member:</strong>{" "}
									{selectedWithdrawal.member?.user
										? `${selectedWithdrawal.member.user.first_name} ${selectedWithdrawal.member.user.last_name}`
										: "N/A"}
								</p>
								<p className="text-sm">
									<strong>Amount:</strong> {currencyFormatter.format(selectedWithdrawal.amount)}
								</p>
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="rejection_reason">Rejection Reason *</Label>
							<Textarea
								id="rejection_reason"
								placeholder="Provide a reason for rejection..."
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								rows={4}
								required
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleReject} disabled={processing || !rejectionReason.trim()}>
							{processing ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Processing...
								</>
							) : (
								"Reject"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Process Dialog */}
			<Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Process Withdrawal</DialogTitle>
						<DialogDescription>Process this withdrawal and credit the member's wallet</DialogDescription>
					</DialogHeader>
					{selectedWithdrawal && (
						<div className="space-y-4">
							<div className="space-y-2">
								<p className="text-sm">
									<strong>Member:</strong>{" "}
									{selectedWithdrawal.member?.user
										? `${selectedWithdrawal.member.user.first_name} ${selectedWithdrawal.member.user.last_name}`
										: "N/A"}
								</p>
								<p className="text-sm">
									<strong>Amount:</strong> {currencyFormatter.format(selectedWithdrawal.amount)}
								</p>
								<p className="text-sm">
									<strong>Type:</strong> <span className="capitalize">{selectedWithdrawal.withdrawal_type}</span>
								</p>
							</div>
							<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
								<p className="text-sm text-yellow-900 dark:text-yellow-100">
									This will credit {currencyFormatter.format(selectedWithdrawal.amount)} to the member's wallet and mark the withdrawal as completed.
								</p>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleProcess} disabled={processing}>
							{processing ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Processing...
								</>
							) : (
								"Process Withdrawal"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

