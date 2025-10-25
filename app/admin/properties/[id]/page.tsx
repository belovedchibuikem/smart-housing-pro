"use client"

import { use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin, Bed, Bath, Square, Calendar, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Mock data
  const property = {
    id,
    title: "Modern 3-Bedroom Apartment",
    location: "Lekki Phase 1, Lagos",
    type: "Apartment",
    price: 45000000,
    status: "available",
    bedrooms: 3,
    bathrooms: 3,
    area: 150,
    description: "Luxurious 3-bedroom apartment in prime Lekki location with modern amenities and excellent finishing.",
    features: [
      "24/7 Security",
      "Swimming Pool",
      "Gym",
      "Parking Space",
      "Generator",
      "Water Supply",
      "Fitted Kitchen",
      "Balcony",
    ],
    images: ["/modern-apartment-building.png", "/modern-living-room.png", "/modern-kitchen.png", "/modern-bedroom.png"],
    investment: {
      totalShares: 100,
      availableShares: 35,
      soldShares: 65,
      minInvestment: 450000,
      expectedReturn: "12-15%",
      investors: 45,
    },
    subscriptions: [
      {
        id: "SUB-001",
        member: "John Adebayo",
        memberId: "FRSC/HMS/2024/001",
        shares: 10,
        amount: 4500000,
        date: "Jan 15, 2024",
        status: "active",
      },
      {
        id: "SUB-002",
        member: "Sarah Okonkwo",
        memberId: "FRSC/HMS/2024/015",
        shares: 5,
        amount: 2250000,
        date: "Feb 1, 2024",
        status: "active",
      },
    ],
    dateAdded: "Dec 1, 2023",
    lastUpdated: "Mar 1, 2024",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/properties">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {property.location}
          </p>
        </div>
        <Badge>{property.status}</Badge>
        <Link href={`/admin/properties/${id}/edit`}>
          <Button>Edit Property</Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <img
                src={property.images[0] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-96 object-cover rounded-t-lg"
              />
              <div className="grid grid-cols-3 gap-2 p-4">
                {property.images.slice(1).map((img, index) => (
                  <img
                    key={index}
                    src={img || "/placeholder.svg"}
                    alt=""
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="investment">Investment</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                  <CardDescription>Complete property information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <Bed className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.bedrooms}</p>
                        <p className="text-sm text-muted-foreground">Bedrooms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <Bath className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.bathrooms}</p>
                        <p className="text-sm text-muted-foreground">Bathrooms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <Square className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.area}</p>
                        <p className="text-sm text-muted-foreground">sqm</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{property.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Features & Amenities</h3>
                    <div className="grid md:grid-cols-2 gap-2">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Overview</CardTitle>
                  <CardDescription>Property investment statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-muted-foreground">Total Shares</label>
                      <p className="text-2xl font-bold">{property.investment.totalShares}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Available Shares</label>
                      <p className="text-2xl font-bold text-green-600">{property.investment.availableShares}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Sold Shares</label>
                      <p className="text-2xl font-bold">{property.investment.soldShares}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Total Investors</label>
                      <p className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        {property.investment.investors}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Min. Investment</label>
                      <p className="text-xl font-semibold">₦{property.investment.minInvestment.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Expected Return</label>
                      <p className="text-xl font-semibold text-green-600 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {property.investment.expectedReturn}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Subscriptions</CardTitle>
                  <CardDescription>Members who have invested in this property</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subscription ID</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead className="text-right">Shares</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {property.subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{sub.member}</div>
                              <div className="text-sm text-muted-foreground">{sub.memberId}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{sub.shares}</TableCell>
                          <TableCell className="text-right">₦{sub.amount.toLocaleString()}</TableCell>
                          <TableCell>{sub.date}</TableCell>
                          <TableCell>
                            <Badge>{sub.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Price Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Property Value</label>
                <p className="text-3xl font-bold">₦{property.price.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Price per Share</label>
                <p className="text-xl font-semibold">
                  ₦{(property.price / property.investment.totalShares).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Type</label>
                <p className="font-medium">{property.type}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <Badge>{property.status}</Badge>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Date Added</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {property.dateAdded}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Last Updated</label>
                <p className="font-medium">{property.lastUpdated}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
