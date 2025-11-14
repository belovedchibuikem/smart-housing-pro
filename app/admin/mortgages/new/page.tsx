"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, Loader2, Search, Check } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, getPropertyPaymentPlanDetails, getApprovedPropertyInterests, type ApprovedPropertyInterest } from "@/lib/api/client"

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

export default function CreateMortgagePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<MortgageProvider[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [propertyOptions, setPropertyOptions] = useState<ApprovedPropertyInterest[]>([])
  const [selectedProvider, setSelectedProvider] = useState<MortgageProvider | null>(null)
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [propertySearchQuery, setPropertySearchQuery] = useState("")
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [filteredProperties, setFilteredProperties] = useState<ApprovedPropertyInterest[]>([])
  const [loanAmountLocked, setLoanAmountLocked] = useState(false)
  const [loadingProperties, setLoadingProperties] = useState(false)

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
  }, [])

  // Load approved property interests when member is selected
  useEffect(() => {
    if (formData.member_id) {
      setLoadingProperties(true)
      getApprovedPropertyInterests(formData.member_id)
        .then((response) => {
          if (response.success && response.data) {
            setPropertyOptions(response.data)
          } else {
            setPropertyOptions([])
          }
        })
        .catch((error) => {
          console.error("Failed to load property interests:", error)
          setPropertyOptions([])
        })
        .finally(() => {
          setLoadingProperties(false)
        })
    } else {
      setPropertyOptions([])
      setFormData(prev => ({ ...prev, property_id: "" }))
    }
  }, [formData.member_id])

  // Load property payment plan details when property is selected
  useEffect(() => {
    if (formData.property_id && formData.member_id) {
      getPropertyPaymentPlanDetails(formData.property_id, formData.member_id)
        .then((response) => {
          if (response.success && response.data) {
            const planData = response.data
            // Auto-fill loan amount with mortgage allocation (locked)
            if (planData.mortgage_amount) {
              setFormData(prev => ({ ...prev, loan_amount: planData.mortgage_amount!.toString() }))
              setLoanAmountLocked(true)
            }
          }
        })
        .catch((error) => {
          console.error("Failed to load property payment plan details:", error)
        })
    } else {
      // Reset lock when property is deselected
      if (!formData.property_id) {
        setLoanAmountLocked(false)
      }
    }
  }, [formData.property_id, formData.member_id])

  useEffect(() => {
    // Auto-calculate monthly payment using amortization formula (PMT)
    if (formData.loan_amount && formData.interest_rate && formData.tenure_years) {
      const loanAmount = parseFloat(formData.loan_amount)
      const interestRate = parseFloat(formData.interest_rate)
      const tenureYears = parseFloat(formData.tenure_years)

      if (!isNaN(loanAmount) && !isNaN(interestRate) && !isNaN(tenureYears) && tenureYears > 0 && loanAmount > 0) {
        const numberOfPayments = tenureYears * 12
        const monthlyRate = (interestRate / 100) / 12

        let monthlyPayment: number
        if (monthlyRate <= 0) {
          // If no interest, just divide principal by number of payments
          monthlyPayment = loanAmount / numberOfPayments
        } else {
          const factor = Math.pow(1 + monthlyRate, numberOfPayments)
          if (factor === 1.0) {
            monthlyPayment = loanAmount / numberOfPayments
          } else {
            monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1)
          }
        }
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
      const response = await apiFetch<{ members: Member[] }>("/admin/members?per_page=1000")
      setMembers(response.members || [])
      setFilteredMembers(response.members || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      })
    }
  }


  useEffect(() => {
    if (memberSearchQuery.trim() === "") {
      setFilteredMembers(members)
    } else {
      const query = memberSearchQuery.toLowerCase()
      setFilteredMembers(
        members.filter(
          (member) =>
            member.user?.first_name?.toLowerCase().includes(query) ||
            member.user?.last_name?.toLowerCase().includes(query) ||
            member.member_id?.toLowerCase().includes(query) ||
            member.staff_id?.toLowerCase().includes(query)
        )
      )
    }
  }, [memberSearchQuery, members])

  useEffect(() => {
    if (propertySearchQuery.trim() === "") {
      setFilteredProperties(propertyOptions)
    } else {
      const query = propertySearchQuery.toLowerCase()
      setFilteredProperties(
        propertyOptions.filter(
          (interest) =>
            interest.property.title?.toLowerCase().includes(query) ||
            interest.property.address?.toLowerCase().includes(query) ||
            interest.property.id.toLowerCase().includes(query) ||
            interest.property.location?.toLowerCase().includes(query)
        )
      )
    }
  }, [propertySearchQuery, propertyOptions])

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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !formData.member_id && "text-muted-foreground")}
                    >
                      {formData.member_id
                        ? `${members.find((m) => m.id === formData.member_id)?.user?.first_name} ${members.find((m) => m.id === formData.member_id)?.user?.last_name} - ${members.find((m) => m.id === formData.member_id)?.member_id || members.find((m) => m.id === formData.member_id)?.staff_id || ""}`
                        : "Search and select a member..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Search by name, member ID, or staff ID..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0"
                      />
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                      {filteredMembers.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No members found</div>
                      ) : (
                        filteredMembers.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            className={cn(
                              "flex w-full items-center justify-between px-4 py-2 text-left hover:bg-accent",
                              formData.member_id === member.id && "bg-accent"
                            )}
                            onClick={() => setFormData({ ...formData, member_id: member.id })}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {member.user?.first_name} {member.user?.last_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {member.member_id || member.staff_id || member.id}
                              </span>
                            </div>
                            {formData.member_id === member.id && <Check className="h-4 w-4" />}
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_id">Property (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !formData.property_id && "text-muted-foreground")}
                    >
                      {formData.property_id
                        ? propertyOptions.find((p) => p.property_id === formData.property_id)?.property.title ||
                          propertyOptions.find((p) => p.property_id === formData.property_id)?.property.address ||
                          "Selected property"
                        : loadingProperties
                          ? "Loading properties..."
                          : "Search and select a property (optional)..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Search by title, address, or ID..."
                        value={propertySearchQuery}
                        onChange={(e) => setPropertySearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0"
                      />
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between px-4 py-2 text-left hover:bg-accent",
                          !formData.property_id && "bg-accent"
                        )}
                        onClick={() => setFormData({ ...formData, property_id: "" })}
                      >
                        <span className="font-medium">None</span>
                        {!formData.property_id && <Check className="h-4 w-4" />}
                      </button>
                        {loadingProperties ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">Loading properties...</div>
                        ) : filteredProperties.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {formData.member_id ? "No approved properties found for this member" : "Select a member first"}
                          </div>
                        ) : (
                          filteredProperties.map((interest) => (
                            <button
                              key={interest.id}
                              type="button"
                              className={cn(
                                "flex w-full items-center justify-between px-4 py-2 text-left hover:bg-accent",
                                formData.property_id === interest.property_id && "bg-accent"
                              )}
                              onClick={() => setFormData({ ...formData, property_id: interest.property_id })}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {interest.property.title || interest.property.address || interest.property.id}
                                </span>
                                {(interest.property.address || interest.property.location) && (
                                  <span className="text-xs text-muted-foreground">
                                    {interest.property.address || interest.property.location}
                                  </span>
                                )}
                              </div>
                              {formData.property_id === interest.property_id && <Check className="h-4 w-4" />}
                            </button>
                          ))
                        )}
                    </div>
                  </PopoverContent>
                </Popover>
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
                  disabled={loanAmountLocked}
                />
                {loanAmountLocked && <p className="text-xs text-muted-foreground">Auto-filled from mortgage allocation</p>}
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
                    {Array.from({ length: 35 }, (_, i) => i + 1).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year} {year === 1 ? "year" : "years"}
                      </SelectItem>
                    ))}
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
