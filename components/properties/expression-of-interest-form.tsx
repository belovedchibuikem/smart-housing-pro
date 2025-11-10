"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, FileText } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ExpressionOfInterestFormProps {
  propertyId: string
}

export function ExpressionOfInterestForm({ propertyId }: ExpressionOfInterestFormProps) {
  const router = useRouter()
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null)
  const [paySlip, setPaySlip] = useState<File | null>(null)
  const [hasExistingLoan, setHasExistingLoan] = useState<string>("no")
  const [loanTypes, setLoanTypes] = useState({
    fmbn: false,
    fgshlb: false,
    homeRenovation: false,
    cooperative: false,
  })
  const [fundingOption, setFundingOption] = useState<string>("")

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPassportPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("[v0] EOI Form submitted")
    // Redirect to property payment page
    router.push(`/dashboard/properties/${propertyId}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="w-24 h-24 border-2 border-gray-300 rounded flex items-center justify-center">
              <Image src="/frsc-logo.jpg" alt="FRSC Logo" width={80} height={80} className="object-contain" />
            </div>
            <div className="flex-1 text-center">
              <CardTitle className="text-2xl font-bold">FEDERAL ROAD SAFETY CORPS</CardTitle>
              <div className="text-sm font-semibold mt-1">FRSC HOUSING COOPERATIVE SOCIETY</div>
              <div className="text-xs mt-1">HOUSING 20000 (ONE MAN, ONE HOUSE) PROJECT</div>
              <div className="text-xs text-blue-600 mt-1">
                <a href="mailto:Housing20000@frsc.gov.ng">Housing20000@frsc.gov.ng</a>,{" "}
                <a href="mailto:frschousingcooperative@gmail.com">frschousingcooperative@gmail.com</a>
              </div>
              <div className="text-sm font-semibold mt-2">APO WASA EXPRESSION OF INTEREST FORM</div>
            </div>
            <div className="w-32 h-40 border-2 border-gray-300 rounded flex flex-col items-center justify-center">
              {passportPhoto ? (
                <img
                  src={passportPhoto || "/placeholder.svg"}
                  alt="Passport"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <>
                  <div className="text-xs text-center mb-2">AFFIX YOUR PASSPORT (UNIFORM)</div>
                  <label htmlFor="passport-upload" className="cursor-pointer">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </label>
                  <input
                    id="passport-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePassportUpload}
                  />
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">PERSONAL DETAILS:</h3>

            <div className="space-y-2">
              <Label htmlFor="name">NAME OF APPLICANT</Label>
              <Input id="name" required className="border-b border-dotted border-t-0 border-x-0 rounded-none" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rank">RANK</Label>
                <Input id="rank" required className="border-b border-dotted border-t-0 border-x-0 rounded-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input id="pin" required className="border-b border-dotted border-t-0 border-x-0 rounded-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ippis">IPPIS NO</Label>
                <Input id="ippis" required className="border-b border-dotted border-t-0 border-x-0 rounded-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="command">COMMAND</Label>
              <Input id="command" required className="border-b border-dotted border-t-0 border-x-0 rounded-none" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">PHONE NO</Label>
              <Input
                id="phone"
                type="tel"
                required
                className="border-b border-dotted border-t-0 border-x-0 rounded-none"
              />
            </div>
          </div>

          {/* Affordability Test */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">AFFORDABILITY TEST</h3>

            <div className="space-y-2">
              <Label htmlFor="salary">NET SALARY (As at last pay slip) =N=</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="salary"
                  type="number"
                  required
                  placeholder="Enter net salary"
                  className="border-b border-dotted border-t-0 border-x-0 rounded-none"
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="payslip-upload" className="cursor-pointer flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    {paySlip ? paySlip.name : "Attach pay slip"}
                  </Label>
                  <input
                    id="payslip-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => setPaySlip(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>ARE YOU CURRENTLY ON ANY LOAN OR MORTGAGE?</Label>
              <RadioGroup value={hasExistingLoan} onValueChange={setHasExistingLoan}>
                <div className="flex gap-8">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="loan-yes" />
                    <Label htmlFor="loan-yes" className="font-normal cursor-pointer">
                      YES
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="loan-no" />
                    <Label htmlFor="loan-no" className="font-normal cursor-pointer">
                      NO
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {hasExistingLoan === "yes" && (
              <div className="space-y-3 pl-4">
                <Label>IF YES, TICK LOAN TYPE:</Label>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fmbn"
                      checked={loanTypes.fmbn}
                      onCheckedChange={(checked) => setLoanTypes({ ...loanTypes, fmbn: checked as boolean })}
                    />
                    <Label htmlFor="fmbn" className="font-normal cursor-pointer">
                      FMBN
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fgshlb"
                      checked={loanTypes.fgshlb}
                      onCheckedChange={(checked) => setLoanTypes({ ...loanTypes, fgshlb: checked as boolean })}
                    />
                    <Label htmlFor="fgshlb" className="font-normal cursor-pointer">
                      FGSHLB
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="home-renovation"
                      checked={loanTypes.homeRenovation}
                      onCheckedChange={(checked) => setLoanTypes({ ...loanTypes, homeRenovation: checked as boolean })}
                    />
                    <Label htmlFor="home-renovation" className="font-normal cursor-pointer">
                      HOME RENOVATION
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cooperative-loan"
                      checked={loanTypes.cooperative}
                      onCheckedChange={(checked) => setLoanTypes({ ...loanTypes, cooperative: checked as boolean })}
                    />
                    <Label htmlFor="cooperative-loan" className="font-normal cursor-pointer">
                      COOPERATIVE
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next of Kin Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">NEXT OF KIN DETAILS</h3>

            <div className="space-y-2">
              <Label htmlFor="nok-name">NAME:</Label>
              <Input id="nok-name" required className="border-b border-dotted border-t-0 border-x-0 rounded-none" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nok-address">ADDRESS:</Label>
              <Input id="nok-address" required className="border-b border-dotted border-t-0 border-x-0 rounded-none" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nok-phone">PHONE NUMBER</Label>
              <Input
                id="nok-phone"
                type="tel"
                required
                className="border-b border-dotted border-t-0 border-x-0 rounded-none"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">
              PROPERTY DETAILS (State the property you are interested in)
            </h3>

            <div className="space-y-2">
              <Label htmlFor="property-name">PROPERTY NAME</Label>
              <Input
                id="property-name"
                required
                className="border-b border-dotted border-t-0 border-x-0 rounded-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property-description">PROPERTY DESCRIPTION (700SQM ETC)</Label>
                <Input
                  id="property-description"
                  required
                  className="border-b border-dotted border-t-0 border-x-0 rounded-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property-cost">PROPERTY COST =N=</Label>
                <Input
                  id="property-cost"
                  type="number"
                  required
                  className="border-b border-dotted border-t-0 border-x-0 rounded-none"
                />
              </div>
            </div>
          </div>

          {/* Funding */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">FUNDING (Tick how you intend to fund your interest)</h3>

            <RadioGroup value={fundingOption} onValueChange={setFundingOption} required>
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="equity_wallet" id="funding-equity-wallet" />
                  <Label htmlFor="funding-equity-wallet" className="font-normal cursor-pointer">
                    EQUITY WALLET (Property Deposit)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="funding-cash" />
                  <Label htmlFor="funding-cash" className="font-normal cursor-pointer">
                    100% CASH PAYMENT
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loan" id="funding-loan" />
                  <Label htmlFor="funding-loan" className="font-normal cursor-pointer">
                    100% LOAN
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mix" id="funding-mix" />
                  <Label htmlFor="funding-mix" className="font-normal cursor-pointer">
                    MIX FUNDING (EQUITY/LOAN)
                  </Label>
                </div>
              </div>
            </RadioGroup>

            <div className="text-sm text-muted-foreground italic">
              Please Note: If your choice of funding is mix-funding, equity is 20% while loan is 80%. 
              Equity Wallet can be used for property deposits and payments.
            </div>
          </div>

          {/* Certification and Authorization */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">CERTIFICATION AND AUTHORIZATION.</h3>

            <div className="space-y-4 text-sm">
              <p>
                I,
                <Input
                  type="text"
                  className="inline-block w-64 mx-2 border-b border-dotted border-t-0 border-x-0 rounded-none"
                  placeholder="Your full name"
                />
                hereby certify that the information provided above are correct. I also authorize the FRSC Housing
                Cooperative to commence deduction from my account to pay for the property of my choice.
              </p>

              <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="signature">Signature</Label>
                  <div className="border-b-2 border-dotted h-20"></div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" required className="border-b-2 border-dotted" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" size="lg">
              Submit Expression of Interest
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
