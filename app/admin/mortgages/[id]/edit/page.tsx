"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

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

interface Property {
  id: string
  title?: string | null
  address?: string | null
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
  const [properties, setProperties] = useState<Property[]>([])
  const [members, setMembers] = useState<Member[]>([])
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
    let isMounted = true

    const initialize = async () => {
      try {
        setLoading(true)
        await Promise.all([fetchMortgage(), fetchMembers(), fetchProviders(), fetchProperties()])
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
      tenureYears > 0
    ) {
      const totalAmount = loanAmount * (1 + (interestRate / 100) * tenureYears)
      const monthlyPayment = totalAmount / (tenureYears * 12)
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
        monthly_payment: mortgage.monthly_payment?.toFixed(2) ?? "",
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
    const response = await apiFetch<{ members: Member[] }>("/admin/members?per_page=100")
    setMembers(response.members || [])
  }

  const fetchProperties = async () => {
    const response = await apiFetch<{ data: Property[] }>("/admin/properties?per_page=100")
    setProperties(response.data || [])
  }

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find((item) => item.id === providerId)
    setSelectedProvider(provider || null)
    setFormData((prev) => ({ ...prev, provider_id: providerId }))
  }

  const memberOptions = useMemo(() => {
    return members.map((member) => ({
      value: member.id,
      label: `${member.user?.first_name ?? ""} ${member.user?.last_name ?? ""}`.trim() || "Unnamed Member",
      meta: member.member_id || member.staff_id || member.id,
    }))
  }, [members])

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
                  <Select
                    value={formData.member_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, member_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member">
                        {memberOptions.find((option) => option.value === formData.member_id)?.label || "Select member"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {memberOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} • {option.meta}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_id">Property</Label>
                  <Select
                    value={formData.property_id || "none"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, property_id: value === "none" ? "" : value }))
                    }
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
                    value={formData.loan_amount}
                    onChange={(event) => setFormData((prev) => ({ ...prev, loan_amount: event.target.value }))}
                    required
                  />
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
                      {[5, 10, 15, 20, 25, 30].map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year} years
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

