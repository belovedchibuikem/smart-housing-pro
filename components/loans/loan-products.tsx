import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export function LoanProducts() {
  const products = [
    {
      id: "housing-dev",
      name: "Housing Development Loan",
      description: "Finance your dream home construction or purchase",
      maxAmount: 10000000,
      interestRate: "8%",
      tenure: "Up to 60 months",
      features: [
        "Competitive interest rates",
        "Flexible repayment terms",
        "No hidden charges",
        "Quick approval process",
      ],
      eligibility: ["Minimum 12 months membership", "Regular contribution history", "Valid employment status"],
    },
    {
      id: "emergency",
      name: "Emergency Loan",
      description: "Quick access to funds for urgent needs",
      maxAmount: 2000000,
      interestRate: "10%",
      tenure: "Up to 24 months",
      features: [
        "Fast approval within 48 hours",
        "Minimal documentation",
        "Flexible repayment",
        "No collateral required",
      ],
      eligibility: ["Minimum 6 months membership", "Active contribution status", "No outstanding loans"],
    },
    {
      id: "renovation",
      name: "Home Renovation Loan",
      description: "Upgrade and improve your existing property",
      maxAmount: 5000000,
      interestRate: "9%",
      tenure: "Up to 36 months",
      features: ["Competitive rates", "Flexible disbursement", "Grace period available", "Top-up facility available"],
      eligibility: ["Minimum 9 months membership", "Property ownership proof", "Regular contributions"],
    },
  ]

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="p-6 flex flex-col">
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold">{product.name}</h3>
                <Badge variant="outline">{product.interestRate} p.a.</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Maximum Amount</p>
                <p className="font-semibold">₦{product.maxAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tenure</p>
                <p className="font-semibold">{product.tenure}</p>
              </div>
            </div>

            <div>
              <p className="font-medium text-sm mb-2">Key Features</p>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-medium text-sm mb-2">Eligibility</p>
              <ul className="space-y-2">
                {product.eligibility.map((criteria, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link href={`/dashboard/loans/apply?product=${product.id}`} className="mt-6">
            <Button className="w-full">Apply Now</Button>
          </Link>
        </Card>
      ))}
    </div>
  )
}
