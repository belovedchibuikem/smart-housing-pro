"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, Loader2, Upload } from "lucide-react"
import type { LoanProduct } from "@/lib/api/loans"
import { submitLoanApplication } from "@/lib/api/loans"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type LoanApplicationFormProps = {
	products: LoanProduct[]
	isLoadingProducts?: boolean
	onSubmitted?: (loanId: string) => void
	redirectOnSuccess?: boolean
	initialProductId?: string
}

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 2,
	}).format(value || 0)

const computeMonthlyRepayment = (product: LoanProduct | undefined, amount: number, months: number) => {
	if (!product || !amount || !months) return { monthly: 0, total: 0, interest: 0 }

	const interestRate = product.interest_rate ?? 0

	if (product.interest_type === "compound") {
		const monthlyRate = interestRate / 100
		const totalAmount = amount * Math.pow(1 + monthlyRate, months)
		const monthlyPayment = totalAmount / months
		return { monthly: monthlyPayment, total: totalAmount, interest: totalAmount - amount }
	}

	const totalInterest = amount * (interestRate / 100) * months
	const totalAmount = amount + totalInterest
	const monthlyPayment = totalAmount / months

	return { monthly: monthlyPayment, total: totalAmount, interest: totalInterest }
}

export function LoanApplicationForm({
	products,
	isLoadingProducts,
	onSubmitted,
	redirectOnSuccess = true,
	initialProductId,
}: LoanApplicationFormProps) {
  const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [selectedProductId, setSelectedProductId] = useState<string>("")
	const [loanAmount, setLoanAmount] = useState<string>("")
	const [netPay, setNetPay] = useState<string>("")
	const [tenureMonths, setTenureMonths] = useState<number>(0)
	const [employmentStatus, setEmploymentStatus] = useState<"employed" | "self_employed" | "retired">("employed")
	const [purpose, setPurpose] = useState<string>("")
	const [guarantorName, setGuarantorName] = useState<string>("")
	const [guarantorPhone, setGuarantorPhone] = useState<string>("")
	const [guarantorRelationship, setGuarantorRelationship] = useState<string>("")
	const [guarantorAddress, setGuarantorAddress] = useState<string>("")
	const [additionalInfo, setAdditionalInfo] = useState<string>("")

  useEffect(() => {
		if (initialProductId && products.some((product) => product.id === initialProductId)) {
			setSelectedProductId(initialProductId)
		}
	}, [initialProductId, products])

	const selectedProduct = useMemo(
		() => products.find((product) => product.id === selectedProductId),
		[products, selectedProductId]
	)

	const tenureOptions = useMemo(() => {
		if (!selectedProduct) return []
		const min = Math.max(selectedProduct.min_tenure_months ?? 1, 1)
		const max = Math.max(selectedProduct.max_tenure_months ?? min, min)
		const options: number[] = []
		for (let month = min; month <= max; month += 1) {
			options.push(month)
		}
		return options
	}, [selectedProduct])

	useEffect(() => {
		if (tenureOptions.length > 0) {
			setTenureMonths((current) => (current ? current : tenureOptions[0]))
		} else {
			setTenureMonths(0)
		}
	}, [tenureOptions])

	const numericAmount = Number(loanAmount) || 0
	const numericNetPay = Number(netPay) || 0

	const repaymentSummary = useMemo(() => {
		if (!selectedProduct || !numericAmount || !tenureMonths) {
			return { monthly: 0, total: 0, interest: 0 }
		}

		return computeMonthlyRepayment(selectedProduct, numericAmount, tenureMonths)
	}, [selectedProduct, numericAmount, tenureMonths])

	const processingFee =
		selectedProduct?.processing_fee_percentage && numericAmount
			? (numericAmount * (selectedProduct.processing_fee_percentage ?? 0)) / 100
			: 0

	const requiredNetPay = repaymentSummary.monthly * 2
	const isQualified = numericNetPay >= requiredNetPay && repaymentSummary.monthly > 0

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!selectedProduct) return
    if (!isQualified) {
			toast.error("Net pay requirement", {
				description: "Your net pay must be at least twice the monthly repayment amount.",
			})
      return
    }

		try {
			setIsSubmitting(true)
			const response = await submitLoanApplication({
				product_id: selectedProduct.id,
				amount: numericAmount,
				tenure_months: tenureMonths,
				purpose,
				net_pay: numericNetPay,
				employment_status: employmentStatus,
				guarantor_name: guarantorName,
				guarantor_phone: guarantorPhone,
				guarantor_relationship: guarantorRelationship,
				guarantor_address: guarantorAddress,
				additional_info: additionalInfo || undefined,
			})

			toast.success(response.message || "Loan application submitted successfully")
			onSubmitted?.(response.loan.id)

			if (redirectOnSuccess) {
				router.push(`/dashboard/loans/application-success?loanId=${response.loan.id}`)
				return
			}

			setLoanAmount("")
			setNetPay("")
			setPurpose("")
			setGuarantorName("")
			setGuarantorPhone("")
			setGuarantorRelationship("")
			setGuarantorAddress("")
			setAdditionalInfo("")
		} catch (error: any) {
			console.error("Loan application failed", error)
			toast.error("Loan application failed", {
				description: error?.message ?? "Please review the details and try again.",
			})
		} finally {
			setIsSubmitting(false)
		}
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
				<div className="mb-6 flex flex-col gap-2">
					<h2 className="text-lg font-semibold">Loan Details</h2>
					<p className="text-sm text-muted-foreground">
						Select a loan product and provide the required information to proceed.
					</p>
				</div>

        <div className="space-y-4">
          <div className="space-y-2">
						<Label htmlFor="loan-product">Loan Product</Label>
						<Select
							value={selectedProductId}
							onValueChange={setSelectedProductId}
							disabled={isLoadingProducts || products.length === 0}
							required
						>
							<SelectTrigger id="loan-product">
								<SelectValue placeholder={isLoadingProducts ? "Loading loan products..." : "Select loan product"} />
              </SelectTrigger>
              <SelectContent>
								{products.map((product) => (
									<SelectItem key={product.id} value={product.id}>
										{product.name}
									</SelectItem>
								))}
              </SelectContent>
            </Select>
          </div>

					<div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
							<Label htmlFor="loan-amount">Loan Amount (₦)</Label>
              <Input
								id="loan-amount"
                type="number"
								min={selectedProduct?.min_amount ?? 0}
								max={selectedProduct?.max_amount ?? undefined}
								step="1000"
                placeholder="Enter amount"
                value={loanAmount}
								onChange={(event) => setLoanAmount(event.target.value)}
                required
              />
							{selectedProduct?.min_amount ? (
								<p className="text-xs text-muted-foreground">
									Minimum: {formatCurrency(selectedProduct.min_amount)} {selectedProduct.max_amount ? `• Maximum: ${formatCurrency(selectedProduct.max_amount)}` : ""}
								</p>
							) : null}
            </div>

            <div className="space-y-2">
							<Label htmlFor="net-pay">Net Pay (₦)</Label>
              <Input
								id="net-pay"
                type="number"
								min="0"
								step="1000"
								placeholder="Enter your monthly net salary"
								value={netPay}
								onChange={(event) => setNetPay(event.target.value)}
                required
              />
							<p className="text-xs text-muted-foreground">
								You need at least {formatCurrency(requiredNetPay)} monthly net pay to qualify.
							</p>
            </div>
          </div>

          <div className="space-y-2">
						<Label htmlFor="tenure">Repayment Tenure</Label>
						<Select
							value={tenureMonths ? String(tenureMonths) : ""}
							onValueChange={(value) => setTenureMonths(Number(value))}
							disabled={!tenureOptions.length}
							required
						>
              <SelectTrigger id="tenure">
                <SelectValue placeholder="Select tenure" />
              </SelectTrigger>
              <SelectContent>
								{tenureOptions.map((month) => (
									<SelectItem key={month} value={String(month)}>
										{month} {month === 1 ? "month" : "months"}
									</SelectItem>
								))}
              </SelectContent>
            </Select>
          </div>

					{selectedProduct ? (
						<div className="rounded-lg border bg-muted/40 p-4">
							<div className="flex flex-wrap items-center gap-3">
								<Badge variant="secondary">Interest: {selectedProduct.interest_rate ?? 0}%</Badge>
								<Badge variant="secondary">Type: {selectedProduct.interest_type?.toUpperCase()}</Badge>
								{selectedProduct.processing_fee_percentage ? (
									<Badge variant="secondary">
										Processing Fee: {selectedProduct.processing_fee_percentage}%
									</Badge>
								) : null}
							</div>
						</div>
					) : null}

					{repaymentSummary.monthly > 0 ? (
            <div
							className={`rounded-lg border p-4 ${
								isQualified ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
							}`}
            >
              <div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Monthly Repayment</span>
									<span className="text-lg font-semibold text-primary">
										{formatCurrency(repaymentSummary.monthly)}
                  </span>
                </div>
								<div className="flex items-center justify-between text-sm text-muted-foreground">
									<span>Total Repayment</span>
									<span>{formatCurrency(repaymentSummary.total + processingFee)}</span>
                </div>
								<div className="flex items-center justify-between text-sm text-muted-foreground">
									<span>Processing Fee</span>
									<span>{formatCurrency(processingFee)}</span>
                </div>
								<div className="flex items-center justify-between border-t pt-2 text-sm">
									<span>Required Net Pay (200%)</span>
									<span className="font-medium">{formatCurrency(requiredNetPay)}</span>
                </div>
              </div>
							<p className="mt-3 text-xs">
								Calculation based on {selectedProduct?.interest_type ?? "simple"} interest with rate of{" "}
								{selectedProduct?.interest_rate ?? 0}% for {tenureMonths} months.
              </p>
            </div>
					) : null}

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Loan</Label>
						<Textarea
							id="purpose"
							placeholder="Describe the purpose of the loan"
							value={purpose}
							onChange={(event) => setPurpose(event.target.value)}
							required
						/>
          </div>
        </div>
      </Card>

      <Card className="p-6">
				<h2 className="mb-4 text-lg font-semibold">Employment Information</h2>
				<div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
						<Label htmlFor="employment-status">Employment Status</Label>
						<Select value={employmentStatus} onValueChange={(value) => setEmploymentStatus(value as typeof employmentStatus)}>
							<SelectTrigger id="employment-status">
								<SelectValue placeholder="Select employment status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="employed">Employed</SelectItem>
								<SelectItem value="self_employed">Self-employed</SelectItem>
								<SelectItem value="retired">Retired</SelectItem>
							</SelectContent>
						</Select>
            </div>
            <div className="space-y-2">
						<Label htmlFor="additional-info">Additional Information (optional)</Label>
						<Textarea
							id="additional-info"
							placeholder="Provide any additional information relevant to your loan request"
							value={additionalInfo}
							onChange={(event) => setAdditionalInfo(event.target.value)}
							className="min-h-[96px]"
						/>
          </div>
        </div>
      </Card>

      <Card className="p-6">
				<h2 className="mb-4 text-lg font-semibold">Guarantor Information</h2>
				<div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guarantor-name">Full Name</Label>
						<Input
							id="guarantor-name"
							placeholder="Guarantor's full name"
							value={guarantorName}
							onChange={(event) => setGuarantorName(event.target.value)}
							required
						/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="guarantor-phone">Phone Number</Label>
						<Input
							id="guarantor-phone"
							placeholder="Guarantor's phone number"
							value={guarantorPhone}
							onChange={(event) => setGuarantorPhone(event.target.value)}
							required
						/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="guarantor-relationship">Relationship</Label>
						<Input
							id="guarantor-relationship"
							placeholder="e.g. colleague, sibling"
							value={guarantorRelationship}
							onChange={(event) => setGuarantorRelationship(event.target.value)}
							required
						/>
            </div>
					<div className="space-y-2 md:col-span-2">
						<Label htmlFor="guarantor-address">Residential Address</Label>
						<Textarea
							id="guarantor-address"
							placeholder="Enter the guarantor's residential address"
							value={guarantorAddress}
							onChange={(event) => setGuarantorAddress(event.target.value)}
							required
						/>
          </div>
        </div>
      </Card>

      <Card className="p-6">
				<h2 className="mb-4 text-lg font-semibold">Supporting Documents (optional)</h2>
				<div className="space-y-4 text-center">
					<div className="rounded-lg border-2 border-dashed p-6">
						<Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
						<p className="text-sm font-medium">Upload supporting documents</p>
						<p className="text-xs text-muted-foreground">
							Salary slips, employment letters, bank statements (PDF, JPG, PNG up to 5MB)
						</p>
            </div>
					<p className="text-xs text-muted-foreground">
						Document uploads are optional at this stage. Admins may request additional documents during review.
					</p>
        </div>
      </Card>

			<div className="flex flex-col gap-3 md:flex-row">
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
					disabled={
						isSubmitting ||
						!selectedProduct ||
						!loanAmount ||
						!netPay ||
						!tenureMonths ||
						!purpose ||
						!guarantorName ||
						!guarantorPhone ||
						!guarantorRelationship ||
						!guarantorAddress ||
						!isQualified
					}
        >
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
						</>
					) : (
						<>
							Submit Application
							<ArrowRight className="ml-2 h-4 w-4" />
						</>
					)}
        </Button>
      </div>
    </form>
  )
}
