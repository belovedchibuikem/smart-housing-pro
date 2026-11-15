"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { askHousingAssistant, type HousingMemberReply } from "@/lib/api/client"

const PROMPTS = [
	"What is my balance?",
	"What is my loan status?",
	"What documents am I missing?",
]

function money(value: number) {
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0)
}

function sourceLabel(source?: string) {
	return source === "openai" ? "AI wrote this from your records" : "Read from your records"
}

export default function MemberHousingAiPage() {
	const [message, setMessage] = useState("")
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [turns, setTurns] = useState<Array<{ question: string; reply: HousingMemberReply }>>([])

	async function ask(text: string) {
		const question = text.trim()
		if (question.length < 2) return
		setBusy(true)
		setError(null)
		try {
			const response = await askHousingAssistant(question)
			setTurns((current) => [...current, { question, reply: response.data }])
			setMessage("")
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "The assistant could not answer")
		} finally {
			setBusy(false)
		}
	}

	const latest = turns.length > 0 ? turns[turns.length - 1].reply : undefined

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Housing AI</h1>
				<p className="text-muted-foreground">Ask about your own balance, loan, contributions, and documents. This chat cannot move money or approve a request.</p>
			</div>

			<Alert>
				<AlertDescription>Answers come from your file only. A staff member still decides loans, allocations, and withdrawals.</AlertDescription>
			</Alert>

			<Card>
				<CardHeader>
					<CardTitle>Ask</CardTitle>
					<CardDescription>Choose a prompt or write your own question.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex flex-wrap gap-2">
						{PROMPTS.map((prompt) => (
							<Button key={prompt} type="button" variant="outline" size="sm" disabled={busy} onClick={() => void ask(prompt)}>
								{prompt}
							</Button>
						))}
					</div>
					<Textarea
						value={message}
						onChange={(event) => setMessage(event.target.value)}
						placeholder="Ask about your housing file"
						rows={3}
					/>
					<Button type="button" disabled={busy || message.trim().length < 2} onClick={() => void ask(message)}>
						{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
					</Button>
					{error ? <p className="text-sm text-destructive">{error}</p> : null}
				</CardContent>
			</Card>

			{turns.map((turn, index) => (
				<Card key={`${turn.question}-${index}`}>
					<CardHeader>
						<div className="flex items-center justify-between gap-3">
							<CardTitle className="text-base">{turn.question}</CardTitle>
							<Badge variant="secondary">{sourceLabel(turn.reply.source)}</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap text-sm">{turn.reply.answer}</p>
					</CardContent>
				</Card>
			))}

			{latest ? (
				<Card>
					<CardHeader>
						<CardTitle>From your file</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<p>Monthly contribution: {money(latest.position.monthly_contribution)}</p>
						<p>Savings: {money(latest.position.available_savings)}</p>
						<p>Wallet: {money(latest.position.wallet_balance)}</p>
						<p>Open loan balance: {money(latest.position.open_loan_balance)}</p>
						{latest.position.gaps.length === 0 ? <p>No missing profile items were found.</p> : null}
						{latest.position.gaps.map((gap) => (
							<p key={gap}>{gap}</p>
						))}
						{latest.staff_decisions && latest.staff_decisions.length > 0 ? (
							<div className="pt-2">
								<p className="font-medium">Earlier staff notes on your file</p>
								{latest.staff_decisions.map((decision, index) => (
									<p key={`${decision.at}-${index}`}>{decision.action === "accepted" ? "Accepted" : "Set aside"}: {decision.summary}</p>
								))}
							</div>
						) : null}
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}
