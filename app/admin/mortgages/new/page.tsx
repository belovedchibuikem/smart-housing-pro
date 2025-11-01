"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface MortgageProvider {
  id: string
  name: string
  interest_rate_min?: number
  interest_rate_max?: number
}

interface Member {
  id: string
  user: {
    first_name: string
    last_name: string
  }
  member_id?: string
  staff_id?: string
}

interface Property {
  id: string
  title?: string
  address?: string
}

export default function CreateMortgagePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<MortgageProvider[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProvider, setSelectedProvider] = useState<MortgageProvider | null>(null)

  const [formData, setFormData] = useState({
    member_id: "",
    property_id: "",
    provider_id: "",
    loan_amount: "",
    interest_rate: "",
    tenure_years: "",
    monthly_payment: "",
    notes: "",
  })

  useEffect(() => {
    fetchProviders()
    fetchMembers()
    fetchProperties()
  }, [])

  useEffect(() => {
    // Auto-calculate monthly payment when loan amount, interest rate, or tenure changes
    if (formData.loan_amount && formData.interest_rate && formData.tenure_years) {
      const loanAmount = parseFloat(formData.loan_amount)
      const interestRate = parseFloat(formData.interest_rate)
      const tenureYears = parseFloat(formData.tenure_years)

      if (!isNaN(loanAmount) && !isNaN(interestRate) && !isNaN(tenureYears) && tenureYears > 0) {
        const totalAmount = loanAmount * (1 + (interestRate / 100) * tenureYears)
        const monthlyPayment = totalAmount / (tenureYears * 12)
        setFormData(prev => ({ ...prev, monthly_payment: monthlyPayment.toFixed(2) }))
      }
    }
  }, [formData.loan_amount, formData.interest_rate, formData.tenure_years])

  useEffect(() => {
    // Auto-fill interest rate when provider is selected
    if (selectedProvider && selectedProvider.interest_rate_min) {
      setFormData(prev => ({ ...prev, interest_rate: selectedProvider.interest_rate_min?.toString() || "" }))
    }
  }, [selectedProvider])

  const fetchProviders = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: MortgageProvider[] }>(
        "/admin/mortgage-providers?is_active=true"
      )
      if (response.success) {
        setProviders(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load mortgage providers",
        variant: "destructive",
      })
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await apiFetch<{ members: Member[] }>("/admin/members?per_page=100")
      setMembers(response.members || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      })
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await apiFetch<{ data: Property[] }>("/admin/properties?per_page=100")
      setProperties(response.data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load properties",
        variant: "destructive",
      })
    }
  }

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    setSelectedProvider(provider || null)
    setFormData(prev => ({ ...prev, provider_id: providerId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiFetch("/admin/mortgages", {
        method: "POST",
        body: {
          member_id: formData.member_id,
          property_id: formData.property_id || null,
          provider_id: formData.provider_id || null,
          loan_amount: parseFloat(formData.loan_amount),
          interest_rate: parseFloat(formData.interest_rate),
          tenure_years: parseInt(formData.tenure_years),
          notes: formData.notes,
        },
      })

      toast({
        title: "Success",
        description: "Mortgage created successfully",
      })

      router.push("/admin/mortgages")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create mortgage",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/mortgages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Mortgage</h1>
          <p className="text-muted-foreground mt-1">Set up a new mortgage agreement for a member</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Mortgage Details</CardTitle>
            <CardDescription>Enter the mortgage information and terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="member_id">Member *</Label>
                <Select
                  value={formData.member_id}
                  onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.user?.first_name} {member.user?.last_name} - {member.member_id || member.staff_id || member.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_id">Property (Optional)</Label>
                <Select
                  value={formData.property_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, property_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title || property.address || property.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="provider_id">Mortgage Provider (Optional)</Label>
                <Select
                  value={formData.provider_id || "none"}
                  onValueChange={(value) => {
                    if (value === "none") {
                      setSelectedProvider(null)
                      setFormData(prev => ({ ...prev, provider_id: "" }))
                    } else {
                      handleProviderChange(value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mortgage provider (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                        {provider.interest_rate_min && provider.interest_rate_max && (
                          <span className="text-muted-foreground ml-2">
                            ({provider.interest_rate_min}% - {provider.interest_rate_max}%)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan_amount">Loan Amount (₦) *</Label>
                <Input
                  id="loan_amount"
                  type="number"
                  placeholder="12000000"
                  value={formData.loan_amount}
                  onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest_rate">Interest Rate (%) *</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.1"
                  placeholder="6.5"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenure_years">Tenure (Years) *</Label>
                <Select
                  value={formData.tenure_years}
                  onValueChange={(value) => setFormData({ ...formData, tenure_years: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="10">10 years</SelectItem>
                    <SelectItem value="15">15 years</SelectItem>
                    <SelectItem value="20">20 years</SelectItem>
                    <SelectItem value="25">25 years</SelectItem>
                    <SelectItem value="30">30 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_payment">Monthly Payment (₦) *</Label>
                <Input
                  id="monthly_payment"
                  type="number"
                  step="0.01"
                  placeholder="250000"
                  value={formData.monthly_payment}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Calculated automatically</p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about this mortgage..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/mortgages">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Mortgage
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
