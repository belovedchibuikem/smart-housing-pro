"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, Shield, Activity, User, LogIn, LogOut, FileText, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAuditLogs, getAuditLogStats, exportAuditLogs } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

// Icon mapping for actions
const actionIconMap: Record<string, any> = {
	create: Plus,
	update: Edit,
	delete: Trash2,
	login: LogIn,
	logout: LogOut,
	approve: Shield,
	reject: Shield,
	view: FileText,
}

// Color mapping for action badges
const actionColorMap: Record<string, string> = {
	create: "bg-green-100 text-green-800 border-green-200",
	update: "bg-blue-100 text-blue-800 border-blue-200",
	delete: "bg-red-100 text-red-800 border-red-200",
	login: "bg-emerald-100 text-emerald-800 border-emerald-200",
	logout: "bg-gray-100 text-gray-800 border-gray-200",
	approve: "bg-green-100 text-green-800 border-green-200",
	reject: "bg-orange-100 text-orange-800 border-orange-200",
	view: "bg-purple-100 text-purple-800 border-purple-200",
}

interface AuditLog {
	id: string
	user: {
		id: string
		name: string
		email: string
	} | null
	action: string
	module: string
	resource_type: string | null
	resource_id: string | null
	description: string
	old_values: any
	new_values: any
	metadata: any
	ip_address: string | null
	user_agent: string | null
	created_at: string
	created_at_formatted: string
}

export default function AuditLogsPage() {
	const { toast } = useToast()
	const [searchQuery, setSearchQuery] = useState("")
	const [filterAction, setFilterAction] = useState("all")
	const [filterModule, setFilterModule] = useState("all")
	const [dateRange, setDateRange] = useState("this-month")
	const [loading, setLoading] = useState(true)
	const [statsLoading, setStatsLoading] = useState(true)
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
	const [stats, setStats] = useState<any>(null)
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [pagination, setPagination] = useState<any>(null)

	useEffect(() => {
		fetchLogs()
		fetchStats()
	}, [searchQuery, filterAction, filterModule, dateRange])

	const fetchLogs = async () => {
		try {
			setLoading(true)
			const response = await getAuditLogs({
				search: searchQuery || undefined,
				action: filterAction !== 'all' ? filterAction : undefined,
				module: filterModule !== 'all' ? filterModule : undefined,
				date_range: dateRange,
				per_page: 50,
			})
			if (response.success) {
				setAuditLogs(response.data || [])
				setPagination(response.pagination || null)
			}
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to load audit logs",
				variant: "destructive",
			})
		} finally {
			setLoading(false)
		}
	}

	const fetchStats = async () => {
		try {
			setStatsLoading(true)
			const response = await getAuditLogStats({
				date_range: dateRange,
			})
			if (response.success) {
				setStats(response.stats)
			}
		} catch (error: any) {
			console.error("Failed to load stats:", error)
		} finally {
			setStatsLoading(false)
		}
	}

	const handleExport = async () => {
		try {
			await exportAuditLogs({
				date_range: dateRange,
				search: searchQuery || undefined,
				action: filterAction !== 'all' ? filterAction : undefined,
				module: filterModule !== 'all' ? filterModule : undefined,
			})
			toast({
				title: "Export successful",
				description: "Audit logs have been downloaded.",
			})
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to export audit logs",
				variant: "destructive",
			})
		}
	}

	const handleViewDetails = (log: AuditLog) => {
		setSelectedLog(log)
		setDialogOpen(true)
	}

	const getActionIcon = (action: string) => {
		return actionIconMap[action.toLowerCase()] || Activity
	}

	const getActionColor = (action: string) => {
		return actionColorMap[action.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200"
	}

	const statsCards = stats ? [
		{
			label: "Total Logs",
			value: stats.total?.toLocaleString() || "0",
			icon: Activity,
			color: "text-blue-600",
		},
		{
			label: "Logins",
			value: stats.login_logout?.logins?.toLocaleString() || "0",
			icon: LogIn,
			color: "text-green-600",
		},
		{
			label: "Logouts",
			value: stats.login_logout?.logouts?.toLocaleString() || "0",
			icon: LogOut,
			color: "text-gray-600",
		},
		{
			label: "Unique Users",
			value: stats.by_user?.length?.toLocaleString() || "0",
			icon: User,
			color: "text-purple-600",
		},
	] : []

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto space-y-6 p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Audit Logs</h1>
						<p className="text-muted-foreground mt-1">
							Detailed audit trail of all system activities and user actions
						</p>
					</div>
					<Button variant="outline" onClick={handleExport}>
						<Download className="h-4 w-4 mr-2" />
						Export Logs
					</Button>
				</div>

				{/* Stats Cards */}
				{statsCards.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{statsCards.map((stat) => {
							const Icon = stat.icon
							return (
								<Card key={stat.label}>
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<CardTitle className="text-sm font-medium text-muted-foreground">
											{stat.label}
										</CardTitle>
										<Icon className={`h-5 w-5 ${stat.color}`} />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{stat.value}</div>
									</CardContent>
								</Card>
							)
						})}
					</div>
				)}

				{/* Filters */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search by user, action, module, or description..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9"
								/>
							</div>
							<Select value={dateRange} onValueChange={setDateRange}>
								<SelectTrigger className="w-full sm:w-[180px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="today">Today</SelectItem>
									<SelectItem value="this-week">This Week</SelectItem>
									<SelectItem value="this-month">This Month</SelectItem>
									<SelectItem value="last-month">Last Month</SelectItem>
									<SelectItem value="last-7-days">Last 7 Days</SelectItem>
									<SelectItem value="last-30-days">Last 30 Days</SelectItem>
								</SelectContent>
							</Select>
							<Select value={filterAction} onValueChange={setFilterAction}>
								<SelectTrigger className="w-full sm:w-[200px]">
									<Filter className="h-4 w-4 mr-2" />
									<SelectValue placeholder="Filter by action" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Actions</SelectItem>
									<SelectItem value="create">Create</SelectItem>
									<SelectItem value="update">Update</SelectItem>
									<SelectItem value="delete">Delete</SelectItem>
									<SelectItem value="login">Login</SelectItem>
									<SelectItem value="logout">Logout</SelectItem>
									<SelectItem value="approve">Approve</SelectItem>
									<SelectItem value="reject">Reject</SelectItem>
								</SelectContent>
							</Select>
							<Select value={filterModule} onValueChange={setFilterModule}>
								<SelectTrigger className="w-full sm:w-[200px]">
									<SelectValue placeholder="Filter by module" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Modules</SelectItem>
									<SelectItem value="loan">Loans</SelectItem>
									<SelectItem value="member">Members</SelectItem>
									<SelectItem value="contribution">Contributions</SelectItem>
									<SelectItem value="payment">Payments</SelectItem>
									<SelectItem value="kyc">KYC</SelectItem>
									<SelectItem value="document">Documents</SelectItem>
									<SelectItem value="property">Properties</SelectItem>
									<SelectItem value="user">Users</SelectItem>
									<SelectItem value="auth">Authentication</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Audit Logs Table */}
				<Card>
					<CardHeader>
						<CardTitle>Audit Trail</CardTitle>
						<CardDescription>
							{loading
								? "Loading..."
								: `Showing ${auditLogs.length} of ${pagination?.total || 0} audit logs`}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="text-center py-8">Loading audit logs...</div>
						) : auditLogs.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								No audit logs found
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Timestamp</TableHead>
											<TableHead>User</TableHead>
											<TableHead>Action</TableHead>
											<TableHead>Module</TableHead>
											<TableHead>Description</TableHead>
											<TableHead>IP Address</TableHead>
											<TableHead>Details</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{auditLogs.map((log) => {
											const ActionIcon = getActionIcon(log.action)
											return (
												<TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
													<TableCell className="font-mono text-xs">
														{log.created_at_formatted}
													</TableCell>
													<TableCell>
														{log.user ? (
															<div>
																<div className="font-medium">{log.user.name}</div>
																<div className="text-xs text-muted-foreground">
																	{log.user.email}
																</div>
															</div>
														) : (
															<span className="text-muted-foreground">System</span>
														)}
													</TableCell>
													<TableCell>
														<Badge
															variant="outline"
															className={`${getActionColor(log.action)} capitalize`}
														>
															<ActionIcon className="h-3 w-3 mr-1" />
															{log.action}
														</Badge>
													</TableCell>
													<TableCell className="capitalize">{log.module || "-"}</TableCell>
													<TableCell className="max-w-xs truncate">
														{log.description}
													</TableCell>
													<TableCell className="font-mono text-xs">
														{log.ip_address || "-"}
													</TableCell>
													<TableCell>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleViewDetails(log)}
														>
															View
														</Button>
													</TableCell>
												</TableRow>
											)
										})}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Details Dialog */}
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Audit Log Details</DialogTitle>
							<DialogDescription>
								Detailed information about this audit log entry
							</DialogDescription>
						</DialogHeader>
						{selectedLog && (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground">ID</label>
										<p className="font-mono text-sm">{selectedLog.id}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Timestamp
										</label>
										<p className="text-sm">{selectedLog.created_at_formatted}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">User</label>
										<p className="text-sm">
											{selectedLog.user
												? `${selectedLog.user.name} (${selectedLog.user.email})`
												: "System"}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Action</label>
										<Badge
											variant="outline"
											className={`${getActionColor(selectedLog.action)} capitalize`}
										>
											{selectedLog.action}
										</Badge>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Module</label>
										<p className="text-sm capitalize">{selectedLog.module || "-"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Resource Type
										</label>
										<p className="text-sm">{selectedLog.resource_type || "-"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Resource ID
										</label>
										<p className="font-mono text-sm">{selectedLog.resource_id || "-"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											IP Address
										</label>
										<p className="font-mono text-sm">{selectedLog.ip_address || "-"}</p>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">
										Description
									</label>
									<p className="text-sm mt-1">{selectedLog.description}</p>
								</div>
								{selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Old Values
										</label>
										<pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
											{JSON.stringify(selectedLog.old_values, null, 2)}
										</pre>
									</div>
								)}
								{selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											New Values
										</label>
										<pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
											{JSON.stringify(selectedLog.new_values, null, 2)}
										</pre>
									</div>
								)}
								{selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Metadata
										</label>
										<pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
											{JSON.stringify(selectedLog.metadata, null, 2)}
										</pre>
									</div>
								)}
								{selectedLog.user_agent && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											User Agent
										</label>
										<p className="text-xs mt-1 break-all">{selectedLog.user_agent}</p>
									</div>
								)}
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}

