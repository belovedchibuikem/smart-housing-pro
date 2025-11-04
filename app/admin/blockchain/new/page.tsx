"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { registerPropertyOnBlockchain } from "@/lib/api/client"
import { apiFetch } from "@/lib/api/client"

interface Property {
  id: string
  title?: string
  location?: string
}

interface Member {
  id: string
  member_number?: string
  user?: {
    first_name?: string
    last_name?: string
  }
}

export default function RegisterPropertyBlockchainPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    property_id: "",
    network: "ethereum",
    ownership_data: [] as Array<{ member_id: string; wallet_address?: string; ownership_percentage?: number }>,
  })
  const [selectedMember, setSelectedMember] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [ownershipPercentage, setOwnershipPercentage] = useState("")

  useEffect(() => {
    fetchProperties()
    fetchMembers()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: any[] }>("/admin/properties")
      if (response.success && response.data) {
        setProperties(response.data)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch properties",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: any[] }>("/admin/members")
      if (response.success && response.data) {
        setMembers(response.data)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch members",
        variant: "destructive",
      })
    }
  }

  const handleAddOwner = () => {
    if (!selectedMember) {
      toast({
        title: "Error",
        description: "Please select a member",
        variant: "destructive",
      })
      return
    }

    const exists = formData.ownership_data.find((o) => o.member_id === selectedMember)
    if (exists) {
      toast({
        title: "Error",
        description: "This member is already added as an owner",
        variant: "destructive",
      })
      return
    }

    setFormData({
      ...formData,
      ownership_data: [
        ...formData.ownership_data,
        {
          member_id: selectedMember,
          wallet_address: walletAddress || undefined,
          ownership_percentage: ownershipPercentage ? parseFloat(ownershipPercentage) : undefined,
        },
      ],
    })

    setSelectedMember("")
    setWalletAddress("")
    setOwnershipPercentage("")
  }

  const handleRemoveOwner = (index: number) => {
    setFormData({
      ...formData,
      ownership_data: formData.ownership_data.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.property_id) {
      toast({
        title: "Error",
        description: "Please select a property",
        variant: "destructive",
      })
      return
    }

    if (formData.ownership_data.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one owner. If property has allocations, owners will be auto-populated.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await registerPropertyOnBlockchain(formData)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Property registration initiated on blockchain",
        })
        router.push("/admin/blockchain")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register property on blockchain",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return "Unknown"
    const user = member.user
    if (user) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim() || member.member_number || "Unknown"
    }
    return member.member_number || "Unknown"
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blockchain">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Register Property on Blockchain</h1>
          <p className="text-muted-foreground mt-1">Create an immutable record of property ownership</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
            <CardDescription>Select a property to register on the blockchain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="property_id">Property *</Label>
              <Select value={formData.property_id} onValueChange={(value) => setFormData({ ...formData, property_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title || property.id} {property.location ? `- ${property.location}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Blockchain Network *</Label>
              <Select value={formData.network} onValueChange={(value) => setFormData({ ...formData, network: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="optimism">Optimism</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Property Owners</Label>
              <p className="text-sm text-muted-foreground">
                Add property owners. If the property has approved allocations, owners will be auto-populated if left empty.
              </p>

              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Member</Label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.user
                              ? `${member.user.first_name || ""} ${member.user.last_name || ""}`.trim() ||
                                member.member_number ||
                                member.id
                              : member.member_number || member.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Wallet Address (Optional)</Label>
                    <Input
                      placeholder="0x..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ownership % (Optional)</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      min="0"
                      max="100"
                      value={ownershipPercentage}
                      onChange={(e) => setOwnershipPercentage(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="button" onClick={handleAddOwner} variant="outline">
                  Add Owner
                </Button>
              </div>

              {formData.ownership_data.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Owners</Label>
                  <div className="space-y-2">
                    {formData.ownership_data.map((owner, index) => (
                      <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <div className="font-medium">{getMemberName(owner.member_id)}</div>
                          {owner.wallet_address && (
                            <div className="text-xs text-muted-foreground">Wallet: {owner.wallet_address.substring(0, 10)}...</div>
                          )}
                          {owner.ownership_percentage !== undefined && (
                            <div className="text-xs text-muted-foreground">Ownership: {owner.ownership_percentage}%</div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOwner(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Blockchain Registration</h3>
              <p className="text-sm text-muted-foreground">
                This property will be registered on the {formData.network} blockchain, creating an immutable record of ownership.
                Transaction fees will apply. The registration will be pending until confirmed on the blockchain.
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/blockchain">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register on Blockchain"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
