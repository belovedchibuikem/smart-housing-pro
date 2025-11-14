"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Search, Check } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, getPropertyPaymentPlanDetails, getApprovedPropertyInterests, type ApprovedPropertyInterest } from "@/lib/api/client"

interface MortgageProvider {
  id: string
  name: string
  interest_rate_min?: number | null
  interest_rate_max?: number | null
}

interface Member {
  id: string
  user?: {
    first_name?: string | null
    last_name?: string | null
  } | null
  member_id?: string | null
  staff_id?: string | null
}

interface MortgageDetail {
  id: string
  member_id: string
  property_id?: string | null
  provider_id?: string | null
  loan_amount: number
  interest_rate: number
  tenure_years: number
  monthly_payment: number
  notes?: string | null
  status: string
  member?: Member | null
}

export default function EditMortgagePage() {
  const params = useParams<{ id?: string }>()
  const mortgageId = params?.id ?? ""
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [providers, setProviders] = useState<MortgageProvider[]>([])
  const [propertyOptions, setPropertyOptions] = useState<ApprovedPropertyInterest[]>([])
  const [members, setMembers] = useState<Member[]>([])
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
    let isMounted = true

    const initialize = async () => {
      try {
        setLoading(true)
        await Promise.all([fetchMortgage(), fetchMembers(), fetchProviders()])
      } catch (error: any) {
        console.error(error)
        toast({
          title: "Error",
          description: error?.message || "Unable to load mortgage details.",
          variant: "destructive",
        })
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initialize()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mortgageId])

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

  // Auto-calculate monthly payment using amortization formula (PMT)
  useEffect(() => {
    if (!formData.loan_amount || !formData.interest_rate || !formData.tenure_years) {
      return
    }
    const loanAmount = parseFloat(formData.loan_amount)
    const interestRate = parseFloat(formData.interest_rate)
    const tenureYears = parseFloat(formData.tenure_years)

    if (
      Number.isFinite(loanAmount) &&
      Number.isFinite(interestRate) &&
      Number.isFinite(tenureYears) &&
      tenureYears > 0 &&
      loanAmount > 0
    ) {
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
      setFormData((prev) => ({ ...prev, monthly_payment: monthlyPayment.toFixed(2) }))
    }
  }, [formData.loan_amount, formData.interest_rate, formData.tenure_years])

  useEffect(() => {
    if (selectedProvider?.interest_rate_min) {
      setFormData((prev) => ({
        ...prev,
        interest_rate: selectedProvider.interest_rate_min?.toString() || prev.interest_rate,
      }))
    }
  }, [selectedProvider])

  const fetchMortgage = async () => {
    if (!mortgageId) return
    const response = await apiFetch<{ success: boolean; data: MortgageDetail }>(`/admin/mortgages/${mortgageId}`)
    if (response.success && response.data) {
      const mortgage = response.data
      setFormData({
        member_id: mortgage.member_id ?? "",
        property_id: mortgage.property_id ?? "",
        provider_id: mortgage.provider_id ?? "",
        loan_amount: mortgage.loan_amount?.toString() ?? "",
        interest_rate: mortgage.interest_rate?.toString() ?? "",
        tenure_years: mortgage.tenure_years?.toString() ?? "",
        monthly_payment: mortgage.monthly_payment ? Number(mortgage.monthly_payment).toFixed(2) : "",
        notes: mortgage.notes ?? "",
      })
    }
  }

  const fetchProviders = async () => {
    const response = await apiFetch<{ success: boolean; data: MortgageProvider[] }>("/admin/mortgage-providers")
    if (response.success) {
      setProviders(response.data)
    }
  }

  useEffect(() => {
    if (!formData.provider_id) {
      setSelectedProvider(null)
      return
    }
    const provider = providers.find((item) => item.id === formData.provider_id)
    setSelectedProvider(provider ?? null)
  }, [providers, formData.provider_id])

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
    const provider = providers.find((item) => item.id === providerId)
    setSelectedProvider(provider || null)
    setFormData((prev) => ({ ...prev, provider_id: providerId }))
  }


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!mortgageId) return
    setSubmitting(true)

    try {
      await apiFetch(`/admin/mortgages/${mortgageId}`, {
        method: "PUT",
        body: {
          member_id: formData.member_id,
          property_id: formData.property_id || null,
          provider_id: formData.provider_id || null,
          loan_amount: parseFloat(formData.loan_amount),
          interest_rate: parseFloat(formData.interest_rate),
          tenure_years: parseInt(formData.tenure_years, 10),
          notes: formData.notes,
        },
      })

      toast({
        title: "Mortgage updated",
        description: "Changes have been saved successfully.",
      })
      router.push(`/admin/mortgages/${mortgageId}`)
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.message || "Unable to update mortgage.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/mortgages/${mortgageId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Mortgage</h1>
          <p className="text-muted-foreground mt-1">Update mortgage terms, provider, or associated property.</p>
        </div>
      </div>

      {loading ? (
        <Card className="py-16">
          <CardContent className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Mortgage Details</CardTitle>
              <CardDescription>Adjust key information for this mortgage agreement.</CardDescription>
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
                  <Label htmlFor="provider_id">Mortgage Provider</Label>
                  <Select
                    value={formData.provider_id || "none"}
                    onValueChange={(value) => {
                      if (value === "none") {
                        setSelectedProvider(null)
                        setFormData((prev) => ({ ...prev, provider_id: "" }))
                      } else {
                        handleProviderChange(value)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider (optional)" />
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
                    onChange={(event) => setFormData((prev) => ({ ...prev, loan_amount: event.target.value }))}
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
                    value={formData.interest_rate}
                    onChange={(event) => setFormData((prev) => ({ ...prev, interest_rate: event.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenure_years">Tenure (Years) *</Label>
                  <Select
                    value={formData.tenure_years}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, tenure_years: value }))}
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
                  <Label htmlFor="monthly_payment">Monthly Payment (₦)</Label>
                  <Input id="monthly_payment" type="number" readOnly value={formData.monthly_payment} />
                  <p className="text-xs text-muted-foreground">Calculated automatically based on current terms.</p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Add any relevant notes about this mortgage..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/admin/mortgages/${mortgageId}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}

