"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Sparkles } from "lucide-react"
import { toast as sonnerToast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getHousingLeaderBrief, recordHousingDecision, type HousingLeaderBrief, type HousingLeaderItem } from "@/lib/api/client"

function money(value?: number) {
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0)
}

function sourceLabel(source?: string) {
	return source === "openai" ? "AI wrote this from the records" : "Read from the cooperative records"
}

function Empty({ text }: { text: string }) {
	return <p className="text-sm text-muted-foreground">{text}</p>
}

function DecisionButtons({ busy, onAccept, onReject }: { busy: boolean; onAccept: () => void; onReject: () => void }) {
	return (
		<div className="flex shrink-0 gap-2">
			<Button type="button" size="sm" variant="outline" disabled={busy} onClick={onAccept}>Accept</Button>
			<Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onReject}>Set aside</Button>
		</div>
	)
}

function ItemLine({ item }: { item: HousingLeaderItem }) {
	if (item.times) {
		return (
			<p className="text-sm">
				{item.property}: reported {item.times} times in the last year
				{item.latest_issue ? ` · latest ${item.latest_issue}` : ""}
			</p>
		)
	}
	if (item.amount) {
		return (
			<p className="text-sm">
				{item.member_name}: {money(item.amount)} · {item.status}
				{item.due_date ? ` · due ${item.due_date}` : ""}
			</p>
		)
	}
	return (
		<p className="text-sm">
			{item.member_name}
			{item.property ? ` · ${item.property}` : ""}
			{item.status ? ` · ${item.status}` : ""}
		</p>
	)
}

export default function HousingAiPage() {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [brief, setBrief] = useState<HousingLeaderBrief | null>(null)
	const [savingKey, setSavingKey] = useState<string | null>(null)

	function load() {
		setLoading(true)
		getHousingLeaderBrief()
			.then((response) => setBrief(response.data))
			.catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to prepare the brief"))
			.finally(() => setLoading(false))
	}

	useEffect(() => {
		load()
	}, [])

	async function decide(subject: "behind" | "ready" | "repair" | "exit", action: "accepted" | "rejected", item: HousingLeaderItem, key: string) {
		const summary = [item.member_name, item.property, item.status, item.amount ? money(item.amount) : "", item.times ? `${item.times} reports` : "", item.latest_issue]
			.filter(Boolean)
			.join(" · ")
		setSavingKey(key)
		try {
			const response = await recordHousingDecision({
				action,
				subject,
				summary: summary || subject,
				member_id: item.member_id || undefined,
			})
			sonnerToast.success(response.message || response.data.message)
			load()
		} catch (err: unknown) {
			sonnerToast.error(err instanceof Error ? err.message : "The choice was not saved")
		} finally {
			setSavingKey(null)
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Housing AI</h1>
				<p className="text-muted-foreground">A brief from the cooperative records. Nothing here approves a loan, allocation, repair, or exit.</p>
			</div>

			<Card className="border-primary/40">
				<CardHeader>
					<div className="flex items-center justify-between gap-3">
						<CardTitle className="flex items-center gap-2">
							<Sparkles className="h-5 w-5" />
							Leader brief
						</CardTitle>
						{brief ? <Badge variant="secondary">{sourceLabel(brief.source)}</Badge> : null}
					</div>
					<CardDescription>Prepared when this page opens.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					{loading ? (
						<p className="flex items-center gap-2 text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							Reading loans, housing requests, repairs, and exits…
						</p>
					) : null}
					{error ? <p className="text-destructive">{error}</p> : null}
					{brief ? <p>{brief.briefing}</p> : null}
					<p>
						<Link href="/admin/loans/housing-finance-ai" className="text-primary underline">
							Open Housing Finance AI
						</Link>{" "}
						when you want a member file, a letter, or a maintenance note.
					</p>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Behind on a loan</CardTitle>
						<CardDescription>Overdue or past the due date.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{brief && brief.behind.length === 0 ? <Empty text="No overdue loan needs a follow-up." /> : null}
						{brief?.behind.map((item, index) => (
							<div key={`behind-${index}`} className="flex items-start justify-between gap-3">
								<ItemLine item={item} />
								<DecisionButtons busy={savingKey === `behind-${index}`} onAccept={() => void decide("behind", "accepted", item, `behind-${index}`)} onReject={() => void decide("behind", "rejected", item, `behind-${index}`)} />
							</div>
						))}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Waiting for a house</CardTitle>
						<CardDescription>Allocation and interest requests still open.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{brief && brief.ready.length === 0 ? <Empty text="No open housing request was found." /> : null}
						{brief?.ready.map((item, index) => (
							<div key={`ready-${index}`} className="flex items-start justify-between gap-3">
								<ItemLine item={item} />
								<DecisionButtons busy={savingKey === `ready-${index}`} onAccept={() => void decide("ready", "accepted", item, `ready-${index}`)} onReject={() => void decide("ready", "rejected", item, `ready-${index}`)} />
							</div>
						))}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Repeated faults</CardTitle>
						<CardDescription>Properties reported more than once in the last year.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{brief && brief.repairs.length === 0 ? <Empty text="No property has a repeated fault in the last year." /> : null}
						{brief?.repairs.map((item, index) => (
							<div key={`repair-${index}`} className="flex items-start justify-between gap-3">
								<ItemLine item={item} />
								<DecisionButtons busy={savingKey === `repair-${index}`} onAccept={() => void decide("repair", "accepted", item, `repair-${index}`)} onReject={() => void decide("repair", "rejected", item, `repair-${index}`)} />
							</div>
						))}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Exits waiting</CardTitle>
						<CardDescription>Withdrawal requests that are not finished.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{brief && brief.exits.length === 0 ? <Empty text="No exit request is waiting." /> : null}
						{brief?.exits.map((item, index) => (
							<div key={`exit-${index}`} className="flex items-start justify-between gap-3">
								<ItemLine item={item} />
								<DecisionButtons busy={savingKey === `exit-${index}`} onAccept={() => void decide("exit", "accepted", item, `exit-${index}`)} onReject={() => void decide("exit", "rejected", item, `exit-${index}`)} />
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			{brief && (brief.decisions?.length ?? 0) > 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>Earlier staff choices</CardTitle>
						<CardDescription>The next brief uses these. They do not change a loan, allocation, repair, or exit.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						{brief.decisions?.map((decision, index) => (
							<p key={`${decision.at}-${index}`}>
								{decision.action === "accepted" ? "Accepted" : "Set aside"} · {decision.subject} · {decision.summary}
							</p>
						))}
					</CardContent>
				</Card>
			) : null}

			<Alert>
				<AlertDescription>Staff still approve every loan, allocation, repair, and exit. This page only prepares the brief.</AlertDescription>
			</Alert>
		</div>
	)
}
