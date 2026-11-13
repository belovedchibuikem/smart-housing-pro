"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api/client"

type QueueItem = {
	id: string
	loan_number: string | null
	member_name: string
	amount: number
	financial_status: string
	administration_status: string
}

type Workspace = {
	enabled: boolean
	message?: string
	cards?: Record<string, number>
	queues?: { officer: QueueItem[]; super_admin: QueueItem[]; accounts: QueueItem[] }
	irregularities?: Array<{
		loan_id: string
		loan_number: string | null
		member_name: string
		expected: number
		actual: number
		shortfall: number
		kind: string
		severity: string
	}>
}

const actions = [
	["start_profiling", "Start profiling"],
	["complete_profiling", "Profiling complete"],
	["submit_for_review", "Send to review"],
	["return_for_correction", "Return for correction"],
	["resubmit", "Resubmit"],
	["send_to_accounts", "Send to accounts"],
] as const

function money(value: number) {
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0)
}

export default function LoanAdministrationPage() {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState<Workspace | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loanId, setLoanId] = useState("")
	const [action, setAction] = useState<(typeof actions)[number][0]>("submit_for_review")
	const [comment, setComment] = useState("")
	const [busy, setBusy] = useState(false)
	const [notice, setNotice] = useState<string | null>(null)

	async function load() {
		setLoading(true)
		setError(null)
		try {
			const response = await apiFetch<{ success: boolean; data: Workspace }>("/admin/loans/administration")
			setData(response.data)
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Unable to load loan administration")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void load()
	}, [])

	async function move() {
		setBusy(true)
		setNotice(null)
		try {
			const response = await apiFetch<{ success: boolean; message: string }>("/admin/loans/administration/transition", {
				method: "POST",
				body: { loan_id: loanId.trim(), action, comment },
			})
			setNotice(response.message)
			setComment("")
			await load()
		} catch (err: unknown) {
			setNotice(err instanceof Error ? err.message : "Workflow update failed")
		} finally {
			setBusy(false)
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-[240px] items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		)
	}

	if (error) {
		return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
	}

	if (!data?.enabled) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Loan administration is off</CardTitle>
					<CardDescription>{data?.message}</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild>
						<Link href="/admin/settings">Open settings</Link>
					</Button>
				</CardContent>
			</Card>
		)
	}

	const cards = data.cards || {}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Loan administration</h1>
				<p className="text-muted-foreground">Officer workflow for this cooperative. Approving, disbursing, and posting repayments still uses the existing loan screens.</p>
			</div>
			<div className="grid gap-3 md:grid-cols-4">
				{Object.entries(cards).map(([key, value]) => (
					<Card key={key}>
						<CardHeader className="pb-2">
							<CardDescription>{key.replaceAll("_", " ")}</CardDescription>
							<CardTitle>{value}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Move an application</CardTitle>
					<CardDescription>This updates the officer queue only. It does not change the loan balance or post a repayment.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid gap-3 md:grid-cols-2">
						<div>
							<Label htmlFor="loan-id">Loan ID</Label>
							<Input id="loan-id" value={loanId} onChange={(event) => setLoanId(event.target.value)} />
						</div>
						<div>
							<Label htmlFor="workflow-action">Action</Label>
							<select id="workflow-action" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={action} onChange={(event) => setAction(event.target.value as typeof action)}>
								{actions.map(([value, label]) => (
									<option key={value} value={value}>{label}</option>
								))}
							</select>
						</div>
					</div>
					<Input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Comment for the file" />
					<Button type="button" disabled={busy || loanId.trim() === ""} onClick={() => void move()}>
						{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update workflow"}
					</Button>
					{notice ? <p className="text-sm">{notice}</p> : null}
				</CardContent>
			</Card>

			<div className="grid gap-4 lg:grid-cols-3">
				<Queue title="Officer queue" items={data.queues?.officer || []} onPick={setLoanId} />
				<Queue title="Review queue" items={data.queues?.super_admin || []} onPick={setLoanId} />
				<Queue title="Accounts queue" items={data.queues?.accounts || []} onPick={setLoanId} />
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Deduction watch</CardTitle>
					<CardDescription>Missing, short, repeated, and overpaid deductions from posted repayments. Nothing is posted from this list.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					{(data.irregularities || []).length === 0 ? <p className="text-muted-foreground">No irregularity matched the current thresholds.</p> : null}
					{(data.irregularities || []).map((row) => (
						<p key={row.loan_id}>
							{row.member_name} · {row.loan_number || row.loan_id} · expected {money(row.expected)} · actual {money(row.actual)} · {row.kind} · {row.severity}
						</p>
					))}
					<div className="flex flex-wrap gap-3 pt-2">
						<Link className="text-primary underline" href="/admin/bulk-upload/loans">Bulk applications</Link>
						<Link className="text-primary underline" href="/admin/bulk-upload/loan-repayments">Bulk repayments</Link>
						<Link className="text-primary underline" href="/admin/loan-products">Loan products</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function Queue({ title, items, onPick }: { title: string; items: QueueItem[]; onPick: (id: string) => void }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 text-sm">
				{items.length === 0 ? <p className="text-muted-foreground">None in this queue.</p> : null}
				{items.map((item) => (
					<button key={item.id} type="button" className="block text-left" onClick={() => onPick(item.id)}>
						{item.member_name} · {money(item.amount)} · {item.administration_status}
					</button>
				))}
			</CardContent>
		</Card>
	)
}
