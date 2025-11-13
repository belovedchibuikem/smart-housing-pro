import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Home, TrendingUp, Wallet, PiggyBank } from "lucide-react"
import type { MemberPropertiesSummary } from "@/lib/api/client"

type PropertiesSummaryProps = {
	summary?: MemberPropertiesSummary | null
	loading?: boolean
}

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 })

export function PropertiesSummary({ summary, loading }: PropertiesSummaryProps) {
	if (loading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Card key={index} className="p-6 space-y-4">
						<Skeleton className="h-10 w-10 rounded-lg" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-3 w-20" />
						</div>
					</Card>
				))}
			</div>
		)
	}

	const data = summary ?? {
		total_properties: 0,
		houses_owned: 0,
		total_paid: 0,
		current_value: 0,
		predictive_value: 0,
	}

  const stats = [
    {
			title: "Total Houses",
			value: data.houses_owned,
			description: `${data.total_properties} total properties expressed`,
			icon: Home,
		},
		{
			title: "Total Paid",
			value: currency.format(data.total_paid),
			description: "Amount contributed so far",
      icon: Wallet,
    },
    {
      title: "Current Value",
			value: currency.format(data.current_value),
			description: "Estimated present valuation",
      icon: TrendingUp,
    },
    {
			title: "Predictive Value",
			value: currency.format(data.predictive_value),
			description: "Projected future valuation",
			icon: PiggyBank,
    },
  ]

  return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-6">
						<div className="mb-4 flex items-center justify-between">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
							<p className="mb-1 text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
							<p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
