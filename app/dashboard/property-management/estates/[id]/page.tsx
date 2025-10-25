"use client"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin, Building, Calendar, Phone, Mail } from "lucide-react"

export default function EstateDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const estateId = params.id

  // Mock data - in real app, fetch based on estateId
  const estate = {
    id: estateId,
    name: "FRSC Estate Phase 1",
    location: "Abuja, FCT",
    address: "Plot 123, Cadastral Zone A00, Abuja FCT",
    totalUnits: 150,
    occupiedUnits: 120,
    availableUnits: 30,
    myProperties: 2,
    status: "active",
    description:
      "Modern residential estate with excellent facilities including 24/7 security, power supply, water treatment plant, and recreational facilities.",
    amenities: [
      "24/7 Security",
      "Power Supply",
      "Water Treatment",
      "Recreation Center",
      "Children's Playground",
      "Shopping Complex",
    ],
    establishedDate: "2020-01-15",
    managementContact: {
      phone: "+234 803 123 4567",
      email: "phase1@frschousing.org",
    },
  }

  const myProperties = [
    {
      id: 1,
      type: "3 Bedroom Duplex",
      unit: "Block A, Unit 12",
      status: "occupied",
      allocationDate: "2023-06-15",
      monthlyCharge: 15000,
    },
    {
      id: 2,
      type: "2 Bedroom Flat",
      unit: "Block C, Unit 8",
      status: "rented",
      allocationDate: "2023-08-20",
      monthlyCharge: 12000,
    },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{estate.name}</h1>
          <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4" />
            {estate.location}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>My Properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{estate.myProperties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estate.totalUnits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Occupied</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{estate.occupiedUnits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{estate.availableUnits}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Estate Information</CardTitle>
              <CardDescription>Detailed information about the estate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{estate.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Full Address</div>
                  <div className="font-medium">{estate.address}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge>{estate.status}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Established</div>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(estate.establishedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Management Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{estate.managementContact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{estate.managementContact.email}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>My Properties in this Estate</CardTitle>
              <CardDescription>Properties you own in {estate.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myProperties.map((property) => (
                  <div key={property.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">{property.type}</h4>
                        <p className="text-sm text-muted-foreground">{property.unit}</p>
                      </div>
                      <Badge>{property.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Allocation Date</div>
                        <div className="font-medium">{new Date(property.allocationDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Monthly Charge</div>
                        <div className="font-medium">₦{property.monthlyCharge.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities">
          <Card>
            <CardHeader>
              <CardTitle>Estate Amenities</CardTitle>
              <CardDescription>Available facilities and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {estate.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Building className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
