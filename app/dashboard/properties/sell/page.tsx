"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getMemberProperties, type MemberHouse } from "@/lib/api/client"
import { apiFetch } from "@/lib/api/client"

function formatCurrency(amount: number | null | undefined) {
  if (!amount || Number.isNaN(amount)) return "₦0"
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

export default function SellPropertyPage() {
  const { toast } = useToast()
  const [properties, setProperties] = useState<MemberHouse[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    property_id: "",
    transfer_type: "",
    buyer_name: "",
    buyer_contact: "",
    buyer_email: "",
    sale_price: "",
    reason: "",
    documents: [] as File[],
  })

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await getMemberProperties()
        if (response.success) {
          // Only show fully paid properties
          const fullyPaidProperties = (response.properties || []).filter((p) => (p.progress || 0) >= 100)
          setProperties(fullyPaidProperties)
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

  const selectedProperty = properties.find((p) => p.id === formData.property_id)
  const transferFee = selectedProperty
    ? Math.round((selectedProperty.current_value || selectedProperty.price || 0) * 0.02)
    : 0

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        documents: Array.from(e.target.files || []),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.property_id || !formData.transfer_type || !formData.buyer_name || !formData.sale_price) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const formDataToSend = new FormData()
      formDataToSend.append("property_id", formData.property_id)
      formDataToSend.append("transfer_type", formData.transfer_type)
      formDataToSend.append("buyer_name", formData.buyer_name)
      formDataToSend.append("buyer_contact", formData.buyer_contact)
      formDataToSend.append("buyer_email", formData.buyer_email)
      formDataToSend.append("sale_price", formData.sale_price)
      formDataToSend.append("reason", formData.reason)

      formData.documents.forEach((file, index) => {
        formDataToSend.append(`documents[${index}]`, file)
      })

      const response = await apiFetch<{ success: boolean; message: string; data?: any }>("/properties/transfer", {
        method: "POST",
        body: formDataToSend,
        headers: {}, // Let browser set multipart headers
      })

      if (response.success) {
        toast({
          title: "Transfer request submitted",
          description: response.message || "Your property transfer request has been submitted successfully.",
        })
        // Reset form
        setFormData({
          property_id: "",
          transfer_type: "",
          buyer_name: "",
          buyer_contact: "",
          buyer_email: "",
          sale_price: "",
          reason: "",
          documents: [],
        })
      } else {
        throw new Error(response.message || "Failed to submit transfer request")
      }
    } catch (error: any) {
      toast({
        title: "Error submitting request",
        description: error?.message || "An error occurred while submitting your transfer request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/properties/manage">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Sell My Property</h1>
          <p className="text-muted-foreground">Transfer or sell your property to another member</p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Property transfers require approval from the Housing Cooperative. Processing time is typically 14-21 business days.
          Only fully paid properties can be transferred.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Property Transfer Request</CardTitle>
          <CardDescription>Fill in the details to initiate a property transfer or sale</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : properties.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have any fully paid properties available for transfer. Properties must be fully paid before they can be transferred.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property">Select Property *</Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, property_id: value }))}
                >
                  <SelectTrigger id="property">
                    <SelectValue placeholder="Choose property to sell/transfer" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - {property.location} ({formatCurrency(property.current_value || property.price)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProperty && (
                  <p className="text-sm text-muted-foreground">
                    Current Value: {formatCurrency(selectedProperty.current_value || selectedProperty.price)} • Transfer Fee:{" "}
                    {formatCurrency(transferFee)} (2%)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferType">Transfer Type *</Label>
                <Select
                  value={formData.transfer_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, transfer_type: value }))}
                >
                  <SelectTrigger id="transferType">
                    <SelectValue placeholder="Select transfer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale to Another Member</SelectItem>
                    <SelectItem value="gift">Gift/Transfer to Family</SelectItem>
                    <SelectItem value="external">Sale to External Party</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerName">Buyer/Recipient Name *</Label>
                <Input
                  id="buyerName"
                  placeholder="Enter full name of buyer/recipient"
                  value={formData.buyer_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, buyer_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerContact">Buyer/Recipient Contact</Label>
                <Input
                  id="buyerContact"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.buyer_contact}
                  onChange={(e) => setFormData((prev) => ({ ...prev, buyer_contact: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerEmail">Buyer/Recipient Email</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.buyer_email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, buyer_email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale/Transfer Price *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  placeholder="Enter agreed price (₦)"
                  value={formData.sale_price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sale_price: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Transfer</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain the reason for this property transfer"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Supporting Documents</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload transfer agreement and supporting documents (PDF, JPG, PNG)
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Choose Files
                  </Button>
                  {formData.documents.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {formData.documents.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Transfer Fee:</strong> A processing fee of 2% of the property value ({formatCurrency(transferFee)}) will be
                  charged for this transfer.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Transfer Request"
                  )}
                </Button>
                <Button variant="outline" asChild disabled={submitting}>
                  <Link href="/dashboard/properties/manage">Cancel</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
