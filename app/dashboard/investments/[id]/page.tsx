"use client"

import { use, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Download, TrendingUp, Calendar, FileText, ImageIcon } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

export default function InvestmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAddSharesDialog, setShowAddSharesDialog] = useState(false)
  const [additionalShares, setAdditionalShares] = useState("")
  const [loading, setLoading] = useState(false)

  // Mock data
  const investment = {
    id,
    title: "Modern 3-Bedroom Apartment",
    type: "Property Investment",
    location: "Lekki Phase 1, Lagos",
    investedAmount: 5000000,
    currentValue: 5410000,
    shares: 11,
    totalShares: 100,
    sharePrice: 500000,
    appreciation: 8.2,
    roi: "12-15%",
    purchaseDate: "Jan 15, 2024",
    maturityDate: "Jan 15, 2029",
    status: "active",
    description: "Premium 3-bedroom apartment in prime Lekki location with excellent appreciation potential.",
    features: ["24/7 Security", "Swimming Pool", "Gym", "Parking Space", "Generator"],
    images: ["/modern-apartment-building.png", "/modern-living-room.png", "/modern-kitchen.png", "/modern-bedroom.png"],
    documents: [
      { name: "Investment Certificate", type: "PDF", size: "2.5 MB", date: "Jan 15, 2024" },
      { name: "Property Title", type: "PDF", size: "1.8 MB", date: "Jan 15, 2024" },
      { name: "Valuation Report", type: "PDF", size: "3.2 MB", date: "Jan 15, 2024" },
    ],
    transactions: [
      { date: "Jan 15, 2024", type: "Initial Investment", amount: 5000000, status: "completed" },
      { date: "Feb 1, 2024", type: "Dividend Payment", amount: 50000, status: "completed" },
      { date: "Mar 1, 2024", type: "Dividend Payment", amount: 50000, status: "completed" },
    ],
  }

  const profitLoss = investment.currentValue - investment.investedAmount
  const profitLossPercentage = ((profitLoss / investment.investedAmount) * 100).toFixed(2)
  const availableShares = investment.totalShares - investment.shares

  const handleAddShares = () => {
    if (!additionalShares || Number.parseInt(additionalShares) <= 0) {
      toast.error("Please enter a valid number of shares")
      return
    }

    if (Number.parseInt(additionalShares) > availableShares) {
      toast.error(`Only ${availableShares} shares available`)
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setShowAddSharesDialog(false)
      toast.success(`Successfully added ${additionalShares} shares to your investment`)
      setAdditionalShares("")
    }, 1500)
  }

  const handleDownload = (documentName: string) => {
    toast.success(`Downloading ${documentName}...`)
    // In production, this would trigger actual file download
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/investments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{investment.title}</h1>
          <p className="text-muted-foreground">{investment.location}</p>
        </div>
        <Badge>{investment.status}</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardContent className="p-0">
              <img
                src={investment.images[selectedImage] || "/placeholder.svg"}
                alt={investment.title}
                className="w-full h-96 object-cover rounded-t-lg"
              />
              <div className="grid grid-cols-4 gap-2 p-4">
                {investment.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded overflow-hidden ${selectedImage === index ? "ring-2 ring-primary" : ""}`}
                  >
                    <img src={img || "/placeholder.svg"} alt="" className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Details</CardTitle>
                  <CardDescription>Complete information about your investment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{investment.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Property Features</h3>
                    <div className="grid md:grid-cols-2 gap-2">
                      {investment.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                      <label className="text-sm text-muted-foreground">Purchase Date</label>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {investment.purchaseDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Maturity Date</label>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {investment.maturityDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Expected ROI</label>
                      <p className="font-medium text-green-600 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {investment.roi}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Investment Type</label>
                      <p className="font-medium">{investment.type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Documents</CardTitle>
                  <CardDescription>Download certificates and related documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investment.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {doc.size} • {doc.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownload(doc.name)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(doc.name)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>All transactions related to this investment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investment.transactions.map((txn, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{txn.type}</p>
                          <p className="text-sm text-muted-foreground">{txn.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {txn.type.includes("Payment") || txn.type.includes("Dividend") ? "+" : ""}₦
                            {txn.amount.toLocaleString()}
                          </p>
                          <Badge variant={txn.status === "completed" ? "default" : "secondary"}>{txn.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Invested Amount</label>
                <p className="text-2xl font-bold">₦{investment.investedAmount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Current Value</label>
                <p className="text-2xl font-bold text-green-600">₦{investment.currentValue.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Profit/Loss</label>
                <p className={`text-xl font-semibold ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {profitLoss >= 0 ? "+" : ""}₦{profitLoss.toLocaleString()} ({profitLossPercentage}%)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ownership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Your Shares</span>
                  <span className="font-medium">
                    {investment.shares}/{investment.totalShares} ({investment.shares}%)
                  </span>
                </div>
                <Progress value={investment.shares} />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Share Price: ₦{investment.sharePrice.toLocaleString()}</p>
                <p>Available Shares: {availableShares}</p>
              </div>
              <Button className="w-full" onClick={() => setShowAddSharesDialog(true)}>
                Add More Shares
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => handleDownload("Investment Certificate")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <ImageIcon className="h-4 w-4 mr-2" />
                View Gallery
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                View All Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showAddSharesDialog} onOpenChange={setShowAddSharesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add More Shares</DialogTitle>
            <DialogDescription>Increase your investment by purchasing additional shares</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Share Price:</span>
                <span className="font-semibold">₦{investment.sharePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Shares:</span>
                <span className="font-semibold">{availableShares}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Current Shares:</span>
                <span className="font-semibold">{investment.shares}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shares">Number of Shares</Label>
              <Input
                id="shares"
                type="number"
                placeholder="Enter number of shares"
                value={additionalShares}
                onChange={(e) => setAdditionalShares(e.target.value)}
                min="1"
                max={availableShares}
              />
            </div>

            {additionalShares && Number.parseInt(additionalShares) > 0 && (
              <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Investment:</span>
                  <span className="text-xl font-bold text-primary">
                    ₦{(Number.parseInt(additionalShares) * investment.sharePrice).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSharesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddShares} disabled={loading || !additionalShares}>
              {loading ? "Processing..." : "Purchase Shares"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
