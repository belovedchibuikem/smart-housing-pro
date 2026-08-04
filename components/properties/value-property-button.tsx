"use client"

import { useState } from "react"
import { Calculator, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { publicValueLand, publicValueProperty, type ValuationRow } from "@/lib/api/valuations"
import { useToast } from "@/hooks/use-toast"

function money(n?: number | null) {
	if (n == null || Number.isNaN(Number(n))) return "—"
	return `₦${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function ValuePropertyButton({
	propertyId,
	kind = "house",
}: {
	propertyId: string
	kind?: "house" | "land"
}) {
	const { toast } = useToast()
	const [open, setOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const [valuation, setValuation] = useState<ValuationRow | null>(null)

	const run = async () => {
		setLoading(true)
		try {
			const res =
				kind === "land"
					? await publicValueLand(propertyId)
					: await publicValueProperty(propertyId)
			setValuation(res.valuation)
			setOpen(true)
		} catch (e) {
			toast({
				title: "Valuation unavailable",
				description: String(e),
				variant: "destructive",
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<Button type="button" variant="secondary" className="w-full" onClick={() => void run()} disabled={loading}>
				{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
				Value this {kind === "land" ? "land" : "property"}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Estimated market value</DialogTitle>
						<DialogDescription>
							Hybrid valuation using market data, comparables, AI prediction, and business rules. No login required.
						</DialogDescription>
					</DialogHeader>
					{valuation && (
						<div className="space-y-3 text-sm">
							<div>
								<p className="text-muted-foreground text-xs uppercase tracking-wide">Current value</p>
								<p className="text-2xl font-semibold">{money(valuation.estimated_value ?? valuation.current_value)}</p>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<p className="text-muted-foreground text-xs">Confidence</p>
									<p className="font-medium">{valuation.confidence_score ?? "—"}%</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Annual growth</p>
									<p className="font-medium">
										{valuation.predicted_growth != null ? `${Number(valuation.predicted_growth).toFixed(1)}%` : "—"}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">1 year forecast</p>
									<p className="font-medium">{money(valuation.predictions?.one_year)}</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">5 year forecast</p>
									<p className="font-medium">{money(valuation.predictions?.five_year)}</p>
								</div>
							</div>
							{valuation.ai_recommendation ? (
								<p className="text-muted-foreground rounded-md border bg-muted/30 p-3 text-xs">
									{valuation.ai_recommendation}
								</p>
							) : null}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}
