"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Building2, CreditCard, Info, Loader2, Smartphone, Upload, X } from "lucide-react"
import type { LoanRepaymentPayload, LoanResource } from "@/lib/api/loans"
import { fetchLoanDetails, fetchLoanPaymentMethods, repayLoan } from "@/lib/api/loans"
import { getWallet, uploadPaymentEvidence } from "@/lib/api/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type PaymentMethod = "wallet" | "card" | "bank_transfer"
type Stage = "details" | "review" | "confirm"

type ManualAccount = {
	id: string
	bank_name?: string | null
	account_name?: string | null
	account_number?: string | null
	instructions?: string | null
	is_primary?: boolean
}

type ManualConfig = {
	require_payer_name?: boolean
	require_payer_phone?: boolean
	require_transaction_reference?: boolean
	require_payment_evidence?: boolean
	bank_accounts?: ManualAccount[]
}

const currency = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 0,
})

const paymentMethodLabels: Record<PaymentMethod, string> = {
	wallet: "Wallet Balance",
	card: "Debit/Credit Card",
	bank_transfer: "Bank Transfer",
}

const generateId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)

const computeOutstanding = (loan: LoanResource | null) => {
	if (!loan) return 0
	const repayments = loan.repayments ?? []
	const totalRepaid = repayments.reduce((sum, repayment) => sum + (repayment.amount ?? 0), 0)
	return Math.max((loan.total_amount ?? loan.amount ?? 0) - totalRepaid, 0)
}

export default function LoanRepaymentPage() {
	const { id: loanId } = useParams<{ id: string }>()
  const router = useRouter()

	const [stage, setStage] = useState<Stage>("details")
	const [loan, setLoan] = useState<LoanResource | null>(null)
	const [isLoadingLoan, setIsLoadingLoan] = useState<boolean>(true)
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")
	const [amount, setAmount] = useState<string>("")
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
	const [bankInstructions, setBankInstructions] = useState<Record<string, unknown> | null>(null)
	const [walletBalance, setWalletBalance] = useState<number | null>(null)
	const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false)
	const [notes, setNotes] = useState<string>("")
	const [error, setError] = useState<string | null>(null)
	const [manualConfig, setManualConfig] = useState<ManualConfig | null>(null)
	const [manualDetails, setManualDetails] = useState({
		payerName: "",
		payerPhone: "",
		transactionReference: "",
		bankAccountId: "",
	})
	const [manualEvidence, setManualEvidence] = useState<string[]>([])
	const [evidenceUploading, setEvidenceUploading] = useState<boolean>(false)

	useEffect(() => {
		let mounted = true
		const loadLoan = async () => {
			try {
				setIsLoadingLoan(true)
				setError(null)
				const response = await fetchLoanDetails(loanId)
				if (mounted) {
					setLoan(response)
					const defaultAmount =
						response.monthly_payment ??
						(response.total_amount && response.duration_months
							? response.total_amount / Math.max(response.duration_months, 1)
							: response.total_amount) ??
						0
					setAmount(String(Math.round(defaultAmount)))
					setStage("details")
				}
			} catch (err: any) {
				console.error("Failed to load loan", err)
				if (mounted) {
					setError(err?.message ?? "Unable to load loan details.")
				}
			} finally {
				if (mounted) {
					setIsLoadingLoan(false)
				}
			}
		}

		if (loanId) {
			loadLoan()
		}

		return () => {
			mounted = false
		}
	}, [loanId])

	useEffect(() => {
		let active = true

		const loadPaymentMethods = async () => {
			try {
				const methods = await fetchLoanPaymentMethods()
				if (!active) return

				const manualMethod = methods.find((method) => method.id === "bank_transfer")

				if (manualMethod && manualMethod.configuration && typeof manualMethod.configuration === "object") {
					const config = manualMethod.configuration as Record<string, unknown>
					const accountsRaw = Array.isArray(config.bank_accounts) ? (config.bank_accounts as unknown[]) : []

					const normalizedAccounts: ManualAccount[] = accountsRaw
						.filter((account): account is Record<string, unknown> => typeof account === "object" && account !== null)
						.map((account) => ({
							id: typeof account.id === "string" ? account.id : generateId(),
							bank_name: typeof account.bank_name === "string" ? (account.bank_name as string) : null,
							account_name: typeof account.account_name === "string" ? (account.account_name as string) : null,
							account_number:
								typeof account.account_number === "string" ? (account.account_number as string) : null,
							instructions:
								typeof account.instructions === "string" ? (account.instructions as string) : null,
							is_primary: Boolean(account.is_primary),
						}))

					setManualConfig({
						require_payer_name:
							typeof config.require_payer_name === "boolean" ? (config.require_payer_name as boolean) : true,
						require_payer_phone:
							typeof config.require_payer_phone === "boolean" ? (config.require_payer_phone as boolean) : false,
						require_transaction_reference:
							typeof config.require_transaction_reference === "boolean"
								? (config.require_transaction_reference as boolean)
								: true,
						require_payment_evidence:
							typeof config.require_payment_evidence === "boolean"
								? (config.require_payment_evidence as boolean)
								: true,
						bank_accounts: normalizedAccounts,
					})

					const defaultAccount =
						normalizedAccounts.find((account) => account.is_primary) ?? normalizedAccounts[0] ?? null

					if (defaultAccount) {
						setManualDetails((prev) => ({
							...prev,
							bankAccountId: defaultAccount.id,
						}))
					}
				} else {
					setManualConfig(null)
					setManualDetails((prev) => ({
						...prev,
						bankAccountId: "",
					}))
				}
			} catch (error) {
				console.error("Failed to load loan payment methods", error)
				if (!active) return
				setManualConfig(null)
			}
		}

		loadPaymentMethods()

		return () => {
			active = false
		}
	}, [])

	useEffect(() => {
		let mounted = true
		const loadWallet = async () => {
			try {
				setIsLoadingWallet(true)
				const response = await getWallet()
				if (mounted) {
					const balance = Number(response.wallet?.balance ?? NaN)
					setWalletBalance(Number.isFinite(balance) ? balance : null)
				}
			} catch (err) {
				console.warn("Unable to fetch wallet balance", err)
				if (mounted) {
					setWalletBalance(null)
				}
			} finally {
				if (mounted) {
					setIsLoadingWallet(false)
				}
			}
		}

		loadWallet()
		return () => {
			mounted = false
		}
	}, [])

	useEffect(() => {
		const accounts = manualConfig?.bank_accounts ?? []
		if (!accounts.length) {
			if (manualDetails.bankAccountId) {
				setManualDetails((prev) => ({ ...prev, bankAccountId: "" }))
			}
			return
		}

		const exists = accounts.some((account) => account.id === manualDetails.bankAccountId)
		if (!exists) {
			const defaultAccount = accounts.find((account) => account.is_primary) ?? accounts[0]
			setManualDetails((prev) => ({ ...prev, bankAccountId: defaultAccount.id }))
		}
	}, [manualConfig, manualDetails.bankAccountId])

	const outstandingBalance = useMemo(() => computeOutstanding(loan), [loan])
	const numericAmount = Number(amount) || 0
	const newBalance = Math.max(outstandingBalance - numericAmount, 0)
	const selectedMethodLabel = paymentMethodLabels[paymentMethod]
	const manualAccounts = useMemo(() => manualConfig?.bank_accounts ?? [], [manualConfig])
	const selectedManualAccount = useMemo(() => {
		if (!manualAccounts.length) {
			return null
		}

		if (!manualDetails.bankAccountId) {
			return manualAccounts[0]
		}

		return manualAccounts.find((account) => account.id === manualDetails.bankAccountId) ?? manualAccounts[0]
	}, [manualAccounts, manualDetails.bankAccountId])

	const PaymentTotals = () => (
		<Card className="border-none bg-muted/50">
			<CardContent className="space-y-2 p-4 text-sm">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Outstanding Balance</span>
					<span className="font-medium">{currency.format(outstandingBalance)}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Payment Amount</span>
					<span className="font-medium">{currency.format(numericAmount)}</span>
				</div>
				<div className="flex justify-between border-t pt-2">
					<span className="font-semibold">New Balance (after payment)</span>
					<span className="font-semibold text-primary">{currency.format(newBalance)}</span>
				</div>
			</CardContent>
		</Card>
	)

	const handleEvidenceUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files
		if (!files?.length) return

		setEvidenceUploading(true)
		try {
			const uploaded = await Promise.all(Array.from(files).map(uploadPaymentEvidence))
			setManualEvidence((prev) => Array.from(new Set([...prev, ...uploaded])))
			toast.success(
				uploaded.length === 1
					? "Payment evidence uploaded successfully."
					: `${uploaded.length} files uploaded successfully.`,
			)
		} catch (error: any) {
			console.error("Failed to upload payment evidence", error)
			toast.error("Failed to upload evidence", {
				description: error?.message ?? "Unable to upload payment evidence. Please try again.",
			})
		} finally {
			setEvidenceUploading(false)
			if (event.target) {
				event.target.value = ""
			}
		}
	}

	const removeEvidence = (url: string) => {
		setManualEvidence((prev) => prev.filter((item) => item !== url))
	}

	const validatePayment = () => {
		if (!loan) {
			toast.error("Unable to process payment", { description: "Loan details are still loading. Please try again shortly." })
			return false
		}
		if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
			toast.error("Invalid amount", { description: "Please enter a valid repayment amount greater than zero." })
			return false
		}
		if (numericAmount > outstandingBalance) {
			toast.error("Amount too high", {
				description: "Repayment amount cannot exceed the outstanding balance.",
			})
			return false
		}
		if (paymentMethod === "wallet" && walletBalance !== null && numericAmount > walletBalance) {
			toast.error("Insufficient wallet balance", {
				description: `Available wallet balance is ${currency.format(walletBalance)}.`,
			})
			return false
		}
		if (paymentMethod === "bank_transfer") {
			if (evidenceUploading) {
				toast.error("Upload in progress", {
					description: "Please wait for the payment evidence upload to finish.",
				})
				return false
			}

			if (!manualAccounts.length) {
				toast.error("Bank transfer unavailable", {
					description: "No manual bank accounts are configured. Choose another payment method or contact support.",
				})
				return false
			}

			if (!selectedManualAccount) {
				toast.error("Invalid bank account", {
					description: "The selected receiving account is no longer available. Please choose another account.",
				})
				return false
			}

			if ((manualConfig?.require_payer_name ?? true) && !manualDetails.payerName.trim()) {
				toast.error("Payer name required", {
					description: "Enter the name of the person making this transfer.",
				})
				return false
			}

			if ((manualConfig?.require_payer_phone ?? false) && !manualDetails.payerPhone.trim()) {
				toast.error("Payer phone required", {
					description: "Enter the payer's phone number.",
				})
				return false
			}

			if ((manualConfig?.require_transaction_reference ?? true) && !manualDetails.transactionReference.trim()) {
				toast.error("Reference required", {
					description: "Provide the bank transfer narration or transaction reference.",
				})
				return false
			}

			if ((manualConfig?.require_payment_evidence ?? true) && manualEvidence.length === 0) {
				toast.error("Payment evidence required", {
					description: "Upload at least one proof of payment before continuing.",
				})
				return false
			}

			if (manualAccounts.length > 1 && !manualDetails.bankAccountId) {
				toast.error("Select receiving account", {
					description: "Choose the cooperative bank account you paid into.",
				})
				return false
			}
		}
		return true
	}

	const handleDetailsSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!validatePayment()) return
		setBankInstructions(null)
		setStage("review")
	}

	const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setStage("confirm")
	}

	const handleConfirmSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!validatePayment()) return

		try {
			setIsSubmitting(true)
			setBankInstructions(null)

			const payload: LoanRepaymentPayload = {
				amount: numericAmount,
				payment_method: paymentMethod,
			}

			if (notes.trim()) {
				payload.notes = notes.trim()
			}

			if (paymentMethod === "bank_transfer") {
				payload.payer_name = manualDetails.payerName.trim()
				if (manualDetails.payerPhone.trim()) {
					payload.payer_phone = manualDetails.payerPhone.trim()
				}
				payload.transaction_reference = manualDetails.transactionReference.trim()
				if (manualDetails.bankAccountId) {
					payload.bank_account_id = manualDetails.bankAccountId
				}
				payload.payment_evidence = manualEvidence
			}

			const response = await repayLoan(loanId, payload)

			if (!response.success) {
				throw new Error(response.message ?? "Repayment failed")
			}

			if (paymentMethod === "card") {
				const paymentUrl = response.payment_data?.payment_url as string | undefined
				if (paymentUrl) {
					window.location.href = paymentUrl
					return
				}
			}

			if (paymentMethod === "bank_transfer") {
				setBankInstructions(response.payment_data ?? null)
				toast.success("Bank transfer initialized", {
					description: "Please complete the transfer using the provided account details.",
				})
				return
			}

			const reference = response.payment?.reference ?? ""
			router.push(
				`/dashboard/loans/${loanId}/repay/success?amount=${numericAmount}&reference=${reference}&method=${paymentMethod}`,
			)
		} catch (err: any) {
			console.error("Repayment failed", err)
			toast.error("Payment failed", {
				description: err?.message ?? "Unable to process repayment. Please try again.",
			})
		} finally {
			setIsSubmitting(false)
    }
  }

  return (
		<div className="mx-auto max-w-4xl space-y-6">
      <div>
				<Link href={`/dashboard/loans/${loanId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
            Back to Loan Details
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Make Loan Payment</h1>
				<p className="text-sm text-muted-foreground">Loan ID: {loanId}</p>
				{error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

			{stage === "details" && (
				<form onSubmit={handleDetailsSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Amount</CardTitle>
						<CardDescription>Select or enter how much you want to pay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
								min={1}
									step="any"
                value={amount}
								onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter amount"
								disabled={isLoadingLoan}
                required
              />
            </div>
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									setAmount(
											String(
												Math.round(
													loan?.monthly_payment ??
														(loan?.total_amount && loan?.duration_months
															? loan.total_amount / Math.max(loan.duration_months, 1)
															: loan?.total_amount) ??
															0,
												),
											),
									)
								}
								disabled={isLoadingLoan}
							>
								Monthly Payment ({currency.format(loan?.monthly_payment ?? 0)})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
								onClick={() => setAmount(String(Math.round(outstandingBalance)))}
								disabled={isLoadingLoan}
              >
								Full Balance ({currency.format(outstandingBalance)})
              </Button>
            </div>
							<PaymentTotals />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
						<CardDescription>Choose how you would like to complete this repayment</CardDescription>
          </CardHeader>
					<CardContent className="space-y-3">
						<RadioGroup
							value={paymentMethod}
							onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
							className="space-y-3"
						>
							<div className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50">
                  <RadioGroupItem value="card" id="card" />
								<Label htmlFor="card" className="flex flex-1 cursor-pointer items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
									<span>
										<span className="block font-medium">Debit/Credit Card</span>
										<span className="text-sm text-muted-foreground">
											Pay securely using your bank card (processed by Paystack)
										</span>
									</span>
                  </Label>
								<Badge variant="outline">Instant</Badge>
                </div>

							<div className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50">
								<RadioGroupItem value="wallet" id="wallet" />
								<Label htmlFor="wallet" className="flex flex-1 cursor-pointer items-center gap-3">
									<Smartphone className="h-5 w-5 text-muted-foreground" />
									<span>
										<span className="block font-medium">Wallet Balance</span>
										<span className="text-sm text-muted-foreground">
											Use available wallet balance for this repayment
										</span>
									</span>
                  </Label>
									<Badge variant="secondary">Instant</Badge>
                </div>

							<div className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50">
								<RadioGroupItem value="bank_transfer" id="bank_transfer" />
								<Label htmlFor="bank_transfer" className="flex flex-1 cursor-pointer items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
									<span>
										<span className="block font-medium">Bank Transfer</span>
										<span className="text-sm text-muted-foreground">
											Initiate a bank transfer and upload proof of payment
										</span>
									</span>
                  </Label>
              </div>
            </RadioGroup>

							{paymentMethod === "wallet" && (
								<Alert>
									<Info className="h-4 w-4" />
									<AlertDescription>
										{isLoadingWallet
											? "Loading your wallet balance..."
											: walletBalance !== null
											? `Available wallet balance: ${currency.format(walletBalance)}`
											: "Ensure you have sufficient wallet balance before you continue."}
									</AlertDescription>
								</Alert>
							)}

						{paymentMethod === "bank_transfer" ? (
								<div className="space-y-4 rounded-lg border bg-muted/40 p-4">
									<div className="space-y-2">
										<p className="font-medium">Transfer Details</p>
										{manualAccounts.length > 0 ? (
											<div className="space-y-3">
												{manualAccounts.length > 1 ? (
													<div className="space-y-2">
														<Label htmlFor="bank-account">Select Receiving Account</Label>
														<Select
															value={manualDetails.bankAccountId}
															onValueChange={(value) =>
																setManualDetails((prev) => ({ ...prev, bankAccountId: value }))
															}
														>
															<SelectTrigger id="bank-account">
																<SelectValue placeholder="Select account" />
															</SelectTrigger>
															<SelectContent>
																{manualAccounts.map((account) => (
																	<SelectItem key={account.id} value={account.id}>
																		<div className="flex flex-col">
																			<span className="font-medium">{account.bank_name ?? "Bank"}</span>
																			<span className="text-xs text-muted-foreground">
																				{account.account_name ?? "Account"} • {account.account_number ?? "—"}
																			</span>
																		</div>
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												) : null}
												{selectedManualAccount ? (
													<div className="rounded-lg border bg-white p-4 text-sm">
														<div className="flex justify-between">
															<span className="text-muted-foreground">Bank</span>
															<span className="font-medium">{selectedManualAccount.bank_name ?? "—"}</span>
														</div>
														<div className="flex justify-between">
															<span className="text-muted-foreground">Account Name</span>
															<span className="font-medium break-all">
																{selectedManualAccount.account_name ?? "—"}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-muted-foreground">Account Number</span>
															<span className="font-medium">{selectedManualAccount.account_number ?? "—"}</span>
														</div>
														{selectedManualAccount.instructions ? (
															<p className="mt-3 text-xs text-muted-foreground">
																{selectedManualAccount.instructions}
															</p>
														) : null}
													</div>
												) : null}
											</div>
										) : (
											<Alert>
												<AlertDescription>
													No cooperative bank accounts are configured for manual payments. Please contact support
													or choose a different payment method.
												</AlertDescription>
											</Alert>
										)}
									</div>
									<div className="grid gap-4 md:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="payer-name">
												Payer Name{" "}
												{manualConfig?.require_payer_name ?? true ? (
													<span className="text-destructive">*</span>
												) : null}
											</Label>
											<Input
												id="payer-name"
												value={manualDetails.payerName}
												onChange={(event) =>
													setManualDetails((prev) => ({ ...prev, payerName: event.target.value }))
												}
												placeholder="Full name of payer"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="payer-phone">
												Payer Phone{" "}
												{manualConfig?.require_payer_phone ? <span className="text-destructive">*</span> : null}
											</Label>
											<Input
												id="payer-phone"
												value={manualDetails.payerPhone}
												onChange={(event) =>
													setManualDetails((prev) => ({ ...prev, payerPhone: event.target.value }))
												}
												placeholder="Phone number used for transfer"
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="transaction-reference">
											Transaction Reference{" "}
											{manualConfig?.require_transaction_reference ?? true ? (
												<span className="text-destructive">*</span>
											) : null}
										</Label>
										<Input
											id="transaction-reference"
											value={manualDetails.transactionReference}
											onChange={(event) =>
												setManualDetails((prev) => ({ ...prev, transactionReference: event.target.value }))
											}
											placeholder="Transfer narration or bank reference"
										/>
									</div>
									<div className="space-y-3">
										<Label>
											Payment Evidence{" "}
											{manualConfig?.require_payment_evidence ?? true ? (
												<span className="text-destructive">*</span>
											) : null}
										</Label>
										<p className="text-sm text-muted-foreground">Upload proof of payment (PNG, JPG, or PDF).</p>
										<label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white transition-colors hover:border-primary">
											{evidenceUploading ? (
												<>
													<Loader2 className="mb-2 h-6 w-6 animate-spin text-muted-foreground" />
													<span className="text-sm text-muted-foreground">Uploading evidence…</span>
												</>
											) : (
												<>
													<Upload className="mb-2 h-6 w-6 text-muted-foreground" />
													<span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
													<span className="text-xs text-muted-foreground">PNG, JPG, or PDF up to 5MB</span>
												</>
											)}
											<input
												type="file"
												accept="image/*,.pdf"
												multiple
												className="hidden"
												onChange={handleEvidenceUpload}
												disabled={evidenceUploading}
											/>
										</label>
										{manualEvidence.length > 0 ? (
											<div className="space-y-2">
												{manualEvidence.map((url) => (
													<div
														key={url}
														className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm"
													>
														<a
															className="text-primary hover:underline"
															href={url}
															target="_blank"
															rel="noopener noreferrer"
														>
															View evidence
														</a>
														<Button type="button" variant="ghost" size="icon" onClick={() => removeEvidence(url)}>
															<X className="h-4 w-4" />
														</Button>
													</div>
												))}
											</div>
										) : null}
									</div>
									<div className="space-y-2">
										<Label htmlFor="manual-notes">Notes (optional)</Label>
								<Textarea
											id="manual-notes"
											placeholder="Add optional notes for the finance team"
									value={notes}
									onChange={(event) => setNotes(event.target.value)}
								/>
                  </div>
                  </div>
						) : null}
          </CardContent>
        </Card>

				<div className="flex flex-col gap-3 sm:flex-row">
					<Button
						type="button"
						variant="outline"
						className="flex-1 bg-transparent"
						onClick={() => router.back()}
						disabled={isSubmitting}
					>
            Cancel
          </Button>
					<Button
						type="submit"
						className="flex-1"
							disabled={isLoadingLoan || numericAmount <= 0 || (paymentMethod === "bank_transfer" && evidenceUploading)}
						>
							Review Payment
						</Button>
					</div>
				</form>
			)}

			{stage === "review" && (
				<form onSubmit={handleReviewSubmit} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Review Payment</CardTitle>
							<CardDescription>Confirm the repayment details before proceeding.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-lg border p-4 space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Payment Amount</span>
									<span className="text-lg font-semibold">{currency.format(numericAmount)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Payment Method</span>
									<span className="font-medium">{selectedMethodLabel}</span>
								</div>
							</div>
							<PaymentTotals />
							<div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
								<ul className="space-y-1">
									<li>• You can still go back to adjust the amount or payment method.</li>
									<li>• Payments above the outstanding balance are not allowed.</li>
									<li>• Confirmation will initiate your selected payment method.</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{paymentMethod === "bank_transfer" && (
						<Card>
							<CardHeader>
								<CardTitle>Manual Payment Summary</CardTitle>
								<CardDescription>Verify the transfer details before continuing.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{selectedManualAccount ? (
									<div className="rounded-lg border p-4 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Bank</span>
											<span className="font-medium">{selectedManualAccount.bank_name ?? "—"}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Account Name</span>
											<span className="font-medium break-all">
												{selectedManualAccount.account_name ?? "—"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Account Number</span>
											<span className="font-medium">{selectedManualAccount.account_number ?? "—"}</span>
										</div>
										{selectedManualAccount.instructions ? (
											<p className="mt-3 text-xs text-muted-foreground">
												{selectedManualAccount.instructions}
											</p>
										) : null}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">No receiving account selected.</p>
								)}
								<div className="grid gap-2 text-sm md:grid-cols-2">
									<div>
										<p className="text-muted-foreground">Payer Name</p>
										<p className="font-medium">{manualDetails.payerName || "Not provided"}</p>
									</div>
									<div>
										<p className="text-muted-foreground">Payer Phone</p>
										<p className="font-medium">{manualDetails.payerPhone || "Not provided"}</p>
									</div>
								</div>
								<div className="space-y-1 text-sm">
									<span className="text-muted-foreground">Transaction Reference</span>
									<p className="font-medium break-all">
										{manualDetails.transactionReference || "Not provided"}
									</p>
								</div>
								{notes.trim() ? (
									<div className="space-y-1 text-sm">
										<span className="text-muted-foreground">Notes</span>
										<p className="font-medium break-all">{notes.trim()}</p>
									</div>
								) : null}
								{manualEvidence.length > 0 ? (
									<div className="space-y-1 text-sm">
										<span className="text-muted-foreground">Payment Evidence</span>
										<ul className="space-y-1">
											{manualEvidence.map((url) => (
												<li key={url}>
													<a
														className="text-primary hover:underline"
														href={url}
														target="_blank"
														rel="noopener noreferrer"
													>
														{url.split("/").pop()}
													</a>
												</li>
											))}
										</ul>
									</div>
								) : (
									<p className="text-sm text-muted-foreground">No payment evidence uploaded yet.</p>
								)}
							</CardContent>
						</Card>
					)}

					{paymentMethod === "wallet" && (
						<Alert>
							<Info className="h-4 w-4" />
							<AlertDescription>
								{walletBalance !== null
									? `This payment will deduct ${currency.format(numericAmount)} from your wallet.`
									: "Ensure you have enough wallet balance before confirming."}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							type="button"
							variant="outline"
							className="flex-1 bg-transparent"
							onClick={() => {
								setStage("details")
								setBankInstructions(null)
							}}
						>
							Back to Edit
						</Button>
						<Button type="submit" className="flex-1">
							Proceed to Confirm
						</Button>
					</div>
				</form>
			)}

			{stage === "confirm" && (
				<form onSubmit={handleConfirmSubmit} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Confirm Payment</CardTitle>
							<CardDescription>Authorize this repayment to continue.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-lg border p-4 space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Amount</span>
									<span className="text-xl font-semibold">{currency.format(numericAmount)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Payment Method</span>
									<span className="font-medium">{selectedMethodLabel}</span>
								</div>
								{notes.trim() && paymentMethod === "bank_transfer" ? (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Notes</span>
										<span className="max-w-[60%] text-right text-sm">{notes.trim()}</span>
									</div>
								) : null}
							</div>
							<PaymentTotals />
							{paymentMethod === "bank_transfer" && (
								<div className="space-y-3 rounded-lg border p-4 text-sm">
									<p className="text-sm font-semibold">Transfer Summary</p>
									{selectedManualAccount ? (
										<div className="space-y-2">
											<div className="flex justify-between">
												<span className="text-muted-foreground">Bank</span>
												<span className="font-medium">{selectedManualAccount.bank_name ?? "—"}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Account Name</span>
												<span className="font-medium break-all">
													{selectedManualAccount.account_name ?? "—"}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Account Number</span>
												<span className="font-medium">{selectedManualAccount.account_number ?? "—"}</span>
											</div>
										</div>
									) : (
										<p className="text-muted-foreground">No receiving account selected.</p>
									)}
									<div className="grid gap-2 md:grid-cols-2">
										<div>
											<p className="text-muted-foreground">Payer Name</p>
											<p className="font-medium">{manualDetails.payerName || "Not provided"}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Payer Phone</p>
											<p className="font-medium">{manualDetails.payerPhone || "Not provided"}</p>
										</div>
									</div>
									<div>
										<p className="text-muted-foreground">Transaction Reference</p>
										<p className="font-medium break-all">
											{manualDetails.transactionReference || "Not provided"}
										</p>
									</div>
									{notes.trim() ? (
										<div>
											<p className="text-muted-foreground">Notes</p>
											<p className="font-medium break-all">{notes.trim()}</p>
										</div>
									) : null}
									{manualEvidence.length > 0 ? (
										<div className="space-y-1">
											<p className="text-muted-foreground">Payment Evidence</p>
											<ul className="space-y-1">
												{manualEvidence.map((url) => (
													<li key={url}>
														<a
															className="text-primary hover:underline"
															href={url}
															target="_blank"
															rel="noopener noreferrer"
														>
															{url.split("/").pop()}
														</a>
													</li>
												))}
											</ul>
										</div>
									) : (
										<p className="text-muted-foreground">No payment evidence uploaded yet.</p>
									)}
								</div>
							)}
							<p className="text-sm text-muted-foreground">
								By clicking confirm, you authorize this repayment and acknowledge that the amount will be processed via the
								selected payment method.
							</p>

							{paymentMethod === "bank_transfer" && bankInstructions && (
								<Card className="border-primary/50 bg-primary/5">
									<CardHeader>
										<CardTitle className="text-base font-semibold">Bank Transfer Instructions</CardTitle>
										<CardDescription>
											Complete your transfer using the details below and upload proof of payment to finance.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<pre className="whitespace-pre-wrap text-sm">{JSON.stringify(bankInstructions, null, 2)}</pre>
									</CardContent>
								</Card>
							)}
						</CardContent>
					</Card>

					{paymentMethod === "wallet" && (
						<Alert>
							<Info className="h-4 w-4" />
							<AlertDescription>
								{walletBalance !== null
									? `Wallet deduction after confirmation: ${currency.format(numericAmount)}`
									: "We could not verify your wallet balance. Ensure funds are available."}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							type="button"
							variant="outline"
							className="flex-1 bg-transparent"
							onClick={() => {
								setStage("review")
								setBankInstructions(null)
							}}
							disabled={isSubmitting}
						>
							Back
						</Button>
						<Button
							type="submit"
							className="flex-1"
							disabled={
								isSubmitting ||
								isLoadingLoan ||
								(paymentMethod === "bank_transfer" && bankInstructions !== null)
							}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
							) : paymentMethod === "bank_transfer" && bankInstructions
							? "Awaiting Transfer"
							: "Confirm Payment"}
          </Button>
        </div>
      </form>
			)}
    </div>
  )
}
