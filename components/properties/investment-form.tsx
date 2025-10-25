"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

export function InvestmentForm() {
  const router = useRouter()
  const [shares, setShares] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const pricePerShare = 450000
  const totalShares = 100
  const availableShares = 35
  const soldPercentage = ((totalShares - availableShares) / totalShares) * 100

  const totalAmount = shares * pricePerShare

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Implement actual investment processing
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard/properties/investment-success")
    }, 2000)
  }

  return (
    <Card className="p-6 sticky top-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-4">Investment Details</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Shares</span>
                <span className="font-medium">
                  {availableShares}/{totalShares}
                </span>
              </div>
              <Progress value={soldPercentage} />
              <p className="text-xs text-muted-foreground">{soldPercentage.toFixed(0)}% sold</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shares">Number of Shares</Label>
              <Input
                id="shares"
                type="number"
                min="1"
                max={availableShares}
                value={shares}
                onChange={(e) => setShares(Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Min: 1 share | Max: {availableShares} shares</p>
            </div>

            <div className="space-y-2">
              <Label>Price per Share</Label>
              <div className="text-2xl font-bold">₦{pricePerShare.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shares</span>
            <span className="font-medium">{shares}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price per Share</span>
            <span className="font-medium">₦{pricePerShare.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee (1%)</span>
            <span className="font-medium">₦{(totalAmount * 0.01).toLocaleString()}</span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="font-semibold">Total Investment</span>
            <span className="font-bold text-xl">₦{(totalAmount * 1.01).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            You will own {shares}% of this property and receive proportional returns from rental income and
            appreciation.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || shares < 1 || shares > availableShares}
        >
          {isLoading ? "Processing..." : "Invest Now"}
        </Button>
      </form>
    </Card>
  )
}
