import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyListings } from "@/components/properties/property-listings"
import { MyInvestments } from "@/components/properties/my-investments"
import { InvestmentSummary } from "@/components/properties/investment-summary"

export default function PropertiesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Properties & Investments</h1>
        <p className="text-muted-foreground mt-1">Browse properties and manage your investment portfolio</p>
      </div>

      <InvestmentSummary />

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Properties</TabsTrigger>
          <TabsTrigger value="investments">My Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <PropertyListings />
        </TabsContent>

        <TabsContent value="investments">
          <MyInvestments />
        </TabsContent>
      </Tabs>
    </div>
  )
}
