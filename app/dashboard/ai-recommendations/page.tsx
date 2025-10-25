import { Sparkles, TrendingUp, Shield, Clock, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function AIRecommendationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Investment Recommendations</h1>
          <p className="text-muted-foreground mt-1">Personalized investment suggestions powered by AI</p>
        </div>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Recommendations
        </Button>
      </div>

      {/* AI Analysis Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Your Investment Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Risk Tolerance</p>
              <p className="text-2xl font-bold text-foreground">Moderate</p>
              <Progress value={60} className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Investment Capacity</p>
              <p className="text-2xl font-bold text-foreground">₦2.5M</p>
              <Progress value={75} className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recommended Allocation</p>
              <p className="text-2xl font-bold text-foreground">₦1.8M</p>
              <Progress value={72} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Recommendations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Top Recommendations for You</h2>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle>Lekki Phase 2 - 3 Bedroom Apartment</CardTitle>
                  <Badge className="bg-green-500">Best Match</Badge>
                </div>
                <CardDescription>High-growth area with excellent ROI potential</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">₦15M</p>
                <p className="text-sm text-muted-foreground">Min. Investment: ₦500K</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Projected ROI</p>
                  <p className="font-semibold text-foreground">18-22% annually</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="font-semibold text-foreground">Low-Medium</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Horizon</p>
                  <p className="font-semibold text-foreground">3-5 years</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">AI Confidence</p>
                  <p className="font-semibold text-foreground">94%</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-background p-4 space-y-2">
              <p className="font-semibold text-foreground">Why this is recommended for you:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Matches your moderate risk tolerance and investment capacity</li>
                <li>• Located in high-growth area with strong infrastructure development</li>
                <li>• Your contribution history shows consistent monthly savings of ₦150K</li>
                <li>• Similar properties in the area have appreciated 35% in the last 2 years</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/dashboard/properties/1">
                  View Property Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle>Abuja Gwarinpa - 4 Bedroom Duplex</CardTitle>
                  <Badge variant="secondary">Good Match</Badge>
                </div>
                <CardDescription>Stable investment with steady appreciation</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">₦25M</p>
                <p className="text-sm text-muted-foreground">Min. Investment: ₦1M</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Projected ROI</p>
                  <p className="font-semibold text-foreground">15-18% annually</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="font-semibold text-foreground">Low</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Horizon</p>
                  <p className="font-semibold text-foreground">5-7 years</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">AI Confidence</p>
                  <p className="font-semibold text-foreground">87%</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/dashboard/properties/2">
                  View Property Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Port Harcourt GRA - Commercial Property</CardTitle>
                <CardDescription>Higher risk, higher potential returns</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">₦35M</p>
                <p className="text-sm text-muted-foreground">Min. Investment: ₦2M</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Projected ROI</p>
                  <p className="font-semibold text-foreground">25-30% annually</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="font-semibold text-foreground">Medium-High</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Horizon</p>
                  <p className="font-semibold text-foreground">2-4 years</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">AI Confidence</p>
                  <p className="font-semibold text-foreground">76%</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/dashboard/properties/3">
                  View Property Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
