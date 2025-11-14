"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { getMemberProperties, getPropertyPaymentSetup, getPropertyDocuments, type MemberHouse, type PropertyPaymentSetup, type PropertyPaymentHistoryEntry } from "@/lib/api/client"

function formatCurrency(amount: number | null | undefined) {
  if (!amount || Number.isNaN(amount)) return "₦0"
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

function formatDate(date: string | null | undefined) {
  if (!date) return "—"
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

type PropertyWithDetails = MemberHouse & {
  paymentSetup?: PropertyPaymentSetup | null
  documents?: Array<{ id: string; name: string; url?: string }>
}

export default function MyPropertyPage() {
  const { toast } = useToast()
  const [properties, setProperties] = useState<PropertyWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await getMemberProperties()
        if (response.success) {
          setProperties(response.properties || [])
        } else {
          toast({
            title: "Unable to load properties",
            description: "We could not load your properties. Please try again later.",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        toast({
          title: "Error loading properties",
          description: error?.message || "An error occurred while loading your properties.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    void fetchProperties()
  }, [toast])

  const fetchPropertyDetails = async (propertyId: string) => {
    if (loadingDetails[propertyId] || properties.find((p) => p.id === propertyId)?.paymentSetup) {
      return
    }

    try {
      setLoadingDetails((prev) => ({ ...prev, [propertyId]: true }))
      const [paymentSetupResponse, documentsResponse] = await Promise.allSettled([
        getPropertyPaymentSetup(propertyId),
        getPropertyDocuments(propertyId),
      ])

      setProperties((prev) =>
        prev.map((prop) => {
          if (prop.id === propertyId) {
            const paymentSetup =
              paymentSetupResponse.status === "fulfilled" && paymentSetupResponse.value.success
                ? paymentSetupResponse.value.data
                : null
            const documents =
              documentsResponse.status === "fulfilled" && documentsResponse.value.success
                ? documentsResponse.value.data?.map((doc: any) => ({
                    id: doc.id,
                    name: doc.name || doc.title || "Document",
                    url: doc.url || doc.file_url,
                  }))
                : []

            return {
              ...prop,
              paymentSetup,
              documents,
            }
          }
          return prop
        }),
      )
    } catch (error) {
      console.error(`Error loading details for property ${propertyId}:`, error)
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [propertyId]: false }))
    }
  }

  const totalInvestment = useMemo(() => {
    return properties.reduce((sum, p) => sum + (p.price || 0), 0)
  }, [properties])

  const totalValue = useMemo(() => {
    return properties.reduce((sum, p) => sum + (p.current_value || p.price || 0), 0)
  }, [properties])

  const appreciation = totalValue - totalInvestment

  const houses = useMemo(() => properties.filter((p) => p.type?.toLowerCase() === "house"), [properties])
  const lands = useMemo(() => properties.filter((p) => p.type?.toLowerCase() === "land"), [properties])

  const renderPropertyCard = (property: PropertyWithDetails) => {
    const isHouse = property.type?.toLowerCase() === "house"
    const progress = property.progress || 0
    const isFullyPaid = progress >= 100
    const paymentHistory = property.paymentSetup?.payment_history || []
    const ledgerEntries = property.paymentSetup?.ledger_entries || []

    // Combine payment history and ledger entries
    const allPayments: Array<{
      id: string
      date: string
      amount: number
      type: string
      status: string
      receipt?: string
    }> = [
      ...paymentHistory.map((payment: PropertyPaymentHistoryEntry) => ({
        id: payment.id,
        date: payment.created_at || new Date().toISOString(),
        amount: payment.amount || 0,
        type: payment.payment_method?.replace(/_/g, " ") || "Payment",
        status: payment.status === "completed" || payment.status === "success" ? "Paid" : "Pending",
        receipt: payment.reference || undefined,
      })),
      ...ledgerEntries
        .filter((entry) => entry.direction === "credit")
        .map((entry) => ({
          id: entry.id,
          date: entry.paid_at || entry.created_at || new Date().toISOString(),
          amount: entry.amount || 0,
          type: entry.source?.replace(/_/g, " ") || "Ledger Entry",
          status: entry.status === "completed" ? "Paid" : "Pending",
          receipt: entry.reference || undefined,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
      <Card key={property.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {isHouse ? <Home className="h-5 w-5 text-primary" /> : <MapPinned className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <CardTitle>{property.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-3 w-3" />
                  {property.location}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isFullyPaid ? "default" : "secondary"}>
              {isFullyPaid ? "Fully Paid" : `${progress.toFixed(0)}% Paid`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Details */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-semibold">{property.type || "—"}</p>
            </div>
            {property.size && (
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-semibold">{property.size} {isHouse ? "sqm" : "sqm"}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Purchase Price</p>
              <p className="font-semibold">{formatCurrency(property.price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="font-semibold text-green-600">{formatCurrency(property.current_value || property.price)}</p>
            </div>
          </div>

          {/* Payment History */}
          {allPayments.length > 0 && (
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
                  {allPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell className="capitalize">{payment.type}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
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
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Documents */}
          {property.documents && property.documents.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Property Documents
              </h4>
              <div className="flex flex-wrap gap-2">
                {property.documents.map((doc) => (
                  <Button key={doc.id} variant="outline" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3 w-3 mr-1" />
                      {doc.name}
                      <Download className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Link href={`/dashboard/properties/${property.id}`}>
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                View Full Details
              </Button>
            </Link>
            {property.documents && property.documents.length > 0 && (
              <Button variant="outline" onClick={() => property.documents?.forEach((doc) => doc.url && window.open(doc.url, "_blank"))}>
                <Download className="h-4 w-4 mr-2" />
                Download All Documents
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (!property.paymentSetup) {
                  void fetchPropertyDetails(property.id)
                }
              }}
              disabled={loadingDetails[property.id]}
            >
              {loadingDetails[property.id] ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Load Details
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Property</h1>
          <p className="text-muted-foreground">View properties you have acquired, payment details, and statutory charges</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Property</h1>
        <p className="text-muted-foreground">View properties you have acquired, payment details, and statutory charges</p>
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
              {houses.length} House{houses.length !== 1 ? "s" : ""}, {lands.length} Land{lands.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
            <p className="text-xs text-muted-foreground">Purchase value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-green-600">+{formatCurrency(appreciation)} appreciation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fully Paid</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.filter((p) => (p.progress || 0) >= 100).length}</div>
            <p className="text-xs text-muted-foreground">Properties fully paid</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Properties ({properties.length})</TabsTrigger>
          <TabsTrigger value="house">Houses ({houses.length})</TabsTrigger>
          <TabsTrigger value="land">Land ({lands.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {properties.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                You have not acquired any properties yet. Browse available properties to get started.
              </CardContent>
            </Card>
          ) : (
            properties.map(renderPropertyCard)
          )}
        </TabsContent>

        <TabsContent value="house" className="space-y-4 mt-4">
          {houses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No house properties found</CardContent>
            </Card>
          ) : (
            houses.map(renderPropertyCard)
          )}
        </TabsContent>

        <TabsContent value="land" className="space-y-4 mt-4">
          {lands.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No land properties found</CardContent>
            </Card>
          ) : (
            lands.map(renderPropertyCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
