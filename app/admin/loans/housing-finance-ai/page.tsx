"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { toast as sonnerToast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	getHousingFinanceArrears,
	getHousingFinanceContext,
	getMemberHousingBrief,
	getEarlyArrearsWarnings,
	getPaymentAnomalies,
	reviewHousingFile,
	draftHousingDocument,
	triageMaintenance,
	recordHousingDecision,
	type HousingFinanceArrears,
	type HousingFinanceContext,
	type HousingGuidance,
	type MaintenanceTriage,
	type EarlyWarning,
	type FileReview,
} from "@/lib/api/client"

function money(value: number) {
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0)
}

function sourceLabel(source?: string) {
	return source === "openai" ? "AI wrote this from the records" : "Read from the cooperative records"
}

export default function HousingFinanceAiPage() {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [arrears, setArrears] = useState<HousingFinanceArrears | null>(null)
	const [context, setContext] = useState<HousingFinanceContext>({ members: [], loans: [], properties: [] })
	const [filter, setFilter] = useState("")
	const [memberId, setMemberId] = useState("")
	const [loanId, setLoanId] = useState("")
	const [propertyId, setPropertyId] = useState("")
	const [brief, setBrief] = useState<HousingGuidance | null>(null)
	const [briefName, setBriefName] = useState("")
	const [briefError, setBriefError] = useState<string | null>(null)
	const [description, setDescription] = useState("")
	const [triage, setTriage] = useState<MaintenanceTriage | null>(null)
	const [warnings, setWarnings] = useState<EarlyWarning[]>([])
	const [anomalies, setAnomalies] = useState<Array<{ member_name: string; message: string }>>([])
	const [fileReview, setFileReview] = useState<FileReview | null>(null)
	const [draftKind, setDraftKind] = useState<"property_description" | "allocation_letter" | "demand_notice">("demand_notice")
	const [draftBody, setDraftBody] = useState("")
	const [busy, setBusy] = useState<"brief" | "triage" | "review" | "draft" | null>(null)

	useEffect(() => {
		Promise.allSettled([
			getHousingFinanceArrears(),
			getEarlyArrearsWarnings(),
			getPaymentAnomalies(),
			getHousingFinanceContext(),
		])
			.then(([arrearsResult, warningResult, anomalyResult, contextResult]) => {
				if (arrearsResult.status === "fulfilled") setArrears(arrearsResult.value.data)
				else setError("Unable to load the finance review")
				if (warningResult.status === "fulfilled") setWarnings(warningResult.value.data.items)
				if (anomalyResult.status === "fulfilled") setAnomalies(anomalyResult.value.data.notes)
				if (contextResult.status === "fulfilled") setContext(contextResult.value.data)
			})
			.finally(() => setLoading(false))
	}, [])

	useEffect(() => {
		const handle = window.setTimeout(() => {
			getHousingFinanceContext(filter)
				.then((response) => setContext(response.data))
				.catch(() => undefined)
		}, 300)
		return () => window.clearTimeout(handle)
	}, [filter])

	const selectedLoan = context.loans.find((loan) => loan.id === loanId) ?? null
	const selectedProperty = context.properties.find((property) => property.id === propertyId) ?? null
	const selectedMember = context.members.find((member) => member.id === memberId) ?? null
	const memberLoans = useMemo(
		() => context.loans.filter((loan) => (memberId === "" ? true : loan.member_id === memberId)),
		[context.loans, memberId],
	)

	useEffect(() => {
		if (memberId === "") {
			setBrief(null)
			setFileReview(null)
			return
		}
		const loan = context.loans.find((item) => item.id === loanId && item.member_id === memberId)
		const amount = loan?.amount || selectedProperty?.price || 0
		const installment = loan?.monthly_payment || 0
		let cancelled = false
		setBusy("brief")
		setBriefError(null)
		Promise.allSettled([
			getMemberHousingBrief(memberId),
			amount > 0
				? reviewHousingFile({
					member_id: memberId,
					requested_amount: amount,
					proposed_installment: installment > 0 ? installment : undefined,
				})
				: Promise.resolve(null),
		]).then(([briefResult, reviewResult]) => {
			if (cancelled) return
			if (briefResult.status === "fulfilled") {
				setBrief(briefResult.value.data.guidance)
				setBriefName(briefResult.value.data.member.name || briefResult.value.data.member.member_number || "Member")
			} else {
				setBrief(null)
				setBriefError("The assistant could not read this member")
			}
			if (reviewResult.status === "fulfilled" && reviewResult.value) {
				setFileReview(reviewResult.value.data)
			} else if (amount <= 0) {
				setFileReview(null)
			}
		}).finally(() => {
			if (!cancelled) setBusy(null)
		})
		return () => {
			cancelled = true
		}
	}, [memberId, loanId, propertyId, context.loans, selectedProperty?.price])

	function chooseMember(nextId: string) {
		setMemberId(nextId)
		const stillFits = context.loans.some((loan) => loan.id === loanId && loan.member_id === nextId)
		if (!stillFits) setLoanId("")
	}

	function chooseLoan(nextId: string) {
		setLoanId(nextId)
		const loan = context.loans.find((item) => item.id === nextId)
		if (!loan) return
		setMemberId(loan.member_id)
		if (loan.property_id) setPropertyId(loan.property_id)
	}

	async function keepDecision(subject: "file_note" | "letter" | "maintenance" | "arrears", action: "accepted" | "rejected", summary: string, forMember?: string) {
		try {
			const response = await recordHousingDecision({
				action,
				subject,
				summary: summary.slice(0, 500),
				member_id: forMember || undefined,
			})
			sonnerToast.success(response.message || response.data.message)
		} catch (err: unknown) {
			sonnerToast.error(err instanceof Error ? err.message : "The choice was not saved")
		}
	}

	async function runTriage() {
		setBusy("triage")
		setTriage(null)
		try {
			const response = await triageMaintenance(description)
			setTriage(response.data)
		} catch (err: unknown) {
			setTriage({
				issue_type: "general",
				priority: "medium",
				summary: err instanceof Error ? err.message : "Unable to classify this request",
				source: "rules",
				requires_staff_review: true,
			})
		} finally {
			setBusy(null)
		}
	}

	async function runDraft() {
		setBusy("draft")
		setDraftBody("")
		try {
			const response = await draftHousingDocument({
				kind: draftKind,
				member_name: selectedMember?.name || selectedLoan?.member_name || "",
				property_title: selectedProperty ? `${selectedProperty.title}${selectedProperty.location ? `, ${selectedProperty.location}` : ""}` : "",
				amount: selectedLoan?.amount || selectedProperty?.price || undefined,
			})
			setDraftBody(response.data.body)
		} catch (err: unknown) {
			setDraftBody(err instanceof Error ? err.message : "Draft failed")
		} finally {
			setBusy(null)
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Housing finance assistant</h1>
				<p className="text-muted-foreground">The assistant reads members, loans, and properties already in this cooperative, then writes a staff note. Nothing is approved from this page.</p>
			</div>

			<Card className="border-primary/40">
				<CardHeader>
					<div className="flex items-center justify-between gap-3">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Sparkles className="h-5 w-5" />
								Assistant review
							</CardTitle>
							<CardDescription>Checked the loan book as soon as this page opened.</CardDescription>
						</div>
						{arrears ? <Badge variant="secondary">{sourceLabel(arrears.source)}</Badge> : null}
					</div>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					{loading ? (
						<p className="flex items-center gap-2 text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Reading loans, repayments, and wallet activity…
						</p>
					) : null}
					{error ? <p className="text-destructive">{error}</p> : null}
					{arrears?.briefing ? <p>{arrears.briefing}</p> : null}
					<p className="text-muted-foreground">
						{warnings.length} payment{warnings.length === 1 ? "" : "s"} due in 14 days · {anomalies.length} wallet note{anomalies.length === 1 ? "" : "s"} · {arrears?.drafts.length ?? 0} overdue draft{arrears?.drafts.length === 1 ? "" : "s"}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Choose a record</CardTitle>
					<CardDescription>Filter the lists, then pick a member, loan, or property. The assistant runs from that record.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="record-filter">Filter</Label>
						<Input id="record-filter" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Name, member number, loan number, or property" />
					</div>
					<div className="grid gap-3 md:grid-cols-3">
						<div>
							<Label htmlFor="member-select">Member</Label>
							<select id="member-select" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={memberId} onChange={(event) => chooseMember(event.target.value)}>
								<option value="">Select a member</option>
								{context.members.map((member) => (
									<option key={member.id} value={member.id}>
										{member.name}{member.member_number ? ` · ${member.member_number}` : ""}
									</option>
								))}
							</select>
						</div>
						<div>
							<Label htmlFor="loan-select">Loan</Label>
							<select id="loan-select" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={loanId} onChange={(event) => chooseLoan(event.target.value)}>
								<option value="">Select a loan</option>
								{memberLoans.map((loan) => (
									<option key={loan.id} value={loan.id}>
										{loan.loan_number || "Loan"} · {loan.member_name} · {money(loan.amount)} · {loan.status}
									</option>
								))}
							</select>
						</div>
						<div>
							<Label htmlFor="property-select">Property</Label>
							<select id="property-select" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={propertyId} onChange={(event) => setPropertyId(event.target.value)}>
								<option value="">Select a property</option>
								{context.properties.map((property) => (
									<option key={property.id} value={property.id}>
										{property.title}{property.location ? ` · ${property.location}` : ""} · {money(property.price)}
									</option>
								))}
							</select>
						</div>
					</div>
					{selectedLoan ? (
						<p className="text-sm text-muted-foreground">
							Using {money(selectedLoan.amount)} and a monthly installment of {money(selectedLoan.monthly_payment)} from the selected loan.
						</p>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-3">
						<div>
							<CardTitle>What the assistant found</CardTitle>
							<CardDescription>{briefName || "Select a member to start the review."}</CardDescription>
						</div>
						{brief ? <Badge variant="secondary">{sourceLabel(brief.source)}</Badge> : null}
					</div>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					{busy === "brief" ? (
						<p className="flex items-center gap-2 text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Reading contributions, open loans, and wallet balance…
						</p>
					) : null}
					{briefError ? <p className="text-destructive">{briefError}</p> : null}
					{brief ? (
						<div className="space-y-2">
							<p>{brief.summary}</p>
							<p>Suggested repayment: {money(brief.affordability.suggested_monthly_repayment)}</p>
							<p>Open loan balance: {money(brief.affordability.open_loan_balance)} · Savings: {money(brief.affordability.available_savings)}</p>
							{brief.next_steps.map((step) => (
								<p key={step}>{step}</p>
							))}
						</div>
					) : null}
					{fileReview ? (
						<div className="rounded-md border p-3">
							<div className="mb-2 flex items-center justify-between gap-2">
								<p className="font-medium capitalize">File note: {fileReview.stance}</p>
								<Badge variant="secondary">{sourceLabel(fileReview.source)}</Badge>
							</div>
							<p>{fileReview.note}</p>
							{fileReview.reasons.map((reason) => (
								<p key={reason} className="mt-1 text-muted-foreground">{reason}</p>
							))}
							<div className="mt-3 flex gap-2">
								<Button type="button" size="sm" variant="outline" onClick={() => void keepDecision("file_note", "accepted", fileReview.note, memberId)}>Accept note</Button>
								<Button type="button" size="sm" variant="ghost" onClick={() => void keepDecision("file_note", "rejected", fileReview.note, memberId)}>Set aside</Button>
							</div>
						</div>
					) : null}
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Coming due</CardTitle>
						<CardDescription>Installments and loans due in the next 14 days.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						{warnings.length === 0 ? <p className="text-muted-foreground">Nothing is due in the next 14 days.</p> : null}
						{warnings.map((item, index) => (
							<p key={`${item.kind}-${item.due_date}-${index}`}>
								{item.member_name}: {item.message} {item.due_date ? `(${item.due_date})` : ""}
							</p>
						))}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Payment notes</CardTitle>
						<CardDescription>Unusual wallet activity for staff to check. No account is frozen.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						{anomalies.length === 0 ? <p className="text-muted-foreground">No unusual wallet pattern in the last 45 days.</p> : null}
						{anomalies.map((note) => (
							<p key={`${note.member_name}-${note.message}`}>{note.member_name}: {note.message}</p>
						))}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Letters and listing text</CardTitle>
					<CardDescription>Uses the member, loan, and property selected above. Copy the draft. Nothing is saved or sent.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<Label htmlFor="draft-kind">Draft</Label>
						<select id="draft-kind" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={draftKind} onChange={(event) => setDraftKind(event.target.value as typeof draftKind)}>
							<option value="property_description">Property description</option>
							<option value="allocation_letter">Allocation letter</option>
							<option value="demand_notice">Demand notice</option>
						</select>
					</div>
					<Button type="button" disabled={busy === "draft" || (memberId === "" && propertyId === "")} onClick={runDraft}>
						{busy === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Write draft"}
					</Button>
					{draftBody ? (
						<div className="space-y-2">
							<p className="whitespace-pre-wrap text-sm">{draftBody}</p>
							<div className="flex gap-2">
								<Button type="button" size="sm" variant="outline" onClick={() => void keepDecision("letter", "accepted", draftBody, memberId)}>Accept draft</Button>
								<Button type="button" size="sm" variant="ghost" onClick={() => void keepDecision("letter", "rejected", draftBody, memberId)}>Set aside</Button>
							</div>
						</div>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Arrears drafts</CardTitle>
					<CardDescription>Reminders you can edit before sending. No message is sent from this page.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{arrears && arrears.drafts.length === 0 ? <p className="text-sm text-muted-foreground">No overdue loans were found.</p> : null}
					{arrears?.drafts.map((draft) => (
						<div key={draft.loan_id} className="rounded-md border p-3 text-sm">
							<button type="button" className="block w-full text-left" onClick={() => chooseLoan(draft.loan_id)}>
								<p className="font-medium">
									{draft.member_name} · {money(draft.amount)} · {draft.status}
								</p>
								<p className="mt-2 text-muted-foreground">{draft.draft}</p>
							</button>
							<div className="mt-3 flex gap-2">
								<Button type="button" size="sm" variant="outline" onClick={() => void keepDecision("arrears", "accepted", draft.draft, draft.member_id)}>Accept draft</Button>
								<Button type="button" size="sm" variant="ghost" onClick={() => void keepDecision("arrears", "rejected", draft.draft, draft.member_id)}>Set aside</Button>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Maintenance triage</CardTitle>
					<CardDescription>Describe the fault. The assistant suggests a trade and priority. Assign the request yourself after you agree.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the maintenance issue" rows={4} />
					<Button type="button" disabled={busy === "triage" || description.trim().length < 8} onClick={runTriage}>
						{busy === "triage" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suggest priority"}
					</Button>
					{triage ? (
						<div className="space-y-2">
							<p className="text-sm">
								{sourceLabel(triage.source)}. {triage.issue_type} · {triage.priority} · {triage.summary}
							</p>
							<div className="flex gap-2">
								<Button type="button" size="sm" variant="outline" onClick={() => void keepDecision("maintenance", "accepted", `${triage.issue_type} · ${triage.priority} · ${triage.summary}`)}>Accept suggestion</Button>
								<Button type="button" size="sm" variant="ghost" onClick={() => void keepDecision("maintenance", "rejected", `${triage.issue_type} · ${triage.priority} · ${triage.summary}`)}>Set aside</Button>
							</div>
						</div>
					) : null}
				</CardContent>
			</Card>

			<Alert>
				<AlertDescription>Nothing here changes a loan, mortgage, letter, or work order until a staff member acts on it.</AlertDescription>
			</Alert>
		</div>
	)
}
