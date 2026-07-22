"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
	Search,
	Filter,
	Download,
	Shield,
	Activity,
	User,
	LogIn,
	LogOut,
	FileText,
	Edit,
	Trash2,
	Plus,
	Loader2,
} from "lucide-react"
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

const actionIconMap: Record<string, any> = {
	create: Plus,
	update: Edit,
	delete: Trash2,
	login: LogIn,
	logout: LogOut,
	approve: Shield,
	reject: Shield,
	view: FileText,
	toggle: Edit,
	sync: Activity,
	export: Download,
}

const actionColorMap: Record<string, string> = {
	create: "bg-green-100 text-green-800 border-green-200",
	update: "bg-blue-100 text-blue-800 border-blue-200",
	delete: "bg-red-100 text-red-800 border-red-200",
	login: "bg-emerald-100 text-emerald-800 border-emerald-200",
	logout: "bg-gray-100 text-gray-800 border-gray-200",
	approve: "bg-green-100 text-green-800 border-green-200",
	reject: "bg-orange-100 text-orange-800 border-orange-200",
	view: "bg-purple-100 text-purple-800 border-purple-200",
	toggle: "bg-amber-100 text-amber-800 border-amber-200",
	sync: "bg-sky-100 text-sky-800 border-sky-200",
	export: "bg-indigo-100 text-indigo-800 border-indigo-200",
}

interface AuditLog {
	id: string
	user: {
		id: string | null
		name: string
		email: string | null
	} | null
	actor_name?: string | null
	actor_email?: string | null
	actor_roles?: string[]
	action: string
	module: string
	resource_type: string | null
	resource_id: string | null
	resource_label?: string | null
	description: string
	old_values: any
	new_values: any
	metadata: any
	ip_address: string | null
	user_agent: string | null
	http_method?: string | null
	request_path?: string | null
	route_name?: string | null
	status_code?: number | null
	request_id?: string | null
	source?: string | null
	created_at: string
	created_at_formatted: string
}

function statusBadgeClass(code?: number | null) {
	if (!code) return "bg-gray-100 text-gray-700 border-gray-200"
	if (code >= 200 && code < 300) return "bg-green-100 text-green-800 border-green-200"
	if (code >= 400) return "bg-red-100 text-red-800 border-red-200"
	return "bg-amber-100 text-amber-800 border-amber-200"
}

export default function AuditLogsPage() {
	const { toast } = useToast()
	const [searchQuery, setSearchQuery] = useState("")
	const [filterAction, setFilterAction] = useState("all")
	const [filterModule, setFilterModule] = useState("all")
	const [filterSource, setFilterSource] = useState("all")
	const [dateRange, setDateRange] = useState("this-month")
	const [loading, setLoading] = useState(true)
	const [exporting, setExporting] = useState(false)
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
	const [stats, setStats] = useState<any>(null)
	const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
	const [dialogOpen, setDialogOpen] = useState(false)
	const [pagination, setPagination] = useState<any>(null)

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchLogs()
			fetchStats()
		}, searchQuery ? 300 : 0)
		return () => clearTimeout(timer)
	}, [searchQuery, filterAction, filterModule, filterSource, dateRange])

	const fetchLogs = async () => {
		try {
			setLoading(true)
			const response = await getAuditLogs({
				search: searchQuery || undefined,
				action: filterAction !== "all" ? filterAction : undefined,
				module: filterModule !== "all" ? filterModule : undefined,
				source: filterSource !== "all" ? filterSource : undefined,
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
			const response = await getAuditLogStats({
				date_range: dateRange,
			})
			if (response.success) {
				setStats(response.stats)
			}
		} catch (error: any) {
			console.error("Failed to load stats:", error)
		}
	}

	const handleExport = async () => {
		try {
			setExporting(true)
			await exportAuditLogs({
				date_range: dateRange,
				search: searchQuery || undefined,
				action: filterAction !== "all" ? filterAction : undefined,
				module: filterModule !== "all" ? filterModule : undefined,
				source: filterSource !== "all" ? filterSource : undefined,
			})
			toast({
				title: "Export successful",
				description: "Staff audit trail CSV has been downloaded.",
			})
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to export audit logs",
				variant: "destructive",
			})
		} finally {
			setExporting(false)
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

	const whoLabel = (log: AuditLog) => {
		const name = log.actor_name || log.user?.name
		const email = log.actor_email || log.user?.email
		return { name: name || "System", email: email || null }
	}

	const statsCards = stats
		? [
				{
					label: "Total operations",
					value: stats.total?.toLocaleString() || "0",
					icon: Activity,
					color: "text-blue-600",
				},
				{
					label: "HTTP captures",
					value: (stats.by_source?.http ?? 0).toLocaleString(),
					icon: Shield,
					color: "text-emerald-600",
				},
				{
					label: "Domain logs",
					value: (stats.by_source?.service ?? 0).toLocaleString(),
					icon: FileText,
					color: "text-sky-600",
				},
				{
					label: "Staff actors",
					value: stats.by_user?.length?.toLocaleString() || "0",
					icon: User,
					color: "text-indigo-600",
				},
			]
		: []

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto space-y-6 p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold">Audit Logs</h1>
						<p className="text-muted-foreground mt-1">
							Staff operations trail — who changed what, when, and from where
						</p>
					</div>
					<Button variant="outline" onClick={handleExport} disabled={exporting}>
						{exporting ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<Download className="h-4 w-4 mr-2" />
						)}
						Export CSV
					</Button>
				</div>

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

				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col lg:flex-row gap-4 flex-wrap">
							<div className="flex-1 min-w-[220px] relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search actor, path, action, IP, request ID..."
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
								<SelectTrigger className="w-full sm:w-[180px]">
									<Filter className="h-4 w-4 mr-2" />
									<SelectValue placeholder="Action" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Actions</SelectItem>
									<SelectItem value="create">Create</SelectItem>
									<SelectItem value="update">Update</SelectItem>
									<SelectItem value="delete">Delete</SelectItem>
									<SelectItem value="approve">Approve</SelectItem>
									<SelectItem value="reject">Reject</SelectItem>
									<SelectItem value="toggle">Toggle</SelectItem>
									<SelectItem value="sync">Sync</SelectItem>
									<SelectItem value="export">Export</SelectItem>
									<SelectItem value="login">Login</SelectItem>
									<SelectItem value="logout">Logout</SelectItem>
								</SelectContent>
							</Select>
							<Select value={filterModule} onValueChange={setFilterModule}>
								<SelectTrigger className="w-full sm:w-[180px]">
									<SelectValue placeholder="Module" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Modules</SelectItem>
									<SelectItem value="users">Users</SelectItem>
									<SelectItem value="roles">Roles</SelectItem>
									<SelectItem value="permissions">Permissions</SelectItem>
									<SelectItem value="members">Members</SelectItem>
									<SelectItem value="loans">Loans</SelectItem>
									<SelectItem value="wallets">Wallets</SelectItem>
									<SelectItem value="properties">Properties</SelectItem>
									<SelectItem value="settings">Settings</SelectItem>
									<SelectItem value="documents">Documents</SelectItem>
									<SelectItem value="auth">Authentication</SelectItem>
								</SelectContent>
							</Select>
							<Select value={filterSource} onValueChange={setFilterSource}>
								<SelectTrigger className="w-full sm:w-[160px]">
									<SelectValue placeholder="Source" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Sources</SelectItem>
									<SelectItem value="http">HTTP (auto)</SelectItem>
									<SelectItem value="service">Domain</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Staff operations trail</CardTitle>
						<CardDescription>
							{loading
								? "Loading staff operations..."
								: `Showing ${auditLogs.length} of ${pagination?.total || 0} recorded operations`}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
								<Loader2 className="h-8 w-8 animate-spin" />
								<p>Loading staff audit trail...</p>
							</div>
						) : auditLogs.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
								<Shield className="h-10 w-10 opacity-40" />
								<p className="font-medium text-foreground">No staff operations recorded yet</p>
								<p className="text-sm max-w-md">
									Mutating admin actions (create, update, delete, approve) appear here with actor,
									path, IP, and status.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>When</TableHead>
											<TableHead>Who</TableHead>
											<TableHead>Action</TableHead>
											<TableHead>Module</TableHead>
											<TableHead>Resource</TableHead>
											<TableHead>Path / Method</TableHead>
											<TableHead>IP</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="w-[80px]">Details</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{auditLogs.map((log) => {
											const ActionIcon = getActionIcon(log.action)
											const who = whoLabel(log)
											return (
												<TableRow
													key={log.id}
													className="cursor-pointer hover:bg-muted/50"
													onClick={() => handleViewDetails(log)}
												>
													<TableCell className="font-mono text-xs whitespace-nowrap">
														{log.created_at_formatted}
													</TableCell>
													<TableCell>
														<div>
															<div className="font-medium">{who.name}</div>
															{who.email && (
																<div className="text-xs text-muted-foreground">{who.email}</div>
															)}
														</div>
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
													<TableCell className="capitalize">{log.module || "—"}</TableCell>
													<TableCell className="text-sm max-w-[140px] truncate">
														{log.resource_label || "—"}
													</TableCell>
													<TableCell>
														{log.request_path || log.http_method ? (
															<div className="text-xs">
																{log.http_method && (
																	<span className="font-semibold mr-1">{log.http_method}</span>
																)}
																<span className="font-mono text-muted-foreground break-all">
																	{log.request_path || "—"}
																</span>
															</div>
														) : (
															<span className="text-muted-foreground text-xs">
																{log.source === "service" ? "domain" : "—"}
															</span>
														)}
													</TableCell>
													<TableCell className="font-mono text-xs">
														{log.ip_address || "—"}
													</TableCell>
													<TableCell>
														{log.status_code != null ? (
															<Badge
																variant="outline"
																className={statusBadgeClass(log.status_code)}
															>
																{log.status_code}
															</Badge>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</TableCell>
													<TableCell onClick={(e) => e.stopPropagation()}>
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

				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Operation details</DialogTitle>
							<DialogDescription>
								Full audit record for this staff action
							</DialogDescription>
						</DialogHeader>
						{selectedLog && (
							<div className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-muted-foreground">When</label>
										<p className="text-sm">{selectedLog.created_at_formatted}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Who</label>
										<p className="text-sm">
											{whoLabel(selectedLog).name}
											{whoLabel(selectedLog).email
												? ` (${whoLabel(selectedLog).email})`
												: ""}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Action</label>
										<div className="mt-1">
											<Badge
												variant="outline"
												className={`${getActionColor(selectedLog.action)} capitalize`}
											>
												{selectedLog.action}
											</Badge>
										</div>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Module</label>
										<p className="text-sm capitalize">{selectedLog.module || "—"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Resource</label>
										<p className="text-sm">{selectedLog.resource_label || "—"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Source</label>
										<p className="text-sm capitalize">{selectedLog.source || "—"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											HTTP method / path
										</label>
										<p className="text-sm font-mono break-all">
											{[selectedLog.http_method, selectedLog.request_path]
												.filter(Boolean)
												.join(" ") || "—"}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Status</label>
										<p className="text-sm">{selectedLog.status_code ?? "—"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">IP address</label>
										<p className="font-mono text-sm">{selectedLog.ip_address || "—"}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Request ID</label>
										<p className="font-mono text-sm break-all">
											{selectedLog.request_id || "—"}
										</p>
									</div>
								</div>

								{(selectedLog.actor_roles?.length ?? 0) > 0 && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											Actor roles
										</label>
										<div className="flex flex-wrap gap-1 mt-1">
											{selectedLog.actor_roles!.map((role) => (
												<Badge key={role} variant="secondary" className="capitalize">
													{role.replace(/_/g, " ")}
												</Badge>
											))}
										</div>
									</div>
								)}

								<div>
									<label className="text-sm font-medium text-muted-foreground">Description</label>
									<p className="text-sm mt-1">{selectedLog.description}</p>
								</div>

								{selectedLog.old_values &&
									Object.keys(selectedLog.old_values).length > 0 && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												Before (redacted)
											</label>
											<pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
												{JSON.stringify(selectedLog.old_values, null, 2)}
											</pre>
										</div>
									)}

								{selectedLog.new_values &&
									Object.keys(selectedLog.new_values).length > 0 && (
										<div>
											<label className="text-sm font-medium text-muted-foreground">
												After / request payload (redacted)
											</label>
											<pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
												{JSON.stringify(selectedLog.new_values, null, 2)}
											</pre>
										</div>
									)}

								{selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">Metadata</label>
										<pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
											{JSON.stringify(selectedLog.metadata, null, 2)}
										</pre>
									</div>
								)}

								{selectedLog.user_agent && (
									<div>
										<label className="text-sm font-medium text-muted-foreground">
											User agent
										</label>
										<p className="text-xs mt-1 break-all">{selectedLog.user_agent}</p>
									</div>
								)}

								<div>
									<label className="text-sm font-medium text-muted-foreground">Log ID</label>
									<p className="font-mono text-xs break-all">{selectedLog.id}</p>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
