"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Calendar, TrendingUp, Clock, FileText, Download, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function InvestmentPlanDetailPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("direct")
  const [isLoading, setIsLoading] = useState(false)

  // Mock data
  const plan = {
    id: "1",
    name: "Housing Development Project Phase 3",
    description:
      "Invest in our latest housing development project featuring modern residential units with attractive returns. This project aims to provide quality housing while offering competitive returns to our investors.",
    targetAmount: 50000000,
    currentAmount: 32500000,
    roi: 15,
    roiPaymentMode: "Quarterly",
    closingDate: "2024-12-31",
    moratoriumMonths: 6,
    minInvestment: 100000,
    maxInvestment: 5000000,
    status: "open",
  }

  const contributionBalance = 2500000
  const myInvestments = [
    { date: "2024-01-15", amount: 1000000, method: "Direct Payment", status: "Completed" },
    { date: "2024-02-10", amount: 500000, method: "Contribution Balance", status: "Completed" },
    { date: "2024-03-05", amount: 500000, method: "Direct Payment", status: "Completed" },
  ]

  const totalInvested = myInvestments.reduce((sum, inv) => sum + inv.amount, 0)
  const progress = (plan.currentAmount / plan.targetAmount) * 100
  const daysLeft = Math.ceil((new Date(plan.closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const handleInvest = async () => {
    const investAmount = Number(amount)
    if (investAmount < plan.minInvestment || investAmount > plan.maxInvestment) {
      alert(
        `Investment must be between ₦${plan.minInvestment.toLocaleString()} and ₦${plan.maxInvestment.toLocaleString()}`,
      )
      return
    }

    if (paymentMethod === "contribution" && investAmount > contributionBalance) {
      alert("Insufficient contribution balance")
      return
    }

    setIsLoading(true)
    // Simulate investment processing
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard/investment-plans/investment-success")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/investment-plans">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Investment Plans
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{plan.name}</h1>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </div>
                <Badge variant="default">Open</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    ROI
                  </p>
                  <p className="text-2xl font-bold text-green-600">{plan.roi}%</p>
                  <p className="text-xs text-muted-foreground">per annum</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Payment
                  </p>
                  <p className="text-lg font-semibold">{plan.roiPaymentMode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Moratorium
                  </p>
                  <p className="text-lg font-semibold">{plan.moratoriumMonths} months</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Closes in
                  </p>
                  <p className="text-lg font-semibold">{daysLeft} days</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Investment Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Raised</span>
                <span className="font-semibold">₦{plan.currentAmount.toLocaleString()}</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{progress.toFixed(1)}% of target</span>
                <span className="font-semibold">₦{plan.targetAmount.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">My Investments ({myInvestments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-2">Investment Range</h4>
                  <p className="text-sm text-muted-foreground">
                    Minimum: ₦{plan.minInvestment.toLocaleString()} | Maximum: ₦{plan.maxInvestment.toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Moratorium Period</h4>
                  <p className="text-sm text-muted-foreground">
                    There is a {plan.moratoriumMonths}-month grace period before the investment starts yielding profit.
                    This allows time for project setup and initial development.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Multiple Investments</h4>
                  <p className="text-sm text-muted-foreground">
                    You can invest multiple times in this plan until the closing date. Each investment will be tracked
                    separately with date and time stamps. Your certificate will be issued when the investment window
                    closes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Options</h4>
                  <p className="text-sm text-muted-foreground">
                    You can invest using your contribution balance or make direct payments through various payment
                    gateways (Paystack, Remita, Bank Transfer, etc.).
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                {myInvestments.length > 0 ? (
                  <div className="space-y-3">
                    {myInvestments.map((investment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-semibold">₦{investment.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{investment.date}</p>
                          <p className="text-xs text-muted-foreground">{investment.method}</p>
                        </div>
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {investment.status}
                        </Badge>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Invested</span>
                        <span className="text-xl font-bold">₦{totalInvested.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>You haven't made any investments in this plan yet</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Make Investment</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={plan.minInvestment}
                  max={plan.maxInvestment}
                />
                <p className="text-xs text-muted-foreground">
                  Min: ₦{plan.minInvestment.toLocaleString()} | Max: ₦{plan.maxInvestment.toLocaleString()}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="contribution" id="contribution" />
                    <Label htmlFor="contribution" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Contribution Balance</p>
                        <p className="text-sm text-muted-foreground">
                          Available: ₦{contributionBalance.toLocaleString()}
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="direct" id="direct" />
                    <Label htmlFor="direct" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Direct Payment</p>
                        <p className="text-sm text-muted-foreground">Paystack, Remita, Bank Transfer</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button className="w-full" size="lg" onClick={handleInvest} disabled={isLoading || !amount}>
                {isLoading ? "Processing..." : "Invest Now"}
              </Button>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  You can make multiple investments until {new Date(plan.closingDate).toLocaleDateString()}. Your
                  certificate will be issued when the window closes.
                </p>
              </div>
            </div>
          </Card>

          {totalInvested > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Your Investment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-semibold">₦{totalInvested.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Number of Investments</span>
                  <span className="font-semibold">{myInvestments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected Annual ROI</span>
                  <span className="font-semibold text-green-600">
                    ₦{(totalInvested * (plan.roi / 100)).toLocaleString()}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Investment Summary
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
