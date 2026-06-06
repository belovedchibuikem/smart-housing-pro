"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

const currencyFormatter = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	minimumFractionDigits: 0,
})

export default function InvestmentSuccessPage() {
	const searchParams = useSearchParams()
	const investmentId = searchParams.get("investment_id") || "—"
	const planName = searchParams.get("plan_name") || "Investment plan"
	const amount = searchParams.get("amount")
	const status = searchParams.get("status") || "pending"
	const paymentMethod = searchParams.get("payment_method") || "—"

	const formattedAmount = amount ? currencyFormatter.format(Number(amount)) : "—"
	const statusLabel = status === "active" ? "Active" : status === "pending" ? "Pending approval" : status

	return (
		<div className="max-w-2xl mx-auto py-12">
			<Card className="p-8 text-center space-y-6">
				<div className="flex justify-center">
					<div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
						<CheckCircle2 className="h-16 w-16 text-green-600" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Investment submitted</h1>
					<p className="text-muted-foreground text-lg">
						{status === "active"
							? "Your investment is now active."
							: "Your investment has been recorded and is awaiting payment confirmation."}
					</p>
				</div>

				<div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
					<div className="flex justify-between gap-4">
						<span className="text-muted-foreground">Investment ID</span>
						<span className="font-mono font-semibold text-sm">{investmentId}</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="text-muted-foreground">Investment plan</span>
						<span className="font-semibold text-right">{planName}</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="text-muted-foreground">Date & time</span>
						<span className="font-semibold">{new Date().toLocaleString()}</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="text-muted-foreground">Amount</span>
						<span className="font-bold text-xl">{formattedAmount}</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="text-muted-foreground">Payment method</span>
						<span className="font-semibold capitalize">{paymentMethod.replace(/_/g, " ")}</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="text-muted-foreground">Status</span>
						<span className={`font-semibold ${status === "active" ? "text-green-600" : "text-amber-600"}`}>
							{statusLabel}
						</span>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 pt-4">
					<Link href="/dashboard/investments" className="flex-1">
						<Button className="w-full">
							View my investments
							<ArrowRight className="h-4 w-4 ml-2" />
						</Button>
					</Link>
					<Link href="/dashboard/investment-plans" className="flex-1">
						<Button variant="outline" className="w-full bg-transparent">
							Browse more plans
						</Button>
					</Link>
				</div>
			</Card>
		</div>
	)
}
