"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"

type Step = 1 | 2 | 3 | 4

export function KYCForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)

  // Form data state
  const [personalInfo, setPersonalInfo] = useState({
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    stateOfOrigin: "",
    lga: "",
    residentialAddress: "",
    city: "",
    state: "",
  })

  const [employmentInfo, setEmploymentInfo] = useState({
    staffId: "",
    rank: "",
    department: "",
    commandState: "",
    dateOfEmployment: "",
    yearsOfService: "",
  })

  const [nextOfKin, setNextOfKin] = useState({
    fullName: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    address: "",
  })

  const [documents, setDocuments] = useState({
    idCard: null as File | null,
    passportPhoto: null as File | null,
    proofOfAddress: null as File | null,
  })

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    bvn: "",
  })

  const progress = (currentStep / 4) * 100

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    // TODO: Implement actual KYC submission
    setTimeout(() => {
      setIsLoading(false)
      router.push("/kyc/success")
    }, 2000)
  }

  const handleFileChange = (field: keyof typeof documents) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocuments({ ...documents, [field]: file })
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of 4</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, label: "Personal" },
          { num: 2, label: "Employment" },
          { num: 3, label: "Next of Kin" },
          { num: 4, label: "Documents" },
        ].map((step) => (
          <div
            key={step.num}
            className={`text-center p-3 rounded-lg border-2 transition-colors ${
              currentStep === step.num
                ? "border-primary bg-primary/5"
                : currentStep > step.num
                  ? "border-primary/50 bg-primary/5"
                  : "border-border"
            }`}
          >
            <div
              className={`text-xs font-medium ${currentStep >= step.num ? "text-primary" : "text-muted-foreground"}`}
            >
              {step.label}
            </div>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card className="p-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Personal Information</h2>
              <p className="text-sm text-muted-foreground">Please provide your personal details</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={personalInfo.gender}
                  onValueChange={(value) => setPersonalInfo({ ...personalInfo, gender: value })}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  value={personalInfo.maritalStatus}
                  onValueChange={(value) => setPersonalInfo({ ...personalInfo, maritalStatus: value })}
                >
                  <SelectTrigger id="maritalStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  placeholder="e.g., Nigerian"
                  value={personalInfo.nationality}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateOfOrigin">State of Origin</Label>
                <Input
                  id="stateOfOrigin"
                  placeholder="e.g., Lagos"
                  value={personalInfo.stateOfOrigin}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, stateOfOrigin: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lga">Local Government Area</Label>
                <Input
                  id="lga"
                  placeholder="e.g., Ikeja"
                  value={personalInfo.lga}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lga: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Residential Address</Label>
              <Textarea
                id="address"
                placeholder="Enter your full residential address"
                value={personalInfo.residentialAddress}
                onChange={(e) => setPersonalInfo({ ...personalInfo, residentialAddress: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., Lagos"
                  value={personalInfo.city}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="e.g., Lagos State"
                  value={personalInfo.state}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Employment Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Employment Information</h2>
              <p className="text-sm text-muted-foreground">Provide your FRSC employment details</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffId">Staff ID Number</Label>
                <Input
                  id="staffId"
                  placeholder="e.g., FRSC/2020/12345"
                  value={employmentInfo.staffId}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, staffId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rank">Rank/Position</Label>
                <Select
                  value={employmentInfo.rank}
                  onValueChange={(value) => setEmploymentInfo({ ...employmentInfo, rank: value })}
                >
                  <SelectTrigger id="rank">
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marshal">Marshal</SelectItem>
                    <SelectItem value="deputy-marshal">Deputy Marshal</SelectItem>
                    <SelectItem value="assistant-marshal">Assistant Marshal</SelectItem>
                    <SelectItem value="corps-commander">Corps Commander</SelectItem>
                    <SelectItem value="deputy-commander">Deputy Commander</SelectItem>
                    <SelectItem value="assistant-commander">Assistant Commander</SelectItem>
                    <SelectItem value="chief-route-commander">Chief Route Commander</SelectItem>
                    <SelectItem value="principal-route-commander">Principal Route Commander</SelectItem>
                    <SelectItem value="senior-route-commander">Senior Route Commander</SelectItem>
                    <SelectItem value="route-commander">Route Commander</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department/Unit</Label>
                <Input
                  id="department"
                  placeholder="e.g., Operations"
                  value={employmentInfo.department}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, department: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commandState">Command State</Label>
                <Input
                  id="commandState"
                  placeholder="e.g., Lagos State Command"
                  value={employmentInfo.commandState}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, commandState: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfEmployment">Date of Employment</Label>
                <Input
                  id="dateOfEmployment"
                  type="date"
                  value={employmentInfo.dateOfEmployment}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, dateOfEmployment: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfService">Years of Service</Label>
                <Input
                  id="yearsOfService"
                  type="number"
                  placeholder="e.g., 5"
                  value={employmentInfo.yearsOfService}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, yearsOfService: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Next of Kin */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Next of Kin Information</h2>
              <p className="text-sm text-muted-foreground">Provide details of your next of kin</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kinName">Full Name</Label>
                <Input
                  id="kinName"
                  placeholder="Enter full name"
                  value={nextOfKin.fullName}
                  onChange={(e) => setNextOfKin({ ...nextOfKin, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select
                  value={nextOfKin.relationship}
                  onValueChange={(value) => setNextOfKin({ ...nextOfKin, relationship: value })}
                >
                  <SelectTrigger id="relationship">
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

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kinPhone">Phone Number</Label>
                  <Input
                    id="kinPhone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={nextOfKin.phoneNumber}
                    onChange={(e) => setNextOfKin({ ...nextOfKin, phoneNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kinEmail">Email Address</Label>
                  <Input
                    id="kinEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={nextOfKin.email}
                    onChange={(e) => setNextOfKin({ ...nextOfKin, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kinAddress">Address</Label>
                <Textarea
                  id="kinAddress"
                  placeholder="Enter full address"
                  value={nextOfKin.address}
                  onChange={(e) => setNextOfKin({ ...nextOfKin, address: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Documents & Bank Details */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Documents & Bank Details</h2>
              <p className="text-sm text-muted-foreground">Upload required documents and provide bank information</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idCard">FRSC ID Card</Label>
                <div className="flex items-center gap-2">
                  <Input id="idCard" type="file" accept="image/*,.pdf" onChange={handleFileChange("idCard")} />
                  {documents.idCard && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <p className="text-xs text-muted-foreground">Upload a clear copy of your FRSC ID card</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passport">Passport Photograph</Label>
                <div className="flex items-center gap-2">
                  <Input id="passport" type="file" accept="image/*" onChange={handleFileChange("passportPhoto")} />
                  {documents.passportPhoto && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <p className="text-xs text-muted-foreground">Recent passport-sized photograph</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proofOfAddress">Proof of Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="proofOfAddress"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange("proofOfAddress")}
                  />
                  {documents.proofOfAddress && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <p className="text-xs text-muted-foreground">
                  Utility bill or bank statement (not older than 3 months)
                </p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold">Bank Account Details</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select
                    value={bankDetails.bankName}
                    onValueChange={(value) => setBankDetails({ ...bankDetails, bankName: value })}
                  >
                    <SelectTrigger id="bankName">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="access">Access Bank</SelectItem>
                      <SelectItem value="gtb">GTBank</SelectItem>
                      <SelectItem value="firstbank">First Bank</SelectItem>
                      <SelectItem value="uba">UBA</SelectItem>
                      <SelectItem value="zenith">Zenith Bank</SelectItem>
                      <SelectItem value="fidelity">Fidelity Bank</SelectItem>
                      <SelectItem value="union">Union Bank</SelectItem>
                      <SelectItem value="sterling">Sterling Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="0123456789"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="As it appears on your account"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bvn">BVN (Bank Verification Number)</Label>
                  <Input
                    id="bvn"
                    placeholder="12345678901"
                    maxLength={11}
                    value={bankDetails.bvn}
                    onChange={(e) => setBankDetails({ ...bankDetails, bvn: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Application"}
          </Button>
        )}
      </div>
    </div>
  )
}
