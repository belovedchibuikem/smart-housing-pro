import { Plus, Search, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AdminBlockchainPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blockchain Management</h1>
          <p className="text-muted-foreground mt-1">Manage property ownership records on the blockchain</p>
        </div>
        <Button asChild>
          <Link href="/admin/blockchain/new">
            <Plus className="mr-2 h-4 w-4" />
            Register Property
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">156</div>
            <p className="text-xs text-muted-foreground mt-1">On blockchain</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified Owners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">423</div>
            <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Network Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-lg font-bold text-foreground">Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ethereum Mainnet</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by property ID, owner, or transaction hash..." className="pl-9" />
        </div>
        <Button>Search</Button>
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Property Records</CardTitle>
          <CardDescription>All properties registered on the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property ID</TableHead>
                <TableHead>Property Name</TableHead>
                <TableHead>Owner(s)</TableHead>
                <TableHead>Blockchain Hash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">FRSC-PROP-001</TableCell>
                <TableCell>Lekki Phase 2 Apartment</TableCell>
                <TableCell>3 Owners</TableCell>
                <TableCell>
                  <code className="text-xs">0x742d35...f0bEb</code>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Verified</Badge>
                </TableCell>
                <TableCell>Jan 15, 2024</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">FRSC-PROP-002</TableCell>
                <TableCell>Abuja Gwarinpa Estate</TableCell>
                <TableCell>5 Owners</TableCell>
                <TableCell>
                  <code className="text-xs">0x8f3Cf7...6A063</code>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-500">Verified</Badge>
                </TableCell>
                <TableCell>Feb 20, 2024</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">FRSC-PROP-003</TableCell>
                <TableCell>Port Harcourt GRA</TableCell>
                <TableCell>2 Owners</TableCell>
                <TableCell>
                  <code className="text-xs">0x1a2b3c...d4e5f</code>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                </TableCell>
                <TableCell>Mar 10, 2024</TableCell>
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
