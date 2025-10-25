"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, TrendingUp, Calendar, DollarSign, Home, MapPin } from "lucide-react"
import Link from "next/link"

export default function AdminInvestmentPlansPage() {
  const stats = [
    { label: "Active Plans", value: 5, icon: TrendingUp },
    { label: "Total Investments", value: "₦45.2M", icon: DollarSign },
    { label: "Closing Soon", value: 1, icon: Calendar },
  ]

  const investmentPlans = [
    {
      id: 1,
      name: "Housing Development Project Phase 3",
      type: "money",
      targetAmount: "₦50,000,000",
      currentAmount: "₦32,500,000",
      progress: 65,
      roi: "15%",
      closingDate: "2024-03-31",
      moratorium: "6 months",
      status: "Active",
      investors: 87,
    },
    {
      id: 2,
      name: "Estate Infrastructure Upgrade",
      type: "money",
      targetAmount: "₦30,000,000",
      currentAmount: "₦28,000,000",
      progress: 93,
      roi: "12%",
      closingDate: "2024-02-15",
      moratorium: "3 months",
      status: "Closing Soon",
      investors: 65,
    },
    {
      id: 3,
      name: "Land Acquisition Project - Abuja",
      type: "land",
      location: "Abuja, Gwarinpa",
      totalPlots: 50,
      soldPlots: 32,
      progress: 64,
      pricePerPlot: "₦2,000,000",
      closingDate: "2024-06-30",
      status: "Active",
      investors: 32,
    },
    {
      id: 4,
      name: "Luxury Duplex Investment - Lekki",
      type: "house",
      location: "Lagos, Lekki Phase 1",
      houseType: "Duplex",
      totalUnits: 20,
      soldUnits: 8,
      progress: 40,
      pricePerUnit: "₦35,000,000",
      closingDate: "2024-05-15",
      status: "Active",
      investors: 8,
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "land":
        return <MapPin className="h-4 w-4" />
      case "house":
        return <Home className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "land":
        return "secondary"
      case "house":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Plans Management</h1>
          <p className="text-muted-foreground mt-2">Create and manage investment opportunities</p>
        </div>
        <Link href="/admin/investment-plans/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Investment Plan
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search investment plans..." className="pl-9" />
          </div>
          <Select defaultValue="all-types">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              <SelectItem value="money">Money</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="house">House</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {investmentPlans.map((plan) => (
            <Card key={plan.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <Badge variant={getTypeBadgeVariant(plan.type)} className="flex items-center gap-1">
                        {getTypeIcon(plan.type)}
                        {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)}
                      </Badge>
                      <Badge variant={plan.status === "Active" ? "default" : "secondary"}>{plan.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {plan.type === "money" && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Target Amount</p>
                            <p className="font-semibold">{plan.targetAmount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Current Amount</p>
                            <p className="font-semibold">{plan.currentAmount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">ROI</p>
                            <p className="font-semibold">{plan.roi} per annum</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Investors</p>
                            <p className="font-semibold">{plan.investors} members</p>
                          </div>
                        </>
                      )}
                      {plan.type === "land" && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-semibold">{plan.location}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Plots</p>
                            <p className="font-semibold">{plan.totalPlots} plots</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sold</p>
                            <p className="font-semibold">{plan.soldPlots} plots</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Price per Plot</p>
                            <p className="font-semibold">{plan.pricePerPlot}</p>
                          </div>
                        </>
                      )}
                      {plan.type === "house" && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-semibold">{plan.location}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Type</p>
                            <p className="font-semibold">{plan.houseType}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Units</p>
                            <p className="font-semibold">
                              {plan.soldUnits}/{plan.totalUnits}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Price per Unit</p>
                            <p className="font-semibold">{plan.pricePerUnit}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{plan.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${plan.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">Closes: {plan.closingDate}</span>
                    {plan.type === "money" && plan.moratorium && (
                      <span className="text-muted-foreground">Moratorium: {plan.moratorium}</span>
                    )}
                  </div>
                  <Link href={`/admin/investment-plans/${plan.id}`}>
                    <Button variant="link" size="sm">
                      View Details →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}
