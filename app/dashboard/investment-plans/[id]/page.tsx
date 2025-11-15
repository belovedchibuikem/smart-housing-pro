"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Calendar, TrendingUp, Clock, FileText, Download, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { getUserInvestmentPlan, getUserInvestments, getInvestmentPaymentMethods, getWallet, initializeInvestmentPayment } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const currencyFormatter = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	minimumFractionDigits: 0,
})

export default function InvestmentPlanDetailPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const { isLoading, loadData } = usePageLoading()
	const { toast } = useToast()

	const [plan, setPlan] = useState<any>(null)
	const [myInvestments, setMyInvestments] = useState<Array<{ id: string; amount: number; investment_date: string; status: string }>>([])
	const [walletBalance, setWalletBalance] = useState<number | null>(null)
	const [paymentMethods, setPaymentMethods] = useState<any[]>([])
	const [amount, setAmount] = useState("")
	const [paymentMethod, setPaymentMethod] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [stage, setStage] = useState<"details" | "review" | "confirm">("details")

	useEffect(() => {
		let active = true
		;(async () => {
			try {
			const [planResponse, investmentsResponse, methodsResponse, walletResponse] = await Promise.all([
				loadData(() => getUserInvestmentPlan(params.id)),
				loadData(() => getUserInvestments()).catch(() => ({ investments: [] })),
				loadData(() => getInvestmentPaymentMethods()).catch(() => ({ payment_methods: [] })),
				loadData(() => getWallet()).catch(() => null),
			])

				if (!active) return

				if (planResponse.plan) {
					setPlan(planResponse.plan)
					setAmount(String(planResponse.plan.min_amount))
				}

				if (investmentsResponse.investments) {
					// Filter investments for this plan (if plan_id exists) or all user investments
					const planInvestments = investmentsResponse.investments.filter((inv: any) => {
						// For now, show all investments since plan_id might not be linked
						return true
					})
					setMyInvestments(planInvestments)
				}

				if (methodsResponse.payment_methods) {
					const enabledMethods = methodsResponse.payment_methods.filter((m: any) => m.is_enabled)
					setPaymentMethods(enabledMethods)
					if (enabledMethods.length > 0) {
						setPaymentMethod(enabledMethods[0].id)
					}
				}

				if (walletResponse?.wallet) {
					setWalletBalance(walletResponse.wallet.balance)
				}
			} catch (error: any) {
				if (!active) return
				toast({
					title: "Failed to load investment plan",
					description: error?.message || "Please try again later.",
					variant: "destructive",
				})
			}
		})()

		return () => {
			active = false
		}
	}, [params.id, loadData, toast])

	const totalInvested = myInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
	const selectedMethod = useMemo(() => paymentMethods.find((m) => m.id === paymentMethod), [paymentMethods, paymentMethod])

	const handleInvest = async () => {
		if (!plan) return

		const investAmount = Number(amount)
		if (investAmount < plan.min_amount || investAmount > plan.max_amount) {
			toast({
				title: "Invalid amount",
				description: `Investment must be between ${currencyFormatter.format(plan.min_amount)} and ${currencyFormatter.format(plan.max_amount)}`,
				variant: "destructive",
			})
			return
		}

		if (paymentMethod === "wallet" && walletBalance !== null && investAmount > walletBalance) {
			toast({
				title: "Insufficient wallet balance",
				description: `Available wallet balance is ${currencyFormatter.format(walletBalance)}`,
				variant: "destructive",
			})
			return
		}

		setIsSubmitting(true)
		try {
			// Process investment payment (creates investment and processes payment)
			const paymentResponse = await initializeInvestmentPayment({
				amount: investAmount,
				payment_method: paymentMethod,
				investment_plan_id: plan.id,
				type: "fixed_deposit", // Default type
				duration_months: plan.min_duration_months,
				expected_return_rate: plan.expected_return_rate,
				notes: `Investment in ${plan.name}`,
			})

			if (!paymentResponse.success) {
				throw new Error(paymentResponse.message || "Failed to process investment payment")
			}

			if (paymentResponse.payment_url) {
				toast({
					title: "Redirecting to payment",
					description: "Complete your payment in the new tab.",
				})
				window.location.href = paymentResponse.payment_url
			} else if (paymentResponse.requires_approval) {
				toast({
					title: "Investment submitted",
					description: paymentResponse.message || "Your investment has been submitted and payment is pending approval.",
				})
				router.push("/dashboard/investments")
			} else {
				toast({
					title: "Investment created successfully",
					description: paymentResponse.message || "Your investment has been submitted for approval.",
				})
				router.push("/dashboard/investments")
			}
		} catch (error: any) {
			toast({
				title: "Failed to create investment",
				description: error?.message || "Please try again later.",
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLoading || !plan) {
		return (
			<div className="space-y-6">
				<div>
					<Link href="/dashboard/investment-plans">
						<Button variant="ghost" size="sm" className="mb-4">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Investment Plans
						</Button>
					</Link>
				</div>
				<div className="grid lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<Card className="p-6">
							<Skeleton className="h-8 w-3/4 mb-4" />
							<Skeleton className="h-4 w-full mb-2" />
							<Skeleton className="h-32 w-full" />
						</Card>
					</div>
					<div>
						<Card className="p-6">
							<Skeleton className="h-6 w-1/2 mb-4" />
							<Skeleton className="h-10 w-full mb-2" />
							<Skeleton className="h-32 w-full" />
						</Card>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<Link href="/dashboard/investment-plans">
					<Button variant="ghost" size="sm" className="mb-4">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Investment Plans
					</Button>
				</Link>
			</div>

			<div className="grid lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<Card className="p-6">
						<div className="space-y-4">
							<div className="flex items-start justify-between">
								<div>
									<h1 className="text-2xl font-bold">{plan.name}</h1>
									<p className="text-muted-foreground mt-2">{plan.description || "No description available"}</p>
								</div>
								<Badge variant={plan.is_active ? "default" : "secondary"}>{plan.is_active ? "Active" : "Inactive"}</Badge>
							</div>

							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground flex items-center gap-1">
										<TrendingUp className="h-4 w-4" />
										ROI
									</p>
									<p className="text-2xl font-bold text-green-600">{plan.expected_return_rate}%</p>
									<p className="text-xs text-muted-foreground">per annum</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground flex items-center gap-1">
										<Calendar className="h-4 w-4" />
										Return Type
									</p>
									<p className="text-lg font-semibold">{plan.return_type || "N/A"}</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground flex items-center gap-1">
										<Clock className="h-4 w-4" />
										Duration
									</p>
									<p className="text-lg font-semibold">
										{plan.min_duration_months}-{plan.max_duration_months} months
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground flex items-center gap-1">
										<TrendingUp className="h-4 w-4" />
										Risk Level
									</p>
									<p className="text-lg font-semibold capitalize">{plan.risk_level}</p>
								</div>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<Tabs defaultValue="details">
							<TabsList>
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger value="history">My Investments ({myInvestments.length})</TabsTrigger>
							</TabsList>

							<TabsContent value="details" className="space-y-4 mt-4">
								<div>
									<h4 className="font-semibold mb-2">Investment Range</h4>
									<p className="text-sm text-muted-foreground">
										Minimum: {currencyFormatter.format(plan.min_amount)} | Maximum: {currencyFormatter.format(plan.max_amount)}
									</p>
								</div>
								{plan.features && plan.features.length > 0 && (
									<div>
										<h4 className="font-semibold mb-2">Features</h4>
										<ul className="text-sm text-muted-foreground space-y-1">
											{plan.features.map((feature: string, idx: number) => (
												<li key={idx}>• {feature}</li>
											))}
										</ul>
									</div>
								)}
								{plan.terms_and_conditions && plan.terms_and_conditions.length > 0 && (
									<div>
										<h4 className="font-semibold mb-2">Terms & Conditions</h4>
										<ul className="text-sm text-muted-foreground space-y-1">
											{plan.terms_and_conditions.map((term: string, idx: number) => (
												<li key={idx}>• {term}</li>
											))}
										</ul>
									</div>
								)}
							</TabsContent>

							<TabsContent value="history" className="mt-4">
								{myInvestments.length > 0 ? (
									<div className="space-y-3">
										{myInvestments.map((investment) => (
											<div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
												<div className="space-y-1">
													<p className="font-semibold">{currencyFormatter.format(investment.amount)}</p>
													<p className="text-sm text-muted-foreground">{new Date(investment.investment_date).toLocaleDateString()}</p>
												</div>
												<Badge variant={investment.status === "active" ? "default" : "secondary"} className="gap-1">
													<CheckCircle2 className="h-3 w-3" />
													{investment.status}
												</Badge>
											</div>
										))}
										<div className="pt-4 border-t">
											<div className="flex justify-between items-center">
												<span className="font-semibold">Total Invested</span>
												<span className="text-xl font-bold">{currencyFormatter.format(totalInvested)}</span>
											</div>
										</div>
									</div>
								) : (
									<div className="text-center py-8 text-muted-foreground">
										<FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
										<p>You haven't made any investments in this plan yet</p>
									</div>
								)}
							</TabsContent>
						</Tabs>
					</Card>
				</div>

				<div className="space-y-6">
					<Card className="p-6 sticky top-24">
						<h3 className="font-semibold text-lg mb-4">Make Investment</h3>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="amount">Investment Amount (₦)</Label>
								<Input
									id="amount"
									type="number"
									placeholder="Enter amount"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									min={plan.min_amount}
									max={plan.max_amount}
								/>
								<p className="text-xs text-muted-foreground">
									Min: {currencyFormatter.format(plan.min_amount)} | Max: {currencyFormatter.format(plan.max_amount)}
								</p>
							</div>

							{paymentMethods.length > 0 && (
								<div className="space-y-3">
									<Label>Payment Method</Label>
									<RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
										{paymentMethods.map((method) => (
											<div key={method.id} className="flex items-center space-x-2 border rounded-lg p-3">
												<RadioGroupItem value={method.id} id={method.id} />
												<Label htmlFor={method.id} className="flex-1 cursor-pointer">
													<div>
														<p className="font-medium">{method.name}</p>
														{method.id === "wallet" && walletBalance !== null && (
															<p className="text-sm text-muted-foreground">Available: {currencyFormatter.format(walletBalance)}</p>
														)}
														{method.description && <p className="text-sm text-muted-foreground">{method.description}</p>}
													</div>
												</Label>
											</div>
										))}
									</RadioGroup>
								</div>
							)}

							<Button className="w-full" size="lg" onClick={handleInvest} disabled={isSubmitting || !amount || !paymentMethod}>
								{isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Processing...
									</>
								) : (
									"Invest Now"
								)}
							</Button>
						</div>
					</Card>

					{totalInvested > 0 && (
						<Card className="p-6">
							<h3 className="font-semibold mb-3">Your Investment Summary</h3>
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Total Invested</span>
									<span className="font-semibold">{currencyFormatter.format(totalInvested)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Number of Investments</span>
									<span className="font-semibold">{myInvestments.length}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Expected Annual ROI</span>
									<span className="font-semibold text-green-600">
										{currencyFormatter.format(totalInvested * (plan.expected_return_rate / 100))}
									</span>
								</div>
							</div>
						</Card>
					)}
				</div>
			</div>
		</div>
	)
}
