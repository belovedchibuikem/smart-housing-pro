import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, Package } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function MySubscriptionsPage() {
  const activeSubscription = {
    package: "Monthly Standard",
    price: 1500,
    startDate: "Dec 15, 2024",
    endDate: "Jan 15, 2025",
    status: "active",
    daysRemaining: 16,
  }

  const subscriptionHistory = [
    {
      id: 1,
      package: "Monthly Standard",
      price: 1500,
      startDate: "Dec 15, 2024",
      endDate: "Jan 15, 2025",
      status: "active",
      paymentMethod: "Paystack",
    },
    {
      id: 2,
      package: "Weekly Basic",
      price: 500,
      startDate: "Dec 8, 2024",
      endDate: "Dec 15, 2024",
      status: "expired",
      paymentMethod: "Bank Transfer",
    },
    {
      id: 3,
      package: "Weekly Basic",
      price: 500,
      startDate: "Dec 1, 2024",
      endDate: "Dec 8, 2024",
      status: "expired",
      paymentMethod: "Remita",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Subscriptions</h1>
          <p className="text-muted-foreground">Manage your subscription and view history</p>
        </div>
        <Link href="/subscription">
          <Button>
            <Package className="h-4 w-4 mr-2" />
            View All Packages
          </Button>
        </Link>
      </div>

      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Subscription</CardTitle>
              <CardDescription>Your current subscription plan</CardDescription>
            </div>
            <Badge className="bg-green-600">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Package</div>
                <div className="font-semibold">{activeSubscription.package}</div>
                <div className="text-sm text-muted-foreground">₦{activeSubscription.price.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Valid Period</div>
                <div className="font-semibold">{activeSubscription.startDate}</div>
                <div className="text-sm text-muted-foreground">to {activeSubscription.endDate}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Days Remaining</div>
                <div className="font-semibold text-2xl">{activeSubscription.daysRemaining}</div>
                <Link href="/subscription">
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Renew Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
          <CardDescription>View all your past and current subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptionHistory.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.package}</TableCell>
                  <TableCell>₦{sub.price.toLocaleString()}</TableCell>
                  <TableCell>{sub.startDate}</TableCell>
                  <TableCell>{sub.endDate}</TableCell>
                  <TableCell>{sub.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant={sub.status === "active" ? "default" : "secondary"}>{sub.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
