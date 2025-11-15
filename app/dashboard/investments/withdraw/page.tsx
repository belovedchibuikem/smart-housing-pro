"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { getInvestmentWithdrawalOptions, getUserInvestments, requestInvestmentWithdrawal } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"

const currencyFormatter = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	minimumFractionDigits: 0,
})

export default function WithdrawInvestmentPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { isLoading, loadData } = usePageLoading()
	const { toast } = useToast()

	const [investments, setInvestments] = useState<Array<{ id: string; amount: number; status: string }>>([])
	const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>("")
	const [withdrawalOptions, setWithdrawalOptions] = useState<any>(null)
	const [withdrawalType, setWithdrawalType] = useState<"full" | "partial">("full")
	const [amount, setAmount] = useState<string>("")
	const [reason, setReason] = useState<string>("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Load investments
	useEffect(() => {
		let active = true
		;(async () => {
			try {
				const response = await loadData(() => getUserInvestments({ status: "active" }))
				if (!active) return
				if (response.investments) {
					setInvestments(response.investments)
					const investmentIdFromUrl = searchParams.get("investment")
					if (investmentIdFromUrl) {
						setSelectedInvestmentId(investmentIdFromUrl)
					} else if (response.investments.length > 0) {
						setSelectedInvestmentId(response.investments[0].id)
					}
				}
			} catch (error: any) {
				if (!active) return
				toast({
					title: "Failed to load investments",
					description: error?.message || "Please try again later.",
					variant: "destructive",
				})
			}
		})()

		return () => {
			active = false
		}
	}, [loadData, toast, searchParams])

	// Load withdrawal options when investment is selected
	useEffect(() => {
		if (!selectedInvestmentId) return

		let active = true
		;(async () => {
			try {
				const response = await loadData(() => getInvestmentWithdrawalOptions(selectedInvestmentId))
				if (!active) return
				if (response.withdrawal_options) {
					setWithdrawalOptions(response.withdrawal_options)
					if (response.withdrawal_options.available_for_withdrawal > 0) {
						setAmount(String(response.withdrawal_options.available_for_withdrawal))
					}
				}
			} catch (error: any) {
				if (!active) return
				toast({
					title: "Failed to load withdrawal options",
					description: error?.message || "Please try again later.",
					variant: "destructive",
				})
			}
		})()

		return () => {
			active = false
		}
	}, [selectedInvestmentId, loadData, toast])

	const handleSubmit = async () => {
		if (!selectedInvestmentId) {
			toast({
				title: "Please select an investment",
				variant: "destructive",
			})
			return
		}

		if (withdrawalType === "partial" && (!amount || Number(amount) <= 0)) {
			toast({
				title: "Please enter a valid withdrawal amount",
				variant: "destructive",
			})
			return
		}

		if (withdrawalType === "partial" && withdrawalOptions && Number(amount) > withdrawalOptions.available_for_withdrawal) {
			toast({
				title: "Withdrawal amount exceeds available balance",
				variant: "destructive",
			})
			return
		}

		setIsSubmitting(true)
		try {
			const response = await requestInvestmentWithdrawal(selectedInvestmentId, {
				withdrawal_type: withdrawalType,
				amount: withdrawalType === "partial" ? Number(amount) : undefined,
			})

			if (response.success) {
				toast({
					title: "Withdrawal request submitted",
					description: response.message || "Your request will be reviewed by an administrator.",
				})
				router.push("/dashboard/investments")
			} else {
				throw new Error(response.message || "Failed to submit withdrawal request")
			}
		} catch (error: any) {
			toast({
				title: "Failed to submit withdrawal request",
				description: error?.message || "Please try again later.",
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const selectedInvestment = investments.find((inv) => inv.id === selectedInvestmentId)

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link href="/dashboard/investments">
						<ArrowLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Withdraw Investment</h1>
					<p className="text-muted-foreground">Request withdrawal from your investment</p>
				</div>
			</div>

			{withdrawalOptions && !withdrawalOptions.is_matured && (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						This investment has not matured yet. Maturity date: {new Date(withdrawalOptions.maturity_date).toLocaleDateString()}
					</AlertDescription>
				</Alert>
			)}

			{withdrawalOptions && withdrawalOptions.available_for_withdrawal <= 0 && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>No funds available for withdrawal from this investment.</AlertDescription>
				</Alert>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Withdrawal Request</CardTitle>
					<CardDescription>Fill in the details to request an investment withdrawal</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="investment">Select Investment</Label>
						{isLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={selectedInvestmentId} onValueChange={setSelectedInvestmentId}>
								<SelectTrigger id="investment">
									<SelectValue placeholder="Choose investment to withdraw from" />
								</SelectTrigger>
								<SelectContent>
									{investments.map((inv) => (
										<SelectItem key={inv.id} value={inv.id}>
											Investment #{inv.id.slice(0, 8)} - {currencyFormatter.format(inv.amount)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					{withdrawalOptions && (
						<>
							<div className="space-y-2">
								<Label>Withdrawal Type</Label>
								<RadioGroup value={withdrawalType} onValueChange={(value) => setWithdrawalType(value as "full" | "partial")}>
									<div className="flex items-center space-x-2 border rounded-lg p-3">
										<RadioGroupItem value="full" id="full" />
										<Label htmlFor="full" className="flex-1 cursor-pointer">
											<div>
												<p className="font-medium">Full Withdrawal</p>
												<p className="text-sm text-muted-foreground">
													{currencyFormatter.format(withdrawalOptions.withdrawal_types.full.amount)} - Withdraw all available funds
												</p>
											</div>
										</Label>
									</div>
									<div className="flex items-center space-x-2 border rounded-lg p-3">
										<RadioGroupItem value="partial" id="partial" />
										<Label htmlFor="partial" className="flex-1 cursor-pointer">
											<div>
												<p className="font-medium">Partial Withdrawal</p>
												<p className="text-sm text-muted-foreground">
													Withdraw a specific amount (Min: {currencyFormatter.format(withdrawalOptions.withdrawal_types.partial.min_amount)}, Max:{" "}
													{currencyFormatter.format(withdrawalOptions.withdrawal_types.partial.max_amount)})
												</p>
											</div>
										</Label>
									</div>
								</RadioGroup>
							</div>

							{withdrawalType === "partial" && (
								<div className="space-y-2">
									<Label htmlFor="amount">Withdrawal Amount</Label>
									<Input
										id="amount"
										type="number"
										placeholder="Enter amount to withdraw"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										min={withdrawalOptions.withdrawal_types.partial.min_amount}
										max={withdrawalOptions.withdrawal_types.partial.max_amount}
									/>
									<p className="text-sm text-muted-foreground">
										Available balance: {currencyFormatter.format(withdrawalOptions.available_for_withdrawal)}
									</p>
								</div>
							)}

							{withdrawalType === "full" && (
								<div className="space-y-2">
									<Label>Withdrawal Amount</Label>
									<div className="p-3 border rounded-lg bg-muted">
										<p className="text-lg font-semibold">{currencyFormatter.format(withdrawalOptions.withdrawal_types.full.amount)}</p>
										<p className="text-sm text-muted-foreground">Full withdrawal amount</p>
									</div>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="reason">Reason for Withdrawal (Optional)</Label>
								<Textarea
									id="reason"
									placeholder="Provide a reason for your withdrawal request"
									rows={4}
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									maxLength={500}
								/>
								<p className="text-xs text-muted-foreground">{reason.length}/500 characters</p>
							</div>

							<Alert>
								<AlertDescription>
									<strong>Processing Time:</strong> Withdrawal requests are typically processed within 5-7 business days. You will receive a
									notification once your request is approved.
								</AlertDescription>
							</Alert>

							<div className="flex gap-2">
								<Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting || !withdrawalOptions.is_matured || withdrawalOptions.available_for_withdrawal <= 0}>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Submitting...
										</>
									) : (
										<>
											<CheckCircle2 className="h-4 w-4 mr-2" />
											Submit Withdrawal Request
										</>
									)}
								</Button>
								<Button variant="outline" asChild>
									<Link href="/dashboard/investments">Cancel</Link>
								</Button>
							</div>
						</>
					)}

					{!withdrawalOptions && !isLoading && (
						<div className="text-center py-8 text-muted-foreground">
							<p>Please select an investment to view withdrawal options</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
