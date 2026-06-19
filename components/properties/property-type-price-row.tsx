import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PropertyTypePriceRowProps = {
	typeLabel: string
	price: ReactNode
	priceHeading?: string
	typeHeading?: string
	variant?: "default" | "amber" | "emerald"
	size?: "default" | "compact"
	splitOnMobile?: boolean
	className?: string
}

const variantStyles = {
	default: {
		wrapper: "border bg-muted/30",
		typeDivider: "border-r",
		price: "text-primary",
	},
	amber: {
		wrapper: "border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-background to-background shadow-sm",
		typeDivider: "border-amber-100 border-r",
		price: "text-amber-600",
	},
	emerald: {
		wrapper: "border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-background to-background shadow-sm",
		typeDivider: "border-emerald-100 border-r",
		price: "text-emerald-700",
	},
} as const

export function PropertyTypePriceRow({
	typeLabel,
	price,
	priceHeading = "Property Price",
	typeHeading = "Property Type",
	variant = "default",
	size = "default",
	splitOnMobile = false,
	className,
}: PropertyTypePriceRowProps) {
	const styles = variantStyles[variant]
	const isCompact = size === "compact"
	const alwaysSplit = splitOnMobile || isCompact

	return (
		<div
			className={cn(
				"grid min-w-0 gap-0 overflow-hidden rounded-lg",
				alwaysSplit
					? "grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
					: "grid-cols-1 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
				styles.wrapper,
				className,
			)}
		>
			<div
				className={cn(
					"flex min-w-0 flex-col items-start justify-start gap-0.5",
					isCompact ? "px-2.5 py-2 sm:px-3 sm:py-2.5" : "px-3 py-2.5 sm:px-3.5 sm:py-3",
					alwaysSplit ? styles.typeDivider : "border-b sm:border-b-0 sm:border-r",
				)}
			>
				<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[11px]">
					{typeHeading}
				</span>
				<span
					title={typeLabel}
					className={cn(
						"line-clamp-2 w-full font-semibold leading-4 text-foreground",
						isCompact ? "text-[11px] sm:text-xs" : "text-xs sm:text-[13px] sm:leading-5",
					)}
				>
					{typeLabel}
				</span>
			</div>
			<div
				className={cn(
					"flex min-w-0 flex-col items-end justify-start gap-0.5 text-right",
					isCompact ? "px-2.5 py-2 sm:px-3 sm:py-2.5" : "px-3 py-2.5 sm:px-3.5 sm:py-3",
				)}
			>
				<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[11px]">
					{priceHeading}
				</span>
				<div
					className={cn(
						"max-w-full font-bold tabular-nums leading-tight whitespace-nowrap",
						isCompact ? "text-sm" : "text-base sm:text-lg",
						styles.price,
					)}
				>
					{price}
				</div>
			</div>
		</div>
	)
}
