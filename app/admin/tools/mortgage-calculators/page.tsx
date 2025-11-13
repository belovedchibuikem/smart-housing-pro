'use client'

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(value)

const formatNumber = (value: number) =>
	new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

type AmortizationRow = {
	period: number
	payment: number
	principal: number
	interest: number
	balance: number
}

const frequencies = [
	{ value: "monthly", label: "Monthly", periodsPerYear: 12 },
	{ value: "quarterly", label: "Quarterly", periodsPerYear: 4 },
	{ value: "biannually", label: "Biannually", periodsPerYear: 2 },
	{ value: "annually", label: "Annually", periodsPerYear: 1 },
];

export default function MortgageCalculatorsPage() {
	const [loanAmount, setLoanAmount] = useState("25000000")
	const [interestRate, setInterestRate] = useState("12")
	const [tenureYears, setTenureYears] = useState("5")
	const [frequency, setFrequency] = useState("monthly")

	const [propertyPrice, setPropertyPrice] = useState("30000000")
	const [downPayment, setDownPayment] = useState("5000000")
	const [mortgageInterest, setMortgageInterest] = useState("11.5")
	const [mortgageTenure, setMortgageTenure] = useState("10")

	const currentFrequency = frequencies.find((item) => item.value === frequency) ?? frequencies[0]

	const amortizationResults = calculateAmortization({
		principal: Number(loanAmount) || 0,
		annualRate: Number(interestRate) || 0,
		tenureYears: Number(tenureYears) || 0,
		periodsPerYear: currentFrequency.periodsPerYear,
	})

	const mortgageResults = calculateAmortization({
		principal: Math.max(Number(propertyPrice) - Number(downPayment), 0) || 0,
		annualRate: Number(mortgageInterest) || 0,
		tenureYears: Number(mortgageTenure) || 0,
		periodsPerYear: 12,
	})

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Mortgage & Amortization Calculators</h1>
				<p className="text-muted-foreground">
					Fast tools for tenant loan officers and admins to model repayment schedules across different funding options.
				</p>
			</div>

			<Tabs defaultValue="amortization" className="space-y-6">
				<TabsList>
					<TabsTrigger value="amortization">Loan Amortization</TabsTrigger>
					<TabsTrigger value="mortgage">Mortgage Scenario</TabsTrigger>
				</TabsList>

				<TabsContent value="amortization" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Amortization Calculator</CardTitle>
							<CardDescription>
								Use this to compute equal repayment schedules (EMI) for loans or internal mortgage plans.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="loan-amount">Loan Amount</Label>
									<Input
										id="loan-amount"
										type="number"
										min="0"
										value={loanAmount}
										onChange={(event) => setLoanAmount(event.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="interest-rate">Interest Rate (% per annum)</Label>
									<Input
										id="interest-rate"
										type="number"
										step="0.01"
										min="0"
										value={interestRate}
										onChange={(event) => setInterestRate(event.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="tenure-years">Tenure (years)</Label>
									<Input
										id="tenure-years"
										type="number"
										min="1"
										value={tenureYears}
										onChange={(event) => setTenureYears(event.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="frequency">Repayment Frequency</Label>
									<select
										id="frequency"
										value={frequency}
										onChange={(event) => setFrequency(event.target.value)}
										className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										{frequencies.map((item) => (
											<option key={item.value} value={item.value}>
												{item.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<SummaryTiles
								payment={amortizationResults.paymentPerPeriod}
								totalPaid={amortizationResults.totalPaid}
								totalInterest={amortizationResults.totalInterest}
								label={`${currentFrequency.label} Payment`}
							/>

							<AmortizationTable rows={amortizationResults.rows} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="mortgage" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Mortgage Funding Scenario</CardTitle>
							<CardDescription>
								Model property price, down payment, and mortgage plan to estimate member obligations.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="property-price">Property Price</Label>
									<Input
										id="property-price"
										type="number"
										min="0"
										value={propertyPrice}
										onChange={(event) => setPropertyPrice(event.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="down-payment">Down Payment</Label>
									<Input
										id="down-payment"
										type="number"
										min="0"
										value={downPayment}
										onChange={(event) => setDownPayment(event.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="mortgage-interest">Mortgage Interest Rate (% per annum)</Label>
									<Input
										id="mortgage-interest"
										type="number"
										step="0.01"
										min="0"
										value={mortgageInterest}
										onChange={(event) => setMortgageInterest(event.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="mortgage-tenure">Mortgage Tenure (years)</Label>
									<Input
										id="mortgage-tenure"
										type="number"
										min="1"
										value={mortgageTenure}
										onChange={(event) => setMortgageTenure(event.target.value)}
									/>
								</div>
							</div>

							<SummaryTiles
								payment={mortgageResults.paymentPerPeriod}
								totalPaid={mortgageResults.totalPaid}
								totalInterest={mortgageResults.totalInterest}
								label="Monthly Payment"
								additional={[
									{
										label: "Loan Amount",
										value: formatCurrency(Math.max(Number(propertyPrice) - Number(downPayment), 0)),
									},
									{
										label: "Down Payment %",
										value: `${formatNumber(
											(Math.max(Number(downPayment), 0) / (Number(propertyPrice) || 1)) * 100,
										)}%`,
									},
								]}
							/>

							<AmortizationTable rows={mortgageResults.rows} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}

function SummaryTiles({
	payment,
	totalPaid,
	totalInterest,
	label,
	additional,
}: {
	payment: number
	totalPaid: number
	totalInterest: number
	label: string
	additional?: Array<{ label: string; value: string }>
}) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<div className="rounded-lg border p-4">
				<div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
				<div className="mt-1 text-2xl font-semibold text-primary">{formatCurrency(payment)}</div>
			</div>
			<div className="rounded-lg border p-4">
				<div className="text-xs uppercase tracking-wide text-muted-foreground">Total Paid</div>
				<div className="mt-1 text-2xl font-semibold">{formatCurrency(totalPaid)}</div>
			</div>
			<div className="rounded-lg border p-4">
				<div className="text-xs uppercase tracking-wide text-muted-foreground">Total Interest</div>
				<div className="mt-1 text-2xl font-semibold text-secondary">{formatCurrency(totalInterest)}</div>
			</div>
			{additional?.map((item) => (
				<div key={item.label} className="rounded-lg border p-4">
					<div className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</div>
					<div className="mt-1 text-2xl font-semibold">{item.value}</div>
				</div>
			))}
		</div>
	)
}

function AmortizationTable({ rows }: { rows: AmortizationRow[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Amortization Schedule</CardTitle>
				<CardDescription>
					Shows the breakdown of each repayment period into principal and interest, with the remaining balance.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded-md border">
					<div className="grid grid-cols-5 gap-2 border-b bg-muted/50 p-3 text-xs font-semibold uppercase text-muted-foreground">
						<span>Period</span>
						<span>Payment</span>
						<span>Principal</span>
						<span>Interest</span>
						<span>Balance</span>
					</div>
					<div className="max-h-80 overflow-auto">
						{rows.map((row) => (
							<div key={row.period} className="grid grid-cols-5 gap-2 border-b p-3 text-xs text-muted-foreground">
								<span className="font-medium text-foreground">{row.period}</span>
								<span>{formatCurrency(row.payment)}</span>
								<span>{formatCurrency(row.principal)}</span>
								<span>{formatCurrency(row.interest)}</span>
								<span>{formatCurrency(row.balance)}</span>
							</div>
						))}
					</div>
				</div>
				<p className="text-xs text-muted-foreground">
					These values provide estimates; actual deductions may vary based on cooperative policies, fees, or rounding rules.
				</p>
			</CardContent>
		</Card>
	)
}

function calculateAmortization({
	principal,
	annualRate,
	tenureYears,
	periodsPerYear,
}: {
	principal: number
	annualRate: number
	tenureYears: number
	periodsPerYear: number
}): { paymentPerPeriod: number; totalPaid: number; totalInterest: number; rows: AmortizationRow[] } {
	if (principal <= 0 || tenureYears <= 0 || periodsPerYear <= 0) {
		return { paymentPerPeriod: 0, totalPaid: 0, totalInterest: 0, rows: [] }
	}

	const totalPeriods = Math.round(tenureYears * periodsPerYear)
	const periodicRate = annualRate > 0 ? (annualRate / 100) / periodsPerYear : 0

	let paymentPerPeriod = 0
	if (periodicRate > 0) {
		paymentPerPeriod =
			principal * (periodicRate * Math.pow(1 + periodicRate, totalPeriods)) /
			(Math.pow(1 + periodicRate, totalPeriods) - 1)
	} else {
		paymentPerPeriod = principal / totalPeriods
	}

	const rows: AmortizationRow[] = []
	let balance = principal
	let totalPaid = 0
	let totalInterest = 0

	for (let period = 1; period <= totalPeriods; period += 1) {
		const interestPortion = periodicRate > 0 ? balance * periodicRate : 0
		let principalPortion = paymentPerPeriod - interestPortion
		let paymentAmount = paymentPerPeriod

		if (period === totalPeriods) {
			principalPortion = balance
			paymentAmount = principalPortion + interestPortion
		}

		balance = Math.max(balance - principalPortion, 0)
		totalPaid += paymentAmount
		totalInterest += interestPortion

		rows.push({
			period,
			payment: paymentAmount,
			principal: principalPortion,
			interest: interestPortion,
			balance,
		})
	}

	return {
		paymentPerPeriod,
		totalPaid,
		totalInterest,
		rows,
	}
}

