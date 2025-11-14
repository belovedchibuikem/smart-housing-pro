"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
	getInternalMortgagePlan,
	type InternalMortgagePlan,
	repayInternalMortgage,
	getInternalMortgageRepaymentSchedule,
	getInternalMortgageNextPayment,
	type RepaymentSchedule,
	type RepayInternalMortgagePayload,
	type NextPaymentDetails,
} from "@/lib/api/client"
import { ArrowLeft, MapPin, Calendar, User, TrendingUp, Info, DollarSign, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"

const formatCurrency = (amount?: number | null) => {
	const value = Number.isFinite(amount) ? Number(amount) : 0
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)
}

const formatDate = (date?: string | null) => {
	if (!date) return "—"
	try {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		})
	} catch {
		return "—"
	}
}

export default function InternalMortgagePlanDetailPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const { toast } = useToast()
	const [plan, setPlan] = useState<InternalMortgagePlan | null>(null)
	const [loading, setLoading] = useState(true)
	const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentSchedule | null>(null)
	const [loadingSchedule, setLoadingSchedule] = useState(false)
	const [repaymentDialogOpen, setRepaymentDialogOpen] = useState(false)
	const [nextPayment, setNextPayment] = useState<NextPaymentDetails | null>(null)
	const [loadingNextPayment, setLoadingNextPayment] = useState(false)
	const [repaymentNotes, setRepaymentNotes] = useState("")
	const [submittingRepayment, setSubmittingRepayment] = useState(false)

	const fetchPlan = useCallback(async () => {
		if (!params?.id) return
		try {
			setLoading(true)
			const response = await getInternalMortgagePlan(params.id)
			if (response.success) {
				setPlan(response.data)
			}
		} catch (error: any) {
			toast({
				title: "Unable to load mortgage plan",
				description: error?.message ?? "Please try again later.",
				variant: "destructive",
			})
			router.back()
		} finally {
			setLoading(false)
		}
	}, [params?.id, router, toast])

	useEffect(() => {
		void fetchPlan()
	}, [fetchPlan])

	const fetchRepaymentSchedule = useCallback(async () => {
		if (!params?.id || plan?.status !== "active") return
		setLoadingSchedule(true)
		try {
			const response = await getInternalMortgageRepaymentSchedule(params.id)
			if (response.success && response.data) {
				setRepaymentSchedule(response.data)
			}
		} catch (error: any) {
			console.error("Failed to load repayment schedule", error)
		} finally {
			setLoadingSchedule(false)
		}
	}, [params?.id, plan?.status])

	useEffect(() => {
		if (plan?.status === "active") {
			fetchRepaymentSchedule()
		}
	}, [plan?.status, fetchRepaymentSchedule])

	const fetchNextPayment = useCallback(async () => {
		if (!params?.id) return
		setLoadingNextPayment(true)
		try {
			const response = await getInternalMortgageNextPayment(params.id)
			if (response.success && response.data) {
				setNextPayment(response.data)
			} else {
				toast({
					title: "Unable to calculate payment",
					description: response.message || "Failed to calculate next payment amount.",
					variant: "destructive",
				})
				setRepaymentDialogOpen(false)
			}
		} catch (error: any) {
			toast({
				title: "Error",
				description: error?.message || "Failed to calculate next payment.",
				variant: "destructive",
			})
			setRepaymentDialogOpen(false)
		} finally {
			setLoadingNextPayment(false)
		}
	}, [params?.id, toast])

	useEffect(() => {
		if (repaymentDialogOpen && params?.id) {
			fetchNextPayment()
		} else {
			setNextPayment(null)
			setRepaymentNotes("")
		}
	}, [repaymentDialogOpen, params?.id, fetchNextPayment])

	const handleRepaymentSubmit = async () => {
		if (!params?.id || !nextPayment) return

		try {
			setSubmittingRepayment(true)
			const payload: RepayInternalMortgagePayload = {
				amount: nextPayment.total_amount,
				principal_paid: nextPayment.principal_paid,
				interest_paid: nextPayment.interest_paid,
				due_date: nextPayment.due_date,
				payment_method: nextPayment.payment_method as "monthly" | "yearly" | "bi-yearly",
				notes: repaymentNotes || undefined,
			}

			const response = await repayInternalMortgage(params.id, payload)
			if (response.success) {
				toast({
					title: "Repayment recorded",
					description: "Internal mortgage repayment has been successfully recorded.",
				})
				setRepaymentDialogOpen(false)
				setNextPayment(null)
				setRepaymentNotes("")
				await fetchPlan()
				await fetchRepaymentSchedule()
			}
		} catch (error: any) {
			toast({
				title: "Repayment failed",
				description: error?.message || "Failed to record repayment.",
				variant: "destructive",
			})
		} finally {
			setSubmittingRepayment(false)
		}
	}

	if (loading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-64" />
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-72" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-1/2" />
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!plan) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">Internal mortgage plan not found.</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/admin/internal-mortgages">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Internal Mortgage Plan</h1>
					<p className="text-muted-foreground">Review the cooperative-managed mortgage configuration and schedule.</p>
				</div>
			</div>

			<Card>
				<CardHeader className="space-y-3 border-b bg-muted/40">
					<CardTitle className="flex flex-wrap items-center gap-3 text-xl">
						{plan.title}
						<Badge variant="outline" className="capitalize">
							Status: {plan.status}
						</Badge>
						<Badge variant="secondary" className="capitalize">
							Frequency: {plan.frequency}
						</Badge>
					</CardTitle>
					<CardDescription className="space-y-2 text-sm text-muted-foreground">
						<p>Principal: {formatCurrency(plan.principal)}</p>
						<p>Interest: {Number(plan.interest_rate).toFixed(2)}% • Tenure: {plan.tenure_months} months</p>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{plan.status === "active" && (
						<div className={`rounded-lg border p-3 ${
							plan.schedule_approved 
								? "border-green-200 bg-green-50" 
								: "border-amber-200 bg-amber-50"
						}`}>
							<div className="flex items-start gap-2">
								{plan.schedule_approved ? (
									<CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
								) : (
									<AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
								)}
								<div className="flex-1">
									<p className={`text-sm font-semibold ${
										plan.schedule_approved ? "text-green-900" : "text-amber-900"
									}`}>
										Schedule Approval Status
									</p>
									{plan.schedule_approved ? (
										<p className="text-xs text-green-700 mt-1">
											Schedule approved by member on {plan.schedule_approved_at ? new Date(plan.schedule_approved_at).toLocaleDateString() : "N/A"}
										</p>
									) : (
										<p className="text-xs text-amber-700 mt-1">
											Schedule pending member approval. Repayments cannot be processed until the member approves the schedule.
										</p>
									)}
								</div>
								{plan.schedule_approved ? (
									<Badge variant="default" className="bg-green-600">
										Approved
									</Badge>
								) : (
									<Badge variant="outline" className="border-amber-300 text-amber-700">
										Pending
									</Badge>
								)}
							</div>
						</div>
					)}
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<h4 className="text-xs font-semibold uppercase text-muted-foreground">Property</h4>
							{plan.property ? (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<MapPin className="h-4 w-4" />
									<span>
										{plan.property.title}
										{plan.property.location ? ` • ${plan.property.location}` : ""}
									</span>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">Not linked to a specific property yet.</p>
							)}
						</div>
						<div className="space-y-1">
							<h4 className="text-xs font-semibold uppercase text-muted-foreground">Member</h4>
							{plan.member?.user ? (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<User className="h-4 w-4" />
									<span>
										{plan.member.user.first_name} {plan.member.user.last_name}
									</span>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">This plan is not yet assigned to a member.</p>
							)}
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1 text-sm text-muted-foreground">
							<h4 className="text-xs font-semibold uppercase">Schedule</h4>
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								<span>
									Starts {plan.starts_on ? new Date(plan.starts_on).toLocaleDateString() : "TBD"} • Ends{" "}
									{plan.ends_on ? new Date(plan.ends_on).toLocaleDateString() : "TBD"}
								</span>
							</div>
						</div>
						<div className="space-y-1 text-sm text-muted-foreground">
							<h4 className="text-xs font-semibold uppercase">Estimated Payment</h4>
							<div className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4" />
								<span>
									{plan.monthly_payment
										? `${formatCurrency(plan.monthly_payment)} per ${plan.frequency.replace("biannually", "half-year")}`
										: "Calculated upon activation"}
								</span>
							</div>
						</div>
					</div>

					{plan.description && (
						<div className="space-y-2">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Description</h4>
							<p className="text-sm text-muted-foreground">{plan.description}</p>
						</div>
					)}

					{plan.metadata && (
						<div className="space-y-2">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Metadata</h4>
							<pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(plan.metadata, null, 2)}</pre>
						</div>
					)}

					{plan.schedule && (
						<div className="space-y-2">
							<h4 className="text-sm font-semibold uppercase text-muted-foreground">Schedule Preview</h4>
							<pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(plan.schedule, null, 2)}</pre>
						</div>
					)}

					{plan.status === "active" && (
						<Card className="border-t">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>Repayment Management</CardTitle>
										<CardDescription>Record repayments and view repayment schedule.</CardDescription>
									</div>
									<Dialog open={repaymentDialogOpen} onOpenChange={setRepaymentDialogOpen}>
										<DialogTrigger asChild>
											<Button>
												<DollarSign className="mr-2 h-4 w-4" />
												Record Repayment
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-2xl">
											<DialogHeader>
												<DialogTitle>Record Internal Mortgage Repayment</DialogTitle>
												<DialogDescription>
													Review the calculated payment amounts and approve to record the repayment.
												</DialogDescription>
											</DialogHeader>
											{loadingNextPayment ? (
												<div className="flex items-center justify-center py-8">
													<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
													<span className="ml-2 text-sm text-muted-foreground">Calculating next payment...</span>
												</div>
											) : nextPayment ? (
												<div className="space-y-4">
													<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
														<h4 className="text-sm font-semibold text-blue-900 mb-3">Payment Details</h4>
														<div className="space-y-2 text-sm">
															<div className="flex justify-between">
																<span className="text-blue-700">Due Date:</span>
																<span className="font-semibold text-blue-900">{new Date(nextPayment.due_date).toLocaleDateString()}</span>
															</div>
															<div className="flex justify-between">
																<span className="text-blue-700">Principal Amount:</span>
																<span className="font-semibold text-blue-900">{formatCurrency(nextPayment.principal_paid)}</span>
															</div>
															<div className="flex justify-between">
																<span className="text-blue-700">Interest Amount:</span>
																<span className="font-semibold text-blue-900">{formatCurrency(nextPayment.interest_paid)}</span>
															</div>
															<div className="flex justify-between border-t border-blue-200 pt-2">
																<span className="text-blue-700 font-semibold">Total Payment:</span>
																<span className="font-bold text-blue-900 text-lg">{formatCurrency(nextPayment.total_amount)}</span>
															</div>
															<div className="flex justify-between">
																<span className="text-blue-700">Remaining Principal After Payment:</span>
																<span className="font-semibold text-blue-900">{formatCurrency(nextPayment.remaining_principal)}</span>
															</div>
														</div>
														<div className="mt-3 rounded-md bg-blue-100 p-2">
															<p className="text-xs text-blue-800">
																<CheckCircle2 className="inline h-3 w-3 mr-1" />
																Only the principal amount ({formatCurrency(nextPayment.principal_paid)}) will count toward property progress.
															</p>
														</div>
													</div>
													<div className="space-y-2">
														<Label htmlFor="repayment-notes">Notes (optional)</Label>
														<Textarea
															id="repayment-notes"
															placeholder="Add any additional notes about this repayment"
															rows={3}
															value={repaymentNotes}
															onChange={(e) => setRepaymentNotes(e.target.value)}
														/>
													</div>
													<div className="flex justify-end gap-2">
														<Button variant="outline" onClick={() => setRepaymentDialogOpen(false)}>
															Cancel
														</Button>
														<Button onClick={handleRepaymentSubmit} disabled={submittingRepayment} className="bg-green-600 hover:bg-green-700">
															{submittingRepayment ? (
																<>
																	<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																	Recording...
																</>
															) : (
																<>
																	<CheckCircle2 className="mr-2 h-4 w-4" />
																	Approve & Record Payment
																</>
															)}
														</Button>
													</div>
												</div>
											) : (
												<div className="py-8 text-center text-sm text-muted-foreground">
													Unable to calculate next payment. Please try again.
												</div>
											)}
										</DialogContent>
									</Dialog>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{loadingSchedule ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								) : repaymentSchedule ? (
									<>
										<div className="rounded-lg border bg-muted/50 p-4">
											<div className="flex items-center justify-between mb-4">
												<div>
													<h4 className="font-semibold">Repayment Summary</h4>
													<p className="text-sm text-muted-foreground">
														{repaymentSchedule.is_fully_repaid ? (
															<span className="font-semibold text-green-600">Fully Repaid</span>
														) : (
															<>
																Principal Repaid: {formatCurrency(repaymentSchedule.total_principal_repaid)} /{" "}
																{formatCurrency(repaymentSchedule.loan_amount ?? repaymentSchedule.principal ?? 0)} • Remaining:{" "}
																{formatCurrency(repaymentSchedule.remaining_principal)}
															</>
														)}
													</p>
												</div>
												<Badge variant={repaymentSchedule.is_fully_repaid ? "default" : "secondary"}>
													{repaymentSchedule.schedule?.filter((e) => e.status === "paid").length ?? 0} /{" "}
													{repaymentSchedule.schedule?.length ?? 0} Payments
												</Badge>
											</div>
											<div className="space-y-2">
												<div className="flex justify-between text-xs">
													<span>Repayment Progress</span>
													<span className="font-semibold">
														{repaymentSchedule.schedule && repaymentSchedule.schedule.length > 0
															? (
																	(repaymentSchedule.schedule.filter((e) => e.status === "paid").length /
																		repaymentSchedule.schedule.length) *
																	100
																).toFixed(1)
															: 0}
														%
													</span>
												</div>
												<Progress
													value={
														repaymentSchedule.schedule && repaymentSchedule.schedule.length > 0
															? (repaymentSchedule.schedule.filter((e) => e.status === "paid").length /
																	repaymentSchedule.schedule.length) *
																100
															: 0
													}
													className="h-2"
												/>
											</div>
										</div>
										{repaymentSchedule.schedule && repaymentSchedule.schedule.length > 0 && (
											<div className="max-h-96 overflow-y-auto rounded-md border">
												<div className="sticky top-0 grid grid-cols-6 gap-2 border-b bg-gray-50 px-4 py-3 text-xs font-semibold">
													<div>Period</div>
													<div>Due Date</div>
													<div>Principal</div>
													<div>Interest</div>
													<div>Total</div>
													<div>Status</div>
												</div>
												{repaymentSchedule.schedule.map((entry, idx) => (
													<div
														key={idx}
														className={`grid grid-cols-6 gap-2 px-4 py-3 text-sm ${
															entry.status === "paid" ? "bg-green-50" : entry.status === "overdue" ? "bg-red-50" : ""
														}`}
													>
														<div>{entry.installment ?? entry.month ?? entry.period ?? idx + 1}</div>
														<div>{new Date(entry.due_date).toLocaleDateString()}</div>
														<div>{formatCurrency(entry.principal)}</div>
														<div>{formatCurrency(entry.interest)}</div>
														<div className="font-semibold">{formatCurrency(entry.total)}</div>
														<div>
															{entry.status === "paid" ? (
																<Badge variant="default" className="text-xs">
																	<CheckCircle2 className="mr-1 h-3 w-3" />
																	Paid
																</Badge>
															) : entry.status === "overdue" ? (
																<Badge variant="destructive" className="text-xs">
																	Overdue
																</Badge>
															) : (
																<Badge variant="outline" className="text-xs">
																	Pending
																</Badge>
															)}
														</div>
													</div>
												))}
											</div>
										)}
									</>
								) : (
									<div className="text-center text-sm text-muted-foreground py-8">
										No repayment schedule available.
									</div>
								)}
							</CardContent>
						</Card>
					)}

					<div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
						<Info className="mt-0.5 h-4 w-4" />
						<span>
							This mortgage plan can be linked to a property payment plan to automate deductions. Use amortization or mortgage
							calculators to adjust the structure as necessary.
						</span>
					</div>

					<div className="flex justify-end gap-3">
						<Button variant="outline" onClick={() => router.back()}>
							Back
						</Button>
						<Button variant="secondary" disabled>
							Edit Plan (coming soon)
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}


