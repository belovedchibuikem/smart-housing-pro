"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { registerRequest, verifyOtpRequest, resendOtpRequest, setAuthToken } from "@/lib/api/client"

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otp, setOtp] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const [formData, setFormData] = useState({
    membershipType: "member",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    idType: "",
    idNumber: "",
    ippisNumber: "",
    dateOfFirstEmployment: "",
    yearsOfService: "",
    commandDepartment: "",
    unit: "",
    rank: "",
    staffNumber: "",
    nokName: "",
    nokRelationship: "",
    nokPhone: "",
    nokEmail: "",
    nokAddress: "",
    profilePhoto: null as File | null,
    idDocument: null as File | null,
    agreeToTerms: false,
  })

  useEffect(() => {
    if (formData.dateOfFirstEmployment) {
      const startDate = new Date(formData.dateOfFirstEmployment)
      const currentDate = new Date()

      const years = currentDate.getFullYear() - startDate.getFullYear()
      const months = currentDate.getMonth() - startDate.getMonth()

      let totalYears = years
      let totalMonths = months

      if (totalMonths < 0) {
        totalYears -= 1
        totalMonths += 12
      }

      const serviceText =
        totalMonths > 0
          ? `${totalYears} yrs and ${totalMonths} months (approximately ${totalYears + 1} yrs)`
          : `${totalYears} yrs`

      setFormData((prev) => ({ ...prev, yearsOfService: serviceText }))
    }
  }, [formData.dateOfFirstEmployment])

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          alert("Please fill in all personal information fields")
          return false
        }
        if (!formData.password || !formData.confirmPassword) {
          alert("Please enter and confirm your password")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match")
          return false
        }
        if (formData.membershipType === "non-member" && (!formData.idType || !formData.idNumber)) {
          alert("Please provide valid ID information")
          return false
        }
        return true

      case 2:
        if (formData.membershipType === "member") {
          if (
            !formData.ippisNumber ||
            !formData.dateOfFirstEmployment ||
            !formData.commandDepartment ||
            !formData.unit ||
            !formData.staffNumber
          ) {
            alert("Please fill in all employment details")
            return false
          }
        }
        return true

      case 3:
        if (!formData.nokName || !formData.nokRelationship || !formData.nokPhone) {
          alert("Please fill in Next of Kin information")
          return false
        }
        return true

      case 4:
        if (!formData.agreeToTerms) {
          alert("Please agree to the terms and conditions")
          return false
        }
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(currentStep)) {
      return
    }

    setIsLoading(true)
    try {
      // Minimal payload for registration; backend can accept richer shape later
      await registerRequest({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        membership_type: formData.membershipType,
        staff_number: formData.staffNumber || undefined,
        ippis_number: formData.ippisNumber || undefined,
      })

      setShowOtpDialog(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      alert(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerification = async () => {
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    try {
      const res = await verifyOtpRequest({ email: formData.email, otp })
      if (res.token) {
        setAuthToken(res.token)
      }
      setShowOtpDialog(false)
      router.push("/subscription")
    } catch (err) {
      const message = err instanceof Error ? err.message : "OTP verification failed"
      alert(message)
    } finally {
      setIsLoading(false)
    }
  }

  const stepTitles = ["Personal", "Employment", "Next of Kin", "Documents"]
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {stepTitles.map((title, index) => {
            const stepNumber = index + 1
            const isActive = currentStep === stepNumber
            const isCompleted = currentStep > stepNumber

            return (
              <button
                key={stepNumber}
                type="button"
                onClick={() => {
                  if (stepNumber < currentStep || validateStep(currentStep)) {
                    setCurrentStep(stepNumber)
                  }
                }}
                className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "border-primary bg-primary/5 text-primary"
                    : isCompleted
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                }`}
              >
                {title}
              </button>
            )
          })}
        </div>

        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <p className="text-sm text-muted-foreground">Provide your basic details</p>
            </div>

            <div className="space-y-3">
              <Label>Membership Type</Label>
              <RadioGroup
                value={formData.membershipType}
                onValueChange={(value) => setFormData({ ...formData, membershipType: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="member" id="member" />
                  <Label htmlFor="member" className="font-normal cursor-pointer">
                    FRSC Member
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-member" id="non-member" />
                  <Label htmlFor="non-member" className="font-normal cursor-pointer">
                    Non-Member
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {formData.membershipType === "member"
                  ? "For FRSC staff members"
                  : "For non-FRSC members (higher interest rates apply)"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            {formData.membershipType === "non-member" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="idType">Valid ID Type</Label>
                  <Select
                    value={formData.idType}
                    onValueChange={(value) => setFormData({ ...formData, idType: value })}
                  >
                    <SelectTrigger id="idType">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drivers-license">Driver's License</SelectItem>
                      <SelectItem value="nin">NIN Card</SelectItem>
                      <SelectItem value="frsc-id">FRSC ID</SelectItem>
                      <SelectItem value="international-passport">International Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    placeholder="Enter ID number"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    required={formData.membershipType === "non-member"}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Employment Information</h2>
              <p className="text-sm text-muted-foreground">
                {formData.membershipType === "member"
                  ? "Provide your FRSC employment details"
                  : "This section is optional for non-members"}
              </p>
            </div>

            {formData.membershipType === "member" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staffNumber">Staff ID Number</Label>
                    <Input
                      id="staffNumber"
                      placeholder="C-01943"
                      value={formData.staffNumber}
                      onChange={(e) => setFormData({ ...formData, staffNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ippisNumber">IPPIS Number</Label>
                    <Input
                      id="ippisNumber"
                      placeholder="Enter IPPIS number"
                      value={formData.ippisNumber}
                      onChange={(e) => setFormData({ ...formData, ippisNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rank">Rank/Position</Label>
                  <Select value={formData.rank} onValueChange={(value) => setFormData({ ...formData, rank: value })}>
                    <SelectTrigger id="rank">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marshal">Corps Marshal</SelectItem>
                      <SelectItem value="dcm">Deputy Corps Marshal</SelectItem>
                      <SelectItem value="acm">Assistant Corps Marshal</SelectItem>
                      <SelectItem value="cc">Corps Commander</SelectItem>
                      <SelectItem value="dcc">Deputy Corps Commander</SelectItem>
                      <SelectItem value="acc">Assistant Corps Commander</SelectItem>
                      <SelectItem value="crc">Chief Route Commander</SelectItem>
                      <SelectItem value="src">Senior Route Commander</SelectItem>
                      <SelectItem value="rc">Route Commander</SelectItem>
                      <SelectItem value="arc">Assistant Route Commander</SelectItem>
                      <SelectItem value="sma">Senior Marshal Assistant</SelectItem>
                      <SelectItem value="ma">Marshal Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commandDepartment">Command/Department</Label>
                    <Select
                      value={formData.commandDepartment}
                      onValueChange={(value) => setFormData({ ...formData, commandDepartment: value })}
                    >
                      <SelectTrigger id="commandDepartment">
                        <SelectValue placeholder="Select command/department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="headquarters">Headquarters</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="enforcement">Enforcement</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="admin">Administration</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="ict">ICT</SelectItem>
                        <SelectItem value="planning">Planning & Research</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="CMO"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfFirstEmployment">Date of Employment</Label>
                    <Input
                      id="dateOfFirstEmployment"
                      type="date"
                      value={formData.dateOfFirstEmployment}
                      onChange={(e) => setFormData({ ...formData, dateOfFirstEmployment: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsOfService">Years of Service</Label>
                    <Input
                      id="yearsOfService"
                      value={formData.yearsOfService}
                      placeholder="Auto-calculated"
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Employment information is not required for non-members.</p>
                <p className="text-sm mt-2">Click Next to continue.</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Next of Kin</h2>
              <p className="text-sm text-muted-foreground">Provide emergency contact information</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nokName">Full Name</Label>
              <Input
                id="nokName"
                placeholder="Enter next of kin's full name"
                value={formData.nokName}
                onChange={(e) => setFormData({ ...formData, nokName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nokRelationship">Relationship</Label>
              <Select
                value={formData.nokRelationship}
                onValueChange={(value) => setFormData({ ...formData, nokRelationship: value })}
              >
                <SelectTrigger id="nokRelationship">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nokPhone">Phone Number</Label>
              <Input
                id="nokPhone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={formData.nokPhone}
                onChange={(e) => setFormData({ ...formData, nokPhone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nokEmail">Email Address (Optional)</Label>
              <Input
                id="nokEmail"
                type="email"
                placeholder="nok@example.com"
                value={formData.nokEmail}
                onChange={(e) => setFormData({ ...formData, nokEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nokAddress">Address</Label>
              <Input
                id="nokAddress"
                placeholder="Enter full address"
                value={formData.nokAddress}
                onChange={(e) => setFormData({ ...formData, nokAddress: e.target.value })}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Documents</h2>
              <p className="text-sm text-muted-foreground">Upload required documents (optional at registration)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhoto">Profile Photo</Label>
              <Input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.files?.[0] || null })}
              />
              <p className="text-xs text-muted-foreground">Upload a clear passport photograph</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idDocument">ID Document</Label>
              <Input
                id="idDocument"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFormData({ ...formData, idDocument: e.target.files?.[0] || null })}
              />
              <p className="text-xs text-muted-foreground">Upload a copy of your valid ID</p>
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          {currentStep < totalSteps ? (
            <Button type="button" onClick={handleNext} className="flex-1">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          )}
        </div>
      </form>

      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Account</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit verification code to {formData.email} and {formData.phone}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Didn't receive the code?{" "}
              <button type="button" className="text-primary hover:underline">
                Resend OTP
              </button>
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOtpDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleOtpVerification} disabled={isLoading || otp.length !== 6}>
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
