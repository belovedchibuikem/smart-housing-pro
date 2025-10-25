import { Shield, CheckCircle2, ExternalLink, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function BlockchainLedgerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blockchain Property Ledger</h1>
          <p className="text-muted-foreground mt-1">Immutable record of property ownership and transactions</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Records
        </Button>
      </div>

      {/* Blockchain Status */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            <CardTitle>Blockchain Verification Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Properties</p>
              <p className="text-2xl font-bold text-foreground">3</p>
              <Badge className="mt-2 bg-green-500">All Verified</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Blockchain Network</p>
              <p className="text-2xl font-bold text-foreground">Ethereum</p>
              <p className="text-sm text-muted-foreground mt-1">Mainnet</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="text-2xl font-bold text-foreground">2 mins ago</p>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <p className="text-sm text-muted-foreground">Synced</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by property ID, transaction hash, or address..." className="pl-9" />
        </div>
        <Button>Search</Button>
      </div>

      {/* Property Ownership Records */}
      <Card>
        <CardHeader>
          <CardTitle>Your Property Ownership Records</CardTitle>
          <CardDescription>Blockchain-verified property ownership certificates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Property 1 */}
            <Card className="border-green-500/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Lekki Phase 2 - 3 Bedroom Apartment</CardTitle>
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    </div>
                    <CardDescription>Property ID: FRSC-PROP-2024-001</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">35% Ownership</p>
                    <p className="text-sm text-muted-foreground">₦5,250,000</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Blockchain Hash</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
                      </code>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Certificate Date</p>
                    <p className="font-medium text-foreground mt-1">January 15, 2024</p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-3 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Transaction History</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initial Purchase</span>
                      <span className="text-foreground">Jan 15, 2024 - ₦5,250,000</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-3 w-3" />
                    Download Certificate
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="mr-2 h-3 w-3" />
                    View on Blockchain
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property 2 */}
            <Card className="border-green-500/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Abuja Gwarinpa Estate - Land</CardTitle>
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    </div>
                    <CardDescription>Property ID: FRSC-PROP-2024-002</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">50% Ownership</p>
                    <p className="text-sm text-muted-foreground">₦3,500,000</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Blockchain Hash</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063
                      </code>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Certificate Date</p>
                    <p className="font-medium text-foreground mt-1">February 20, 2024</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-3 w-3" />
                    Download Certificate
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="mr-2 h-3 w-3" />
                    View on Blockchain
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Blockchain Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Blockchain Transactions</CardTitle>
          <CardDescription>All property-related transactions recorded on the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Transaction Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Feb 20, 2024</TableCell>
                <TableCell>Abuja Gwarinpa Estate</TableCell>
                <TableCell>Purchase</TableCell>
                <TableCell>₦3,500,000</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Confirmed</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jan 15, 2024</TableCell>
                <TableCell>Lekki Phase 2 Apartment</TableCell>
                <TableCell>Purchase</TableCell>
                <TableCell>₦5,250,000</TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Confirmed</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
