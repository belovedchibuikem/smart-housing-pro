"use client"

import Link from "next/link"
import {
  ArrowRight,
  Banknote,
  CreditCard,
  HandCoins,
  Home,
  PieChart,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const reportLinks = [
  {
    title: "Contribution Report",
    description: "Monthly savings and cooperative contributions with filters and exports.",
    href: "/dashboard/reports/contributions",
    icon: CreditCard,
  },
  {
    title: "Equity Contribution Report",
    description: "Equity builds and approvals tied to your cooperative equity plans.",
    href: "/dashboard/reports/equity-contributions",
    icon: HandCoins,
  },
  {
    title: "Investment Report",
    description: "Portfolio value, realized returns, and performance by investment.",
    href: "/dashboard/reports/investments",
    icon: TrendingUp,
  },
  {
    title: "Loan Report",
    description: "Borrowings, repayment progress, interest paid, and balances.",
    href: "/dashboard/reports/loans",
    icon: HandCoins,
  },
  {
    title: "Mortgage Report",
    description: "External and internal mortgages with principal, balance, and providers.",
    href: "/dashboard/reports/mortgages",
    icon: Banknote,
  },
  {
    title: "Property Report",
    description: "Approved interests, payment progress, and balances per property.",
    href: "/dashboard/reports/properties",
    icon: Home,
  },
  {
    title: "Financial Summary",
    description: "Net worth, assets, liabilities, and six‑month contribution vs repayment flow.",
    href: "/dashboard/reports/financial-summary",
    icon: PieChart,
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Generate filtered views from live cooperative data and export PDF or Excel for your records.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reportLinks.map(({ title, description, href, icon: Icon }) => (
          <Link key={href} href={href} className="group block rounded-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="text-lg leading-snug group-hover:text-primary">{title}</CardTitle>
                  <CardDescription className="leading-relaxed">{description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open report
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
