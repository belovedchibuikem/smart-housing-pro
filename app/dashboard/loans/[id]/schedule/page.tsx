"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchLoanRepaymentSchedule } from "@/lib/api/loans"
import type { LoanRepaymentScheduleEntry, LoanRepaymentScheduleResponse } from "@/lib/api/loans"

const currency = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 0,
})

const formatDate = (value: string) =>
	new Date(value).toLocaleDateString("en-NG", {
		month: "short",
		day: "numeric",
		year: "numeric",
	})

export default function LoanSchedulePage() {
	const params = useParams<{ id: string }>()
	const loanId = params?.id ?? ""

	const [scheduleResponse, setScheduleResponse] = useState<LoanRepaymentScheduleResponse | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let mounted = true
		const loadSchedule = async () => {
			try {
				setIsLoading(true)
				setError(null)
				const response = await fetchLoanRepaymentSchedule(loanId)
				if (mounted) {
					setScheduleResponse(response)
				}
			} catch (err: any) {
				if (mounted) {
					console.error("Failed to load repayment schedule", err)
					setError(err?.message ?? "Unable to load repayment schedule.")
				}
			} finally {
				if (mounted) {
					setIsLoading(false)
				}
			}
		}

		if (loanId) {
			loadSchedule()
		}

		return () => {
			mounted = false
		}
	}, [loanId])

	const schedule: LoanRepaymentScheduleEntry[] = scheduleResponse?.schedule ?? []
	const summary = scheduleResponse?.repayment_summary
	const loan = scheduleResponse?.loan

	const completedPayments = schedule.filter((entry) => entry.status === "paid" || entry.status === "completed").length

  return (
		<div className="mx-auto max-w-7xl space-y-6">
      <div>
				<Link href={`/dashboard/loans/${loanId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
            Back to Loan Details
          </Button>
        </Link>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Repayment Schedule</h1>
						<p className="text-sm text-muted-foreground">Loan ID: {loanId}</p>
          </div>
					<Button variant="outline" disabled>
						<Download className="mr-2 h-4 w-4" />
						Export Schedule (coming soon)
          </Button>
        </div>
      </div>

			{isLoading ? (
				<Card className="border-dashed p-12 text-center text-sm text-muted-foreground">
					Loading repayment schedule...
				</Card>
			) : null}

			{error ? (
				<Card className="border-red-200 bg-red-50 p-6 text-sm text-red-600">
					{error}
				</Card>
			) : null}

			{!isLoading && !error && scheduleResponse ? (
				<>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-muted-foreground">Total Installments</CardTitle>
          </CardHeader>
          <CardContent>
								<div className="text-2xl font-bold">{schedule.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
								<div className="text-2xl font-bold text-green-600">{completedPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
								<div className="text-2xl font-bold text-orange-600">
									{Math.max(schedule.length - completedPayments, 0)}
								</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Payment</CardTitle>
          </CardHeader>
          <CardContent>
								<div className="text-2xl font-bold">
									{currency.format(loan?.monthly_payment ?? 0)}
								</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
							<CardDescription>
								Detailed breakdown of each repayment, including due dates and outstanding balance.
							</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
											<TableHead className="w-[80px]">#</TableHead>
                  <TableHead>Due Date</TableHead>
											<TableHead className="text-right">Amount</TableHead>
											<TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
										{schedule.map((entry) => (
											<TableRow key={entry.installment}>
												<TableCell className="font-medium">{entry.installment}</TableCell>
												<TableCell>{formatDate(entry.due_date)}</TableCell>
												<TableCell className="text-right">{currency.format(entry.amount ?? 0)}</TableCell>
												<TableCell className="text-right">
													<Badge variant={entry.status === "paid" || entry.status === "completed" ? "default" : "secondary"}>
														{entry.status ? entry.status.replace("_", " ") : "pending"}
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
				</>
			) : null}
    </div>
  )
}
