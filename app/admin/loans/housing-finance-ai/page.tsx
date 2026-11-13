"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	getHousingFinanceArrears,
	getMemberHousingBrief,
	getEarlyArrearsWarnings,
	getPaymentAnomalies,
	reviewHousingFile,
	draftHousingDocument,
	triageMaintenance,
	type HousingFinanceArrears,
	type HousingGuidance,
	type MaintenanceTriage,
	type EarlyWarning,
	type FileReview,
} from "@/lib/api/client"

function money(value: number) {
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0)
}

export default function HousingFinanceAiPage() {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [arrears, setArrears] = useState<HousingFinanceArrears | null>(null)
	const [memberId, setMemberId] = useState("")
	const [brief, setBrief] = useState<HousingGuidance | null>(null)
	const [briefName, setBriefName] = useState("")
	const [briefError, setBriefError] = useState<string | null>(null)
	const [description, setDescription] = useState("")
	const [triage, setTriage] = useState<MaintenanceTriage | null>(null)
	const [warnings, setWarnings] = useState<EarlyWarning[]>([])
	const [anomalies, setAnomalies] = useState<Array<{ member_name: string; message: string }>>([])
	const [reviewAmount, setReviewAmount] = useState("")
	const [reviewInstallment, setReviewInstallment] = useState("")
	const [fileReview, setFileReview] = useState<FileReview | null>(null)
	const [draftKind, setDraftKind] = useState<"property_description" | "allocation_letter" | "demand_notice">("demand_notice")
	const [draftMember, setDraftMember] = useState("")
	const [draftProperty, setDraftProperty] = useState("")
	const [draftAmount, setDraftAmount] = useState("")
	const [draftBody, setDraftBody] = useState("")
	const [busy, setBusy] = useState<"brief" | "triage" | "review" | "draft" | null>(null)

	useEffect(() => {
		Promise.allSettled([getHousingFinanceArrears(), getEarlyArrearsWarnings(), getPaymentAnomalies()])
			.then(([arrearsResult, warningResult, anomalyResult]) => {
				if (arrearsResult.status === "fulfilled") setArrears(arrearsResult.value.data)
				else setError("Unable to load arrears drafts")
				if (warningResult.status === "fulfilled") setWarnings(warningResult.value.data.items)
				if (anomalyResult.status === "fulfilled") setAnomalies(anomalyResult.value.data.notes)
			})
			.finally(() => setLoading(false))
	}, [])

	async function loadBrief() {
		setBusy("brief")
		setBriefError(null)
		setBrief(null)
		try {
			const response = await getMemberHousingBrief(memberId.trim())
			setBrief(response.data.guidance)
			setBriefName(response.data.member.name || response.data.member.member_number || "Member")
		} catch (err: unknown) {
			setBriefError(err instanceof Error ? err.message : "Member brief failed")
		} finally {
			setBusy(null)
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

	async function runFileReview() {
		setBusy("review")
		setFileReview(null)
		try {
			const response = await reviewHousingFile({
				member_id: memberId.trim(),
				requested_amount: Number(reviewAmount),
				proposed_installment: reviewInstallment.trim() === "" ? undefined : Number(reviewInstallment),
			})
			setFileReview(response.data)
		} catch (err: unknown) {
			setBriefError(err instanceof Error ? err.message : "File review failed")
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
				member_name: draftMember,
				property_title: draftProperty,
				amount: draftAmount.trim() === "" ? undefined : Number(draftAmount),
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
				<p className="text-muted-foreground">Drafts for affordability, arrears follow-up, and maintenance triage. Staff still approve every decision.</p>
			</div>
			<Alert>
				<AlertDescription>Nothing here changes a loan, mortgage, letter, or work order until a staff member acts on it.</AlertDescription>
			</Alert>

			<Card>
				<CardHeader>
					<CardTitle>Loan or mortgage file note</CardTitle>
					<CardDescription>Uses the member id in the affordability section below. The stance is a draft only.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid gap-3 md:grid-cols-2">
						<div>
							<Label htmlFor="requested-amount">Requested amount</Label>
							<Input id="requested-amount" type="number" min="1" value={reviewAmount} onChange={(event) => setReviewAmount(event.target.value)} />
						</div>
						<div>
							<Label htmlFor="proposed-installment">Proposed monthly installment</Label>
							<Input id="proposed-installment" type="number" min="0" value={reviewInstallment} onChange={(event) => setReviewInstallment(event.target.value)} />
						</div>
					</div>
					<Button type="button" disabled={busy === "review" || memberId.trim() === "" || Number(reviewAmount) <= 0} onClick={runFileReview}>
						{busy === "review" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Draft file note"}
					</Button>
					{fileReview ? (
						<div className="space-y-2 text-sm">
							<p className="font-medium capitalize">{fileReview.stance}</p>
							<p>{fileReview.note}</p>
							{fileReview.reasons.map((reason) => (
								<p key={reason}>{reason}</p>
							))}
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
					<CardDescription>Copy the draft into the property or letter. Nothing is saved or sent from here.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid gap-3 md:grid-cols-2">
						<div>
							<Label htmlFor="draft-kind">Draft</Label>
							<select id="draft-kind" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={draftKind} onChange={(event) => setDraftKind(event.target.value as typeof draftKind)}>
								<option value="property_description">Property description</option>
								<option value="allocation_letter">Allocation letter</option>
								<option value="demand_notice">Demand notice</option>
							</select>
						</div>
						<div>
							<Label htmlFor="draft-member">Member name</Label>
							<Input id="draft-member" value={draftMember} onChange={(event) => setDraftMember(event.target.value)} />
						</div>
						<div>
							<Label htmlFor="draft-property">Property</Label>
							<Input id="draft-property" value={draftProperty} onChange={(event) => setDraftProperty(event.target.value)} />
						</div>
						<div>
							<Label htmlFor="draft-amount">Amount</Label>
							<Input id="draft-amount" type="number" min="0" value={draftAmount} onChange={(event) => setDraftAmount(event.target.value)} />
						</div>
					</div>
					<Button type="button" disabled={busy === "draft"} onClick={runDraft}>
						{busy === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Write draft"}
					</Button>
					{draftBody ? <p className="whitespace-pre-wrap text-sm">{draftBody}</p> : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Member affordability brief</CardTitle>
					<CardDescription>Paste a member id to see contribution capacity, profile gaps, and payment-plan fit.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Label htmlFor="member-id">Member ID</Label>
					<div className="flex gap-2">
						<Input id="member-id" value={memberId} onChange={(event) => setMemberId(event.target.value)} placeholder="Member UUID" />
						<Button type="button" disabled={busy === "brief" || memberId.trim() === ""} onClick={loadBrief}>
							{busy === "brief" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Review"}
						</Button>
					</div>
					{briefError ? <p className="text-sm text-destructive">{briefError}</p> : null}
					{brief ? (
						<div className="space-y-2 text-sm">
							<p className="font-medium">{briefName}</p>
							<p>{brief.summary}</p>
							<p>Suggested repayment: {money(brief.affordability.suggested_monthly_repayment)}</p>
							{brief.next_steps.map((step) => (
								<p key={step}>{step}</p>
							))}
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
					{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
					{error ? <p className="text-sm text-destructive">{error}</p> : null}
					{arrears && arrears.drafts.length === 0 ? <p className="text-sm text-muted-foreground">No overdue loans were found.</p> : null}
					{arrears?.drafts.map((draft) => (
						<div key={draft.loan_id} className="rounded-md border p-3 text-sm">
							<p className="font-medium">
								{draft.member_name} · {money(draft.amount)} · {draft.status}
							</p>
							<p className="mt-2 text-muted-foreground">{draft.draft}</p>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Maintenance triage</CardTitle>
					<CardDescription>Suggest a trade and priority. Assign the request yourself after you agree.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the maintenance issue" rows={4} />
					<Button type="button" disabled={busy === "triage" || description.trim().length < 8} onClick={runTriage}>
						{busy === "triage" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Suggest priority"}
					</Button>
					{triage ? (
						<p className="text-sm">
							{triage.issue_type} · {triage.priority} · {triage.summary}
						</p>
					) : null}
				</CardContent>
			</Card>
		</div>
	)
}
