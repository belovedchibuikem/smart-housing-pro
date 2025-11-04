"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, DollarSign, MapPin, Home, Coins } from "lucide-react"

interface InvestmentPlan {
  id: string
  name: string
  description?: string
  min_amount: number
  max_amount: number
  expected_return_rate: number
  min_duration_months: number
  max_duration_months: number
  duration_range?: string
  return_type: string
  risk_level: string
  features?: string[]
}

interface InvestmentOpportunitiesProps {
  plans?: InvestmentPlan[]
  config?: {
    title?: string
    subtitle?: string
    limit?: number
  }
}

export function InvestmentOpportunities({ plans = [], config }: InvestmentOpportunitiesProps) {
  const [investmentType, setInvestmentType] = useState("all")
  
  // Map API plans to display format
  const mappedPlans = plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    type: "Money", // Investment plans are cash-based
    roi: parseFloat(plan.expected_return_rate.toString()),
    minInvestment: parseFloat(plan.min_amount.toString()),
    maxInvestment: parseFloat(plan.max_amount.toString()),
    duration: plan.duration_range || `${plan.min_duration_months}-${plan.max_duration_months} months`,
    status: "Open",
    description: plan.description || "",
    riskLevel: plan.risk_level,
    features: plan.features || [],
    icon: Coins,
  }))

  const filteredInvestments = mappedPlans.filter((investment) => {
    return investmentType === "all" || investment.type === investmentType
  }).slice(0, config?.limit || 6)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Money":
        return Coins
      case "Land":
        return MapPin
      case "House":
        return Home
      default:
        return TrendingUp
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Money":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "Land":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      case "House":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="mb-4" variant="secondary">
            <TrendingUp className="h-3 w-3 mr-1" />
            {config?.title || "Investment Opportunities"}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{config?.title || "Grow Your Wealth with Smart Investments"}</h2>
          <p className="text-muted-foreground text-lg">
            {config?.subtitle || "Explore diverse investment options with attractive returns. From cash investments to property development projects."}
          </p>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            variant={investmentType === "all" ? "default" : "outline"}
            onClick={() => setInvestmentType("all")}
            size="sm"
          >
            All Investments
          </Button>
          <Button
            variant={investmentType === "Money" ? "default" : "outline"}
            onClick={() => setInvestmentType("Money")}
            size="sm"
          >
            <Coins className="h-4 w-4 mr-2" />
            Cash
          </Button>
          <Button
            variant={investmentType === "Land" ? "default" : "outline"}
            onClick={() => setInvestmentType("Land")}
            size="sm"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Land
          </Button>
          <Button
            variant={investmentType === "House" ? "default" : "outline"}
            onClick={() => setInvestmentType("House")}
            size="sm"
          >
            <Home className="h-4 w-4 mr-2" />
            House
          </Button>
        </div>

        {/* Investment Grid */}
        {filteredInvestments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredInvestments.map((investment) => {
              const TypeIcon = investment.icon || getTypeIcon(investment.type)
              return (
                <Card key={investment.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                {investment.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={investment.image || "/placeholder.svg"}
                      alt={investment.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-primary">{investment.roi}% ROI</Badge>
                    <Badge className={`absolute top-3 left-3 ${getTypeColor(investment.type)}`}>
                      {investment.type}
                    </Badge>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                    <TypeIcon className="h-20 w-20 text-primary/40" />
                    <Badge className="absolute top-3 right-3 bg-primary">{investment.roi}% ROI</Badge>
                    <Badge className={`absolute top-3 left-3 ${getTypeColor(investment.type)}`}>
                      {investment.type}
                    </Badge>
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-2 flex-1">{investment.name}</h3>
                    {investment.status === "Filling Fast" && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Filling Fast
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{investment.description}</p>
                  {investment.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {investment.location}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Min. Investment</div>
                      <div className="font-semibold text-sm">{formatCurrency(investment.minInvestment)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="font-semibold text-sm">{investment.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="h-3 w-3 mr-1" />
                    Closes: {new Date(investment.closingDate).toLocaleDateString()}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/register?ref=investment&plan=${investment.id}`} className="w-full">
                    <Button className="w-full" size="sm">
                      Invest Now
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No investment plans available at the moment.</p>
          </div>
        )}

        {/* View All Button */}
        {filteredInvestments.length > 0 && (
          <div className="text-center">
            <Link href="/register">
              <Button size="lg" variant="outline">
                View All Investment Plans
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
