import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"

export function MyInvestments() {
  const investments = [
    {
      id: "PROP-001",
      title: "Modern 3-Bedroom Apartment",
      location: "Lekki Phase 1, Lagos",
      investedAmount: 5000000,
      currentValue: 5410000,
      shares: 11,
      totalShares: 100,
      appreciation: 8.2,
      purchaseDate: "Jan 15, 2024",
      status: "active",
      image: "/modern-apartment-building.png",
    },
    {
      id: "PROP-005",
      title: "Commercial Plaza",
      location: "Ikeja, Lagos",
      investedAmount: 8000000,
      currentValue: 8960000,
      shares: 8,
      totalShares: 100,
      appreciation: 12.0,
      purchaseDate: "Mar 10, 2024",
      status: "active",
      image: "/commercial-plaza-building.jpg",
    },
    {
      id: "PROP-007",
      title: "Residential Estate",
      location: "Ajah, Lagos",
      investedAmount: 2000000,
      currentValue: 2160000,
      shares: 5,
      totalShares: 100,
      appreciation: 8.0,
      purchaseDate: "Jun 20, 2024",
      status: "active",
      image: "/residential-estate.jpg",
    },
  ]

  return (
    <div className="space-y-6">
      {investments.map((investment) => (
        <Card key={investment.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <img
              src={investment.image || "/placeholder.svg"}
              alt={investment.title}
              className="w-full md:w-64 h-48 object-cover"
            />
            <div className="flex-1 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{investment.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {investment.location}
                  </div>
                </div>
                <Badge>{investment.status}</Badge>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Invested Amount</p>
                  <p className="text-lg font-semibold">₦{investment.investedAmount.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Current Value</p>
                  <p className="text-lg font-semibold text-green-600">₦{investment.currentValue.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Appreciation</p>
                  <p className="text-lg font-semibold text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />+{investment.appreciation}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Ownership</span>
                  <span className="font-medium">
                    {investment.shares}/{investment.totalShares} shares ({investment.shares}%)
                  </span>
                </div>
                <Progress value={investment.shares} />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Purchased: {investment.purchaseDate}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/properties/${investment.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Button size="sm">Add More Shares</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
