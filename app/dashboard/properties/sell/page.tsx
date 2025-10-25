import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"

export default function SellPropertyPage() {
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
          Property transfers require approval from the Housing Cooperative. Processing time is typically 14-21 business
          days.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Property Transfer Request</CardTitle>
          <CardDescription>Fill in the details to initiate a property transfer or sale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property">Select Property</Label>
            <Select>
              <SelectTrigger id="property">
                <SelectValue placeholder="Choose property to sell/transfer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">3 Bedroom Apartment - Apo Wasa</SelectItem>
                <SelectItem value="2">Land Plot - Lugbe Extension</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transferType">Transfer Type</Label>
            <Select>
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
            <Label htmlFor="buyerName">Buyer/Recipient Name</Label>
            <Input id="buyerName" placeholder="Enter full name of buyer/recipient" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerContact">Buyer/Recipient Contact</Label>
            <Input id="buyerContact" type="tel" placeholder="Enter phone number" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyerEmail">Buyer/Recipient Email</Label>
            <Input id="buyerEmail" type="email" placeholder="Enter email address" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salePrice">Sale/Transfer Price</Label>
            <Input id="salePrice" type="number" placeholder="Enter agreed price (₦)" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Transfer</Label>
            <Textarea id="reason" placeholder="Explain the reason for this property transfer" rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Supporting Documents</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Upload transfer agreement and supporting documents</p>
              <Button variant="outline" size="sm">
                Choose Files
              </Button>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Transfer Fee:</strong> A processing fee of 2% of the property value will be charged for this
              transfer.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button className="flex-1">Submit Transfer Request</Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/properties/manage">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
