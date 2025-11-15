"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Check, ArrowRight, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"

interface Package {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  billing_cycle: string
  trial_days: number
  is_active: boolean
  is_featured: boolean
  limits: Record<string, any>
  modules?: Array<{
    id: string
    name: string
    slug: string
    limits?: any
  }>
}

export default function OnboardingPage() {
  // Get platform domain dynamically
  const [platformDomain, setPlatformDomain] = useState<string>('coophub.com')

  useEffect(() => {
    // Get platform domain from environment variable or extract from current hostname
    const envDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN
    if (envDomain) {
      // Remove protocol if present and trailing slash
      const cleanDomain = envDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
      setPlatformDomain(cleanDomain)
      return
    }
    
    // Fallback: extract domain from current hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        setPlatformDomain('coophub.com') // Default for local development
        return
      }
      // Try to extract base domain (e.g., from "app.example.com" -> "example.com")
      const parts = hostname.split('.')
      if (parts.length >= 2) {
        setPlatformDomain(parts.slice(-2).join('.'))
        return
      }
    }
    
    // Ultimate fallback
    setPlatformDomain('coophub.com')
  }, [])

  const [step, setStep] = useState(1)
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoadingPackages, setIsLoadingPackages] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: Business Information
    businessName: "",
    slug: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    // Step 2: Admin Account
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPassword: "",
    adminConfirmPassword: "",
    // Step 3: Package Selection
    selectedPackage: "",
    paymentMethod: "manual",
  })

  // Fetch packages on mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoadingPackages(true)
        const response = await apiFetch<{ success: boolean; packages: Package[] }>("/onboarding/packages")
        if (response.success && response.packages) {
          setPackages(response.packages)
          // Auto-select first package if available
          if (response.packages.length > 0 && !formData.selectedPackage) {
            setFormData((prev) => ({ ...prev, selectedPackage: response.packages[0].id }))
          }
        }
      } catch (err) {
        console.error("Failed to fetch packages:", err)
        setError("Failed to load packages. Please refresh the page.")
      } finally {
        setIsLoadingPackages(false)
      }
    }

    fetchPackages()
  }, [])

  // Check slug availability
  useEffect(() => {
    const checkSlug = async () => {
      if (!formData.slug || formData.slug.length < 3) {
        setSlugAvailable(null)
        return
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?$/
      if (!slugRegex.test(formData.slug)) {
        setSlugAvailable(false)
        return
      }

      try {
        setSlugChecking(true)
        const response = await apiFetch<{ available: boolean; suggestions?: string[] }>(
          `/business-onboarding/check-slug/${formData.slug}`
        )
        setSlugAvailable(response.available)
      } catch (err) {
        console.error("Failed to check slug:", err)
        setSlugAvailable(null)
      } finally {
        setSlugChecking(false)
      }
    }

    const timeoutId = setTimeout(checkSlug, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [formData.slug])

  const handleNext = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.businessName || !formData.slug || !formData.contactEmail || !formData.contactPhone || !formData.address) {
        setError("Please fill in all business information fields")
        return
      }
      if (slugAvailable === false) {
        setError("Please choose an available subdomain")
        return
      }
    } else if (step === 2) {
      if (!formData.adminFirstName || !formData.adminLastName || !formData.adminEmail || !formData.adminPassword || !formData.adminConfirmPassword) {
        setError("Please fill in all admin account fields")
        return
      }
      if (formData.adminPassword !== formData.adminConfirmPassword) {
        setError("Passwords do not match")
        return
      }
      if (formData.adminPassword.length < 8) {
        setError("Password must be at least 8 characters")
        return
      }
    } else if (step === 3) {
      if (!formData.selectedPackage) {
        setError("Please select a package")
        return
      }
    }
    
    setError(null)
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    setError(null)
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const selectedPkg = packages.find((p) => p.id === formData.selectedPackage)
      if (!selectedPkg) {
        throw new Error("Please select a package")
      }

      const payload = {
        business_name: formData.businessName,
        slug: formData.slug,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        address: formData.address,
        package_id: formData.selectedPackage,
        payment_method: formData.paymentMethod,
        admin_first_name: formData.adminFirstName,
        admin_last_name: formData.adminLastName,
        admin_email: formData.adminEmail,
        admin_password: formData.adminPassword,
        admin_password_confirmation: formData.adminConfirmPassword,
      }

      const response = await apiFetch<{
        success: boolean
        message: string
        tenant_id?: string
        subscription_id?: string
        payment_reference?: string
        payment_url?: string
        payment_method?: string
        amount?: number
        next_steps?: string
      }>("/business-onboarding", {
        method: "POST",
        body: payload,
      })

      if (response.success) {
        // Handle payment flow
        if (response.payment_url) {
          // Redirect to payment gateway
          window.location.href = response.payment_url
        } else {
          // Manual payment - show success message with instructions
          alert(
            `Tenant created successfully!\n\n` +
            `Payment Reference: ${response.payment_reference}\n` +
            `Amount: ₦${response.amount?.toLocaleString()}\n\n` +
            `Please complete payment and wait for admin approval.`
          )
          // Redirect to a success page or back to home
          window.location.href = "/saas?onboarding=success"
        }
      } else {
        throw new Error(response.message || "Failed to create tenant")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create tenant. Please try again."
      setError(message)
      console.error("Onboarding error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null) // Clear error when user types
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPackageFeatures = (pkg: Package): string[] => {
    const features: string[] = []
    if (pkg.limits) {
      if (pkg.limits.max_members) {
        features.push(`Up to ${pkg.limits.max_members} members`)
      }
      if (pkg.limits.max_properties) {
        features.push(`${pkg.limits.max_properties} property listings`)
      }
      if (pkg.limits.max_loans) {
        features.push(`${pkg.limits.max_loans} loan products`)
      }
      if (pkg.limits.storage_gb) {
        features.push(`${pkg.limits.storage_gb}GB storage`)
      }
    }
    if (pkg.modules && pkg.modules.length > 0) {
      features.push(`${pkg.modules.length} modules included`)
    }
    if (features.length === 0) {
      features.push("All core features")
    }
    return features
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/saas" className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <span>CoopHub</span>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Create Your Cooperative Account</h1>
          <p className="text-muted-foreground mt-2">Get started with your 14-day free trial</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 4 && <div className={`h-1 w-16 mx-2 ${s < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <Card className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Step 1: Business Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Business Information</h2>
                  <p className="text-muted-foreground">Tell us about your cooperative</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Cooperative Name</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g., FRSC Housing Cooperative"
                      value={formData.businessName}
                      onChange={(e) => updateFormData("businessName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Subdomain</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="slug"
                        placeholder="e.g., frsc"
                        value={formData.slug}
                        onChange={(e) =>
                          updateFormData("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        }
                        required
                        className={slugAvailable === false ? "border-destructive" : slugAvailable === true ? "border-green-500" : ""}
                      />
                      <span className="text-muted-foreground whitespace-nowrap">.{platformDomain}</span>
                      {slugChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {slugAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                      {slugAvailable === false && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </div>
                    <p className="text-sm text-muted-foreground">This will be your cooperative's web address</p>
                    {slugAvailable === false && (
                      <p className="text-sm text-destructive">This subdomain is already taken. Please choose another.</p>
                    )}
                    {slugAvailable === true && (
                      <p className="text-sm text-green-600">This subdomain is available!</p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="info@cooperative.com"
                        value={formData.contactEmail}
                        onChange={(e) => updateFormData("contactEmail", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="+234 800 000 0000"
                        value={formData.contactPhone}
                        onChange={(e) => updateFormData("contactPhone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your cooperative's address"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Admin Account */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Admin Account</h2>
                  <p className="text-muted-foreground">Create your administrator account</p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="adminFirstName">First Name</Label>
                      <Input
                        id="adminFirstName"
                        placeholder="John"
                        value={formData.adminFirstName}
                        onChange={(e) => updateFormData("adminFirstName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminLastName">Last Name</Label>
                      <Input
                        id="adminLastName"
                        placeholder="Doe"
                        value={formData.adminLastName}
                        onChange={(e) => updateFormData("adminLastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email Address</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@cooperative.com"
                      value={formData.adminEmail}
                      onChange={(e) => updateFormData("adminEmail", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="adminPassword"
                        type={showAdminPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.adminPassword}
                        onChange={(e) => updateFormData("adminPassword", e.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminConfirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="adminConfirmPassword"
                        type={showAdminConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.adminConfirmPassword}
                        onChange={(e) => updateFormData("adminConfirmPassword", e.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminConfirmPassword(!showAdminConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showAdminConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Package Selection */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
                  <p className="text-muted-foreground">Select the package that fits your needs</p>
                </div>

                {isLoadingPackages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading packages...</span>
                  </div>
                ) : packages.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No packages available at the moment.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      {packages.map((pkg) => {
                        const features = getPackageFeatures(pkg)
                        return (
                          <div
                            key={pkg.id}
                            className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.selectedPackage === pkg.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => updateFormData("selectedPackage", pkg.id)}
                          >
                            {pkg.is_featured && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                                Popular
                              </div>
                            )}
                            <div className="text-center mb-4">
                              <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{pkg.description || "Perfect for your needs"}</p>
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-3xl font-bold">{formatPrice(pkg.price)}</span>
                                <span className="text-muted-foreground text-sm">/{pkg.billing_cycle === "yearly" ? "year" : "month"}</span>
                              </div>
                            </div>
                            <ul className="space-y-2">
                              {features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            {formData.selectedPackage === pkg.id && (
                              <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {formData.selectedPackage && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <Select value={formData.paymentMethod} onValueChange={(value) => updateFormData("paymentMethod", value)}>
                            <SelectTrigger id="paymentMethod">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Manual Payment (Bank Transfer)</SelectItem>
                              <SelectItem value="paystack">Paystack (Card/Bank Transfer)</SelectItem>
                              <SelectItem value="remita">Remita</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {formData.paymentMethod === "manual"
                              ? "You'll upload payment evidence after submission and wait for admin approval"
                              : "You'll be redirected to complete payment securely"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>{packages.find((p) => p.id === formData.selectedPackage)?.trial_days || 14}-day free trial</strong> • No credit card required • Cancel anytime
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
                  <p className="text-muted-foreground">Please review your information before submitting</p>
                </div>

                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Business Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{formData.businessName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subdomain:</span>
                        <span className="font-medium">{formData.slug}.{platformDomain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{formData.contactEmail}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Admin Account</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">
                          {formData.adminFirstName} {formData.adminLastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{formData.adminEmail}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Selected Plan</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Package:</span>
                        <span className="font-medium">{packages.find((p) => p.id === formData.selectedPackage)?.name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">
                          {formData.selectedPackage
                            ? formatPrice(packages.find((p) => p.id === formData.selectedPackage)?.price || 0)
                            : "N/A"}
                          /{packages.find((p) => p.id === formData.selectedPackage)?.billing_cycle === "yearly" ? "year" : "month"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span className="font-medium capitalize">
                          {formData.paymentMethod === "manual" ? "Manual Payment" : formData.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trial:</span>
                        <span className="font-medium">
                          {packages.find((p) => p.id === formData.selectedPackage)?.trial_days || 14} days free
                        </span>
                      </div>
                    </div>
                  </Card>

                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm">
                      By clicking "Create Account", you agree to our{" "}
                      <Link href="/saas/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/saas/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {step < 4 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || !formData.selectedPackage}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/super-admin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
