import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function SubscriptionPage() {
  const packages = [
    {
      id: 1,
      name: "Weekly Basic",
      price: 500,
      duration: "7 days",
      popular: false,
      features: ["Access to all modules", "Basic support", "Weekly reports", "Mobile app access"],
    },
    {
      id: 2,
      name: "Monthly Standard",
      price: 1500,
      duration: "30 days",
      popular: true,
      features: [
        "Access to all modules",
        "Priority support",
        "Daily reports",
        "Mobile app access",
        "Email notifications",
        "Export data",
      ],
    },
    {
      id: 3,
      name: "Quarterly Premium",
      price: 4000,
      duration: "90 days",
      popular: false,
      features: [
        "Access to all modules",
        "24/7 Premium support",
        "Real-time reports",
        "Mobile app access",
        "Email & SMS notifications",
        "Export data",
        "Advanced analytics",
        "API access",
      ],
    },
    {
      id: 4,
      name: "Yearly Elite",
      price: 15000,
      duration: "365 days",
      popular: false,
      features: [
        "Access to all modules",
        "Dedicated support manager",
        "Real-time reports",
        "Mobile app access",
        "All notification channels",
        "Unlimited exports",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "Training sessions",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Subscription Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a plan that works best for you and get instant access to the FRSC Housing Management System
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={pkg.popular ? "border-primary shadow-lg scale-105" : ""}>
              <CardHeader>
                {pkg.popular && <Badge className="w-fit mb-2">Most Popular</Badge>}
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.duration}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₦{pkg.price.toLocaleString()}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={`/subscription/checkout?package=${pkg.id}`} className="w-full">
                  <Button className="w-full" variant={pkg.popular ? "default" : "outline"}>
                    Subscribe Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
