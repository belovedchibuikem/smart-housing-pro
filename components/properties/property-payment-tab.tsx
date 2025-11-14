"use client"

import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
	Upload,
	CreditCard,
	Building2,
	Users,
	Receipt,
	CheckCircle2,
	Wallet,
	Loader2,
	AlertTriangle,
	Download,
	Printer,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type {
	MemberHouse,
	PropertyPaymentSetup,
	PropertyLedgerEntry,
	PropertyPaymentHistoryEntry,
	PropertyFundingOption,
	SubmitPropertyPaymentPayload,
	RepaymentSchedule,
	RepaymentScheduleEntry,
} from "@/lib/api/client"
import { getPropertyPaymentSetup, submitPropertyPayment, approveMortgageSchedule, approveInternalMortgageSchedule } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"

type PropertyPaymentTabProps = {
	propertyId: string
	house?: MemberHouse | null
}

type MethodInfo = {
	label: string
	description?: string
	icon: React.ComponentType<{ className?: string }>
}

const METHOD_INFO: Record<string, MethodInfo> = {
	equity_wallet: {
		label: "Equity Wallet",
		description: "Use your accumulated equity wallet balance to pay for this property.",
		icon: Wallet,
	},
	cash: {
		label: "Cash Payment",
		description: "Record a bank transfer or cash deposit with evidence.",
		icon: CreditCard,
	},
	cooperative: {
		label: "Cooperative Deduction",
		description: "Set up periodic deductions through the cooperative.",
		icon: Users,
	},
	mortgage: {
		label: "Mortgage",
		description: "Apply a mortgage plan configured for this property.",
		icon: Building2,
	},
	loan: {
		label: "Loan",
		description: "Fund this payment using an approved loan facility.",
		icon: Building2,
	},
}

const formatCurrency = (value?: number) => {
	const amount = Number.isFinite(value) ? Number(value) : 0
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

const formatDate = (value?: string | null) => {
	if (!value) return "—"
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	})
}

export function PropertyPaymentTab({ propertyId, house }: PropertyPaymentTabProps) {
	const [setup, setSetup] = useState<PropertyPaymentSetup | null>(null)
	const [paymentMethod, setPaymentMethod] = useState<string>("")
	const [fundingType, setFundingType] = useState<"single" | "mixed">("single")
	const [loading, setLoading] = useState<boolean>(true)
	const [refreshKey, setRefreshKey] = useState<number>(0)
	const [error, setError] = useState<string | null>(null)
	const [equityAmount, setEquityAmount] = useState<string>("")
	const [equityNotes, setEquityNotes] = useState<string>("")
	const [cashAmount, setCashAmount] = useState<string>("")
	const [cashPayerName, setCashPayerName] = useState<string>("")
	const [cashPayerPhone, setCashPayerPhone] = useState<string>("")
	const [cashNotes, setCashNotes] = useState<string>("")
	const [cashEvidence, setCashEvidence] = useState<File | null>(null)
	const [cashEvidenceInputKey, setCashEvidenceInputKey] = useState<number>(0)
	const [cooperativeAmount, setCooperativeAmount] = useState<string>("")
	const [cooperativeStart, setCooperativeStart] = useState<string>("")
	const [cooperativeDuration, setCooperativeDuration] = useState<string>("")
	const [cooperativeNotes, setCooperativeNotes] = useState<string>("")
	const [mortgageProvider, setMortgageProvider] = useState<string>("")
	const [mortgageInterest, setMortgageInterest] = useState<string>("")
	const [mortgageTenure, setMortgageTenure] = useState<string>("")
	const [mortgageDownPayment, setMortgageDownPayment] = useState<string>("")
	const [mortgageNotes, setMortgageNotes] = useState<string>("")
	const [submittingMethod, setSubmittingMethod] = useState<PropertyFundingOption | null>(null)
	const isSubmitting = submittingMethod !== null

	const { toast } = useToast()

	const fetchSetup = useCallback(async () => {
		if (!propertyId) return
		try {
			setLoading(true)
			setError(null)
			const response = await getPropertyPaymentSetup(propertyId)
			if (!response.success) {
				setSetup(null)
				setError(response.message ?? "Unable to load payment setup for this property.")
				return
			}
			setSetup(response.data)
		} catch (err: any) {
			setSetup(null)
			setError(err?.message ?? "Failed to load payment setup.")
		} finally {
			setLoading(false)
		}
	}, [propertyId])

	useEffect(() => {
		void fetchSetup()
	}, [fetchSetup, refreshKey])

	const propertySummary = setup?.property ?? (house
		? {
				id: house.id,
				title: house.title,
				location: house.location,
				price: house.price,
				total_paid: house.total_paid,
				balance: Math.max(0, house.price - house.total_paid),
				progress: house.progress ?? 0,
				status: house.interest_status ?? house.status ?? "pending",
			}
		: null)

	const progressValue = propertySummary ? Math.min(100, Math.max(0, propertySummary.progress ?? 0)) : 0
	const balance = propertySummary?.balance ?? Math.max(0, (house?.price ?? 0) - (house?.total_paid ?? 0))
	const equityWalletBalance = setup?.equity_wallet.balance ?? 0
	const paymentHistory = setup?.payment_history ?? []
	const paymentPlan = setup?.payment_plan ?? null
	const ledgerEntries = setup?.ledger_entries ?? []
	const ledgerTotalPaid = setup?.ledger_total_paid ?? null
	const repaymentSchedules = setup?.repayment_schedules ?? {}
	const [approvingSchedules, setApprovingSchedules] = useState<Record<string, boolean>>({})
	const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
	const [selectedReceipt, setSelectedReceipt] = useState<PropertyPaymentHistoryEntry | null>(null)

	const isMixPlan = paymentPlan?.funding_option === "mix"
	const mixAllocations = isMixPlan ? paymentPlan?.configuration?.mix_allocations ?? null : null
	const totalMixAmount = mixAllocations?.total_amount ?? paymentPlan?.total_amount ?? propertySummary?.price ?? 0

	const ledgerTotalsBySource = useMemo(() => {
		return ledgerEntries.reduce((acc, entry) => {
			const key = entry.source
			if (!key || entry.direction !== "credit") {
				return acc
			}
			const amount = Number(entry.amount ?? 0)
			if (!Number.isFinite(amount)) {
				return acc
			}
			acc[key] = (acc[key] ?? 0) + amount
			return acc
		}, {} as Record<string, number>)
	}, [ledgerEntries])

	const mixAllocationSummary = useMemo(() => {
		if (!isMixPlan || !mixAllocations) return [] as Array<{
			method: string
			label: string
			percentage: number
			targetAmount: number
			settledAmount: number
			remainingAmount: number
		}>

		const percentages = (mixAllocations.percentages ?? {}) as Record<string, number>
		const amountsRecord = (mixAllocations.amounts ?? {}) as Record<string, number>
		const entries: Array<{
			method: string
			label: string
			percentage: number
			targetAmount: number
			settledAmount: number
			remainingAmount: number
		}> = []

		Object.keys(percentages).forEach((method) => {
			const percentage = Number(percentages[method] ?? 0)
			const targetAmount = Number(
				(amountsRecord[method] ?? ((percentage / 100) * (totalMixAmount ?? 0))).toFixed(2),
			)
			const settledAmount = Number((ledgerTotalsBySource[method] ?? 0).toFixed(2))
			const remainingAmount = Math.max(0, Number((targetAmount - settledAmount).toFixed(2)))
			entries.push({
				method,
				label: method.replace(/_/g, " "),
				percentage,
				targetAmount,
				settledAmount,
				remainingAmount,
			})
		})

		return entries
	}, [isMixPlan, mixAllocations, totalMixAmount, ledgerTotalsBySource])

	const availableMethods = useMemo(() => {
		if (isMixPlan && mixAllocationSummary.length > 0) {
			return mixAllocationSummary.map((entry) => entry.method)
		}

		const planMethods = paymentPlan?.selected_methods?.filter((method) => method !== "mix") ?? []
		if (planMethods.length > 0) {
			return planMethods
		}

		const setupPreferred = setup?.preferred_payment_methods?.filter((method) => method !== "mix") ?? []
		if (setupPreferred.length > 0) {
			return setupPreferred
		}

		const housePreferred = house?.preferred_payment_methods?.filter((method) => method !== "mix") ?? []
		if (housePreferred.length > 0) {
			return housePreferred
		}

		if (setup?.funding_option && setup.funding_option !== "mix") {
			return [setup.funding_option]
		}
		if (house?.funding_option && house.funding_option !== "mix") {
			return [house.funding_option]
		}
		return ["cash"]
	}, [isMixPlan, mixAllocationSummary, paymentPlan?.selected_methods, setup?.preferred_payment_methods, house?.preferred_payment_methods, setup?.funding_option, house?.funding_option])

	useEffect(() => {
		if (!paymentMethod && availableMethods.length > 0) {
			setPaymentMethod(availableMethods[0])
			return
		}

		if (paymentMethod && !availableMethods.includes(paymentMethod)) {
			setPaymentMethod(availableMethods[0])
		}
	}, [availableMethods, paymentMethod])

	useEffect(() => {
		const shouldBeMixed =
			setup?.funding_option === "mix" ||
			house?.funding_option === "mix" ||
			availableMethods.includes("equity_wallet") && availableMethods.includes("cooperative")
		setFundingType(shouldBeMixed ? "mixed" : "single")
	}, [setup?.funding_option, house?.funding_option, availableMethods])

	useEffect(() => {
		if (!isMixPlan) return

		const equityAllocation = getMixAllocation("equity_wallet")
		if (equityAllocation && !equityAmount) {
			setEquityAmount(equityAllocation.remainingAmount > 0 ? equityAllocation.remainingAmount.toFixed(2) : "")
		}

		const cooperativeAllocation = getMixAllocation("cooperative")
		if (cooperativeAllocation && !cooperativeAmount) {
			setCooperativeAmount(
				cooperativeAllocation.remainingAmount > 0 ? cooperativeAllocation.remainingAmount.toFixed(2) : "",
			)
		}
	}, [isMixPlan, mixAllocationSummary, equityAmount, cooperativeAmount])

	const supportsMixedFunding = !isMixPlan && availableMethods.includes("equity_wallet") && availableMethods.includes("cooperative")

	const renderMixAllocationReminder = (method: string) => {
		if (!isMixPlan) return null
		const allocation = mixAllocationSummary.find((entry) => entry.method === method)
		if (!allocation) return null

		return (
			<div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
				<div className="font-semibold text-blue-900">Plan allocation</div>
				<div>Target: {formatCurrency(allocation.targetAmount)}</div>
				<div>Recorded so far: {formatCurrency(allocation.settledAmount)}</div>
				<div>Remaining to assign: {formatCurrency(allocation.remainingAmount)}</div>
			</div>
		)
	}

	const getMixAllocation = (method: string) =>
		isMixPlan ? mixAllocationSummary.find((entry) => entry.method === method) ?? null : null

	const renderRepaymentSchedule = (schedule: RepaymentSchedule, type: "mortgage" | "loan" | "cooperative", mortgageId?: string, planId?: string) => {
		if (!schedule || !schedule.schedule || schedule.schedule.length === 0) {
			return null
		}

		const paidCount = schedule.schedule.filter((entry) => entry.status === "paid").length
		const totalCount = schedule.schedule.length
		const progressPercent = totalCount > 0 ? (paidCount / totalCount) * 100 : 0
		const scheduleKey = mortgageId || planId || `${type}-${schedule.mortgage_id || schedule.plan_id}`
		const approving = approvingSchedules[scheduleKey] || false

		const handleApproveSchedule = async () => {
			if (!mortgageId && !planId) return
			
			setApprovingSchedules(prev => ({ ...prev, [scheduleKey]: true }))
			try {
				if (type === "mortgage" && mortgageId) {
					await approveMortgageSchedule(mortgageId)
				} else if (type === "cooperative" && planId) {
					await approveInternalMortgageSchedule(planId)
				}
				toast({
					title: "Schedule Approved",
					description: "Repayment schedule has been approved. Deductions can now proceed.",
				})
				// Refresh the payment setup to get updated schedule
				setRefreshKey((prev) => prev + 1)
			} catch (error: any) {
				toast({
					title: "Approval Failed",
					description: error?.message || "Failed to approve schedule",
					variant: "destructive",
				})
			} finally {
				setApprovingSchedules(prev => ({ ...prev, [scheduleKey]: false }))
			}
		}

		return (
			<div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="font-semibold text-blue-900">
							{type === "mortgage" ? "Mortgage" : type === "loan" ? "Loan" : "Cooperative Deduction"} Repayment Schedule
						</h4>
						<p className="text-sm text-blue-700">
							{schedule.is_fully_repaid ? (
								<span className="font-semibold text-green-700">Fully Repaid</span>
							) : (
								<>
									Principal Repaid: {formatCurrency(schedule.total_principal_repaid)} /{" "}
									{formatCurrency(schedule.loan_amount ?? schedule.principal ?? 0)} • Remaining:{" "}
									{formatCurrency(schedule.remaining_principal)}
								</>
							)}
						</p>
						{schedule.schedule_approved ? (
							<p className="text-xs text-green-700 mt-1 flex items-center gap-1">
								<CheckCircle2 className="h-3 w-3" />
								Schedule approved on {schedule.schedule_approved_at ? new Date(schedule.schedule_approved_at).toLocaleDateString() : ""}
							</p>
						) : (type === "mortgage" || type === "cooperative") && (
							<div className="mt-2 rounded-md border border-amber-300 bg-amber-50 p-2">
								<p className="text-xs text-amber-800 mb-2">
									<AlertTriangle className="inline h-3 w-3 mr-1" />
									You must approve this repayment schedule before deductions can begin.
								</p>
								<Button
									size="sm"
									variant="default"
									onClick={handleApproveSchedule}
									disabled={approving}
									className="h-7 text-xs"
								>
									{approving ? (
										<>
											<Loader2 className="mr-1 h-3 w-3 animate-spin" />
											Approving...
										</>
									) : (
										<>
											<CheckCircle2 className="mr-1 h-3 w-3" />
											Approve Schedule
										</>
									)}
								</Button>
							</div>
						)}
					</div>
					<Badge variant={schedule.is_fully_repaid ? "default" : "secondary"}>
						{paidCount} / {totalCount} Payments
					</Badge>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-xs">
						<span>Repayment Progress</span>
						<span className="font-semibold">{progressPercent.toFixed(1)}%</span>
					</div>
					<Progress value={progressPercent} className="h-2" />
				</div>

				<div className="max-h-64 space-y-2 overflow-y-auto rounded-md border bg-white p-2">
					<div className="sticky top-0 grid grid-cols-6 gap-2 border-b bg-gray-50 px-2 py-2 text-xs font-semibold">
						<div>Period</div>
						<div>Due Date</div>
						<div>Principal</div>
						<div>Interest</div>
						<div>Total</div>
						<div>Status</div>
					</div>
					{schedule.schedule.map((entry, idx) => (
						<div
							key={idx}
							className={`grid grid-cols-6 gap-2 px-2 py-2 text-xs ${
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

				{schedule.total_interest_paid > 0 && (
					<div className="text-xs text-muted-foreground">
						Total Interest Paid: {formatCurrency(schedule.total_interest_paid)} (excluded from property progress)
					</div>
				)}
			</div>
		)
	}

	const handleRetry = () => setRefreshKey((prev) => prev + 1)

	const handleCashEvidenceChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null
		setCashEvidence(file)
		setCashEvidenceInputKey((prev) => prev + 1)
	}

	const handleSubmitPayment = async (
		method: PropertyFundingOption,
		overrides: { amount?: number; metadata?: Record<string, unknown>; notes?: string } = {},
	) => {
		if (!propertyId) {
			toast({
				title: "Missing property",
				description: "We could not determine which property to apply this payment to.",
				variant: "destructive",
			})
			return
		}

		const allocation = getMixAllocation(method)
		const planRemaining = typeof paymentPlan?.remaining_balance === "number" ? paymentPlan.remaining_balance : balance
		const effectiveRemaining = allocation ? allocation.remainingAmount : planRemaining

		let amountValue = overrides.amount

		if (amountValue === undefined) {
			switch (method) {
				case "equity_wallet":
					amountValue = Number.parseFloat(equityAmount || "0")
					break
				case "cash":
					amountValue = Number.parseFloat(cashAmount || "0")
					break
				case "cooperative":
					amountValue = Number.parseFloat(cooperativeAmount || "0")
					break
				case "mortgage":
					amountValue = allocation ? allocation.remainingAmount : balance
					break
				case "loan":
					amountValue = Number.parseFloat(cooperativeAmount || "0")
					break
				default:
					amountValue = Number.parseFloat(equityAmount || "0")
			}
		}

		if (!Number.isFinite(amountValue) || amountValue === undefined || amountValue <= 0) {
			toast({
				title: "Invalid amount",
				description: "Enter an amount greater than zero to proceed.",
				variant: "destructive",
			})
			return
		}

		const remainingCap = effectiveRemaining ?? balance

		if (remainingCap <= 0.01) {
			toast({
				title: "Allocation fulfilled",
				description: "This funding method has no remaining allocation on the plan.",
				variant: "destructive",
			})
			return
		}

		if (amountValue - remainingCap > 0.01) {
			toast({
				title: "Amount too high",
				description: "The amount exceeds the remaining allocation for this payment method.",
				variant: "destructive",
			})
			return
		}

		if (method === "equity_wallet" && amountValue > equityWalletBalance) {
			toast({
				title: "Insufficient balance",
				description: "Your equity wallet balance is not enough to cover this payment.",
				variant: "destructive",
			})
			return
		}

		if (method === "cash" && !cashPayerName.trim()) {
			toast({
				title: "Payer name required",
				description: "Please provide the payer name for manual payments.",
				variant: "destructive",
			})
			return
		}

		setSubmittingMethod(method)

		try {
			const normalizedAmount = Number(Number(amountValue).toFixed(2))
			const metadata: Record<string, unknown> = { ...(overrides.metadata ?? {}) }

			if (method === "cooperative") {
				if (cooperativeStart) metadata.start_date = cooperativeStart
				if (cooperativeDuration) metadata.duration_months = cooperativeDuration
				if (cooperativeAmount) metadata.scheduled_amount = cooperativeAmount
			}

			if (method === "mortgage") {
				if (mortgageProvider) metadata.provider = mortgageProvider
				if (mortgageInterest) metadata.interest_rate = mortgageInterest
				if (mortgageTenure) metadata.tenure_years = mortgageTenure
				if (mortgageDownPayment) metadata.down_payment = mortgageDownPayment
			}

			let body: SubmitPropertyPaymentPayload | FormData

			if (method === "cash") {
				const formData = new FormData()
				formData.append("method", method)
				formData.append("amount", normalizedAmount.toString())
				formData.append("payer_name", cashPayerName)
				if (cashPayerPhone) formData.append("payer_phone", cashPayerPhone)
				if (cashNotes) formData.append("notes", cashNotes)
				if (cashEvidence) formData.append("evidence", cashEvidence)
				Object.entries(metadata).forEach(([key, value]) => {
					if (value !== undefined && value !== null && value !== "") {
						formData.append(`metadata[${key}]`, String(value))
					}
				})
				body = formData
			} else {
				const payload: SubmitPropertyPaymentPayload = {
					method,
					amount: normalizedAmount,
				}

				const implicitNotes =
					overrides.notes ??
					(method === "equity_wallet"
						? equityNotes
						: method === "cooperative"
							? cooperativeNotes
							: method === "mortgage"
								? mortgageNotes
								: undefined)

				if (implicitNotes) {
					payload.notes = implicitNotes
				}

				if (Object.keys(metadata).length > 0) {
					payload.metadata = metadata
				}

				body = payload
			}

			const response = await submitPropertyPayment(propertyId, body)

			if (!response.success) {
				throw new Error(response.message ?? "Unable to record payment at this time.")
			}

			toast({
				title: "Payment recorded",
				description: response.message ?? "Your payment has been recorded successfully.",
			})

			if (response.data) {
				setSetup(response.data)
			}

			setEquityAmount("")
			setEquityNotes("")
			setCashAmount("")
			setCashPayerName("")
			setCashPayerPhone("")
			setCashNotes("")
			setCashEvidence(null)
			setCashEvidenceInputKey((prev) => prev + 1)
			setCooperativeAmount("")
			setCooperativeStart("")
			setCooperativeDuration("")
			setCooperativeNotes("")
			setMortgageProvider("")
			setMortgageInterest("")
			setMortgageTenure("")
			setMortgageDownPayment("")
			setMortgageNotes("")
			setRefreshKey((prev) => prev + 1)
		} catch (error: any) {
			toast({
				title: "Payment failed",
				description: error?.message ?? "Unable to record payment at this time.",
				variant: "destructive",
			})
		} finally {
			setSubmittingMethod(null)
		}
	}

	const renderPaymentMethodOption = (method: string) => {
		const info = METHOD_INFO[method] ?? {
			label: method.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
			icon: CreditCard,
		}
		const Icon = info.icon
		return (
			<div key={method} className="flex items-center space-x-2 p-3 border rounded-lg">
				<RadioGroupItem value={method} id={`method-${method}`} />
				<Label htmlFor={`method-${method}`} className="flex items-start gap-3 font-normal cursor-pointer flex-1">
					<span className="mt-0.5">
						<Icon className="h-4 w-4 text-primary" />
					</span>
					<span className="flex flex-col">
						<span className="font-medium capitalize">{info.label}</span>
						{info.description && <span className="text-xs text-muted-foreground">{info.description}</span>}
					</span>
				</Label>
			</div>
		)
	}

	const renderPaymentHistory = (entries: PropertyPaymentHistoryEntry[]) => {
		if (!entries.length) {
			return (
				<div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
					No recorded payments for this property yet.
				</div>
			)
		}

		return (
			<div className="space-y-4">
				{entries.map((payment) => (
					<div key={payment.id} className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
						<div className="flex items-center gap-4">
							<div className="p-2 bg-primary/10 rounded-lg">
								<Receipt className="h-5 w-5 text-primary" />
							</div>
							<div>
								<div className="font-semibold">{formatCurrency(payment.amount)}</div>
								<div className="text-sm text-muted-foreground">
									{payment.payment_method?.replace(/_/g, " ") || "—"} • {formatDate(payment.created_at)}
								</div>
								{payment.reference && (
									<div className="text-xs text-muted-foreground">Reference: {payment.reference}</div>
								)}
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Badge variant={payment.status === "completed" || payment.status === "success" ? "default" : "secondary"}>
								{payment.status?.replace(/_/g, " ") ?? "Pending"}
							</Badge>
							{payment.approval_status && payment.approval_status !== "approved" && (
								<Badge variant="outline" className="capitalize">
									Approval {payment.approval_status}
								</Badge>
							)}
							<Button 
								variant="outline" 
								size="sm"
								onClick={() => {
									setSelectedReceipt(payment)
									setReceiptDialogOpen(true)
								}}
							>
								<Receipt className="mr-2 h-4 w-4" />
								View Receipt
							</Button>
						</div>
					</div>
				))}
			</div>
		)
	}

	if (loading) {
		return (
			<div className="rounded-lg border p-12 text-center text-muted-foreground">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
					<span>Loading payment setup…</span>
				</div>
			</div>
		)
	}

	if (error || !propertySummary) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Payment Setup Unavailable</CardTitle>
					<CardDescription>{error ?? "We could not load payment details for this property."}</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={handleRetry}>Retry</Button>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Payment Summary</CardTitle>
					<CardDescription>Track your payment progress for {propertySummary.title}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
						<div className="rounded-lg border p-4">
							<div className="text-xs uppercase text-muted-foreground">Total Price</div>
							<div className="text-2xl font-bold">{formatCurrency(propertySummary.price)}</div>
						</div>
						<div className="rounded-lg border p-4">
							<div className="text-xs uppercase text-muted-foreground">Amount Paid</div>
							<div className="text-2xl font-bold text-green-600">{formatCurrency(propertySummary.total_paid)}</div>
						</div>
						<div className="rounded-lg border p-4">
							<div className="text-xs uppercase text-muted-foreground">Balance</div>
							<div className="text-2xl font-bold text-orange-600">{formatCurrency(balance)}</div>
						</div>
						<div className="rounded-lg border p-4">
							<div className="text-xs uppercase text-muted-foreground">Interest Status</div>
							<div className="text-lg font-semibold capitalize">
								{propertySummary.status?.replace(/_/g, " ") ?? "Pending"}
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Payment Progress</span>
							<span className="font-semibold">{progressValue.toFixed(1)}%</span>
						</div>
						<Progress value={progressValue} className="h-3" />
					</div>

					{isMixPlan && mixAllocationSummary.length > 0 && (
						<div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
							<div className="flex items-center justify-between">
								<h4 className="text-sm font-semibold text-primary">Mix Funding Allocation</h4>
								<span className="text-xs text-muted-foreground">
									Plan total: {formatCurrency(totalMixAmount)}
								</span>
							</div>
							<div className="grid gap-3 md:grid-cols-2">
								{mixAllocationSummary.map((item) => (
									<div key={item.method} className="rounded-md border border-dashed border-primary/40 bg-background p-3 text-sm">
										<div className="flex items-center justify-between font-semibold capitalize">
											<span>{item.label}</span>
											<span>{item.percentage.toFixed(2)}%</span>
										</div>
										<div className="mt-1 text-xs text-muted-foreground">
											Target: {formatCurrency(item.targetAmount)}
										</div>
										<div className="text-xs text-muted-foreground">
											Paid: {formatCurrency(item.settledAmount)} • Remaining: {formatCurrency(item.remainingAmount)}
										</div>
									</div>
								))}
							</div>
							<p className="text-xs text-muted-foreground">
								Payments must be recorded against the exact methods and amounts configured above. Contact your cooperative if
								you need this plan updated.
							</p>
						</div>
					)}

					{progressValue >= 100 && (
						<div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
							<CheckCircle2 className="h-5 w-5 text-green-600" />
							<div>
								<div className="font-semibold text-green-900">Payment Complete!</div>
								<div className="text-sm text-green-700">
									Your certificate of payment completion is ready for download.
								</div>
							</div>
						</div>
					)}

					{paymentPlan && (
						<div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
							<div className="flex flex-wrap items-center gap-3">
								<Badge variant="outline" className="capitalize">
									Plan Status: {paymentPlan.status}
								</Badge>
								{paymentPlan.funding_option && (
									<Badge variant="secondary" className="capitalize">
										Funding: {paymentPlan.funding_option.replace(/_/g, " ")}
									</Badge>
								)}
								{paymentPlan.selected_methods && paymentPlan.selected_methods.length > 0 && (
									<Badge className="capitalize">
										Methods: {paymentPlan.selected_methods.map((method) => method.replace(/_/g, " ")).join(", ")}
									</Badge>
								)}
							</div>
							<p className="mt-2 text-muted-foreground">
								This payment plan was configured by your cooperative. Please follow the instructions provided for each
								payment method. Deductions or payments recorded under the plan will appear in the history below.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{balance > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Make Payment</CardTitle>
						<CardDescription>
							Choose from the available payment methods configured for this property.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{isMixPlan && mixAllocationSummary.length > 0 && (
							<div className="space-y-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm text-primary-foreground">
								<div className="font-semibold text-primary-foreground">Mix funding plan enforced</div>
								<p className="text-sm text-primary-foreground/90">
									This property&apos;s payment plan splits the cost across specific funding sources. Only the methods listed below
									and their respective amounts can be used unless your cooperative reconfigures the plan.
								</p>
							</div>
						)}

						{supportsMixedFunding && (
							<div className="space-y-3">
								<Label>Funding Type</Label>
								<RadioGroup
									value={fundingType}
									onValueChange={(value) => setFundingType(value as "single" | "mixed")}
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="single" id="funding-single" />
										<Label htmlFor="funding-single" className="cursor-pointer font-normal">
											Single Payment Method
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="mixed" id="funding-mixed" />
										<Label htmlFor="funding-mixed" className="cursor-pointer font-normal">
											Mixed Funding (Equity Wallet + Cooperative Deduction)
										</Label>
									</div>
								</RadioGroup>
							</div>
						)}

						<div className="space-y-3">
							<Label>Payment Method</Label>
							{availableMethods.length === 0 ? (
								<div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
									<AlertTriangle className="mt-0.5 h-4 w-4" />
									<span>
										Payment methods for this property have not been configured yet. Please contact the cooperative
										for assistance.
									</span>
								</div>
							) : (
								<RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
									{availableMethods.map((method) => renderPaymentMethodOption(method))}
								</RadioGroup>
							)}
						</div>

						{paymentMethod === "equity_wallet" && (
							<div className="space-y-4 rounded-lg border bg-muted/50 p-4">
								{renderMixAllocationReminder("equity_wallet")}
								<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
									<div className="font-semibold text-blue-900">Equity Wallet Payment</div>
									<div className="text-sm text-blue-700">
										Use your equity wallet balance to continue payment for this property.
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="equity-amount">Amount to Pay</Label>
									<Input
										id="equity-amount"
										type="number"
										min={0}
										max={getMixAllocation("equity_wallet")?.remainingAmount ?? balance}
										placeholder="Enter amount"
										value={equityAmount}
										onChange={(event) => setEquityAmount(event.target.value)}
									/>
									<div className="text-sm text-muted-foreground">
										Available balance: {formatCurrency(equityWalletBalance)}
									</div>
									{!isMixPlan && equityWalletBalance < balance && (
										<div className="text-sm text-orange-600">
											Your balance is lower than the outstanding amount. You can combine this with another payment
											method.
										</div>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="equity-notes">Notes (optional)</Label>
									<Textarea
										id="equity-notes"
										rows={2}
										placeholder="Add any extra information for this payment"
										value={equityNotes}
										onChange={(event) => setEquityNotes(event.target.value)}
									/>
								</div>
								<Button
									className="w-full"
									disabled={
										equityWalletBalance <= 0 || isSubmitting || (getMixAllocation("equity_wallet")?.remainingAmount ?? balance) <= 0
									}
									onClick={() => handleSubmitPayment("equity_wallet")}
								>
									{submittingMethod === "equity_wallet" ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<span>Pay from Equity Wallet</span>
									)}
								</Button>
							</div>
						)}

						{paymentMethod === "cash" && (
							<div className="space-y-4 rounded-lg border bg-muted/50 p-4">
								{renderMixAllocationReminder("cash")}
								<div className="space-y-2">
									<Label htmlFor="cash-amount">Payment Amount</Label>
									<Input
										id="cash-amount"
										type="number"
										placeholder="Enter amount"
										min={0}
										max={getMixAllocation("cash")?.remainingAmount ?? balance}
										value={cashAmount}
										onChange={(event) => setCashAmount(event.target.value)}
									/>
								</div>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="cash-payer-name">Payer Name</Label>
										<Input
											id="cash-payer-name"
											placeholder="Name of the payer"
											value={cashPayerName}
											onChange={(event) => setCashPayerName(event.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="cash-payer-phone">Payer Phone (optional)</Label>
										<Input
											id="cash-payer-phone"
											placeholder="Phone number"
											value={cashPayerPhone}
											onChange={(event) => setCashPayerPhone(event.target.value)}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="cash-notes">Notes (optional)</Label>
									<Textarea
										id="cash-notes"
										placeholder="Describe this payment or include bank details"
										rows={2}
										value={cashNotes}
										onChange={(event) => setCashNotes(event.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="cash-evidence">Upload Payment Evidence</Label>
									<input
										key={cashEvidenceInputKey}
										id="cash-evidence"
										type="file"
										accept="image/*,application/pdf"
										className="hidden"
										onChange={handleCashEvidenceChange}
									/>
									<label
										htmlFor="cash-evidence"
										className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary"
									>
										<Upload className="mb-2 h-8 w-8 text-muted-foreground" />
										<div className="text-sm text-muted-foreground">
											{cashEvidence ? `Selected: ${cashEvidence.name}` : "Click to upload payment evidence (receipt, bank statement, etc.)"}
										</div>
									</label>
								</div>
								<Button
									className="w-full"
									disabled={
										isSubmitting ||
										!cashAmount ||
										!cashPayerName.trim() ||
										(getMixAllocation("cash")?.remainingAmount ?? balance) <= 0
									}
									onClick={() => handleSubmitPayment("cash")}
								>
									{submittingMethod === "cash" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Payment Evidence"}
								</Button>
							</div>
						)}

						{paymentMethod === "mortgage" && (
							<div className="space-y-4 rounded-lg border bg-muted/50 p-4">
								{repaymentSchedules.mortgage && renderRepaymentSchedule(repaymentSchedules.mortgage, "mortgage", repaymentSchedules.mortgage.mortgage_id)}
								
								{/* Plan Allocation Section */}
								{(() => {
									const mortgageAllocation = getMixAllocation("mortgage")
									if (!mortgageAllocation) return null
									
									return (
										<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
											<h4 className="text-sm font-semibold text-blue-900 mb-3">Plan allocation</h4>
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-blue-700">Target:</span>
													<span className="font-semibold text-blue-900">{formatCurrency(mortgageAllocation.targetAmount)}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-blue-700">Recorded so far:</span>
													<span className="font-semibold text-blue-900">{formatCurrency(mortgageAllocation.settledAmount)}</span>
												</div>
												<div className="flex justify-between border-t border-blue-200 pt-2">
													<span className="text-blue-700 font-semibold">Remaining to assign:</span>
													<span className="font-bold text-blue-900">{formatCurrency(mortgageAllocation.remainingAmount)}</span>
												</div>
											</div>
										</div>
									)
								})()}

								{/* Mortgage Provider Information */}
								{repaymentSchedules.mortgage?.provider && (
									<div className="rounded-lg border border-gray-200 bg-white p-4">
										<h4 className="text-sm font-semibold text-gray-900 mb-3">Mortgage Provider Information</h4>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-600">Provider Name:</span>
												<span className="font-semibold text-gray-900">{repaymentSchedules.mortgage.provider.name}</span>
											</div>
											{repaymentSchedules.mortgage.provider.code && (
												<div className="flex justify-between">
													<span className="text-gray-600">Provider Code:</span>
													<span className="font-semibold text-gray-900">{repaymentSchedules.mortgage.provider.code}</span>
												</div>
											)}
											{repaymentSchedules.mortgage.provider.contact_phone && (
												<div className="flex justify-between">
													<span className="text-gray-600">Contact Phone:</span>
													<span className="font-semibold text-gray-900">{repaymentSchedules.mortgage.provider.contact_phone}</span>
												</div>
											)}
											{repaymentSchedules.mortgage.provider.contact_email && (
												<div className="flex justify-between">
													<span className="text-gray-600">Contact Email:</span>
													<span className="font-semibold text-gray-900">{repaymentSchedules.mortgage.provider.contact_email}</span>
												</div>
											)}
											{repaymentSchedules.mortgage.provider.address && (
												<div className="flex justify-between">
													<span className="text-gray-600">Address:</span>
													<span className="font-semibold text-gray-900 text-right">{repaymentSchedules.mortgage.provider.address}</span>
												</div>
											)}
										</div>
									</div>
								)}

								{/* Mortgage Details */}
								{repaymentSchedules.mortgage && (
									<div className="rounded-lg border border-gray-200 bg-white p-4">
										<h4 className="text-sm font-semibold text-gray-900 mb-3">Mortgage Details</h4>
										<div className="grid gap-4 md:grid-cols-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-600">Interest Rate:</span>
												<span className="font-semibold text-gray-900">{repaymentSchedules.mortgage.interest_rate}%</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Loan Duration:</span>
												<span className="font-semibold text-gray-900">{repaymentSchedules.mortgage.tenure_years} years</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Loan Amount:</span>
												<span className="font-semibold text-gray-900">{formatCurrency(repaymentSchedules.mortgage.loan_amount)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Monthly Payment:</span>
												<span className="font-semibold text-gray-900">{formatCurrency(repaymentSchedules.mortgage.monthly_payment)}</span>
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{paymentMethod === "cooperative" && (
							<div className="space-y-4 rounded-lg border bg-muted/50 p-4">
								{repaymentSchedules.cooperative && renderRepaymentSchedule(repaymentSchedules.cooperative, "cooperative", undefined, repaymentSchedules.cooperative.plan_id)}
								
								{/* Plan Allocation Section */}
								{(() => {
									const cooperativeAllocation = getMixAllocation("cooperative")
									if (!cooperativeAllocation) return null
									
									return (
										<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
											<h4 className="text-sm font-semibold text-blue-900 mb-3">Plan allocation</h4>
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-blue-700">Target:</span>
													<span className="font-semibold text-blue-900">{formatCurrency(cooperativeAllocation.targetAmount)}</span>
												</div>
												<div className="flex justify-between">
													<span className="text-blue-700">Recorded so far:</span>
													<span className="font-semibold text-blue-900">{formatCurrency(cooperativeAllocation.settledAmount)}</span>
												</div>
												<div className="flex justify-between border-t border-blue-200 pt-2">
													<span className="text-blue-700 font-semibold">Remaining to assign:</span>
													<span className="font-bold text-blue-900">{formatCurrency(cooperativeAllocation.remainingAmount)}</span>
												</div>
											</div>
										</div>
									)
								})()}

								{/* Internal Mortgage Plan Information */}
								{repaymentSchedules.cooperative && (
									<div className="rounded-lg border border-gray-200 bg-white p-4">
										<h4 className="text-sm font-semibold text-gray-900 mb-3">Cooperative Deduction Plan Information</h4>
										<div className="space-y-2 text-sm">
											{repaymentSchedules.cooperative.title && (
												<div className="flex justify-between">
													<span className="text-gray-600">Plan Title:</span>
													<span className="font-semibold text-gray-900">{repaymentSchedules.cooperative.title}</span>
												</div>
											)}
											<div className="flex justify-between">
												<span className="text-gray-600">Principal Amount:</span>
												<span className="font-semibold text-gray-900">{formatCurrency(repaymentSchedules.cooperative.principal)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Interest Rate:</span>
												<span className="font-semibold text-gray-900">{repaymentSchedules.cooperative.interest_rate}%</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Tenure:</span>
												<span className="font-semibold text-gray-900">
													{repaymentSchedules.cooperative.tenure_months} months ({repaymentSchedules.cooperative.tenure_years} years)
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Payment Frequency:</span>
												<span className="font-semibold text-gray-900 capitalize">{repaymentSchedules.cooperative.frequency}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Periodic Payment:</span>
												<span className="font-semibold text-gray-900">{formatCurrency(repaymentSchedules.cooperative.periodic_payment)}</span>
											</div>
											{repaymentSchedules.cooperative.starts_on && (
												<div className="flex justify-between">
													<span className="text-gray-600">Start Date:</span>
													<span className="font-semibold text-gray-900">{formatDate(repaymentSchedules.cooperative.starts_on)}</span>
												</div>
											)}
											{repaymentSchedules.cooperative.notes && (
												<div className="flex justify-between">
													<span className="text-gray-600">Notes:</span>
													<span className="font-semibold text-gray-900 text-right">{repaymentSchedules.cooperative.notes}</span>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						)}

						{!isMixPlan && fundingType === "mixed" && (
							<div className="space-y-3 rounded-lg border-2 border-dashed bg-blue-50 p-4">
								<div className="text-sm font-semibold">Mixed Funding Setup</div>
								<div className="text-sm text-muted-foreground">
									Allocate how much should be paid from your equity wallet versus cooperative deduction.
								</div>
								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<Label className="text-xs uppercase text-muted-foreground">Equity Wallet Portion</Label>
										<Input type="number" placeholder="Amount" min={0} max={equityWalletBalance} />
									</div>
									<div>
										<Label className="text-xs uppercase text-muted-foreground">Cooperative Portion</Label>
										<Input type="number" placeholder="Amount" min={0} max={balance} />
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Payment History</CardTitle>
					<CardDescription>All recorded transactions for this property.</CardDescription>
				</CardHeader>
				<CardContent>{renderPaymentHistory(paymentHistory)}</CardContent>
			</Card>

			{/* Receipt Dialog */}
			<Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Payment Receipt</DialogTitle>
					</DialogHeader>
					{selectedReceipt && (
						<div className="space-y-6">
							{/* Receipt Content - Printable */}
							<div id="receipt-content" className="bg-white p-8 space-y-6 border rounded-lg">
								{/* Header */}
								<div className="text-center border-b pb-4">
									<h2 className="text-2xl font-bold text-gray-900">PAYMENT RECEIPT</h2>
									<p className="text-sm text-gray-600 mt-2">Official Receipt for Property Payment</p>
								</div>

								{/* Receipt Details */}
								<div className="grid grid-cols-2 gap-6">
									<div>
										<p className="text-xs text-gray-500 uppercase mb-1">Receipt Number</p>
										<p className="text-sm font-semibold">{selectedReceipt.reference || selectedReceipt.id}</p>
									</div>
									<div className="text-right">
										<p className="text-xs text-gray-500 uppercase mb-1">Date</p>
										<p className="text-sm font-semibold">{formatDate(selectedReceipt.created_at)}</p>
									</div>
								</div>

								{/* Property Information */}
								{setup?.property && (
									<div className="border-t pt-4">
										<h3 className="text-sm font-semibold text-gray-900 mb-3">Property Information</h3>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-600">Property:</span>
												<span className="font-semibold">{setup.property.title}</span>
											</div>
											{setup.property.location && (
												<div className="flex justify-between">
													<span className="text-gray-600">Location:</span>
													<span className="font-semibold">{setup.property.location}</span>
												</div>
											)}
											<div className="flex justify-between">
												<span className="text-gray-600">Property Value:</span>
												<span className="font-semibold">{formatCurrency(setup.property.price)}</span>
											</div>
										</div>
									</div>
								)}

								{/* Payment Details */}
								<div className="border-t pt-4">
									<h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Details</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-gray-600">Payment Method:</span>
											<span className="font-semibold capitalize">
												{selectedReceipt.payment_method?.replace(/_/g, " ") || "N/A"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">Amount Paid:</span>
											<span className="font-bold text-lg">{formatCurrency(selectedReceipt.amount)}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">Status:</span>
											<Badge variant={selectedReceipt.status === "completed" || selectedReceipt.status === "success" ? "default" : "secondary"}>
												{selectedReceipt.status?.replace(/_/g, " ") ?? "Pending"}
											</Badge>
										</div>
										{selectedReceipt.approval_status && (
											<div className="flex justify-between">
												<span className="text-gray-600">Approval Status:</span>
												<Badge variant={selectedReceipt.approval_status === "approved" ? "default" : "outline"}>
													{selectedReceipt.approval_status}
												</Badge>
											</div>
										)}
										{selectedReceipt.description && (
											<div className="pt-2 border-t">
												<p className="text-xs text-gray-500 uppercase mb-1">Description</p>
												<p className="text-sm">{selectedReceipt.description}</p>
											</div>
										)}
									</div>
								</div>

								{/* Payment Summary */}
								{setup?.property && (
									<div className="border-t pt-4 bg-gray-50 p-4 rounded">
										<h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Summary</h3>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-gray-600">Total Paid:</span>
												<span className="font-semibold">{formatCurrency(setup.property.total_paid)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-600">Remaining Balance:</span>
												<span className="font-semibold">{formatCurrency(setup.property.balance)}</span>
											</div>
											<div className="flex justify-between pt-2 border-t">
												<span className="text-gray-900 font-semibold">Progress:</span>
												<span className="font-bold">{setup.property.progress?.toFixed(1) || 0}%</span>
											</div>
										</div>
									</div>
								)}

								{/* Footer */}
								<div className="border-t pt-4 text-center text-xs text-gray-500">
									<p>This is an official receipt for the payment made.</p>
									<p className="mt-1">Please keep this receipt for your records.</p>
									<p className="mt-2 text-gray-400">Generated on {new Date().toLocaleString()}</p>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									onClick={() => {
										const printWindow = window.open("", "_blank")
										if (printWindow) {
											const receiptContent = document.getElementById("receipt-content")?.innerHTML || ""
											printWindow.document.write(`
												<!DOCTYPE html>
												<html>
													<head>
														<title>Payment Receipt - ${selectedReceipt.reference || selectedReceipt.id}</title>
														<style>
															body { font-family: Arial, sans-serif; padding: 20px; }
															@media print {
																body { padding: 0; }
																.no-print { display: none; }
															}
														</style>
													</head>
													<body>
														${receiptContent}
													</body>
												</html>
											`)
											printWindow.document.close()
											setTimeout(() => {
												printWindow.print()
											}, 250)
										}
									}}
								>
									<Printer className="mr-2 h-4 w-4" />
									Print Receipt
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										const receiptContent = document.getElementById("receipt-content")
										if (receiptContent) {
											const printWindow = window.open("", "_blank")
											if (printWindow) {
												printWindow.document.write(`
													<!DOCTYPE html>
													<html>
														<head>
															<title>Payment Receipt - ${selectedReceipt.reference || selectedReceipt.id}</title>
															<style>
																body { font-family: Arial, sans-serif; padding: 20px; }
															</style>
														</head>
														<body>
															${receiptContent.innerHTML}
														</body>
													</html>
												`)
												printWindow.document.close()
											}
										}
									}}
								>
									<Download className="mr-2 h-4 w-4" />
									Download PDF
								</Button>
								<Button onClick={() => setReceiptDialogOpen(false)}>
									Close
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<Card>
				<CardHeader>
					<CardTitle>Property Ledger</CardTitle>
					<CardDescription>
						Consolidated entries from all funding sources (loans, mortgage, cooperative deductions, equity wallet, cash).
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{ledgerEntries.length === 0 ? (
						<div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
							No ledger entries recorded yet. Once payments begin, you will see consolidated transactions here.
						</div>
					) : (
						<div className="space-y-4">
							{ledgerEntries.map((entry) => (
								<div
									key={entry.id}
									className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
								>
									<div>
										<div className="flex items-center gap-2 text-sm">
											<Badge variant={entry.direction === "credit" ? "default" : "destructive"}>
												{entry.direction === "credit" ? "Credit" : "Debit"}
											</Badge>
											<span className="capitalize">{entry.source.replace(/_/g, " ")}</span>
											{entry.status && (
												<Badge variant="outline" className="capitalize">
													{entry.status}
												</Badge>
											)}
										</div>
										<div className="mt-2 text-lg font-semibold">
											{entry.direction === "credit" ? "+" : "-"} {formatCurrency(entry.amount)}
										</div>
										<div className="mt-1 text-xs text-muted-foreground">
											{entry.paid_at
												? new Date(entry.paid_at).toLocaleString()
												: entry.created_at
													? new Date(entry.created_at).toLocaleString()
													: "Date not available"}
										</div>
										{entry.reference && (
											<div className="text-xs text-muted-foreground">Reference: {entry.reference}</div>
										)}
									</div>
									<div className="text-xs text-muted-foreground">
										{entry.payment_id && <div>Payment ID: {entry.payment_id}</div>}
										{entry.plan_id && <div>Plan ID: {entry.plan_id}</div>}
										{entry.mortgage_plan_id && <div>Mortgage Plan: {entry.mortgage_plan_id}</div>}
									</div>
								</div>
							))}
						</div>
					)}

					{typeof ledgerTotalPaid === "number" && ledgerTotalPaid > 0 && (
						<div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
							Total credited via ledger: <span className="font-semibold text-primary">{formatCurrency(ledgerTotalPaid)}</span>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
