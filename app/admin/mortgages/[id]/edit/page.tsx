"use client"

import type React from "react"

import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, ChevronDown } from "lucide-react"

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
  interest_rate_min?: number | null
  interest_rate_max?: number | null
}

interface Member {
  id: string
  user?: {
    first_name?: string | null
    last_name?: string | null
    email?: string | null
  } | null
  member_number?: string | null
  member_id?: string | null
  staff_id?: string | null
  ippis_number?: string | null
  frsc_pin?: string | null
}

interface MortgageDetail {
  id: string
  member_id: string
  property_id?: string | null
  property_titles?: string[] | null
  provider_id?: string | null
  loan_amount: number
  interest_rate: number
  tenure_years: number
  monthly_payment: number
  notes?: string | null
  status: string
  member?: Member | null
  property?: {
    id: string
    title?: string | null
    location?: string | null
    address?: string | null
    price?: number | null
  } | null
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

  // Load subscribed / approved properties when member is selected
  useEffect(() => {
    if (formData.member_id) {
      setLoadingProperties(true)
      getApprovedPropertyInterests(formData.member_id)
        .then((response) => {
          if (response.success && response.data) {
            setPropertyOptions((prev) => {
              const incoming = response.data
              const byId = new Map(incoming.map((row) => [row.property_id, row]))
              for (const row of prev) {
                if (!byId.has(row.property_id)) byId.set(row.property_id, row)
              }
              return Array.from(byId.values())
            })
          } else {
            setPropertyOptions((prev) => prev)
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
        property_titles: Array.isArray(mortgage.property_titles) ? mortgage.property_titles : [],
        provider_id: mortgage.provider_id ?? "",
        loan_amount: mortgage.loan_amount?.toString() ?? "",
        interest_rate: mortgage.interest_rate?.toString() ?? "",
        tenure_years: mortgage.tenure_years?.toString() ?? "",
        monthly_payment: mortgage.monthly_payment ? Number(mortgage.monthly_payment).toFixed(2) : "",
        notes: mortgage.notes ?? "",
      })
      if (mortgage.member?.id) {
        setMembers((prev) => {
          if (prev.some((m) => m.id === mortgage.member!.id)) return prev
          return [mortgage.member as Member, ...prev]
        })
      }
      if (mortgage.property?.id) {
        setPropertyOptions((prev) => {
          if (prev.some((row) => row.property_id === mortgage.property!.id)) return prev
          return [
            {
              id: mortgage.property.id,
              property_id: mortgage.property.id,
              member_id: mortgage.member_id,
              status: "current",
              property: {
                id: mortgage.property.id,
                title: mortgage.property.title || "Property",
                location: mortgage.property.location,
                address: mortgage.property.address,
                price: mortgage.property.price,
              },
              created_at: "",
            },
            ...prev,
          ]
        })
      }
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
      const response = await apiFetch("/admin/members?per_page=50")
      const list = normalizeAdminMembersList(response) as Member[]
      setMembers((prev) => {
        const byId = new Map(list.map((m) => [m.id, m]))
        for (const m of prev) {
          if (!byId.has(m.id)) byId.set(m.id, m)
        }
        return Array.from(byId.values())
      })
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
    const provider = providers.find((item) => item.id === providerId)
    setSelectedProvider(provider || null)
    setFormData((prev) => ({ ...prev, provider_id: providerId }))
  }


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!mortgageId) return
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
    setSubmitting(true)

    try {
      await apiFetch(`/admin/mortgages/${mortgageId}`, {
        method: "PUT",
        body: {
          member_id: formData.member_id,
          property_id: formData.property_id,
          property_titles: formData.property_titles,
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
                  <SearchableSelect
                    value={formData.member_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        member_id: value,
                        property_id: value === prev.member_id ? prev.property_id : "",
                        property_titles: value === prev.member_id ? prev.property_titles : [],
                      }))
                    }
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
                  <p className="text-xs text-muted-foreground">
                    Principal drawn for this mortgage on the selected property (adjust only when terms differ from the plan).
                  </p>
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

