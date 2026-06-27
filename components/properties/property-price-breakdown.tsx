import { cn } from "@/lib/utils"
import {
  effectiveSlotCount,
  formatNaira,
  perSlotAmount,
  totalListingCost,
  type PricingSource,
} from "@/lib/properties/pricing"

type PropertyPriceBreakdownProps = {
  source: PricingSource
  variant?: "default" | "amber" | "emerald"
  compact?: boolean
  className?: string
}

export function PropertyPriceBreakdown({
  source,
  variant = "default",
  compact = false,
  className,
}: PropertyPriceBreakdownProps) {
  const perSlot = perSlotAmount(source)
  const slots = effectiveSlotCount(source.total_slots)
  const total = totalListingCost(source)

  const accent =
    variant === "amber"
      ? "text-amber-600"
      : variant === "emerald"
        ? "text-emerald-700"
        : "text-primary"

  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/30 p-3 sm:p-4 space-y-3",
        className,
      )}
    >
      <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3")}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Price per slot
          </p>
          <p className={cn("text-lg font-bold tabular-nums", accent)}>{formatNaira(perSlot)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total slots
          </p>
          <p className="text-lg font-bold tabular-nums">{slots}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Total listing cost
          </p>
          <p className={cn("text-lg font-bold tabular-nums", accent)}>{formatNaira(total)}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {formatNaira(perSlot)} × {slots} slots = {formatNaira(total)} total asset value
      </p>
    </div>
  )
}
