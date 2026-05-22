"use client"

import Link from "next/link"
import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type PricingPlanDisplay = {
  id?: string
  name: string
  tagline?: string | null
  description?: string | null
  priceNgn: number | null
  priceLabel?: string
  usdHint?: string | null
  billingCycle?: string
  customPricing?: boolean
  isFeatured?: boolean
  trialDays?: number
  features: string[]
  ctaHref: string
  ctaLabel: string
  ctaVariant?: "default" | "outline"
}

function billingPeriodLabel(cycle: string | undefined): string {
  if (!cycle) return "per year"
  const map: Record<string, string> = {
    yearly: "per year",
    year: "per year",
    monthly: "per month",
    quarterly: "per quarter",
    weekly: "per week",
    lifetime: "lifetime",
    forever: "forever",
  }
  return map[cycle] ?? `per ${cycle}`
}

function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatUsdHint(hint: string): string {
  const t = hint.trim()
  if (!t) return ""
  if (t.startsWith("$") || t.startsWith("~$") || t.toLowerCase().includes("usd")) return t
  return `~$${t.replace(/^\$/, "")}`
}

export function PricingPlanCard({ plan }: { plan: PricingPlanDisplay }) {
  const featured = Boolean(plan.isFeatured)
  const contact = Boolean(plan.customPricing)
  const tagline = plan.tagline?.trim()
  const showTaglineBadge = tagline && tagline.toLowerCase() !== "most popular"

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md",
        featured && "border-2 border-primary shadow-lg ring-1 ring-primary/20",
      )}
    >
      {featured && (
        <div className="flex items-center justify-center gap-1.5 bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Most Popular
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{plan.name}</h3>
            {showTaglineBadge && (
              <Badge variant="secondary" className="font-medium">
                {tagline}
              </Badge>
            )}
          </div>

          {plan.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
          )}
        </div>

        <div className="mb-6 rounded-xl border bg-muted/40 px-4 py-5 text-center">
          {contact ? (
            <p className="text-2xl font-bold tracking-tight sm:text-3xl">Custom pricing</p>
          ) : (
            <>
              <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {plan.priceLabel ??
                  (plan.priceNgn != null ? formatNgn(plan.priceNgn) : "—")}
              </p>
              {plan.billingCycle && (
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {billingPeriodLabel(plan.billingCycle)}
                </p>
              )}
              {plan.usdHint && (
                <p className="mt-2 text-base font-semibold text-primary">
                  {formatUsdHint(plan.usdHint)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">USD approx.</span>
                </p>
              )}
            </>
          )}
          {!contact && plan.trialDays != null && plan.trialDays > 0 && (
            <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {plan.trialDays}-day free trial included
            </p>
          )}
        </div>

        {plan.features.length > 0 && (
          <ul className="mb-8 flex-1 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm leading-snug">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <Button className="mt-auto w-full" size="lg" variant={plan.ctaVariant ?? (featured ? "default" : "outline")} asChild>
          <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
        </Button>
      </div>
    </Card>
  )
}
