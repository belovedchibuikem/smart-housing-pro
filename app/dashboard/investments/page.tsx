"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Calendar, DollarSign, Download, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { getUserInvestments, UserInvestment } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const currencyFormatter = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	minimumFractionDigits: 0,
})

function formatDate(dateString: string): string {
	try {
		const date = new Date(dateString)
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
	} catch {
		return dateString
	}
}

function getStatusBadgeVariant(status: string) {
	switch (status?.toLowerCase()) {
		case "active":
			return "default"
		case "pending":
			return "secondary"
		case "rejected":
			return "destructive"
		case "withdrawn":
			return "outline"
		default:
			return "secondary"
	}
}

export default function MyInvestmentsPage() {
	const { isLoading, loadData } = usePageLoading()
	const { toast } = useToast()
	const [investments, setInvestments] = useState<UserInvestment[]>([])
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const [pagination, setPagination] = useState<{
		current_page: number
		last_page: number
		per_page: number
		total: number
	} | null>(null)

	const loadInvestments = async (page: number = 1) => {
		try {
			const params: any = { page, per_page: 15 }
			if (statusFilter !== "all") {
				params.status = statusFilter
			}
			const response = await loadData(() => getUserInvestments(params))
			if (response.investments) {
				setInvestments(response.investments)
				if (response.pagination) {
					setPagination(response.pagination)
				}
			}
		} catch (error: any) {
			toast({
				title: "Failed to load investments",
				description: error?.message || "Please try again later.",
				variant: "destructive",
			})
		}
	}

	useEffect(() => {
		loadInvestments(1)
	}, [statusFilter])

	const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
	const activeInvestments = investments.filter((inv) => inv.status === "active")
	const totalReturns = investments.reduce((sum, inv) => {
		const returns = inv.returns || []
		return sum + returns.reduce((retSum, ret) => retSum + (ret.amount || 0), 0)
	}, 0)
	const currentValue = totalInvested + totalReturns

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">My Investments</h1>
				<p className="text-muted-foreground">Track and manage your investment portfolio</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Invested</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{currencyFormatter.format(totalInvested)}</div>
						<p className="text-xs text-muted-foreground">Across {investments.length} investment{investments.length !== 1 ? "s" : ""}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Current Value</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{currencyFormatter.format(currentValue)}</div>
						<p className="text-xs text-green-600">
							+{currencyFormatter.format(totalReturns)} ({totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : 0}% gain)
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Investments</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeInvestments.length}</div>
						<p className="text-xs text-muted-foreground">
							{activeInvestments.length === investments.length ? "All investments active" : `${investments.length - activeInvestments.length} inactive`}
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Investments</TabsTrigger>
					<TabsTrigger value="active">Active</TabsTrigger>
					<TabsTrigger value="pending">Pending</TabsTrigger>
					<TabsTrigger value="rejected">Rejected</TabsTrigger>
				</TabsList>

				<TabsContent value={statusFilter} className="space-y-4">
					{isLoading ? (
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<Card key={i}>
									<CardHeader>
										<Skeleton className="h-6 w-1/3 mb-2" />
										<Skeleton className="h-4 w-1/2" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-32 w-full" />
									</CardContent>
								</Card>
							))}
						</div>
					) : investments.length === 0 ? (
						<Card className="p-12 text-center">
							<TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
							<h3 className="text-lg font-semibold mb-2">No Investments Found</h3>
							<p className="text-muted-foreground mb-4">
								{statusFilter === "all" ? "You haven't made any investments yet." : `No ${statusFilter} investments found.`}
							</p>
							<Button asChild>
								<Link href="/dashboard/investment-plans">Browse Investment Plans</Link>
							</Button>
						</Card>
					) : (
						<>
							{investments.map((investment) => (
								<InvestmentCard key={investment.id} investment={investment} />
							))}
							{pagination && pagination.last_page > 1 && (
								<div className="flex items-center justify-center gap-2 pt-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => loadInvestments(pagination.current_page - 1)}
										disabled={pagination.current_page === 1}
									>
										Previous
									</Button>
									<span className="text-sm text-muted-foreground">
										Page {pagination.current_page} of {pagination.last_page}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => loadInvestments(pagination.current_page + 1)}
										disabled={pagination.current_page === pagination.last_page}
									>
										Next
									</Button>
								</div>
							)}
						</>
					)}
				</TabsContent>
			</Tabs>
		</div>
	)
}

function InvestmentCard({ investment }: { investment: UserInvestment }) {
	const totalReturns = (investment.returns || []).reduce((sum, ret) => sum + (ret.amount || 0), 0)
	const currentValue = investment.amount + totalReturns
	const roi = investment.amount > 0 ? (totalReturns / investment.amount) * 100 : 0

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-2">
							<DollarSign className="h-4 w-4 text-primary" />
							<Badge variant={getStatusBadgeVariant(investment.status)}>{investment.status}</Badge>
							<Badge variant="outline">{investment.type}</Badge>
						</div>
						<CardTitle>Investment #{investment.id.slice(0, 8)}</CardTitle>
						<CardDescription>Started {formatDate(investment.investment_date)}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<div>
						<p className="text-sm text-muted-foreground">Investment Amount</p>
						<p className="text-lg font-semibold">{currencyFormatter.format(investment.amount)}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Current Value</p>
						<p className="text-lg font-semibold text-green-600">{currencyFormatter.format(currentValue)}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Returns</p>
						<p className="text-lg font-semibold text-green-600">+{currencyFormatter.format(totalReturns)}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">ROI</p>
						<p className="text-lg font-semibold">{roi.toFixed(1)}%</p>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<p className="text-sm text-muted-foreground">Duration</p>
						<p className="font-medium">{investment.duration_months} months</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Expected Return Rate</p>
						<p className="font-medium">{investment.expected_return_rate}% p.a.</p>
					</div>
				</div>

				{investment.returns && investment.returns.length > 0 && (
					<div>
						<p className="text-sm font-medium mb-2">Returns History ({investment.returns.length} entries)</p>
						<div className="space-y-2">
							{investment.returns.slice(0, 3).map((ret) => (
								<div key={ret.id} className="flex items-center justify-between text-sm border-l-2 border-primary pl-3">
									<span className="text-muted-foreground">{formatDate(ret.return_date)}</span>
									<span className="font-medium text-green-600">+{currencyFormatter.format(ret.amount)}</span>
								</div>
							))}
							{investment.returns.length > 3 && (
								<p className="text-xs text-muted-foreground">+{investment.returns.length - 3} more returns</p>
							)}
						</div>
					</div>
				)}

				<div className="flex gap-2 flex-wrap">
					<Button asChild variant="outline" size="sm">
						<Link href={`/dashboard/investments/${investment.id}`}>
							<Eye className="h-4 w-4 mr-2" />
							View Details
						</Link>
					</Button>
					{investment.status === "active" && (
						<Button asChild variant="outline" size="sm">
							<Link href={`/dashboard/investments/withdraw?investment=${investment.id}`}>
								<Download className="h-4 w-4 mr-2" />
								Withdraw
							</Link>
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
