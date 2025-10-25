import { Card } from "@/components/ui/card"
import { Wallet, TrendingUp, Home, ArrowUpRight, ArrowDownRight } from "lucide-react"

export function StatsCards() {
  const stats = [
    {
      title: "Total Contributions",
      value: "₦2,450,000",
      change: "+12.5%",
      trend: "up",
      icon: Wallet,
      description: "From last month",
    },
    {
      title: "Active Loans",
      value: "₦5,000,000",
      change: "1 loan",
      trend: "neutral",
      icon: TrendingUp,
      description: "Outstanding balance",
    },
    {
      title: "Property Value",
      value: "₦15,000,000",
      change: "+8.2%",
      trend: "up",
      icon: Home,
      description: "Appreciation this year",
    },
    {
      title: "Wallet Balance",
      value: "₦125,000",
      change: "-₦50,000",
      trend: "down",
      icon: Wallet,
      description: "Available balance",
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
              {stat.trend !== "neutral" && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    stat.trend === "up" ? "text-green-600" : "text-red-600",
                  )}
                >
                  {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </div>
              )}
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
