import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Building2,
  MapPin,
  DollarSign,
  FileText,
  Download,
  Eye,
  Receipt,
  CheckCircle2,
  Clock,
  Home,
  MapPinned,
} from "lucide-react"
import Link from "next/link"

export default function MyPropertyPage() {
  const properties = [
    {
      id: "1",
      name: "3 Bedroom Apartment - Apo Wasa",
      type: "House",
      location: "Apo Wasa, Abuja",
      size: "120 sqm",
      purchaseDate: "2023-06-15",
      purchasePrice: 15000000,
      currentValue: 18000000,
      status: "Fully Paid",
      paymentStatus: "completed",
      documents: ["Title Deed", "Certificate of Occupancy", "Building Plan"],
      payments: [
        { date: "2023-06-15", amount: 5000000, type: "Initial Deposit", status: "Paid", receipt: "RCP-001" },
        { date: "2023-09-15", amount: 5000000, type: "Second Installment", status: "Paid", receipt: "RCP-002" },
        { date: "2023-12-15", amount: 5000000, type: "Final Payment", status: "Paid", receipt: "RCP-003" },
      ],
      statutoryCharges: [
        { type: "TDP Fee", amount: 150000, status: "Paid", date: "2023-06-20", receipt: "SC-001" },
        { type: "Building Plan Approval", amount: 75000, status: "Paid", date: "2023-07-10", receipt: "SC-002" },
        { type: "Annual Property Tax", amount: 50000, status: "Pending", dueDate: "2025-01-31" },
      ],
    },
    {
      id: "2",
      name: "Land Plot - Lugbe Extension",
      type: "Land",
      location: "Lugbe Extension, Abuja",
      size: "700 sqm",
      purchaseDate: "2024-01-20",
      purchasePrice: 8000000,
      currentValue: 9500000,
      status: "Payment in Progress",
      paymentStatus: "partial",
      documents: ["Survey Plan", "Certificate of Occupancy"],
      payments: [
        { date: "2024-01-20", amount: 4000000, type: "Initial Deposit", status: "Paid", receipt: "RCP-004" },
        { date: "2024-06-20", amount: 4000000, type: "Final Payment", status: "Pending", dueDate: "2025-06-20" },
      ],
      statutoryCharges: [
        { type: "Survey Fee", amount: 100000, status: "Paid", date: "2024-01-25", receipt: "SC-003" },
        { type: "Land Registration", amount: 200000, status: "Pending", dueDate: "2025-02-28" },
      ],
    },
  ]

  const totalInvestment = properties.reduce((sum, p) => sum + p.purchasePrice, 0)
  const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0)
  const appreciation = totalValue - totalInvestment

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Property</h1>
        <p className="text-muted-foreground">
          View properties you have acquired, payment details, and statutory charges
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">
              {properties.filter((p) => p.type === "House").length} House,{" "}
              {properties.filter((p) => p.type === "Land").length} Land
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(totalInvestment / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Purchase value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(totalValue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-green-600">+₦{(appreciation / 1000000).toFixed(1)}M appreciation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Charges</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties.reduce((sum, p) => sum + p.statutoryCharges.filter((c) => c.status === "Pending").length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Statutory charges due</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="house">Houses ({properties.filter((p) => p.type === "House").length})</TabsTrigger>
          <TabsTrigger value="land">Land ({properties.filter((p) => p.type === "Land").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {property.type === "House" ? (
                        <Home className="h-5 w-5 text-primary" />
                      ) : (
                        <MapPinned className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle>{property.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={property.paymentStatus === "completed" ? "default" : "secondary"}>
                    {property.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Details */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-semibold">{property.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Price</p>
                    <p className="font-semibold">₦{(property.purchasePrice / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="font-semibold text-green-600">₦{(property.currentValue / 1000000).toFixed(1)}M</p>
                  </div>
                </div>

                {/* Payment History */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Payment History
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {property.payments.map((payment, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>{payment.type}</TableCell>
                          <TableCell>₦{(payment.amount / 1000000).toFixed(1)}M</TableCell>
                          <TableCell>
                            {payment.status === "Paid" ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Paid
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {payment.receipt ? (
                              <Button variant="ghost" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                {payment.receipt}
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">Due: {payment.dueDate}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Statutory Charges */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Statutory Charges
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Charge Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date/Due Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {property.statutoryCharges.map((charge, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{charge.type}</TableCell>
                          <TableCell>₦{charge.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {charge.status === "Paid" ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Paid
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{charge.status === "Paid" ? charge.date : `Due: ${charge.dueDate}`}</TableCell>
                          <TableCell>
                            {charge.status === "Paid" ? (
                              <Button variant="ghost" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                {charge.receipt}
                              </Button>
                            ) : (
                              <Button size="sm">Pay Now</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Property Documents
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {property.documents.map((doc, idx) => (
                      <Button key={idx} variant="outline" size="sm">
                        <FileText className="h-3 w-3 mr-1" />
                        {doc}
                        <Download className="h-3 w-3 ml-2" />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Link href={`/dashboard/properties/${property.id}`}>
                    <Button>
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                  </Link>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download All Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="house" className="space-y-4 mt-4">
          {properties
            .filter((p) => p.type === "House")
            .map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{property.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={property.paymentStatus === "completed" ? "default" : "secondary"}>
                      {property.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-semibold">{property.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purchase Price</p>
                      <p className="font-semibold">₦{(property.purchasePrice / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="font-semibold text-green-600">₦{(property.currentValue / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Appreciation</p>
                      <p className="font-semibold text-green-600">
                        +₦{((property.currentValue - property.purchasePrice) / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/properties/${property.id}`}>
                    <Button>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          {properties.filter((p) => p.type === "House").length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No house properties found</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="land" className="space-y-4 mt-4">
          {properties
            .filter((p) => p.type === "Land")
            .map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPinned className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{property.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={property.paymentStatus === "completed" ? "default" : "secondary"}>
                      {property.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-semibold">{property.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purchase Price</p>
                      <p className="font-semibold">₦{(property.purchasePrice / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="font-semibold text-green-600">₦{(property.currentValue / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Appreciation</p>
                      <p className="font-semibold text-green-600">
                        +₦{((property.currentValue - property.purchasePrice) / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/properties/${property.id}`}>
                    <Button>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          {properties.filter((p) => p.type === "Land").length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No land properties found</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
