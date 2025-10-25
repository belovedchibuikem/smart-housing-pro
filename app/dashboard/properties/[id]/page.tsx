import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyDetailsTab } from "@/components/properties/property-details-tab"
import { PropertyPaymentTab } from "@/components/properties/property-payment-tab"
import { PropertyDocumentsTab } from "@/components/properties/property-documents-tab"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PropertyDetailPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/properties">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Property Details</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <PropertyDetailsTab />
        </TabsContent>

        <TabsContent value="payment">
          <PropertyPaymentTab />
        </TabsContent>

        <TabsContent value="documents">
          <PropertyDocumentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
