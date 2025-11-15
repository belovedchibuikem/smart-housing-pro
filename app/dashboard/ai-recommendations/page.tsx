"use client"

import { useState, useEffect } from "react"
import { Sparkles, TrendingUp, Shield, Clock, ArrowRight, RefreshCw, Loader2, AlertCircle, Building2, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { getAIRecommendations, type AIRecommendationsResponse, type AIRecommendation } from "@/lib/api/client"
import { toast } from "sonner"

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount)
}

function getRiskColor(riskLevel: string): string {
	switch (riskLevel.toLowerCase()) {
		case "low":
			return "text-green-500"
		case "medium":
			return "text-yellow-500"
		case "high":
			return "text-orange-500"
		default:
			return "text-gray-500"
	}
}

function getRiskBadgeColor(riskLevel: string): string {
	switch (riskLevel.toLowerCase()) {
		case "low":
			return "bg-green-500"
		case "medium":
			return "bg-yellow-500"
		case "high":
			return "bg-orange-500"
		default:
			return "bg-gray-500"
	}
}

function getConfidenceBadge(confidence: number): { label: string; color: string } {
	if (confidence >= 90) {
		return { label: "Best Match", color: "bg-green-500" }
	} else if (confidence >= 80) {
		return { label: "Good Match", color: "bg-blue-500" }
	} else if (confidence >= 70) {
		return { label: "Consider", color: "bg-yellow-500" }
	} else {
		return { label: "Explore", color: "bg-gray-500" }
	}
}

export default function AIRecommendationsPage() {
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [data, setData] = useState<AIRecommendationsResponse | null>(null)
	const [error, setError] = useState<string | null>(null)

	const fetchRecommendations = async (showRefreshing = false) => {
		try {
			if (showRefreshing) {
				setRefreshing(true)
			} else {
				setLoading(true)
			}
			setError(null)

			const response = await getAIRecommendations()
			setData(response)
		} catch (err: any) {
			const errorMessage = err?.message || "Failed to load AI recommendations"
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setLoading(false)
			setRefreshing(false)
		}
	}

	useEffect(() => {
		fetchRecommendations()
	}, [])

	const handleRefresh = () => {
		fetchRecommendations(true)
		toast.success("Refreshing recommendations...")
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
					<p className="text-muted-foreground">Analyzing your financial profile...</p>
				</div>
			</div>
		)
	}

	if (error && !data) {
		return (
			<div className="space-y-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
				<Button onClick={() => fetchRecommendations()}>Try Again</Button>
			</div>
		)
	}

	const profile = data?.investment_profile
	const recommendations = data?.recommendations || []
	const financialSummary = data?.financial_summary

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">AI Investment Recommendations</h1>
					<p className="text-muted-foreground mt-1">
						Personalized investment suggestions powered by AI
						{data?.note && <span className="text-xs text-muted-foreground ml-2">({data.note})</span>}
					</p>
				</div>
				<Button onClick={handleRefresh} disabled={refreshing}>
					{refreshing ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Refreshing...
						</>
					) : (
						<>
							<RefreshCw className="mr-2 h-4 w-4" />
							Refresh Recommendations
						</>
					)}
				</Button>
			</div>

			{/* AI Analysis Summary */}
			<Card className="border-primary/20 bg-primary/5">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-primary" />
						<CardTitle>Your Investment Profile</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-3">
						<div>
							<p className="text-sm text-muted-foreground">Risk Tolerance</p>
							<p className="text-2xl font-bold text-foreground capitalize">{profile?.risk_tolerance || "Moderate"}</p>
							<Progress value={profile?.risk_score || 50} className="mt-2" />
							<p className="text-xs text-muted-foreground mt-1">Score: {profile?.risk_score || 50}/100</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Investment Capacity</p>
							<p className="text-2xl font-bold text-foreground">{formatCurrency(profile?.investment_capacity || 0)}</p>
							<Progress value={75} className="mt-2" />
							<p className="text-xs text-muted-foreground mt-1">
								Recommended: {formatCurrency(profile?.recommended_allocation || 0)}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Available Capital</p>
							<p className="text-2xl font-bold text-foreground">{formatCurrency(financialSummary?.available_capital || 0)}</p>
							<Progress value={financialSummary?.available_capital ? Math.min((financialSummary.available_capital / (financialSummary.total_assets || 1)) * 100, 100) : 0} className="mt-2" />
							<p className="text-xs text-muted-foreground mt-1">
								Total Assets: {formatCurrency(financialSummary?.total_assets || 0)}
							</p>
						</div>
					</div>

					{financialSummary && (
						<div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
							<div>
								<p className="text-sm text-muted-foreground">Current Investments</p>
								<p className="text-lg font-semibold text-foreground">{formatCurrency(financialSummary.current_investments)}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Property Equity</p>
								<p className="text-lg font-semibold text-foreground">{formatCurrency(financialSummary.property_equity)}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Net Worth</p>
								<p className="text-lg font-semibold text-foreground">{formatCurrency(financialSummary.total_assets)}</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Recommendations */}
			{recommendations.length > 0 ? (
				<div className="space-y-4">
					<h2 className="text-xl font-semibold text-foreground">Top Recommendations for You</h2>

					{recommendations.map((rec, index) => {
						const confidenceBadge = getConfidenceBadge(rec.confidence)
						const isProperty = rec.type === "property"

						return (
							<Card
								key={`${rec.type}-${rec.id}`}
								className={index === 0 ? "border-green-500/20 bg-green-500/5" : ""}
							>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="space-y-1 flex-1">
											<div className="flex items-center gap-2 flex-wrap">
												<CardTitle className="text-lg">{rec.title}</CardTitle>
												<Badge className={confidenceBadge.color}>{confidenceBadge.label}</Badge>
												{isProperty && rec.location && (
													<Badge variant="outline" className="text-xs">
														{rec.location}
													</Badge>
												)}
											</div>
											<CardDescription>
												{isProperty ? `${rec.type_label || "Property"} • ${rec.location || "Location N/A"}` : rec.description || "Investment Plan"}
											</CardDescription>
										</div>
										<div className="text-right ml-4">
											{isProperty && rec.price ? (
												<>
													<p className="text-2xl font-bold text-foreground">{formatCurrency(rec.price)}</p>
													<p className="text-sm text-muted-foreground">Min. Investment: {rec.min_investment}</p>
												</>
											) : (
												<>
													<p className="text-sm text-muted-foreground">Expected Return</p>
													<p className="text-xl font-bold text-foreground">{rec.projected_roi}</p>
													<p className="text-xs text-muted-foreground">Min: {rec.min_investment}</p>
												</>
											)}
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid gap-4 md:grid-cols-4">
										<div className="flex items-center gap-2">
											<TrendingUp className={`h-4 w-4 ${getRiskColor(rec.risk_level)}`} />
											<div>
												<p className="text-sm text-muted-foreground">Projected ROI</p>
												<p className="font-semibold text-foreground">{rec.projected_roi}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Shield className={`h-4 w-4 ${getRiskColor(rec.risk_level)}`} />
											<div>
												<p className="text-sm text-muted-foreground">Risk Level</p>
												<p className="font-semibold text-foreground capitalize">{rec.risk_level}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-orange-500" />
											<div>
												<p className="text-sm text-muted-foreground">Time Horizon</p>
												<p className="font-semibold text-foreground">{rec.time_horizon}</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Sparkles className="h-4 w-4 text-purple-500" />
											<div>
												<p className="text-sm text-muted-foreground">AI Confidence</p>
												<p className="font-semibold text-foreground">{Math.round(rec.confidence)}%</p>
											</div>
										</div>
									</div>

									<div className="rounded-lg bg-background p-4 space-y-2 border">
										<p className="font-semibold text-foreground flex items-center gap-2">
											<Sparkles className="h-4 w-4 text-primary" />
											Why this is recommended for you:
										</p>
										<p className="text-sm text-muted-foreground leading-relaxed">{rec.reasoning}</p>
									</div>

									<div className="flex gap-2">
										<Button asChild className="flex-1">
											<Link href={isProperty ? `/dashboard/properties/${rec.id}` : `/dashboard/investment-plans/${rec.id}`}>
												{isProperty ? "View Property Details" : "View Investment Plan"}
												<ArrowRight className="ml-2 h-4 w-4" />
											</Link>
										</Button>
										{isProperty && (
											<Button variant="outline" asChild>
												<Link href={`/dashboard/properties/${rec.id}/subscribe`}>Express Interest</Link>
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						)
					})}
				</div>
			) : (
				<Card>
					<CardContent className="py-12 text-center">
						<AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
						<p className="text-muted-foreground mb-4">
							We couldn't generate personalized recommendations at this time. Please try again later.
						</p>
						<Button onClick={handleRefresh} variant="outline">
							<RefreshCw className="mr-2 h-4 w-4" />
							Try Again
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
