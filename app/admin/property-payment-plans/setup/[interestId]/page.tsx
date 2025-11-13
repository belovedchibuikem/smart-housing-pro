"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
	createPropertyPaymentPlan,
	getPendingPropertyPaymentInterests,
	type MixFundingAllocationMap,
	type PendingPlanInterest,
	type PropertyFundingOption,
} from "@/lib/api/client"
import { apiFetch } from "@/lib/api/client"
import { CalendarIcon, ArrowLeft, User, MapPin, TrendingUp } from "lucide-react"

type AdminEoiFormDetail = {
	id: string
	member: {
		id: string
		user: {
			first_name: string
			last_name: string
			email?: string | null
			phone?: string | null
		}
	}
	property: {
		id: string
		title: string
		address?: string | null
		location?: string | null
		price?: number | null
	}
	status: string
	funding_option?: PropertyFundingOption | null
	preferred_payment_methods?: PropertyFundingOption[] | null
	created_at: string
}

const PAYMENT_METHOD_OPTIONS: Array<{ value: PropertyFundingOption; label: string }> = [
	{ value: "cash", label: "Cash Payment" },
	{ value: "loan", label: "Loan" },
	{ value: "equity_wallet", label: "Equity Wallet" },
	{ value: "mortgage", label: "Mortgage" },
	{ value: "cooperative", label: "Cooperative Deduction" },
]

type MixAllocationDetail = {
	method: PropertyFundingOption
	label: string
	percentageInput: string
	percentage: number
	amount: number
}

const formatCurrency = (amount?: number | null) => {
	const value = Number.isFinite(amount) ? Number(amount) : 0
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)
}

export default function PropertyPaymentPlanSetupPage() {
	const params = useParams<{ interestId: string }>()
	const router = useRouter()
	const { toast } = useToast()

	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [interest, setInterest] = useState<AdminEoiFormDetail | null>(null)
	const [pendingSnapshot, setPendingSnapshot] = useState<PendingPlanInterest | null>(null)

	const [status, setStatus] = useState<"draft" | "active">("draft")
	const [fundingOption, setFundingOption] = useState<PropertyFundingOption>("cash")
	const [selectedMethods, setSelectedMethods] = useState<PropertyFundingOption[]>([])
	const [totalAmount, setTotalAmount] = useState<string>("")
	const [initialBalance, setInitialBalance] = useState<string>("")
	const [startsOn, setStartsOn] = useState<string>("")
	const [endsOn, setEndsOn] = useState<string>("")
	const [notes, setNotes] = useState<string>("")
	const [mixAllocations, setMixAllocations] = useState<Partial<Record<PropertyFundingOption, string>>>({})

	useEffect(() => {
		if (!interest) return
		if (fundingOption === "mix") {
			if (selectedMethods.length === 0) {
				setSelectedMethods(["equity_wallet", "loan"])
			}
		} else {
			setSelectedMethods([fundingOption])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fundingOption])

	useEffect(() => {
		if (fundingOption !== "mix") {
			setMixAllocations({})
			return
		}

		setMixAllocations((current) => {
			let changed = false
			const next: Partial<Record<PropertyFundingOption, string>> = {}

			selectedMethods.forEach((method) => {
				if (current[method] === undefined) {
					changed = true
					next[method] = ""
				} else {
					next[method] = current[method]
				}
			})

			Object.keys(current).forEach((method) => {
				if (!selectedMethods.includes(method as PropertyFundingOption)) {
					changed = true
				}
			})

			if (!changed) {
				return current
			}

			return next
		})
	}, [fundingOption, selectedMethods])

	const sanitizePercentageInput = (value: string) => {
		const numeric = value.replace(/[^0-9.]/g, "")
		if (numeric === "") return ""

		const [headRaw, ...restParts] = numeric.split(".")
		const decimalsRaw = restParts.join("")
		let head = headRaw ?? "0"
		if (head === "") head = "0"
		head = head.replace(/^0+(?=\d)/, "")
		if (head === "") head = "0"
		const decimals = decimalsRaw.slice(0, 2)

		const result = decimals.length > 0 ? `${head}.${decimals}` : head
		const numericValue = parseFloat(result)
		if (Number.isFinite(numericValue) && numericValue > 100) {
			return "100"
		}

		return result
	}

	const handleMixAllocationInput = (method: PropertyFundingOption) => (event: ChangeEvent<HTMLInputElement>) => {
		const sanitized = sanitizePercentageInput(event.target.value)
		setMixAllocations((prev) => ({
			...prev,
			[method]: sanitized,
		}))
	}

	const handleDistributeMixEvenly = () => {
		if (fundingOption !== "mix" || selectedMethods.length === 0) return

		const allocations: Partial<Record<PropertyFundingOption, string>> = {}
		let allocated = 0

		selectedMethods.forEach((method, index) => {
			let value = Number((100 / selectedMethods.length).toFixed(2))
			if (index === selectedMethods.length - 1) {
				value = Number((100 - allocated).toFixed(2))
			} else {
				allocated += value
			}
			allocations[method] = value.toFixed(2)
		})

		setMixAllocations(allocations)
	}

	const propertyPrice = useMemo(() => {
		const price = interest?.property?.price ?? pendingSnapshot?.property?.price
		return Number(price ?? 0)
	}, [interest?.property?.price, pendingSnapshot?.property?.price])

	const selectedMethodsCount = selectedMethods.length

	const totalPlanAmountValue = useMemo(() => {
		const parsed = totalAmount ? Number(totalAmount) : propertyPrice
		return Number.isFinite(parsed) ? parsed : 0
	}, [totalAmount, propertyPrice])

	const mixAllocationDetails: MixAllocationDetail[] = useMemo(() => {
		if (fundingOption !== "mix") return []

		return selectedMethods.map((method) => {
			const option = PAYMENT_METHOD_OPTIONS.find((item) => item.value === method)
			const label = option ? option.label : method.replace(/_/g, " ")
			const rawValue = mixAllocations[method] ?? ""
			const percentage = parseFloat(rawValue)
			const safePercentage = Number.isFinite(percentage) ? percentage : 0
			const amount = Number.isFinite(safePercentage)
				? Number((((safePercentage / 100) * totalPlanAmountValue) || 0).toFixed(2))
				: 0

			return {
				method,
				label,
				percentageInput: rawValue,
				percentage: safePercentage,
				amount,
			}
		})
	}, [fundingOption, selectedMethods, mixAllocations, totalPlanAmountValue])

	const mixPercentageTotal = useMemo(() => {
		if (fundingOption !== "mix") return 0
		return mixAllocationDetails.reduce((sum, item) => sum + (Number.isFinite(item.percentage) ? item.percentage : 0), 0)
	}, [fundingOption, mixAllocationDetails])

	const mixPercentageRemaining = useMemo(() => {
		if (fundingOption !== "mix") return 0
		return Number((100 - mixPercentageTotal).toFixed(2))
	}, [fundingOption, mixPercentageTotal])

	const mixAllocationHasBlanks = useMemo(() => {
		if (fundingOption !== "mix") return false
		return mixAllocationDetails.some((item) => !item.percentageInput || Number(item.percentage) <= 0)
	}, [fundingOption, mixAllocationDetails])

	const isMixAllocationValid = useMemo(() => {
		if (fundingOption !== "mix") return true
		if (selectedMethods.length < 2) return false
		if (mixAllocationHasBlanks) return false
		return Math.abs(mixPercentageTotal - 100) < 0.01
	}, [fundingOption, selectedMethods.length, mixAllocationHasBlanks, mixPercentageTotal])

	useEffect(() => {
		const loadData = async () => {
			if (!params?.interestId) return

			try {
				setLoading(true)

				const interestResp = await apiFetch<{ success: boolean; data: AdminEoiFormDetail }>(
					`/admin/eoi-forms/${params.interestId}`,
				)

				if (!interestResp.success) {
					throw new Error("Interest not found")
				}

				const data = interestResp.data
				setInterest(data)
				setFundingOption((data.funding_option as PropertyFundingOption) ?? "cash")
				const preferred = data.preferred_payment_methods ?? []
				if (preferred.length > 0) {
					setSelectedMethods(preferred as PropertyFundingOption[])
				} else if (data.funding_option === "mix") {
					setSelectedMethods(["equity_wallet", "loan"])
				} else if (data.funding_option) {
					setSelectedMethods([data.funding_option])
				}
				setTotalAmount(data.property?.price ? String(data.property.price) : "")
				setInitialBalance(data.property?.price ? String(data.property.price) : "")

				const pendingResp = await getPendingPropertyPaymentInterests({
					property_id: data.property.id,
					member_id: data.member.id,
					per_page: 10,
				})

				if (pendingResp.success && pendingResp.data) {
					const match = pendingResp.data.find((item) => item.id === params.interestId)
					if (match) {
						setPendingSnapshot(match)
					}
				}
			} catch (error: any) {
				toast({
					title: "Unable to load interest details",
					description: error?.message ?? "Please try again later.",
					variant: "destructive",
				})
				router.back()
			} finally {
				setLoading(false)
			}
		}

		void loadData()
	}, [params?.interestId, toast, router])

	const handleMethodToggle = (method: PropertyFundingOption) => (checked: boolean | string) => {
		const isChecked = checked === true || checked === "true"
		setSelectedMethods((prev) => {
			if (isChecked) {
				if (prev.includes(method)) return prev
				if (prev.length >= 3) {
					toast({
						title: "Limit reached",
						description: "A maximum of three payment methods can be combined.",
						variant: "destructive",
					})
					return prev
				}
				return [...prev, method]
			}
			return prev.filter((item) => item !== method)
		})
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!interest) return

		let mixAllocationsPayload: MixFundingAllocationMap | undefined

		if (fundingOption === "mix") {
			if (selectedMethods.length < 2) {
				toast({
					title: "Select more payment methods",
					description: "Please choose at least two payment methods for the mix funding plan.",
					variant: "destructive",
				})
				return
			}

			if (totalPlanAmountValue <= 0) {
				toast({
					title: "Enter plan amount",
					description: "Provide the total amount so the system can compute each method's allocation.",
					variant: "destructive",
				})
				return
			}

			if (!isMixAllocationValid) {
				toast({
					title: "Complete mix allocations",
					description:
						mixAllocationHasBlanks
							? "Enter a percentage greater than 0 for every selected method."
							: "The percentages for the selected methods must add up to 100%.",
					variant: "destructive",
				})
				return
			}

			const allocations: MixFundingAllocationMap = {}
			mixAllocationDetails.forEach((item) => {
				allocations[item.method] = Number(item.percentage.toFixed(2))
			})
			mixAllocationsPayload = allocations
		}

		const methodsPayload = Array.from(
			new Set(fundingOption === "mix" ? selectedMethods : [fundingOption]),
		) as PropertyFundingOption[]

		try {
			setSubmitting(true)
			const response = await createPropertyPaymentPlan({
				property_id: interest.property.id,
				member_id: interest.member.id,
				interest_id: interest.id,
				funding_option: fundingOption,
				selected_methods: methodsPayload,
				mix_allocations: mixAllocationsPayload ?? undefined,
				total_amount: totalAmount ? Number(totalAmount) : propertyPrice,
				initial_balance: initialBalance ? Number(initialBalance) : propertyPrice,
				remaining_balance: initialBalance ? Number(initialBalance) : propertyPrice,
				starts_on: startsOn || undefined,
				ends_on: endsOn || undefined,
				status,
				metadata: notes ? { notes } : undefined,
			})

			if (!response.success) {
				toast({
					title: "Unable to create plan",
					description: response.message ?? "Please review the form and try again.",
					variant: "destructive",
				})
				return
			}

			toast({
				title: "Payment plan created",
				description: "The property payment plan is now ready. You can activate it when you're prepared to start deductions.",
			})

			router.push(`/admin/property-payment-plans/${response.data.id}`)
		} catch (error: any) {
			toast({
				title: "Creation failed",
				description: error?.message ?? "Something went wrong while creating the payment plan.",
				variant: "destructive",
			})
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-56" />
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-64" />
						<Skeleton className="h-4 w-48" />
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

	if (!interest) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">
					Interest not found or no longer available for plan setup.
				</CardContent>
			</Card>
		)
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/admin/property-payment-plans">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Configure Payment Plan</h1>
					<p className="text-muted-foreground">
						Define how payments will be collected for this property based on the member&apos;s preferences.
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex flex-wrap items-center gap-3 text-xl">
						<MapPin className="h-4 w-4 text-primary" />
						{interest.property.title}
						<Badge variant="secondary" className="capitalize">
							Interest {interest.status}
						</Badge>
					</CardTitle>
					<CardDescription className="flex flex-wrap items-center gap-3 text-sm">
						<span className="flex items-center gap-2">
							<User className="h-4 w-4" />
							{`${interest.member.user.first_name} ${interest.member.user.last_name}`}
						</span>
						{interest.property.location && (
							<span className="flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								{interest.property.location}
							</span>
						)}
						{propertyPrice > 0 && (
							<span className="flex items-center gap-2">
								<TrendingUp className="h-4 w-4" />
								{formatCurrency(propertyPrice)}
							</span>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="total-amount">Total Amount</Label>
						<Input
							id="total-amount"
							type="number"
							min="0"
							value={totalAmount}
							onChange={(event) => setTotalAmount(event.target.value)}
							placeholder={propertyPrice ? String(propertyPrice) : "Enter total plan amount"}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="initial-balance">Initial Balance</Label>
						<Input
							id="initial-balance"
							type="number"
							min="0"
							value={initialBalance}
							onChange={(event) => setInitialBalance(event.target.value)}
							placeholder={propertyPrice ? String(propertyPrice) : "Enter initial outstanding amount"}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="starts-on">Starts On</Label>
						<div className="relative">
							<Input
								id="starts-on"
								type="date"
								value={startsOn}
								onChange={(event) => setStartsOn(event.target.value)}
							/>
							<CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="ends-on">Ends On</Label>
						<div className="relative">
							<Input
								id="ends-on"
								type="date"
								value={endsOn}
								onChange={(event) => setEndsOn(event.target.value)}
							/>
							<CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Funding Option</CardTitle>
					<CardDescription>
						The member selected{" "}
						<strong>{interest.funding_option ? interest.funding_option.replace(/_/g, " ") : "a plan"}</strong> in their
						expression of interest. Adjust the payment methods below if necessary.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Plan Status</Label>
							<Select value={status} onValueChange={(value: "draft" | "active") => setStatus(value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select plan status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="draft">Draft (review before activation)</SelectItem>
									<SelectItem value="active">Active (start deductions immediately)</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Funding Option</Label>
							<Select value={fundingOption} onValueChange={(value: PropertyFundingOption) => setFundingOption(value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select funding option" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="cash">100% Cash</SelectItem>
									<SelectItem value="loan">100% Loan</SelectItem>
									<SelectItem value="mix">Mix Funding</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{fundingOption === "mix" ? (
						<>
							<p className="text-sm text-muted-foreground">
								Select the payment methods that will be combined in this plan. Up to three methods are supported. The
								member originally expressed interest in:{" "}
								<strong>
									{interest.preferred_payment_methods && interest.preferred_payment_methods.length > 0
										? interest.preferred_payment_methods
												.map((method) => method.replace(/_/g, " "))
												.join(", ")
										: "not specified"}
								</strong>
							</p>
							<div className="grid gap-3 md:grid-cols-2">
								{PAYMENT_METHOD_OPTIONS.filter((option) => option.value !== "mix").map((option) => (
									<label
										key={option.value}
										htmlFor={`method-${option.value}`}
										className={`flex items-start gap-3 rounded-lg border p-3 ${
											!selectedMethods.includes(option.value) && selectedMethodsCount >= 3 ? "opacity-60" : ""
										}`}
									>
										<Checkbox
											id={`method-${option.value}`}
											checked={selectedMethods.includes(option.value)}
											onCheckedChange={handleMethodToggle(option.value)}
										/>
										<span className="flex flex-col">
											<span className="font-medium">{option.label}</span>
											<span className="text-xs text-muted-foreground">
												{option.value === "equity_wallet" &&
													"Use the member's equity wallet towards this payment plan."}
												{option.value === "loan" && "Tie deductions from an approved loan to this property."}
												{option.value === "mortgage" &&
													"Link this plan to a cooperative mortgage configuration for amortized repayment."}
												{option.value === "cooperative" &&
													"Set up an internal cooperative deduction schedule for this property."}
												{option.value === "cash" && "Record cash or bank transfer payments with evidence uploads."}
											</span>
										</span>
									</label>
								))}
							</div>
							<p className="text-xs text-muted-foreground">
								Selected methods: {selectedMethodsCount} / 3. You can combine options such as Equity + Mortgage,
								Mortgage + Cooperative Deduction, or Equity + Loan.
							</p>
							<div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div>
										<h4 className="text-sm font-semibold text-primary">Allocate Percentages</h4>
										<p className="text-xs text-muted-foreground">
											Distribute the property cost ({formatCurrency(totalPlanAmountValue)}) across the selected payment methods.
										</p>
									</div>
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={handleDistributeMixEvenly}
										disabled={selectedMethods.length === 0}
									>
										Distribute Evenly
									</Button>
								</div>
								{selectedMethods.length === 0 ? (
									<div className="rounded-md border border-dashed border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
										Choose at least two payment methods to configure a mix funding plan.
									</div>
								) : (
									<div className="space-y-3">
										{mixAllocationDetails.map((item) => (
											<div
												key={item.method}
												className="flex flex-col gap-3 rounded-md border border-dashed border-primary/30 bg-background p-3 md:flex-row md:items-center md:justify-between"
											>
												<div>
													<div className="font-medium capitalize">{item.label}</div>
													<div className="text-xs text-muted-foreground">
														Target amount ≈ {formatCurrency(item.amount)}
													</div>
												</div>
												<div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3">
													<div className="flex items-center gap-2">
														<Input
															id={`allocation-${item.method}`}
															type="text"
															inputMode="decimal"
															value={item.percentageInput}
															placeholder="0"
															maxLength={6}
															onChange={handleMixAllocationInput(item.method)}
															className="w-24 text-right"
														/>
														<span className="text-sm font-medium text-muted-foreground">%</span>
													</div>
													<div className="text-xs text-muted-foreground">
														{item.percentageInput
																? `${item.percentage.toFixed(2)}% of ${formatCurrency(totalPlanAmountValue)}`
															: "Enter a percentage"}
													</div>
												</div>
											</div>
										))}
										<div
											className={`text-xs ${
												Math.abs(mixPercentageRemaining) < 0.01
													? "text-green-600"
													: mixPercentageRemaining > 0
													? "text-orange-600"
													: "text-red-600"
											}`}
										>
											Allocated: {mixPercentageTotal.toFixed(2)}% • Remaining: {mixPercentageRemaining.toFixed(2)}%
										</div>
										{mixAllocationHasBlanks && (
											<div className="text-xs text-red-600">Enter a percentage greater than 0 for each selected method.</div>
										)}
									</div>
								)}
							</div>
						</>
					) : (
						<div className="rounded-md border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
							This plan will rely solely on <strong>{fundingOption.replace(/_/g, " ")}</strong>. Additional configuration
							can be added in the notes field for admins who will manage the deductions.
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Administrative Notes</CardTitle>
					<CardDescription>Optional instructions for the finance team or cooperative officers.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<Label htmlFor="notes">Notes</Label>
					<Textarea
						id="notes"
						rows={4}
						value={notes}
						onChange={(event) => setNotes(event.target.value)}
						placeholder="Include repayment expectations, manual processes, or special instructions."
					/>
				</CardContent>
				<CardFooter className="flex justify-end gap-3">
					<Button variant="outline" type="button" onClick={() => router.back()} disabled={submitting}>
						Cancel
					</Button>
					<Button type="submit" disabled={submitting || (fundingOption === "mix" && !isMixAllocationValid)}>
						{submitting ? "Creating plan..." : "Create Payment Plan"}
					</Button>
					{fundingOption === "mix" && !isMixAllocationValid && (
						<p className="text-xs text-red-600">
							Enter percentages for each method and ensure the allocation totals 100% before saving the plan.
						</p>
					)}
				</CardFooter>
			</Card>

			<Separator />

			<Card>
				<CardContent className="space-y-3 text-sm text-muted-foreground">
					<p>
						Once saved, you can activate this plan from the payment plan details page. Activation will enable the chosen
						payment methods to start recording deductions in the property&apos;s payment history.
					</p>
					<p>
						Mortgage and cooperative schedules can be further refined in the upcoming internal mortgage module. Loan ties
						will reflect automatically when the member makes repayments through the loan module.
					</p>
				</CardContent>
			</Card>
		</form>
	)
}

