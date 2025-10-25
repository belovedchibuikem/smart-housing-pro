import { Building2, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function PostServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">FRSC Post Service Scheme</h1>
        <p className="text-muted-foreground mt-1">Automate your housing contributions from your Post Service account</p>
      </div>

      {/* Connection Status */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-500" />
              <CardTitle>Post Service Account Status</CardTitle>
            </div>
            <Badge className="bg-green-500">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="text-lg font-bold text-foreground">PSS-2024-12345</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-lg font-bold text-foreground">₦450,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="text-lg font-bold text-foreground">5 mins ago</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Balance
          </Button>
        </CardContent>
      </Card>

      {/* Automated Funding Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Funding Settings</CardTitle>
          <CardDescription>
            Set up automatic transfers from your Post Service account to your housing wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Automated Funding</Label>
              <p className="text-sm text-muted-foreground">Automatically transfer funds for monthly contributions</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Monthly Transfer Amount</Label>
                <Input type="number" placeholder="Enter amount" defaultValue="50000" />
              </div>
              <div className="space-y-2">
                <Label>Transfer Day</Label>
                <Input type="number" placeholder="Day of month" defaultValue="25" />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">How it works</p>
                  <p className="text-sm text-muted-foreground">
                    On the 25th of each month, ₦50,000 will be automatically transferred from your Post Service account
                    to your housing wallet. This ensures your monthly contributions are always paid on time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Quick Transfer */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Transfer</CardTitle>
          <CardDescription>Transfer funds from Post Service to your housing wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Transfer Amount</Label>
            <Input type="number" placeholder="Enter amount to transfer" />
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available Balance</span>
              <span className="font-medium text-foreground">₦450,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transfer Fee</span>
              <span className="font-medium text-foreground">₦0</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-medium text-foreground">You will receive</span>
              <span className="font-bold text-foreground">₦0</span>
            </div>
          </div>

          <Button className="w-full">
            Transfer to Wallet
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Transfer History */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
          <CardDescription>Recent transfers from Post Service account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-foreground">Monthly Contribution</p>
                <p className="text-sm text-muted-foreground">March 25, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">₦50,000</p>
                <Badge className="bg-green-500">Completed</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-foreground">Monthly Contribution</p>
                <p className="text-sm text-muted-foreground">February 25, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">₦50,000</p>
                <Badge className="bg-green-500">Completed</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-foreground">Manual Transfer</p>
                <p className="text-sm text-muted-foreground">February 10, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">₦100,000</p>
                <Badge className="bg-green-500">Completed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link Account Card (if not connected) */}
      {/* <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-500" />
            <CardTitle>Link Your Post Service Account</CardTitle>
          </div>
          <CardDescription>
            Connect your FRSC Post Service Scheme account to enable automated funding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Post Service Account Number</Label>
            <Input placeholder="Enter your PSS account number" />
          </div>
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <Input placeholder="Enter verification code sent to your phone" />
          </div>
          <Button className="w-full">
            <LinkIcon className="mr-2 h-4 w-4" />
            Link Account
          </Button>
        </CardContent>
      </Card> */}
    </div>
  )
}
