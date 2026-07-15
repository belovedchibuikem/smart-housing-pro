/**
 * Shared mortgage / monthly payment calculator (ported for marketplace detail).
 */

export type MortgageInput = {
  principal: number
  annualRatePercent: number
  termYears: number
  downPayment?: number
}

export type MortgageResult = {
  loanAmount: number
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const down = Math.max(0, input.downPayment ?? 0)
  const loanAmount = Math.max(0, input.principal - down)
  const n = Math.max(1, Math.round(input.termYears * 12))
  const r = input.annualRatePercent / 100 / 12

  let monthlyPayment = 0
  if (loanAmount === 0) {
    monthlyPayment = 0
  } else if (r === 0) {
    monthlyPayment = loanAmount / n
  } else {
    monthlyPayment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }

  const totalPayment = monthlyPayment * n
  return {
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest: Math.max(0, totalPayment - loanAmount),
  }
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}
