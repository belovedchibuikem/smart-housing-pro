"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, Loader2, ChevronDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, getPropertyPaymentPlanDetails, getApprovedPropertyInterests, type ApprovedPropertyInterest } from "@/lib/api/client"
import { normalizeAdminMembersList } from "@/lib/api/normalize-admin-members"
import {
  SearchableSelect,
  membersToSearchableOptions,
  propertiesToSearchableOptions,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select"
import { Checkbox } from "@/components/ui/checkbox"
import { MORTGAGE_PROPERTY_TITLE_OPTIONS } from "@/lib/mortgage-property-titles"

interface MortgageProvider {
  id: string
  name: string
  interest_rate_min?: number
  interest_rate_max?: number
}

interface Member {
  id: string
  user?: {
    first_name?: string
    last_name?: string
    email?: string
  } | null
  member_number?: string
  member_id?: string
  staff_id?: string
  ippis_number?: string
  frsc_pin?: string
}

export default function CreateMortgagePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<MortgageProvider[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [propertyOptions, setPropertyOptions] = useState<ApprovedPropertyInterest[]>([])
  const [selectedProvider, setSelectedProvider] = useState<MortgageProvider | null>(null)
  const [loanAmountLocked, setLoanAmountLocked] = useState(false)
  const [loadingProperties, setLoadingProperties] = useState(false)

  const [formData, setFormData] = useState({
    member_id: "",
    property_id: "",
    property_titles: [] as string[],
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

  // Load subscribed / approved properties when member is selected
  useEffect(() => {
    if (formData.member_id) {
      setLoadingProperties(true)
      setFormData((prev) => ({ ...prev, property_id: "", property_titles: [] }))
      getApprovedPropertyInterests(formData.member_id)
        .then((response) => {
          if (response.success && response.data) {
            setPropertyOptions(response.data)
          } else {
            setPropertyOptions([])
          }
        })
        .catch((error) => {
          console.error("Failed to load member properties:", error)
          setPropertyOptions([])
        })
        .finally(() => {
          setLoadingProperties(false)
        })
    } else {
      setPropertyOptions([])
      setFormData((prev) => ({ ...prev, property_id: "", property_titles: [] }))
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
      const response = await apiFetch("/admin/members?per_page=50")
      const list = normalizeAdminMembersList(response) as Member[]
      setMembers(list)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      })
    }
  }

  const searchMembers = useCallback(async (query: string): Promise<SearchableSelectOption[]> => {
    const res = await apiFetch<{ success?: boolean }>(
      `/admin/members?search=${encodeURIComponent(query)}&per_page=50`,
    )
    const rows = normalizeAdminMembersList(res) as Member[]
    setMembers((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]))
      for (const m of rows) byId.set(m.id, m)
      return Array.from(byId.values())
    })
    return membersToSearchableOptions(rows)
  }, [])

  const memberSelectOptions = useMemo(() => membersToSearchableOptions(members), [members])
  const propertySelectOptions = useMemo(
    () =>
      propertiesToSearchableOptions(
        propertyOptions.map((interest) => ({
          id: interest.property_id,
          title: interest.property.title,
          location: interest.property.location || interest.property.address || undefined,
          price: interest.property.price ?? undefined,
        })),
      ),
    [propertyOptions],
  )

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    setSelectedProvider(provider || null)
    setFormData(prev => ({ ...prev, provider_id: providerId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.property_id) {
      toast({
        title: "Property required",
        description: "Select the property this mortgage applies to.",
        variant: "destructive",
      })
      return
    }
    if (formData.property_titles.length === 0) {
      toast({
        title: "Property titles required",
        description: "Select at least one property title (e.g. C of O, R of O).",
        variant: "destructive",
      })
      return
    }
    setLoading(true)

    try {
      await apiFetch("/admin/mortgages", {
        method: "POST",
        body: {
          member_id: formData.member_id,
          property_id: formData.property_id,
          property_titles: formData.property_titles,
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
                <SearchableSelect
                  value={formData.member_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, member_id: value }))}
                  options={memberSelectOptions}
                  onSearch={searchMembers}
                  placeholder="Search and select a member..."
                  searchPlaceholder="Search by name, member no, staff ID, IPPIS, or FRSC PIN…"
                  emptyText="No members match your search."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_id">Property *</Label>
                <SearchableSelect
                  value={formData.property_id}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, property_id: value }))}
                  options={propertySelectOptions}
                  placeholder={
                    loadingProperties
                      ? "Loading properties..."
                      : !formData.member_id
                        ? "Select a member first"
                        : "Search and select a property..."
                  }
                  searchPlaceholder="Search by title, address, or location…"
                  emptyText={
                    formData.member_id
                      ? "No subscribed properties found for this member"
                      : "Select a member first"
                  }
                  disabled={!formData.member_id || loadingProperties}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Property titles *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-between font-normal",
                        formData.property_titles.length === 0 && "text-muted-foreground"
                      )}
                    >
                      {formData.property_titles.length === 0
                        ? "Select one or more titles (C of O, R of O, …)"
                        : `${formData.property_titles.length} title${formData.property_titles.length === 1 ? "" : "s"} selected`}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                    <div className="max-h-[280px] space-y-1 overflow-y-auto pr-1">
                      {MORTGAGE_PROPERTY_TITLE_OPTIONS.map((opt) => (
                        <label
                          key={opt.key}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                        >
                          <Checkbox
                            checked={formData.property_titles.includes(opt.key)}
                            onCheckedChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                property_titles: prev.property_titles.includes(opt.key)
                                  ? prev.property_titles.filter((k) => k !== opt.key)
                                  : [...prev.property_titles, opt.key],
                              }))
                            }}
                          />
                          <span className="text-sm leading-snug">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Documents or title types that apply to this property (you can select several).
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Principal drawn for this mortgage on the selected property (admin-facing guidance; adjust only when terms differ from the plan).
                </p>
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
