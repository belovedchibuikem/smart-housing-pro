"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Building2, Check, Search } from "lucide-react"

export function BusinessSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const businesses = [
    { id: "1", name: "ABC Housing Cooperative", subdomain: "abc-housing" },
    { id: "2", name: "XYZ Properties Ltd", subdomain: "xyz-properties" },
    { id: "3", name: "City Housing Association", subdomain: "city-housing" },
    { id: "4", name: "Metro Cooperative Society", subdomain: "metro-coop" },
  ]

  const filteredBusinesses = businesses.filter((business) =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusiness(businessId)
    setIsOpen(false)
    // In production, this would redirect to the business admin panel
    // window.location.href = `/super-admin/view-business/${businessId}`
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="w-full justify-start">
        <Building2 className="h-4 w-4 mr-2" />
        {selectedBusiness ? businesses.find((b) => b.id === selectedBusiness)?.name : "Switch to Business View"}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <Card className="absolute top-full mt-2 w-80 z-50 p-4">
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredBusinesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => handleSelectBusiness(business.id)}
                  className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md text-left"
                >
                  <div>
                    <div className="font-medium text-sm">{business.name}</div>
                    <div className="text-xs text-muted-foreground">{business.subdomain}.frschousing.com</div>
                  </div>
                  {selectedBusiness === business.id && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
