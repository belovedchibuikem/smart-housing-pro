"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function WalletTransferPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [recipientId, setRecipientId] = useState("")
  const [note, setNote] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          recipientId,
          note,
          senderId: "current-user-id", // TODO: Get from user session
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push("/dashboard/wallet/transfer/success")
      } else {
        alert(data.message || "Transfer failed")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("[v0] Transfer error:", error)
      alert("An error occurred while processing your transfer")
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transfer Funds</h1>
          <p className="text-muted-foreground mt-1">Transfer funds to another member's wallet</p>
        </div>
        <Link href="/dashboard/contributions">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <Card className="p-6 bg-primary/5">
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">₦125,000</p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipientId">Recipient FRSC Housing ID</Label>
              <Input
                id="recipientId"
                type="text"
                placeholder="Enter recipient's Housing ID"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the unique FRSC Housing ID of the member you want to transfer to
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Transfer Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Transfer Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note for this transfer"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {amount && (
          <Card className="p-6 bg-muted/50">
            <div className="space-y-3">
              <h3 className="font-semibold">Transfer Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transfer Amount</span>
                  <span className="font-medium">₦{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transfer Fee</span>
                  <span className="font-medium">₦0</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total Deduction</span>
                  <span className="font-bold text-lg">₦{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">New Balance</span>
                  <span className="font-medium">₦{(125000 - Number(amount)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isLoading || !amount || !recipientId}>
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              Complete Transfer
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
