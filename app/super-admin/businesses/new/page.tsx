"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Building2, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface PackageOption {
  id: string
  name: string
  price: number
  billing_cycle?: string
  is_active?: boolean
  custom_pricing?: boolean
  limits?: { custom_pricing?: boolean }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
}

export default function OnboardBusinessPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [slugTouched, setSlugTouched] = useState(false)

  const [form, setForm] = useState({
    business_name: "",
    slug: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    package_id: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
    admin_password: "",
    admin_phone: "",
    activate_immediately: true,
  })

  useEffect(() => {
    ;(async () => {
      try {
        setLoadingPackages(true)
        const response = await apiFetch<{ packages: PackageOption[] }>("/super-admin/packages?per_page=100&is_active=1")
        const list = (response.packages ?? []).filter((pkg) => !pkg.custom_pricing && !pkg.limits?.custom_pricing)
        setPackages(list)
        if (list.length > 0) {
          setForm((prev) => ({ ...prev, package_id: prev.package_id || list[0].id }))
        }
      } catch {
        toast({
          title: "Unable to load packages",
          description: "Check that packages exist before onboarding a business.",
          variant: "destructive",
        })
      } finally {
        setLoadingPackages(false)
      }
    })()
  }, [toast])

  useEffect(() => {
    if (!form.slug || form.slug.length < 2) {
      setSlugStatus("idle")
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSlugStatus("checking")
        const response = await apiFetch<{ available: boolean }>(`/super-admin/businesses/check-slug/${form.slug}`)
        setSlugStatus(response.available ? "available" : "taken")
      } catch {
        setSlugStatus("idle")
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [form.slug])

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === form.package_id),
    [packages, form.package_id],
  )

  const updateField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (slugStatus === "taken") {
      toast({
        title: "Slug unavailable",
        description: "Choose a different subdomain slug.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await apiFetch<{
        success: boolean
        message: string
        tenant_id?: string
        business?: { id: string }
      }>("/super-admin/businesses", {
        method: "POST",
        body: {
          business_name: form.business_name,
          slug: form.slug,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone || undefined,
          address: form.address || undefined,
          package_id: form.package_id,
          payment_method: "manual",
          admin_first_name: form.admin_first_name,
          admin_last_name: form.admin_last_name,
          admin_email: form.admin_email,
          admin_password: form.admin_password,
          admin_phone: form.admin_phone || undefined,
          activate_immediately: form.activate_immediately,
        },
      })

      if (!response.success) {
        throw new Error(response.message || "Onboarding failed")
      }

      toast({
        title: "Business onboarded",
        description: response.message || "Tenant database and admin account are ready.",
      })

      const id = response.business?.id || response.tenant_id
      router.push(id ? `/super-admin/businesses/${id}` : "/super-admin/businesses")
    } catch (error: any) {
      toast({
        title: "Onboarding failed",
        description: error?.message || "Unable to onboard this business.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link href="/super-admin/businesses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to businesses
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Onboard Business</h1>
          <p className="text-muted-foreground mt-2">
            Create a tenant with database, admin login, package, and subdomain in one step.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Business details</h2>
              <p className="text-sm text-muted-foreground">Cooperative identity and contact information</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="business_name">Business name</Label>
              <Input
                id="business_name"
                required
                value={form.business_name}
                onChange={(e) => {
                  const name = e.target.value
                  updateField("business_name", name)
                  if (!slugTouched) {
                    updateField("slug", slugify(name))
                  }
                }}
                placeholder="FRSC Housing Cooperative"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Subdomain slug</Label>
              <Input
                id="slug"
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  updateField("slug", slugify(e.target.value))
                }}
                placeholder="frsc"
              />
              <p className="text-xs text-muted-foreground">
                {slugStatus === "checking" && "Checking availability…"}
                {slugStatus === "available" && <span className="text-green-600">Slug is available</span>}
                {slugStatus === "taken" && <span className="text-red-600">Slug is already taken</span>}
                {slugStatus === "idle" && "Used for tenant subdomain access"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact email</Label>
              <Input
                id="contact_email"
                type="email"
                required
                value={form.contact_email}
                onChange={(e) => updateField("contact_email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact phone</Label>
              <Input
                id="contact_phone"
                value={form.contact_phone}
                onChange={(e) => updateField("contact_phone", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Package</h2>
            <p className="text-sm text-muted-foreground">Assign a SaaS package to this business</p>
          </div>
          {loadingPackages ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading packages…
            </div>
          ) : packages.length === 0 ? (
            <p className="text-sm text-red-600">No active packages found. Create a package first.</p>
          ) : (
            <div className="grid gap-3">
              {packages.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`flex items-center justify-between border rounded-lg p-4 cursor-pointer ${
                    form.package_id === pkg.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="package_id"
                      checked={form.package_id === pkg.id}
                      onChange={() => updateField("package_id", pkg.id)}
                    />
                    <div>
                      <p className="font-medium">{pkg.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₦{(pkg.price || 0).toLocaleString()}
                        {pkg.billing_cycle ? ` / ${pkg.billing_cycle}` : ""}
                      </p>
                    </div>
                  </div>
                  {form.package_id === pkg.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </label>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="font-semibold">Tenant admin account</h2>
            <p className="text-sm text-muted-foreground">Initial admin login for the cooperative portal</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin_first_name">First name</Label>
              <Input
                id="admin_first_name"
                required
                value={form.admin_first_name}
                onChange={(e) => updateField("admin_first_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_last_name">Last name</Label>
              <Input
                id="admin_last_name"
                required
                value={form.admin_last_name}
                onChange={(e) => updateField("admin_last_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_email">Admin email</Label>
              <Input
                id="admin_email"
                type="email"
                required
                value={form.admin_email}
                onChange={(e) => updateField("admin_email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_phone">Admin phone</Label>
              <Input
                id="admin_phone"
                value={form.admin_phone}
                onChange={(e) => updateField("admin_phone", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="admin_password">Temporary password</Label>
              <Input
                id="admin_password"
                type="password"
                required
                minLength={8}
                value={form.admin_password}
                onChange={(e) => updateField("admin_password", e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Activate immediately</p>
              <p className="text-sm text-muted-foreground">
                Mark subscription active and skip payment approval. Recommended for super-admin onboarding.
              </p>
              {selectedPackage && (
                <p className="text-xs text-muted-foreground mt-1">
                  Package: {selectedPackage.name} · ₦{(selectedPackage.price || 0).toLocaleString()}
                </p>
              )}
            </div>
            <Switch
              checked={form.activate_immediately}
              onCheckedChange={(checked) => updateField("activate_immediately", checked)}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/super-admin/businesses">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting || loadingPackages || packages.length === 0 || slugStatus === "taken"}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Onboarding…
              </>
            ) : (
              "Onboard business"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
