"use client"

import type React from "react"
import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MemberService, type Member } from "@/lib/api/member-service"
import { apiFetch } from "@/lib/api/client"

function toInputDate(v?: string | null): string {
  if (!v) return ""
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v.slice(0, 10)
  return d.toISOString().split("T")[0]
}

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    staff_id: "",
    ippis_number: "",
    date_of_birth: "",
    gender: "",
    marital_status: "",
    nationality: "Nigerian",
    state_of_origin: "",
    lga: "",
    residential_address: "",
    city: "",
    state: "",
    rank: "",
    department: "",
    command_state: "",
    employment_date: "",
    years_of_service: "",
    membership_type: "regular",
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const { member } = await MemberService.getMember(id)
        if (cancelled || !member) return
        const m = member as Member
        setFormData({
          first_name: m.user?.first_name ?? m.first_name ?? "",
          last_name: m.user?.last_name ?? m.last_name ?? "",
          email: m.user?.email ?? m.email ?? "",
          phone: m.user?.phone ?? m.phone ?? "",
          staff_id: m.staff_id ?? "",
          ippis_number: m.ippis_number ?? "",
          date_of_birth: toInputDate(m.date_of_birth as string),
          gender: m.gender ?? "",
          marital_status: m.marital_status ?? "",
          nationality: m.nationality ?? "Nigerian",
          state_of_origin: m.state_of_origin ?? "",
          lga: m.lga ?? "",
          residential_address: m.residential_address ?? "",
          city: m.city ?? "",
          state: m.state ?? "",
          rank: m.rank ?? "",
          department: m.department ?? "",
          command_state: m.command_state ?? "",
          employment_date: toInputDate(m.employment_date as string),
          years_of_service: m.years_of_service != null ? String(m.years_of_service) : "",
          membership_type: m.membership_type ?? "regular",
        })
      } catch (e: any) {
        toast({
          title: "Error",
          description: e?.message || "Failed to load member",
          variant: "destructive",
        })
        router.push("/admin/members")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, router, toast])

  useEffect(() => {
    if (!formData.employment_date) return
    const start = new Date(formData.employment_date)
    if (Number.isNaN(start.getTime())) return
    const years = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    setFormData((prev) => ({ ...prev, years_of_service: String(Math.max(0, years)) }))
  }, [formData.employment_date])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelect = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const yearsOfService = formData.employment_date
        ? Math.floor(
            (Date.now() - new Date(formData.employment_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
          )
        : parseInt(formData.years_of_service, 10) || 0

      await apiFetch(`/admin/members/${id}`, {
        method: "PUT",
        body: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || null,
          staff_id: formData.staff_id || null,
          ippis_number: formData.ippis_number || null,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          marital_status: formData.marital_status || null,
          nationality: formData.nationality || null,
          state_of_origin: formData.state_of_origin || null,
          lga: formData.lga || null,
          residential_address: formData.residential_address || null,
          city: formData.city || null,
          state: formData.state || null,
          rank: formData.rank || null,
          department: formData.department || null,
          command_state: formData.command_state || null,
          employment_date: formData.employment_date || null,
          years_of_service: yearsOfService,
          membership_type: formData.membership_type || "regular",
        },
      })
      toast({ title: "Member updated" })
      router.push(`/admin/members/${id}`)
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Update failed",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/admin/members/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit member</h1>
          <p className="text-muted-foreground mt-1">Update profile and employment details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Contact tied to login</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={formData.gender || "__none__"}
                  onValueChange={(v) => handleSelect("gender", v === "__none__" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marital status</Label>
                <Select
                  value={formData.marital_status || "__none__"}
                  onValueChange={(v) => handleSelect("marital_status", v === "__none__" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state_of_origin">State of origin</Label>
                <Input id="state_of_origin" name="state_of_origin" value={formData.state_of_origin} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lga">LGA</Label>
                <Input id="lga" name="lga" value={formData.lga} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="residential_address">Residential address</Label>
              <Input
                id="residential_address"
                name="residential_address"
                value={formData.residential_address}
                onChange={handleChange}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" value={formData.state} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff_id">Staff ID</Label>
                <Input id="staff_id" name="staff_id" value={formData.staff_id} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ippis_number">IPPIS</Label>
                <Input id="ippis_number" name="ippis_number" value={formData.ippis_number} onChange={handleChange} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rank">Rank</Label>
                <Input id="rank" name="rank" value={formData.rank} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={formData.department} onChange={handleChange} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="command_state">Command / state</Label>
                <Input id="command_state" name="command_state" value={formData.command_state} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment_date">Employment date</Label>
                <Input
                  id="employment_date"
                  name="employment_date"
                  type="date"
                  value={formData.employment_date}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="years_of_service">Years of service</Label>
              <Input
                id="years_of_service"
                name="years_of_service"
                value={formData.years_of_service}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Membership type</Label>
              <Select value={formData.membership_type} onValueChange={(v) => handleSelect("membership_type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
