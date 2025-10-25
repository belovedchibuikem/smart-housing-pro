"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Check, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
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
    selectedPackage: "professional",
  })

  const packages = [
    {
      id: "starter",
      name: "Starter",
      price: "29.99",
      description: "Perfect for small cooperatives",
      features: ["Up to 100 members", "20 property listings", "5 loan products", "5GB storage"],
    },
    {
      id: "professional",
      name: "Professional",
      price: "79.99",
      description: "For growing organizations",
      features: ["Up to 500 members", "100 property listings", "20 loan products", "25GB storage"],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "199.99",
      description: "Unlimited everything",
      features: ["Unlimited members", "Unlimited properties", "Unlimited loan products", "100GB storage"],
    },
  ]

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Onboarding data:", formData)
    // TODO: API call to create business
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
                      />
                      <span className="text-muted-foreground whitespace-nowrap">.coophub.com</span>
                    </div>
                    <p className="text-sm text-muted-foreground">This will be your cooperative's web address</p>
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
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.adminPassword}
                      onChange={(e) => updateFormData("adminPassword", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminConfirmPassword">Confirm Password</Label>
                    <Input
                      id="adminConfirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.adminConfirmPassword}
                      onChange={(e) => updateFormData("adminConfirmPassword", e.target.value)}
                      required
                    />
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

                <div className="grid gap-4 md:grid-cols-3">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.selectedPackage === pkg.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => updateFormData("selectedPackage", pkg.id)}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                          Popular
                        </div>
                      )}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold">₦{pkg.price}</span>
                          <span className="text-muted-foreground text-sm">/month</span>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {pkg.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
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
                  ))}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>14-day free trial</strong> • No credit card required • Cancel anytime
                  </p>
                </div>
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
                        <span className="font-medium">{formData.slug}.coophub.com</span>
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
                        <span className="font-medium capitalize">{formData.selectedPackage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">
                          ₦{packages.find((p) => p.id === formData.selectedPackage)?.price}/month
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trial:</span>
                        <span className="font-medium">14 days free</span>
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
                <Button type="submit">Create Account</Button>
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
