import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Calendar, DollarSign, Download, Eye, MapPin, Home, ImageIcon, FileText } from "lucide-react"
import Link from "next/link"

export default function MyInvestmentsPage() {
  const investments = [
    {
      id: "1",
      planName: "Housing Project 2024",
      type: "money",
      totalInvested: 2000000,
      currentValue: 2150000,
      roi: 7.5,
      status: "Active",
      startDate: "2024-01-15",
      maturityDate: "2025-01-15",
      payments: [
        { date: "2024-01-15", amount: 1000000 },
        { date: "2024-02-15", amount: 500000 },
        { date: "2024-03-15", amount: 500000 },
      ],
    },
    {
      id: "2",
      planName: "Land Development Phase 2",
      type: "land",
      location: "Abuja, Gwarinpa Estate",
      plotsOwned: 2,
      totalInvested: 4000000,
      currentValue: 4800000,
      roi: 20,
      status: "Active",
      startDate: "2024-03-01",
      images: ["/modern-apartment-exterior.png", "/modern-living-room.png"],
      hasDocuments: true,
      payments: [
        { date: "2024-03-01", amount: 2000000 },
        { date: "2024-04-01", amount: 2000000 },
      ],
    },
    {
      id: "3",
      planName: "Luxury Duplex - Lekki",
      type: "house",
      location: "Lagos, Lekki Phase 1",
      houseType: "4-Bedroom Duplex",
      unitsOwned: 1,
      totalInvested: 35000000,
      currentValue: 38000000,
      roi: 8.6,
      status: "Active",
      startDate: "2024-02-01",
      images: ["/modern-apartment-exterior.png", "/modern-kitchen.png", "/modern-living-room.png"],
      hasDocuments: true,
      payments: [
        { date: "2024-02-01", amount: 10000000 },
        { date: "2024-03-01", amount: 12500000 },
        { date: "2024-04-01", amount: 12500000 },
      ],
    },
  ]

  const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0)
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalGain = totalValue - totalInvested

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Investments</h1>
        <p className="text-muted-foreground">Track and manage your investment portfolio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(totalInvested / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Across {investments.length} investment plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(totalValue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-green-600">
              +₦{(totalGain / 1000000).toFixed(1)}M ({((totalGain / totalInvested) * 100).toFixed(1)}% gain)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
            <p className="text-xs text-muted-foreground">All investments active</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Investments</TabsTrigger>
          <TabsTrigger value="money">Cash</TabsTrigger>
          <TabsTrigger value="property">Property</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {investments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))}
        </TabsContent>

        <TabsContent value="money" className="space-y-4">
          {investments
            .filter((inv) => inv.type === "money")
            .map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
        </TabsContent>

        <TabsContent value="property" className="space-y-4">
          {investments
            .filter((inv) => inv.type === "land" || inv.type === "house")
            .map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InvestmentCard({ investment }: { investment: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {investment.type === "money" && (
                <>
                  <DollarSign className="h-4 w-4 text-primary" />
                  <Badge variant="default">Cash Investment</Badge>
                </>
              )}
              {investment.type === "land" && (
                <>
                  <MapPin className="h-4 w-4 text-primary" />
                  <Badge variant="secondary">Land Investment</Badge>
                </>
              )}
              {investment.type === "house" && (
                <>
                  <Home className="h-4 w-4 text-primary" />
                  <Badge variant="outline">House Investment</Badge>
                </>
              )}
              <Badge variant={investment.status === "Active" ? "default" : "secondary"}>{investment.status}</Badge>
            </div>
            <CardTitle>{investment.planName}</CardTitle>
            <CardDescription>Started {new Date(investment.startDate).toLocaleDateString()}</CardDescription>
            {investment.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {investment.location}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {investment.images && investment.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {investment.images.map((image: string, idx: number) => (
              <div key={idx} className="relative h-24 rounded-lg overflow-hidden border">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Property ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {investment.type === "money" && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Investment Type</p>
                <p className="text-lg font-semibold">Cash</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-lg font-semibold">₦{investment.totalInvested.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-lg font-semibold text-green-600">₦{investment.currentValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-lg font-semibold">{investment.roi}%</p>
              </div>
            </>
          )}
          {investment.type === "land" && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Plots Owned</p>
                <p className="text-lg font-semibold">{investment.plotsOwned}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-lg font-semibold">₦{investment.totalInvested.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-lg font-semibold text-green-600">₦{investment.currentValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-lg font-semibold">{investment.roi}%</p>
              </div>
            </>
          )}
          {investment.type === "house" && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Property Type</p>
                <p className="text-lg font-semibold">{investment.houseType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-lg font-semibold">₦{investment.totalInvested.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-lg font-semibold text-green-600">₦{investment.currentValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-lg font-semibold">{investment.roi}%</p>
              </div>
            </>
          )}
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Payment History ({investment.payments.length} payments)</p>
          <div className="space-y-2">
            {investment.payments.map((payment: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm border-l-2 border-primary pl-3">
                <span className="text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</span>
                <span className="font-medium">₦{payment.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/investment-plans/${investment.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
          {investment.hasDocuments && (
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View Documents
            </Button>
          )}
          {investment.images && investment.images.length > 0 && (
            <Button variant="outline" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              View Gallery ({investment.images.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
