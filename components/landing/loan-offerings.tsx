"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Home, Zap, Building2, Shield, ArrowRight, Info } from "lucide-react"
import Link from "next/link"

interface LoanProduct {
  id: string
  name: string
  description?: string
  min_amount: number
  max_amount: number
  interest_rate: number
  min_tenure_months: number
  max_tenure_months: number
  tenure_range?: string
  interest_type: string
  eligibility_criteria?: string[]
  required_documents?: string[]
}

interface LoanOfferingsProps {
  products?: LoanProduct[]
  config?: {
    title?: string
    subtitle?: string
    limit?: number
  }
}

export function LoanOfferings({ products = [], config }: LoanOfferingsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "member" | "non-member">("all")

  // Map API products to display format
  const mappedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    icon: TrendingUp, // Default icon
    maxAmount: `₦${parseFloat(product.max_amount.toString()).toLocaleString('en-NG')}`,
    memberRate: `${product.interest_rate}%`,
    nonMemberRate: `${product.interest_rate + 2}%`, // Estimate non-member rate
    tenure: product.tenure_range || `${product.min_tenure_months}-${product.max_tenure_months} months`,
    description: product.description || "",
    eligibility: "both",
    features: product.eligibility_criteria || [],
  }))

  const loanProducts = mappedProducts.length > 0 ? mappedProducts : [
    {
      id: 1,
      name: "Personal Loan",
      icon: TrendingUp,
      maxAmount: "₦5,000,000",
      memberRate: "5%",
      nonMemberRate: "8%",
      tenure: "12-60 months",
      description: "Quick personal loans for immediate needs with flexible repayment terms",
      eligibility: "both",
      features: ["Fast approval", "Flexible tenure", "No collateral required"],
    },
    {
      id: 2,
      name: "Housing Loan",
      icon: Home,
      maxAmount: "₦20,000,000",
      memberRate: "7%",
      nonMemberRate: "10%",
      tenure: "60-240 months",
      description: "Long-term housing finance for property purchase or construction",
      eligibility: "both",
      features: ["Up to 20 years", "Competitive rates", "Property as collateral"],
    },
    {
      id: 3,
      name: "Emergency Loan",
      icon: Zap,
      maxAmount: "₦1,000,000",
      memberRate: "3%",
      nonMemberRate: "6%",
      tenure: "6-12 months",
      description: "Fast emergency funding for urgent financial needs",
      eligibility: "both",
      features: ["Same-day approval", "Minimal documentation", "Quick disbursement"],
    },
    {
      id: 4,
      name: "Development Loan",
      icon: Building2,
      maxAmount: "₦10,000,000",
      memberRate: "6%",
      nonMemberRate: "9%",
      tenure: "24-120 months",
      description: "Property development financing for construction projects",
      eligibility: "both",
      features: ["Staged disbursement", "Long tenure", "Development support"],
    },
    {
      id: 5,
      name: "Member Exclusive Loan",
      icon: Shield,
      maxAmount: "₦15,000,000",
      memberRate: "4%",
      nonMemberRate: "N/A",
      tenure: "12-180 months",
      description: "Special rates and terms exclusively for FRSC cooperative members",
      eligibility: "member-only",
      features: ["Lowest rates", "Exclusive benefits", "Priority processing"],
    },
  ]

  const filteredLoans = loanProducts
    .filter((loan) => {
      const matchesSearch =
        loan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "member" && loan.eligibility !== "non-member-only") ||
        (selectedCategory === "non-member" && loan.eligibility !== "member-only")

      return matchesSearch && matchesCategory
    })
    .slice(0, config?.limit || 6)

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4" />
            {config?.title || "Flexible Financing Options"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{config?.title || "Affordable Loan Products"}</h2>
          <p className="text-lg text-muted-foreground text-balance">
            {config?.subtitle || "Access competitive loan products with flexible terms designed for FRSC personnel and the general public"}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search loan products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Loans
            </Button>
            <Button
              variant={selectedCategory === "member" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("member")}
            >
              Member Loans
            </Button>
            <Button
              variant={selectedCategory === "non-member" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("non-member")}
            >
              Non-Member Loans
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Member Benefits</p>
              <p className="text-muted-foreground mt-1">
                FRSC Cooperative members enjoy significantly lower interest rates and access to exclusive loan products.
                <Link href="/register" className="text-primary hover:underline ml-1">
                  Become a member today
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Loan Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredLoans.map((loan) => {
            const Icon = loan.icon
            return (
              <Card key={loan.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="p-6 space-y-4">
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {loan.eligibility === "member-only" && (
                      <Badge variant="default" className="text-xs">
                        Members Only
                      </Badge>
                    )}
                  </div>

                  {/* Loan Name */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{loan.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{loan.description}</p>
                  </div>

                  {/* Loan Details */}
                  <div className="space-y-3 py-4 border-y">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Maximum Amount</span>
                      <span className="text-sm font-semibold">{loan.maxAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Member Rate</span>
                      <span className="text-sm font-semibold text-green-600">{loan.memberRate}</span>
                    </div>
                    {loan.nonMemberRate !== "N/A" && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Non-Member Rate</span>
                        <span className="text-sm font-semibold text-amber-600">{loan.nonMemberRate}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tenure</span>
                      <span className="text-sm font-semibold">{loan.tenure}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {loan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link href={`/register?ref=loan&product=${loan.id}`} className="block">
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>

        {/* No Results */}
        {filteredLoans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No loan products found matching your criteria</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Need help choosing the right loan?</p>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Speak with a Loan Officer
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
