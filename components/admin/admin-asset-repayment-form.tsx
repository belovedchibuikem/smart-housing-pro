"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
	getAdminHouseRepaymentOptions,
	getAdminLandRepaymentOptions,
	recordAdminHouseRepayment,
	recordAdminLandRepayment,
	type AdminAssetRepaymentOptions,
} from "@/lib/api/client"
import { Can } from "@/components/admin/can-permission"

type AssetType = "house" | "land"

export interface AdminAssetRepaymentFormProps {
	assetType: AssetType
	tenureId: string
	memberId?: string
	compact?: boolean
	onSuccess?: () => void
}

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" })

export function AdminAssetRepaymentForm({
	assetType,
	tenureId,
	compact = false,
	onSuccess,
}: AdminAssetRepaymentFormProps) {
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [options, setOptions] = useState<AdminAssetRepaymentOptions | null>(null)
	const [amount, setAmount] = useState("")
	const [source, setSource] = useState("cash")
	const [mortgageId, setMortgageId] = useState("")
	const [internalPlanId, setInternalPlanId] = useState("")
	const [paymentDate, setPaymentDate] = useState("")
	const [notes, setNotes] = useState("")

	const loadOptions = useCallback(async () => {
		setLoading(true)
		try {
			const response =
				assetType === "house"
					? await getAdminHouseRepaymentOptions(tenureId)
					: await getAdminLandRepaymentOptions(tenureId)
			if (response.success && response.data) {
				setOptions(response.data)
			}
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : "Failed to load repayment options")
			setOptions(null)
		} finally {
			setLoading(false)
		}
	}, [assetType, tenureId])

	useEffect(() => {
		if (tenureId) void loadOptions()
	}, [tenureId, loadOptions])

	const outstanding = Number(options?.outstanding ?? 0)
	const equityBalance = Number(options?.equity_wallet_balance ?? 0)
	const parsedAmount = Number(amount)
	const sourceBalance = useMemo(() => {
		if (source === "equity_wallet") return equityBalance
		if (source === "wallet") return Number(options?.wallet_balance ?? 0)
		return null
	}, [source, equityBalance, options?.wallet_balance])

	const canSubmit =
		!!options &&
		Number.isFinite(parsedAmount) &&
		parsedAmount > 0 &&
		(source !== "equity_wallet" || parsedAmount <= equityBalance + 0.009) &&
		(source !== "wallet" || parsedAmount <= Number(options?.wallet_balance ?? 0) + 0.009)

	const handleSubmit = async () => {
		if (!canSubmit) {
			toast.error("Enter a valid amount and payment method.")
			return
		}
		setSubmitting(true)
		try {
			const payload = {
				amount: parsedAmount,
				source,
				description: notes || undefined,
				notes: notes || undefined,
				payment_date: paymentDate || undefined,
				mortgage_id: source === "mortgage" && mortgageId ? mortgageId : undefined,
				internal_mortgage_plan_id: source === "mortgage" && internalPlanId ? internalPlanId : undefined,
				allow_overpay: true,
			}
			const response =
				assetType === "house"
					? await recordAdminHouseRepayment(tenureId, payload)
					: await recordAdminLandRepayment(tenureId, payload)

			if (!response.success) {
				throw new Error(response.message || "Repayment failed")
			}
			toast.success(response.message || "Repayment recorded")
			setAmount("")
			setNotes("")
			setPaymentDate("")
			setMortgageId("")
			setInternalPlanId("")
			await loadOptions()
			onSuccess?.()
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : "Failed to record repayment")
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
				<Loader2 className="h-4 w-4 animate-spin" />
				Loading repayment details…
			</div>
		)
	}

	if (!options) {
		return <p className="text-sm text-muted-foreground">Unable to load repayment options for this slot.</p>
	}

	return (
		<div className={compact ? "space-y-3" : "space-y-4"}>
			<div className="grid gap-2 sm:grid-cols-3 text-sm">
				<div className="rounded-md border px-3 py-2">
					<p className="text-muted-foreground">Outstanding</p>
					<p className="font-semibold">{currency.format(outstanding)}</p>
				</div>
				<div className="rounded-md border px-3 py-2">
					<p className="text-muted-foreground">Paid</p>
					<p className="font-semibold">{currency.format(Number(options.amount_paid ?? 0))}</p>
				</div>
				<div className="rounded-md border px-3 py-2">
					<p className="text-muted-foreground">Equity wallet</p>
					<p className="font-semibold">{currency.format(equityBalance)}</p>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Amount (₦)</Label>
					<Input
						type="number"
						min={0.01}
						step={0.01}
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder={outstanding > 0 ? outstanding.toFixed(2) : "0.00"}
					/>
					{outstanding > 0 && (
						<Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setAmount(String(outstanding))}>
							Use full outstanding ({currency.format(outstanding)})
						</Button>
					)}
				</div>
				<div className="space-y-2">
					<Label>Payment method</Label>
					<Select value={source} onValueChange={setSource}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(options.payment_methods ?? []).map((method) => (
								<SelectItem key={method.value} value={method.value}>
									{method.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{sourceBalance != null && (
						<p className="text-xs text-muted-foreground">Available: {currency.format(sourceBalance)}</p>
					)}
				</div>
			</div>

			{source === "mortgage" && assetType === "house" && (
				<div className="grid gap-4 sm:grid-cols-2">
					{(options.mortgages?.length ?? 0) > 0 && (
						<div className="space-y-2">
							<Label>Linked mortgage (optional)</Label>
							<Select value={mortgageId || "none"} onValueChange={(v) => setMortgageId(v === "none" ? "" : v)}>
								<SelectTrigger>
									<SelectValue placeholder="Select mortgage" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No linked mortgage record</SelectItem>
									{options.mortgages?.map((m) => (
										<SelectItem key={m.id} value={m.id}>
											Mortgage · {currency.format(Number(m.loan_amount ?? m.amount ?? 0))} ({m.status})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					{(options.internal_mortgage_plans?.length ?? 0) > 0 && (
						<div className="space-y-2">
							<Label>Internal mortgage plan (optional)</Label>
							<Select value={internalPlanId || "none"} onValueChange={(v) => setInternalPlanId(v === "none" ? "" : v)}>
								<SelectTrigger>
									<SelectValue placeholder="Select plan" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No internal plan record</SelectItem>
									{options.internal_mortgage_plans?.map((p) => (
										<SelectItem key={p.id} value={p.id}>
											Internal plan · {currency.format(Number(p.principal ?? p.principal_amount ?? 0))}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					<p className="sm:col-span-2 text-xs text-muted-foreground">
						Record cash received from a mortgage institution against this member&apos;s house slot.
					</p>
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Payment date (optional)</Label>
					<Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
				</div>
				<div className="space-y-2 sm:col-span-1">
					<Label>Notes</Label>
					<Textarea
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Receipt reference, teller details, etc."
						rows={compact ? 2 : 3}
					/>
				</div>
			</div>

			<Can permission="manage_payments|manage_property_allottees">
				<div className="flex justify-end">
					<Button onClick={() => void handleSubmit()} disabled={submitting || !canSubmit}>
						{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
						Record repayment
					</Button>
				</div>
			</Can>
		</div>
	)
}
