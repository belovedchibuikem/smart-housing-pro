"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePageLoading } from "@/hooks/use-loading"
import { apiFetch } from "@/lib/api/client"
import { Search, UserPlus, Upload, Eye, Edit, MoreHorizontal, Users, Phone, Mail, Calendar, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Member {
	id: string
	first_name?: string
	last_name?: string
	email?: string
	phone?: string
	status?: string
	kyc_status?: string
	member_number?: string
	created_at?: string
	user?: {
		id: string
		email: string
		first_name: string
		last_name: string
		role: string
	}
}

interface MembersResponse {
	members: Member[]
	pagination: {
		current_page: number
		last_page: number
		per_page: number
		total: number
	}
}

export default function AdminMembersPage() {
	const { isLoading, loadData } = usePageLoading()
	const [members, setMembers] = useState<Member[]>([])
	const [error, setError] = useState<string | null>(null)
	const [query, setQuery] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [kycFilter, setKycFilter] = useState("all")
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [perPage] = useState(15)
	const [lastPage, setLastPage] = useState(1)
	
	console.log('Component state:', { members: members.length, total, isLoading, error })

	useEffect(() => {
		loadData(async () => {
			try {
				const params = new URLSearchParams({
					page: String(page),
					per_page: String(perPage)
				})
				if (query) params.append('search', query)
				if (statusFilter !== 'all') params.append('status', statusFilter)
				if (kycFilter !== 'all') params.append('kyc_status', kycFilter)
				
				const rawResponse = await apiFetch<any>(`/admin/members?${params.toString()}`)
				console.log('Members API Raw Response:', rawResponse)
				console.log('Response keys:', Object.keys(rawResponse))
				
				// Handle Laravel Resource Collection which might wrap data in 'data' key
				const response = rawResponse.data ? { members: rawResponse.data, pagination: rawResponse.pagination } : rawResponse
				console.log('Members API Processed Response:', response)
				console.log('Members array:', response.members)
				console.log('Members count:', response.members?.length)
				console.log('Pagination:', response.pagination)
				
				setMembers(response.members || [])
				setTotal(response.pagination?.total || 0)
				setLastPage(response.pagination?.last_page || 1)
				return response
			} catch (error) {
				console.error("Failed to load members:", error)
				setError(error instanceof Error ? error.message : "Failed to load members")
				return { members: [], pagination: { current_page: 1, last_page: 1, per_page: perPage, total: 0 } }
			}
		})
	}, [page, query, statusFilter, kycFilter, loadData, perPage])

	const getStatusBadge = (status?: string) => {
		if (status === 'active') return <Badge variant="default" className="bg-green-500">Active</Badge>
		if (status === 'inactive') return <Badge variant="secondary">Inactive</Badge>
		if (status === 'suspended') return <Badge variant="destructive">Suspended</Badge>
		return <Badge variant="outline">Unknown</Badge>
	}

	const getKycBadge = (kycStatus?: string) => {
		if (kycStatus === 'verified' || kycStatus === 'approved') return <Badge variant="default" className="bg-green-500">Verified</Badge>
		if (kycStatus === 'pending' || kycStatus === 'submitted') return <Badge variant="secondary">Pending</Badge>
		if (kycStatus === 'rejected') return <Badge variant="destructive">Rejected</Badge>
		return <Badge variant="outline">Not Submitted</Badge>
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Members</h1>
					<p className="text-muted-foreground mt-1">Manage tenant members and their information</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => window.location.href = '/admin/bulk-upload/members'}>
						<Upload className="h-4 w-4 mr-2" />
						Bulk Upload
					</Button>
					<Button onClick={() => window.location.href = '/admin/members/new'}>
						<UserPlus className="h-4 w-4 mr-2" />
						Add Member
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Total Members</p>
								<p className="text-2xl font-bold">{total}</p>
							</div>
							<Users className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Active Members</p>
								<p className="text-2xl font-bold text-green-600">
									{members.filter(m => m.status === 'active').length}
								</p>
							</div>
							<Shield className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">KYC Verified</p>
								<p className="text-2xl font-bold text-blue-600">
									{members.filter(m => m.kyc_status === 'verified').length}
								</p>
							</div>
							<Shield className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Pending KYC</p>
								<p className="text-2xl font-bold text-yellow-600">
									{members.filter(m => m.kyc_status === 'pending').length}
								</p>
							</div>
							<Calendar className="h-8 w-8 text-yellow-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
						<div>
							<CardTitle>All Members</CardTitle>
							<CardDescription>View and manage member accounts</CardDescription>
						</div>
						<div className="flex gap-2 w-full sm:w-auto">
							<div className="relative flex-1 sm:w-64">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input 
									placeholder="Search members..." 
									className="pl-9" 
									value={query}
									onChange={(e) => setQuery(e.target.value)}
								/>
							</div>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-[140px]">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
									<SelectItem value="suspended">Suspended</SelectItem>
								</SelectContent>
							</Select>
							<Select value={kycFilter} onValueChange={setKycFilter}>
								<SelectTrigger className="w-[140px]">
									<SelectValue placeholder="KYC Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All KYC</SelectItem>
									<SelectItem value="verified">Verified</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="rejected">Rejected</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					) : error ? (
						<div className="text-center py-8">
							<p className="text-red-500 mb-4">{error}</p>
							<Button onClick={() => window.location.reload()}>Retry</Button>
						</div>
					) : (
						<div className="border rounded-lg overflow-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Member</TableHead>
										<TableHead>Contact</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>KYC Status</TableHead>
										<TableHead>Member #</TableHead>
										<TableHead>Department</TableHead>
										<TableHead className="w-[50px]">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{members.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
												No members found.
											</TableCell>
										</TableRow>
									) : (
										members.map((member) => (
											<TableRow key={member.id}>
												<TableCell>
													<div className="flex items-center gap-3">
														<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
															<Users className="h-5 w-5 text-primary" />
														</div>
														<div>
															<p className="font-medium">
																{member.user?.first_name || member.first_name} {member.user?.last_name || member.last_name}
															</p>
															<p className="text-sm text-muted-foreground">
																{member.user?.email || member.email}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="space-y-1">
														<div className="flex items-center gap-2 text-sm">
															<Mail className="h-4 w-4 text-muted-foreground" />
															{member.user?.email || member.email || "-"}
														</div>
														<div className="flex items-center gap-2 text-sm">
															<Phone className="h-4 w-4 text-muted-foreground" />
															{member.phone || "-"}
														</div>
													</div>
												</TableCell>
												<TableCell>{getStatusBadge(member.status)}</TableCell>
												<TableCell>{getKycBadge(member.kyc_status)}</TableCell>
												<TableCell>
													<span className="text-sm font-mono">{member.member_number || "-"}</span>
												</TableCell>
												<TableCell>
													<span className="text-sm">{member.department || "-"}</span>
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="sm">
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem onClick={() => window.location.href = `/admin/members/${member.id}`}>
																<Eye className="h-4 w-4 mr-2" />
																View Details
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => window.location.href = `/admin/members/${member.id}/edit`}>
																<Edit className="h-4 w-4 mr-2" />
																Edit Member
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					)}

					{/* Pagination */}
					{total > perPage && (
						<div className="flex items-center justify-between mt-4">
							<p className="text-sm text-muted-foreground">
								Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, total)} of {total} members
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={page === 1}
									onClick={() => setPage(p => Math.max(1, p - 1))}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={page >= lastPage}
									onClick={() => setPage(p => p + 1)}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}