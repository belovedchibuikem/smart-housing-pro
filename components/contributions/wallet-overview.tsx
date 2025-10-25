import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

export function WalletOverview() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="p-6 md:col-span-2">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold">₦125,000</h2>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Contributed</p>
            <p className="text-xl font-semibold">₦2,450,000</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">This Month</p>
            <p className="text-xl font-semibold">₦50,000</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Link href="/dashboard/wallet/top-up" className="flex-1">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Top Up Wallet
            </Button>
          </Link>
          <Link href="/dashboard/contributions/new" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <ArrowDownLeft className="h-4 w-4 mr-2" />
              Contribute
            </Button>
          </Link>
          <Link href="/dashboard/wallet/transfer" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Transfer
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Monthly Target</p>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold">₦50,000</p>
            <p className="text-xs text-muted-foreground mt-1">Required monthly contribution</p>
          </div>
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next Payment</span>
              <span className="font-medium">Dec 31, 2024</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600">On Track</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
