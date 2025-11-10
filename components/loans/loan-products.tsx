"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, FileText } from "lucide-react"
import type { LoanProduct } from "@/lib/api/loans"

type LoanProductsProps = {
	products: LoanProduct[]
	isLoading?: boolean
	error?: string | null
	onSelectProduct?: (product: LoanProduct) => void
}

const currency = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 0,
})

export function LoanProducts({ products, isLoading, error, onSelectProduct }: LoanProductsProps) {
	const activeProducts = useMemo(() => products.filter((product) => product.is_active), [products])

	if (isLoading) {
		return (
			<div className="grid gap-6 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, index) => (
					<Card key={index} className="p-6 space-y-4">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-full" />
						<div className="grid grid-cols-2 gap-4">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
						</div>
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-11 w-full" />
					</Card>
				))}
			</div>
		)
	}

	if (error) {
		return (
			<Card className="border-red-200 bg-red-50 p-6">
				<div className="flex items-center gap-3">
					<FileText className="h-5 w-5 text-red-600" />
					<div>
						<p className="font-medium text-red-700">Unable to load loan plans</p>
						<p className="text-sm text-red-600">{error}</p>
					</div>
				</div>
			</Card>
		)
	}

	if (activeProducts.length === 0) {
		return (
			<Card className="border-dashed p-8 text-center">
				<h3 className="text-lg font-semibold">No loan plans available</h3>
				<p className="mt-2 text-sm text-muted-foreground">
					Loan products will appear here once they are published for members.
				</p>
			</Card>
		)
	}

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{activeProducts.map((product) => {
				const minAmount = product.min_amount ? currency.format(product.min_amount) : "—"
				const maxAmount = product.max_amount ? currency.format(product.max_amount) : "No cap"
				const interestRate = `${product.interest_rate ?? 0}% ${
					product.interest_type === "compound" ? "(compound)" : "p.a."
				}`
				const tenureRange =
					product.min_tenure_months && product.max_tenure_months
						? `${product.min_tenure_months} - ${product.max_tenure_months} months`
						: product.max_tenure_months
							? `Up to ${product.max_tenure_months} months`
							: "Flexible"
				const processingFee =
					product.processing_fee_percentage !== undefined && product.processing_fee_percentage !== null
						? `${product.processing_fee_percentage}% processing fee`
						: null

				const handleApplyClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
					if (onSelectProduct) {
						event.preventDefault()
						onSelectProduct(product)
					}
				}

  return (
					<Card key={product.id} className="flex h-full flex-col p-6">
						<div className="flex-1 space-y-4">
            <div>
								<div className="mb-2 flex items-start justify-between">
									<h3 className="text-xl font-semibold leading-tight">{product.name}</h3>
									<Badge variant="outline">{interestRate}</Badge>
              </div>
								{product.description ? (
              <p className="text-sm text-muted-foreground">{product.description}</p>
								) : null}
            </div>

							<div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/40 p-4 text-sm">
								<div>
									<p className="text-xs uppercase tracking-wide text-muted-foreground">Minimum Amount</p>
									<p className="font-semibold">{minAmount}</p>
								</div>
              <div>
									<p className="text-xs uppercase tracking-wide text-muted-foreground">Maximum Amount</p>
									<p className="font-semibold">{maxAmount}</p>
              </div>
              <div>
									<p className="text-xs uppercase tracking-wide text-muted-foreground">Tenure</p>
									<p className="font-semibold">{tenureRange}</p>
								</div>
								{processingFee ? (
									<div>
										<p className="text-xs uppercase tracking-wide text-muted-foreground">Processing Fee</p>
										<p className="font-semibold">{processingFee}</p>
              </div>
								) : null}
            </div>

							{product.eligibility_criteria?.length ? (
            <div>
									<p className="text-sm font-medium">Eligibility Criteria</p>
									<ul className="mt-2 space-y-2 text-sm text-muted-foreground">
										{product.eligibility_criteria.map((criteria, index) => (
											<li key={`${product.id}-eligibility-${index}`} className="flex items-start gap-2">
												<CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
												<span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
							) : null}

							{product.required_documents?.length ? (
            <div>
									<p className="text-sm font-medium">Required Documents</p>
									<ul className="mt-2 space-y-2 text-sm text-muted-foreground">
										{product.required_documents.map((doc, index) => (
											<li key={`${product.id}-document-${index}`} className="flex items-start gap-2">
												<FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
												<span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
							) : null}
          </div>

						<Link
							href={`/dashboard/loans/apply?product=${product.id}`}
							className="mt-6"
							onClick={handleApplyClick}
						>
            <Button className="w-full">Apply Now</Button>
          </Link>
        </Card>
				)
			})}
    </div>
  )
}
