import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Clock, ArrowRight, MapPin, Home, DollarSign, ImageIcon, FileText } from "lucide-react"

export default function InvestmentPlansPage() {
  const cashInvestments = [
    {
      id: "1",
      type: "money",
      name: "Housing Development Project Phase 3",
      description: "Invest in our latest housing development project with attractive returns",
      targetAmount: 50000000,
      currentAmount: 32500000,
      roi: 15,
      roiPaymentMode: "Quarterly",
      closingDate: "2024-12-31",
      moratoriumMonths: 6,
      minInvestment: 100000,
      status: "open",
    },
    {
      id: "2",
      type: "money",
      name: "Commercial Property Investment",
      description: "High-yield commercial property investment opportunity",
      targetAmount: 75000000,
      currentAmount: 45000000,
      roi: 18,
      roiPaymentMode: "Bi-annually",
      closingDate: "2024-11-30",
      moratoriumMonths: 3,
      minInvestment: 250000,
      status: "open",
    },
  ]

  const propertyInvestments = [
    {
      id: "3",
      type: "land",
      name: "Prime Land - Abuja Gwarinpa",
      description: "600sqm plots in a developing estate with C of O",
      location: "Abuja, Gwarinpa Estate",
      totalPlots: 50,
      soldPlots: 32,
      pricePerPlot: 2000000,
      closingDate: "2024-12-31",
      status: "open",
      images: ["/modern-apartment-exterior.png", "/modern-living-room.png"],
      hasDocuments: true,
    },
    {
      id: "4",
      type: "house",
      name: "Luxury Duplex Investment - Lekki",
      description: "4-bedroom detached duplex in prime Lekki location",
      location: "Lagos, Lekki Phase 1",
      houseType: "Duplex",
      totalUnits: 20,
      soldUnits: 8,
      pricePerUnit: 35000000,
      closingDate: "2024-11-30",
      status: "open",
      images: ["/modern-apartment-exterior.png", "/modern-kitchen.png", "/modern-living-room.png"],
      hasDocuments: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Investment Plans</h1>
        <p className="text-muted-foreground mt-1">Browse and subscribe to available investment opportunities</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Investments</TabsTrigger>
          <TabsTrigger value="cash">Cash Investments</TabsTrigger>
          <TabsTrigger value="property">Property Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...cashInvestments, ...propertyInvestments].map((plan) => (
              <InvestmentCard key={plan.id} plan={plan} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cash" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cashInvestments.map((plan) => (
              <InvestmentCard key={plan.id} plan={plan} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="property" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {propertyInvestments.map((plan) => (
              <InvestmentCard key={plan.id} plan={plan} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InvestmentCard({ plan }: { plan: any }) {
  if (plan.type === "money") {
    const progress = (plan.currentAmount / plan.targetAmount) * 100
    const daysLeft = Math.ceil((new Date(plan.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    return (
      <Card className="overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <Badge variant="default">Cash Investment</Badge>
              </div>
              <h3 className="font-semibold text-lg leading-tight">{plan.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₦{(plan.currentAmount / 1000000).toFixed(1)}M raised</span>
              <span>₦{(plan.targetAmount / 1000000).toFixed(1)}M target</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">ROI</p>
              <p className="font-semibold text-green-600">{plan.roi}% p.a.</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment</p>
              <p className="font-semibold text-sm">{plan.roiPaymentMode}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Min. Investment</p>
              <p className="font-semibold text-sm">₦{(plan.minInvestment / 1000).toFixed(0)}K</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Closes in</p>
              <p className="font-semibold text-sm">{daysLeft} days</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{plan.moratoriumMonths} months moratorium period</span>
          </div>

          <Link href={`/dashboard/investment-plans/${plan.id}`} className="block">
            <Button className="w-full">
              View Details & Invest
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  // Property investment card (land or house)
  const progress =
    plan.type === "land" ? (plan.soldPlots / plan.totalPlots) * 100 : (plan.soldUnits / plan.totalUnits) * 100
  const daysLeft = Math.ceil((new Date(plan.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const estimatedROI = plan.type === "land" ? 15 : 12

  return (
    <Card className="overflow-hidden">
      {plan.images && plan.images.length > 0 && (
        <div className="relative h-48 bg-muted">
          <img src={plan.images[0] || "/placeholder.svg"} alt={plan.name} className="w-full h-full object-cover" />
          {plan.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              {plan.images.length} photos
            </div>
          )}
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {plan.type === "land" ? (
              <>
                <MapPin className="h-4 w-4 text-primary" />
                <Badge variant="secondary">Land Investment</Badge>
              </>
            ) : (
              <>
                <Home className="h-4 w-4 text-primary" />
                <Badge variant="outline">House Investment</Badge>
              </>
            )}
          </div>
          <h3 className="font-semibold text-lg leading-tight">{plan.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {plan.location}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{plan.type === "land" ? "Plots Sold" : "Units Sold"}</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{plan.type === "land" ? `${plan.soldPlots} plots sold` : `${plan.soldUnits} units sold`}</span>
            <span>{plan.type === "land" ? `${plan.totalPlots} total` : `${plan.totalUnits} total`}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs text-muted-foreground">Expected ROI</p>
            <p className="font-semibold text-green-600">{estimatedROI}% p.a.</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {plan.type === "land" ? "Price per Plot" : "Price per Unit"}
            </p>
            <p className="font-semibold">
              ₦{((plan.type === "land" ? plan.pricePerPlot : plan.pricePerUnit) / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs text-muted-foreground">Closes in</p>
          <p className="font-semibold text-sm">{daysLeft} days</p>
        </div>

        {plan.hasDocuments && (
          <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Documents available</span>
          </div>
        )}

        <Link href={`/dashboard/investment-plans/${plan.id}`} className="block">
          <Button className="w-full">
            View Details & Invest
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
