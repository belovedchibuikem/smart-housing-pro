"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react"
import { meRequest, registerRequest, setAuthToken } from "@/lib/api/client"
import { OtpVerificationDialog } from "@/components/auth/otp-verification-dialog"
import { Recaptcha, RecaptchaRef } from "@/components/auth/recaptcha"
import { useI18n } from "@/lib/i18n/i18n-provider"

export function RegisterForm() {
  const { t } = useI18n()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<RecaptchaRef>(null)
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
          alert(t("register.valPersonal"))
          return false
        }
        if (!formData.password || !formData.confirmPassword) {
          alert(t("register.valPassword"))
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          alert(t("register.valPasswordMatch"))
          return false
        }
        if (formData.membershipType === "non-member" && (!formData.idType || !formData.idNumber)) {
          alert(t("register.valId"))
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
            alert(t("register.valEmployment"))
            return false
          }
        }
        return true

      case 3:
        if (!formData.nokName || !formData.nokRelationship || !formData.nokPhone) {
          alert(t("register.valNok"))
          return false
        }
        return true

      case 4:
        if (!formData.agreeToTerms) {
          alert(t("register.valTerms"))
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
      // Execute reCAPTCHA v3 before submitting
      let token: string
      if (recaptchaRef.current) {
        token = await recaptchaRef.current.execute()
      } else {
        alert(t("register.recaptchaNotReady"))
        setIsLoading(false)
        return
      }

      // Send all form fields to API
      const payload: Record<string, unknown> = {
        recaptcha_token: token,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        membership_type: formData.membershipType,
      }

      // Add ID information for non-members
      if (formData.membershipType === 'non-member') {
        if (formData.idType) payload.id_type = formData.idType
        if (formData.idNumber) payload.id_number = formData.idNumber
      }

      // Add employment details for members
      if (formData.membershipType === 'member') {
        if (formData.staffNumber) payload.staff_number = formData.staffNumber
        if (formData.ippisNumber) payload.ippis_number = formData.ippisNumber
        if (formData.dateOfFirstEmployment) payload.date_of_first_employment = formData.dateOfFirstEmployment
        if (formData.yearsOfService) payload.years_of_service = parseInt(formData.yearsOfService)
        if (formData.commandDepartment) payload.command_department = formData.commandDepartment
        if (formData.unit) payload.unit = formData.unit
        if (formData.rank) payload.rank = formData.rank
      }

      // Add next of kin information
      if (formData.nokName) payload.nok_name = formData.nokName
      if (formData.nokRelationship) payload.nok_relationship = formData.nokRelationship
      if (formData.nokPhone) payload.nok_phone = formData.nokPhone
      if (formData.nokEmail) payload.nok_email = formData.nokEmail
      if (formData.nokAddress) payload.nok_address = formData.nokAddress

      const response = await registerRequest(payload)
      
      if (response.success || response.requires_otp_verification) {
      setShowOtpDialog(true)
      } else {
        throw new Error(response.message || t("register.registrationFailed"))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t("register.registrationFailed")
      alert(message)
      // Reset reCAPTCHA token on error
      setRecaptchaToken(null)
      // Re-execute reCAPTCHA on next attempt
      if (recaptchaRef.current) {
        try {
          await recaptchaRef.current.execute()
        } catch {
          // Ignore reCAPTCHA errors during retry
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token)
  }

  const handleRecaptchaError = () => {
    setRecaptchaToken(null)
  }

  const handleOtpSuccess = (token?: string, user?: unknown) => {
    if (token) {
      setAuthToken(token)
      // Store user data
      if (user) {
        localStorage.setItem('user_data', JSON.stringify(user))
      }
      setShowOtpDialog(false)
      // Redirect to dashboard
      router.push("/dashboard")
    }
  }

  const stepTitles = [t("register.stepPersonal"), t("register.stepEmployment"), t("register.stepNok"), t("register.stepDocuments")]
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {t("register.stepOf").replace("{current}", String(currentStep)).replace("{total}", String(totalSteps))}
            </span>
            <span className="text-muted-foreground">
              {t("register.percentComplete").replace("{n}", String(Math.round(progressPercentage)))}
            </span>
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
              <h2 className="text-xl font-semibold">{t("register.personalTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.personalDesc")}</p>
            </div>

            <div className="space-y-3">
              <Label>{t("register.membershipType")}</Label>
              <RadioGroup
                value={formData.membershipType}
                onValueChange={(value) => setFormData({ ...formData, membershipType: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="member" id="member" />
                  <Label htmlFor="member" className="font-normal cursor-pointer">
                    {t("register.frscMember")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-member" id="non-member" />
                  <Label htmlFor="non-member" className="font-normal cursor-pointer">
                    {t("register.nonMember")}
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {formData.membershipType === "member" ? t("register.memberHint") : t("register.nonMemberHint")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("register.firstName")}</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("register.lastName")}</Label>
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
              <Label htmlFor="email">{t("register.email")}</Label>
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
              <Label htmlFor="phone">{t("register.phone")}</Label>
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
                  <Label htmlFor="idType">{t("register.idType")}</Label>
                  <Select
                    value={formData.idType}
                    onValueChange={(value) => setFormData({ ...formData, idType: value })}
                  >
                    <SelectTrigger id="idType">
                      <SelectValue placeholder={t("register.idTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drivers-license">{t("register.idDrivers")}</SelectItem>
                      <SelectItem value="nin">{t("register.idNin")}</SelectItem>
                      <SelectItem value="frsc-id">{t("register.idFrsc")}</SelectItem>
                      <SelectItem value="international-passport">{t("register.idPassport")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">{t("register.idNumber")}</Label>
                  <Input
                    id="idNumber"
                    placeholder={t("register.idNumberPlaceholder")}
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    required={formData.membershipType === "non-member"}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">{t("register.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("register.passwordPlaceholder")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("register.confirmPassword")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("register.confirmPasswordPlaceholder")}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{t("register.employmentTitle")}</h2>
              <p className="text-sm text-muted-foreground">
                {formData.membershipType === "member" ? t("register.employmentMemberDesc") : t("register.employmentNonMemberDesc")}
              </p>
            </div>

            {formData.membershipType === "member" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staffNumber">{t("register.staffNumber")}</Label>
                    <Input
                      id="staffNumber"
                      placeholder="C-01943"
                      value={formData.staffNumber}
                      onChange={(e) => setFormData({ ...formData, staffNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ippisNumber">{t("register.ippisNumber")}</Label>
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
                  <Label htmlFor="rank">{t("register.rank")}</Label>
                  <Select value={formData.rank} onValueChange={(value) => setFormData({ ...formData, rank: value })}>
                    <SelectTrigger id="rank">
                      <SelectValue placeholder={t("register.rankPlaceholder")} />
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
                    <Label htmlFor="commandDepartment">{t("register.commandDept")}</Label>
                    <Select
                      value={formData.commandDepartment}
                      onValueChange={(value) => setFormData({ ...formData, commandDepartment: value })}
                    >
                      <SelectTrigger id="commandDepartment">
                        <SelectValue placeholder={t("register.commandPlaceholder")} />
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
                    <Label htmlFor="unit">{t("register.unit")}</Label>
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
                    <Label htmlFor="dateOfFirstEmployment">{t("register.dateEmployment")}</Label>
                    <Input
                      id="dateOfFirstEmployment"
                      type="date"
                      value={formData.dateOfFirstEmployment}
                      onChange={(e) => setFormData({ ...formData, dateOfFirstEmployment: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsOfService">{t("register.yearsOfService")}</Label>
                    <Input
                      id="yearsOfService"
                      value={formData.yearsOfService}
                      placeholder={t("register.yearsAuto")}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("register.employmentSkip")}</p>
                <p className="text-sm mt-2">{t("register.employmentSkipNext")}</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{t("register.nokTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.nokDesc")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nokName">{t("register.nokName")}</Label>
              <Input
                id="nokName"
                placeholder={t("register.nokNamePlaceholder")}
                value={formData.nokName}
                onChange={(e) => setFormData({ ...formData, nokName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nokRelationship">{t("register.nokRelationship")}</Label>
              <Select
                value={formData.nokRelationship}
                onValueChange={(value) => setFormData({ ...formData, nokRelationship: value })}
              >
                <SelectTrigger id="nokRelationship">
                  <SelectValue placeholder={t("register.nokRelationshipPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spouse">{t("register.relSpouse")}</SelectItem>
                  <SelectItem value="parent">{t("register.relParent")}</SelectItem>
                  <SelectItem value="sibling">{t("register.relSibling")}</SelectItem>
                  <SelectItem value="child">{t("register.relChild")}</SelectItem>
                  <SelectItem value="other">{t("register.relOther")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nokPhone">{t("register.nokPhone")}</Label>
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
              <Label htmlFor="nokEmail">{t("register.nokEmail")}</Label>
              <Input
                id="nokEmail"
                type="email"
                placeholder="nok@example.com"
                value={formData.nokEmail}
                onChange={(e) => setFormData({ ...formData, nokEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nokAddress">{t("register.nokAddress")}</Label>
              <Input
                id="nokAddress"
                placeholder={t("register.nokAddressPlaceholder")}
                value={formData.nokAddress}
                onChange={(e) => setFormData({ ...formData, nokAddress: e.target.value })}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{t("register.documentsTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("register.documentsDesc")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhoto">{t("register.profilePhoto")}</Label>
              <Input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.files?.[0] || null })}
              />
              <p className="text-xs text-muted-foreground">{t("register.profilePhotoHint")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idDocument">{t("register.idDocument")}</Label>
              <Input
                id="idDocument"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFormData({ ...formData, idDocument: e.target.files?.[0] || null })}
              />
              <p className="text-xs text-muted-foreground">{t("register.idDocumentHint")}</p>
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
                {t("register.termsPrefix")}{" "}
                <a href="/terms" className="text-primary hover:underline">
                  {t("register.termsLink")}
                </a>{" "}
                {t("register.termsAnd")}{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  {t("register.privacyLink")}
                </a>
              </label>
            </div>

            <Recaptcha
              ref={recaptchaRef}
              onVerify={handleRecaptchaVerify}
              onError={handleRecaptchaError}
              action="register"
            />
            <p className="text-[11px] text-muted-foreground text-center leading-snug">{t("register.recaptcha")}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t("register.back")}
            </Button>
          )}
          {currentStep < totalSteps ? (
            <Button type="button" onClick={handleNext} className="flex-1">
              {t("register.next")}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? t("register.creating") : t("register.submit")}
            </Button>
          )}
        </div>
      </form>

      <OtpVerificationDialog
        open={showOtpDialog}
        onOpenChange={setShowOtpDialog}
        email={formData.email}
        phone={formData.phone}
        type="registration"
        onSuccess={handleOtpSuccess}
        onError={(msg) => alert(msg)}
      />
    </>
  )
}
