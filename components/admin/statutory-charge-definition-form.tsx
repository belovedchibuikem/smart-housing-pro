"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  createStatutoryChargeDefinition,
  updateStatutoryChargeDefinition,
  getStatutoryChargeTypes,
  getStatutoryChargeDepartments,
  apiFetch,
  type StatutoryChargeDefinitionPayload,
} from "@/lib/api/client"
import { SearchableSelect, propertiesToSearchableOptions } from "@/components/ui/searchable-select"

interface PropertyOption {
  id: string
  title: string
  location?: string
  type?: string
  property_type?: string
  type_label?: string
}

interface DefinitionFormProps {
  mode: "create" | "edit"
  definitionId?: string
  initial?: Partial<StatutoryChargeDefinitionPayload> & { rules?: Record<string, unknown> | null }
}

const CATEGORY_HELP: Record<string, string> = {
  estate_wide: "Assigned automatically when a member is allocated a matching house or land subscription.",
  member_based: "Assigned manually by admin to a specific member (use Assign on the definitions list).",
  event_based: "Assigned when a named event fires (e.g. ownership transfer). Set event trigger below.",
}

export function StatutoryChargeDefinitionForm({ mode, definitionId, initial }: DefinitionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [chargeTypes, setChargeTypes] = useState<string[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [properties, setProperties] = useState<PropertyOption[]>([])

  const [formData, setFormData] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    type: initial?.type || "",
    charge_category: (initial?.charge_category || "estate_wide") as StatutoryChargeDefinitionPayload["charge_category"],
    calculation_type: (initial?.calculation_type || "fixed") as StatutoryChargeDefinitionPayload["calculation_type"],
    amount: initial?.amount != null ? String(initial.amount) : "",
    percentage: initial?.percentage != null ? String(initial.percentage) : "",
    percentage_base: (initial?.percentage_base || "property_cost") as NonNullable<
      StatutoryChargeDefinitionPayload["percentage_base"]
    >,
    property_id: initial?.property_id || "",
    property_type: initial?.property_type || "",
    department_id: initial?.department_id || "",
    is_recurring: Boolean(initial?.is_recurring),
    frequency: initial?.frequency || "",
    is_active: initial?.is_active !== false,
    event_trigger: (initial?.rules as any)?.event_trigger || "",
  })

  useEffect(() => {
    if (initial) {
      setFormData((prev) => ({
        ...prev,
        name: initial.name || prev.name,
        description: initial.description || "",
        type: initial.type || prev.type,
        charge_category: (initial.charge_category || prev.charge_category) as any,
        calculation_type: (initial.calculation_type || prev.calculation_type) as any,
        amount: initial.amount != null ? String(initial.amount) : prev.amount,
        percentage: initial.percentage != null ? String(initial.percentage) : prev.percentage,
        percentage_base: (initial.percentage_base || prev.percentage_base) as any,
        property_id: initial.property_id || "",
        property_type: initial.property_type || "",
        department_id: initial.department_id || "",
        is_recurring: Boolean(initial.is_recurring),
        frequency: initial.frequency || "",
        is_active: initial.is_active !== false,
        event_trigger: (initial.rules as any)?.event_trigger || "",
      }))
    }
  }, [initial])

  useEffect(() => {
    Promise.all([
      getStatutoryChargeTypes().catch(() => ({ success: false, data: [] })),
      getStatutoryChargeDepartments().catch(() => ({ success: false, data: [] })),
      apiFetch<{ success: boolean; data: PropertyOption[] }>("/admin/properties?per_page=1000").catch(() => ({
        success: false,
        data: [],
      })),
    ]).then(([typesRes, deptRes, propsRes]) => {
      if (typesRes.success && Array.isArray(typesRes.data)) {
        setChargeTypes(typesRes.data.map((t: any) => t.type).filter(Boolean))
      }
      if (deptRes.success && Array.isArray(deptRes.data)) {
        setDepartments(deptRes.data)
      }
      if ((propsRes as any).success) {
        setProperties((propsRes as any).data || [])
      } else if (Array.isArray((propsRes as any).data)) {
        setProperties((propsRes as any).data)
      }
    }).finally(() => setLoadingData(false))
  }, [])

  const propertyOptions = useMemo(() => propertiesToSearchableOptions(properties), [properties])
  const chargeTypeOptions = useMemo(
    () => chargeTypes.map((t) => ({ value: t, label: t, searchText: t })),
    [chargeTypes],
  )

  const houseTypeOptions = useMemo(() => {
    const types = new Set<string>()
    properties.forEach((p) => {
      const t = p.property_type || p.type_label || p.type
      if (t) types.add(String(t))
    })
    return Array.from(types).sort().map((t) => ({ value: t, label: t, searchText: t }))
  }, [properties])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.type) {
      toast({ title: "Validation", description: "Name and type are required", variant: "destructive" })
      return
    }
    if (formData.calculation_type === "fixed" && !formData.amount) {
      toast({ title: "Validation", description: "Amount is required for fixed charges", variant: "destructive" })
      return
    }
    if (formData.calculation_type === "percentage" && (!formData.percentage || !formData.percentage_base)) {
      toast({
        title: "Validation",
        description: "Percentage and percentage base are required",
        variant: "destructive",
      })
      return
    }

    const payload: StatutoryChargeDefinitionPayload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      type: formData.type,
      charge_category: formData.charge_category,
      calculation_type: formData.calculation_type,
      amount: formData.calculation_type === "fixed" ? formData.amount : null,
      percentage: formData.calculation_type === "percentage" ? formData.percentage : null,
      percentage_base: formData.calculation_type === "percentage" ? formData.percentage_base : null,
      property_id: formData.property_id || null,
      property_type: formData.property_type.trim() || null,
      department_id: formData.department_id || null,
      is_recurring: formData.is_recurring,
      frequency: formData.is_recurring ? formData.frequency || null : null,
      is_active: formData.is_active,
      rules:
        formData.charge_category === "event_based" && formData.event_trigger
          ? { event_trigger: formData.event_trigger }
          : null,
    }

    setLoading(true)
    try {
      const response =
        mode === "edit" && definitionId
          ? await updateStatutoryChargeDefinition(definitionId, payload)
          : await createStatutoryChargeDefinition(payload)

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || (mode === "edit" ? "Definition updated" : "Definition created"),
        })
        router.push("/admin/statutory-charges/definitions")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save definition",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/admin/statutory-charges/definitions">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to definitions
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{mode === "edit" ? "Edit Definition" : "New Charge Definition"}</h1>
        <p className="text-muted-foreground mt-1">Configure calculation method, category, and property scope</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Definition details</CardTitle>
            <CardDescription>{CATEGORY_HELP[formData.charge_category]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Survey fee"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Charge type *</Label>
                {chargeTypeOptions.length > 0 ? (
                  <SearchableSelect
                    options={chargeTypeOptions}
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    placeholder="Select type..."
                  />
                ) : (
                  <Input
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g. Survey Fee"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.charge_category}
                  onValueChange={(value: any) => setFormData({ ...formData, charge_category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estate_wide">Estate-Wide (auto on allocate/subscribe)</SelectItem>
                    <SelectItem value="member_based">Member-Based (manual assign)</SelectItem>
                    <SelectItem value="event_based">Event-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Calculation *</Label>
                <Select
                  value={formData.calculation_type}
                  onValueChange={(value: any) => setFormData({ ...formData, calculation_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                    <SelectItem value="percentage">Percentage of base</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.calculation_type === "fixed" ? (
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Percentage *</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      step="0.0001"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Percentage base *</Label>
                    <Select
                      value={formData.percentage_base}
                      onValueChange={(value: any) => setFormData({ ...formData, percentage_base: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="property_cost">Property cost</SelectItem>
                        <SelectItem value="house_cost">House cost</SelectItem>
                        <SelectItem value="land_cost">Land cost</SelectItem>
                        <SelectItem value="mortgage_amount">Mortgage amount</SelectItem>
                        <SelectItem value="equity_amount">Equity amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Property (optional scope)</Label>
                <SearchableSelect
                  options={propertyOptions}
                  value={formData.property_id || ""}
                  onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                  placeholder="Any property..."
                  allowEmpty
                  emptyValueLabel="Any property"
                />
              </div>

              <div className="space-y-2">
                <Label>House / property type (optional)</Label>
                <Input
                  list="house-type-options"
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  placeholder="e.g. 3-Bedroom or leave blank for any"
                />
                <datalist id="house-type-options">
                  {houseTypeOptions.map((t) => (
                    <option key={t.value} value={t.value} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label>Department (optional)</Label>
                <Select
                  value={formData.department_id || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department_id: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.charge_category === "event_based" && (
                <div className="space-y-2">
                  <Label>Event trigger</Label>
                  <Select
                    value={formData.event_trigger || "none"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, event_trigger: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      <SelectItem value="mortgage_activation">Mortgage activation (on approve)</SelectItem>
                      <SelectItem value="ownership_transfer">Ownership transfer</SelectItem>
                      <SelectItem value="reallocation">Reallocation</SelectItem>
                      <SelectItem value="building_plan_approval">Building plan approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Inactive definitions are skipped by auto-assign</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
                <div>
                  <Label>Recurring</Label>
                  <p className="text-sm text-muted-foreground">Mark for future recurring billing (Phase 1 stores flag only)</p>
                </div>
                <Switch
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                />
              </div>

              {formData.is_recurring && (
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={formData.frequency || "none"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, frequency: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/admin/statutory-charges/definitions">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {mode === "edit" ? "Save changes" : "Create definition"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
