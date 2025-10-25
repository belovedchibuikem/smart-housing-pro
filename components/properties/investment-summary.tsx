import { Card } from "@/components/ui/card"
import { Home, TrendingUp, Wallet, PieChart } from "lucide-react"

export function InvestmentSummary() {
  const stats = [
    {
      title: "Total Invested",
      value: "₦15,000,000",
      icon: Wallet,
      description: "Across 3 properties",
    },
    {
      title: "Current Value",
      value: "₦16,230,000",
      icon: TrendingUp,
      description: "+8.2% appreciation",
    },
    {
      title: "Properties Owned",
      value: "3",
      icon: Home,
      description: "Active investments",
    },
    {
      title: "Total Returns",
      value: "₦1,230,000",
      icon: PieChart,
      description: "Lifetime earnings",
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
