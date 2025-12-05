"use client"

import { useEffect, useMemo, useState, useCallback, type ChangeEvent } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
	getPropertyPaymentPlan,
	updatePropertyPaymentPlan,
	type PropertyPaymentPlan,
	type PropertyFundingOption,
	type MixFundingAllocationMap,
} from "@/lib/api/client"
import { MapPin, TrendingUp, Calendar as CalendarIcon, ArrowLeft } from "lucide-react"

type MixAllocationDetail = {
	method: PropertyFundingOption
	label: string
	percentageInput: string
	percentage: number
	amount: number
}

const PAYMENT_METHOD_OPTIONS: Array<{ value: PropertyFundingOption; label: string }> = [
	{ value: "cash", label: "Cash Payment" },
	{ value: "loan", label: "Loan" },
	{ value: "equity_wallet", label: "Equity Wallet" },
	{ value: "mortgage", label: "Mortgage" },
	{ value: "cooperative", label: "Cooperative Deduction" },
]

const formatCurrency = (amount?: number | null) => {
	const value = Number.isFinite(amount) ? Number(amount) : 0
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)
}

export default function EditPropertyPaymentPlanPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const { toast } = useToast()

	const [loading, setLoading] = useState(true)
	const [plan, setPlan] = useState<PropertyPaymentPlan | null>(null)
	const [status, setStatus] = useState<PropertyPaymentPlan["status"]>("draft")
	const [fundingOption, setFundingOption] = useState<PropertyFundingOption>("cash")
	const [selectedMethods, setSelectedMethods] = useState<PropertyFundingOption[]>([])
	const [totalAmount, setTotalAmount] = useState<string>("")
	const [initialBalance, setInitialBalance] = useState<string>("")
	const [startsOn, setStartsOn] = useState<string>("")
	const [endsOn, setEndsOn] = useState<string>("")
	const [notes, setNotes] = useState<string>("")
	const [mixAllocations, setMixAllocations] = useState<Partial<Record<PropertyFundingOption, string>>>({})
	const [submitting, setSubmitting] = useState(false)

	const selectedMethodsCount = selectedMethods.length

	const mixAllocationDetails: MixAllocationDetail[] = useMemo(() => {
		if (fundingOption !== "mix") return []

		return selectedMethods.map((method) => {
			const option = PAYMENT_METHOD_OPTIONS.find((item) => item.value === method)
			const label = option ? option.label : method.replace(/_/g, " ")
			const rawValue = mixAllocations[method] ?? ""
			const percentage = parseFloat(rawValue)
			const safePercentage = Number.isFinite(percentage) ? percentage : 0
			const amount = Number.isFinite(safePercentage)
				? Number((((safePercentage / 100) * Number(totalAmount || (plan?.total_amount ?? 0))) || 0).toFixed(2))
				: 0

			return {
				method,
				label,
				percentageInput: rawValue,
				percentage: safePercentage,
				amount,
			}
		})
	}, [fundingOption, selectedMethods, mixAllocations, totalAmount, plan?.total_amount])

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

	const loadPlan = useCallback(async () => {
		if (!params?.id) return
		try {
			setLoading(true)
			const response = await getPropertyPaymentPlan(params.id)
			if (!response.success) {
				throw new Error(response.data ? "Unable to load plan details." : response.message)
			}

			const planData = response.data
			setPlan(planData)
			setStatus(planData.status)
			setFundingOption((planData.funding_option as PropertyFundingOption) ?? "cash")
			setSelectedMethods(planData.selected_methods?.filter((method) => method !== "mix") as PropertyFundingOption[] ?? [])
			setTotalAmount(planData.total_amount ? String(planData.total_amount) : "")
			setInitialBalance(planData.initial_balance ? String(planData.initial_balance) : "")
			setStartsOn(planData.starts_on ? planData.starts_on.slice(0, 10) : "")
			setEndsOn(planData.ends_on ? planData.ends_on.slice(0, 10) : "")
			setNotes(typeof planData.metadata?.notes === "string" ? planData.metadata?.notes : "")

			if (planData.funding_option === "mix") {
				const percentages =
					planData.configuration?.mix_allocations?.percentages ??
					(planData.configuration?.mix_allocations as MixFundingAllocationMap) ??
					{}
				const allocationEntries: Partial<Record<PropertyFundingOption, string>> = {}
				Object.entries(percentages as Record<string, number>).forEach(([method, value]) => {
					allocationEntries[method as PropertyFundingOption] = Number(value).toString()
				})
				setMixAllocations(allocationEntries)

				if (!planData.selected_methods || planData.selected_methods.length === 0) {
					setSelectedMethods(Object.keys(allocationEntries) as PropertyFundingOption[])
				}
			} else if (!planData.selected_methods || planData.selected_methods.length === 0) {
				setSelectedMethods(planData.funding_option ? [planData.funding_option] : ["cash"])
			}
		} catch (error: any) {
			toast({
				title: "Unable to load payment plan",
				description: error?.message ?? "Please try again later.",
				variant: "destructive",
			})
			router.push("/admin/property-payment-plans")
		} finally {
			setLoading(false)
		}
	}, [params?.id, router, toast])

	useEffect(() => {
		void loadPlan()
	}, [loadPlan])

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
		if (!plan) return

		if (fundingOption === "mix") {
			if (selectedMethods.length < 2) {
				toast({
					title: "Select more payment methods",
					description: "Please choose at least two payment methods for the mix funding plan.",
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
		}

		try {
			setSubmitting(true)

			const payload: {
				status?: PropertyPaymentPlan["status"]
				funding_option?: PropertyFundingOption
				selected_methods?: PropertyFundingOption[]
				mix_allocations?: MixFundingAllocationMap | null
				total_amount?: number | null
				initial_balance?: number | null
				starts_on?: string | null
				ends_on?: string | null
				metadata?: Record<string, unknown> | null
			} = {
				status,
				funding_option: fundingOption,
				selected_methods: fundingOption === "mix" ? selectedMethods : selectedMethods.slice(0, 1),
				total_amount: totalAmount ? Number(totalAmount) : null,
				initial_balance: initialBalance ? Number(initialBalance) : null,
				starts_on: startsOn || null,
				ends_on: endsOn || null,
				metadata: notes ? { notes } : null,
			}

			if (fundingOption === "mix") {
				const allocations: MixFundingAllocationMap = {}
				mixAllocationDetails.forEach((item) => {
					allocations[item.method] = Number(item.percentage.toFixed(2))
				})
				payload.mix_allocations = allocations
			}

			const response = await updatePropertyPaymentPlan(plan.id, payload)

			if (!response.success) {
				throw new Error(response.message ?? "Unable to update payment plan.")
			}

			toast({
				title: "Payment plan updated",
				description: response.message ?? "Changes to the payment plan have been saved.",
			})

			router.push(`/admin/property-payment-plans/${plan.id}`)
		} catch (error: any) {
			toast({
				title: "Update failed",
				description: error?.message ?? "Something went wrong while updating the payment plan.",
				variant: "destructive",
			})
		} finally {
			setSubmitting(false)
		}
	}

	if (loading || !plan) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-8 w-56" />
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-72" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href={`/admin/property-payment-plans/${plan.id}`}>
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Edit Payment Plan</h1>
					<p className="text-muted-foreground">
						Update allocation settings and status for this property payment plan.
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex flex-wrap items-center gap-3">
						<MapPin className="h-4 w-4 text-primary" />
						<span>{plan.property?.title ?? "Property"}</span>
						{plan.property?.location && (
							<span className="flex items-center gap-2 text-sm text-muted-foreground">
								<MapPin className="h-4 w-4" />
								{plan.property.location}
							</span>
						)}
					</CardTitle>
					<CardDescription className="flex flex-wrap items-center gap-3 text-sm">
						{plan?.property?.price !== undefined && (
							<span>
								Total Price:{" "}
								{formatCurrency(Number(plan.property.price ?? plan?.total_amount ?? 0))}
							</span>
						)}
						{plan?.total_amount !== null && (
							<span>
								Plan Total: {formatCurrency(Number(plan?.total_amount ?? 0))}
							</span>
						)}
						{plan.remaining_balance !== null && (
							<span>
								Remaining Balance: {formatCurrency(Number(plan.remaining_balance ?? 0))}
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
							placeholder={plan?.total_amount ? String(plan?.total_amount) : "Enter total plan amount"}
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
							placeholder={plan.initial_balance ? String(plan.initial_balance) : "Enter initial balance"}
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
							<Input id="ends-on" type="date" value={endsOn} onChange={(event) => setEndsOn(event.target.value)} />
							<CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Funding Option</CardTitle>
					<CardDescription>Adjust payment methods and allocations for the plan.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Plan Status</Label>
							<Select value={status} onValueChange={(value: PropertyPaymentPlan["status"]) => setStatus(value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select plan status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="draft">Draft</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
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
									<SelectItem value="equity_wallet">100% Equity Wallet</SelectItem>
									<SelectItem value="mortgage">Mortgage</SelectItem>
									<SelectItem value="cooperative">Cooperative Deduction</SelectItem>
									<SelectItem value="mix">Mix Funding</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{fundingOption === "mix" ? (
						<>
							<p className="text-sm text-muted-foreground">
								Select the payment methods that will be combined in this plan. Up to three methods are supported.
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
										</span>
									</label>
								))}
							</div>
							<p className="text-xs text-muted-foreground">Selected methods: {selectedMethodsCount} / 3.</p>

							<div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div>
										<h4 className="text-sm font-semibold text-primary">Allocate Percentages</h4>
										<p className="text-xs text-muted-foreground">
											Distribute {formatCurrency(Number(totalAmount || plan?.total_amount ?? 0))} across the selected payment
											methods.
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
															? `${item.percentage.toFixed(2)}% of ${formatCurrency(
																	Number(totalAmount || plan?.total_amount ?? 0),
															  )}`
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
											<div className="text-xs text-red-600">
												Enter a percentage greater than 0 for each selected method.
											</div>
										)}
									</div>
								)}
							</div>
						</>
					) : (
						<div className="rounded-md border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
							This plan relies on <strong>{fundingOption.replace(/_/g, " ")}</strong>.
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Administrative Notes</CardTitle>
					<CardDescription>Provide optional instructions for finance or cooperative teams.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<Label htmlFor="notes">Notes</Label>
					<Textarea
						id="notes"
						rows={4}
						value={notes}
						onChange={(event) => setNotes(event.target.value)}
						placeholder="Share payment expectations, manual processes, or special instructions."
					/>
				</CardContent>
				<CardFooter className="flex justify-end gap-3">
					<Button variant="outline" type="button" onClick={() => router.push(`/admin/property-payment-plans/${plan.id}`)} disabled={submitting}>
						Cancel
					</Button>
					<Button type="submit" disabled={submitting || (fundingOption === "mix" && !isMixAllocationValid)}>
						{submitting ? "Saving..." : "Save Changes"}
					</Button>
				</CardFooter>
			</Card>

			<Separator />

			<Card>
				<CardContent className="space-y-3 text-sm text-muted-foreground">
					<p>
						Plan updates take effect immediately. Mix allocations will guide member payments and cooperative deductions, so double-check
						percentages before saving.
					</p>
					<p>
						If existing transactions exceed a new allocation, you will need to adjust allocations or settle transactions before saving.
					</p>
				</CardContent>
			</Card>
		</form>
	)
}


