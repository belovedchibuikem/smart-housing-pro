"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculateMortgage, formatNaira } from "@/lib/calculators/mortgage"

export function MortgageCalculatorPanel({ defaultPrincipal }: { defaultPrincipal: number }) {
  const [principal, setPrincipal] = useState(defaultPrincipal)
  const [rate, setRate] = useState(18)
  const [years, setYears] = useState(20)
  const [down, setDown] = useState(Math.round(defaultPrincipal * 0.2))

  const result = useMemo(
    () =>
      calculateMortgage({
        principal,
        annualRatePercent: rate,
        termYears: years,
        downPayment: down,
      }),
    [principal, rate, years, down]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mortgage calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="principal">Property price (₦)</Label>
          <Input
            id="principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="down">Down payment (₦)</Label>
          <Input id="down" type="number" value={down} onChange={(e) => setDown(Number(e.target.value) || 0)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="rate">Rate % / yr</Label>
            <Input id="rate" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="years">Term (years)</Label>
            <Input id="years" type="number" value={years} onChange={(e) => setYears(Number(e.target.value) || 1)} />
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
          <p>
            Loan amount: <strong>{formatNaira(result.loanAmount)}</strong>
          </p>
          <p>
            Monthly payment: <strong className="text-primary">{formatNaira(result.monthlyPayment)}</strong>
          </p>
          <p className="text-muted-foreground">Total interest: {formatNaira(result.totalInterest)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
