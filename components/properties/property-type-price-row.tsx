import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PropertyTypePriceRowProps = {
	typeLabel: string
	price: ReactNode
	priceHeading?: string
	typeHeading?: string
	variant?: "default" | "amber" | "emerald"
	size?: "default" | "compact"
	className?: string
}

const variantStyles = {
	default: {
		wrapper: "border bg-muted/30",
		typeDivider: "sm:border-r",
		price: "text-primary",
	},
	amber: {
		wrapper: "border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-background to-background shadow-sm",
		typeDivider: "border-amber-100 sm:border-r",
		price: "text-amber-600",
	},
	emerald: {
		wrapper: "border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-background to-background shadow-sm",
		typeDivider: "border-emerald-100 sm:border-r",
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
	className,
}: PropertyTypePriceRowProps) {
	const styles = variantStyles[variant]
	const isCompact = size === "compact"

	return (
		<div
			className={cn(
				"grid grid-cols-1 gap-0 overflow-hidden rounded-xl sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]",
				styles.wrapper,
				className,
			)}
		>
			<div
				className={cn(
					"flex min-w-0 flex-col justify-center gap-1 border-b p-4 sm:border-b-0",
					isCompact ? "sm:p-3" : "sm:p-5",
					styles.typeDivider,
				)}
			>
				<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{typeHeading}</span>
				<span
					className={cn(
						"break-words font-bold leading-snug text-foreground",
						isCompact ? "text-sm sm:text-base" : "text-base sm:text-lg",
					)}
				>
					{typeLabel}
				</span>
			</div>
			<div
				className={cn(
					"flex min-w-0 flex-col justify-center gap-1 p-4 sm:items-end sm:text-right",
					isCompact ? "sm:p-3" : "sm:p-5",
				)}
			>
				<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{priceHeading}</span>
				<div
					className={cn(
						"break-words font-bold leading-tight",
						isCompact ? "text-lg" : "text-xl sm:text-2xl",
						styles.price,
					)}
				>
					{price}
				</div>
			</div>
		</div>
	)
}
