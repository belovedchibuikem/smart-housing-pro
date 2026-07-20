"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getInternalFundBalances, transferInternalFunds, type InternalFundAccount } from "@/lib/api/client"

export default function WalletTransferPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingBalances, setLoadingBalances] = useState(true)
  const [amount, setAmount] = useState("")
  const [fromAccount, setFromAccount] = useState<InternalFundAccount>("contribution")
  const [toAccount, setToAccount] = useState<InternalFundAccount>("wallet")
  const [note, setNote] = useState("")
  const [balances, setBalances] = useState<Record<InternalFundAccount, number>>({
    wallet: 0,
    contribution: 0,
    equity: 0,
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoadingBalances(true)
      try {
        const response = await getInternalFundBalances()
        if (!active) return
        setBalances({
          wallet: Number(response?.balances?.wallet ?? 0),
          contribution: Number(response?.balances?.contribution ?? 0),
          equity: Number(response?.balances?.equity ?? 0),
        })
      } catch {
        if (!active) return
        toast({
          title: "Unable to load balances",
          description: "Try refreshing this page.",
          variant: "destructive",
        })
      } finally {
        if (active) setLoadingBalances(false)
      }
    })()
    return () => {
      active = false
    }
  }, [toast])

  const accountLabel: Record<InternalFundAccount, string> = {
    wallet: "Main Wallet",
    contribution: "Contribution Wallet",
    equity: "Equity Wallet",
  }

  const numericAmount = Number(amount)
  const sourceBalance = balances[fromAccount] ?? 0
  const isValidAmount = Number.isFinite(numericAmount) && numericAmount > 0
  const canSubmit = isValidAmount && fromAccount !== toAccount && numericAmount <= sourceBalance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) {
      toast({
        title: "Transfer not valid",
        description: "Check amount, source/destination accounts, and available balance.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)

    try {
      const data = await transferInternalFunds({
        from_account: fromAccount,
        to_account: toAccount,
        amount: numericAmount,
        note: note || undefined,
      })

      if (data.success) {
        const params = new URLSearchParams()
        params.set("reference", `IFT-${Date.now()}`)
        params.set("from", fromAccount)
        params.set("to", toAccount)
        params.set("amount", String(numericAmount))
        router.push(`/dashboard/wallet/transfer/success?${params.toString()}`)
      } else {
        toast({
          title: "Transfer failed",
          description: data.message || "Could not complete transfer.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("[v0] Transfer error:", error)
      toast({
        title: "Transfer failed",
        description: "An error occurred while processing your transfer",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const projectedBalances = useMemo(() => {
    if (!isValidAmount || fromAccount === toAccount) return balances
    return {
      ...balances,
      [fromAccount]: Math.max(0, (balances[fromAccount] ?? 0) - numericAmount),
      [toAccount]: (balances[toAccount] ?? 0) + numericAmount,
    }
  }, [balances, fromAccount, toAccount, numericAmount, isValidAmount])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transfer Funds</h1>
          <p className="text-muted-foreground mt-1">Move money between your wallets (main, contribution, equity)</p>
        </div>
        <Link href="/dashboard/wallet">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <Card className="p-6 bg-primary/5">
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Source Balance</p>
            <p className="text-2xl font-bold">
              {loadingBalances ? "Loading..." : `₦${sourceBalance.toLocaleString()}`}
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="from-account">From Account</Label>
              <Select value={fromAccount} onValueChange={(v) => setFromAccount(v as InternalFundAccount)}>
                <SelectTrigger id="from-account">
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wallet">{accountLabel.wallet}</SelectItem>
                  <SelectItem value="contribution">{accountLabel.contribution}</SelectItem>
                  <SelectItem value="equity">{accountLabel.equity}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-account">To Account</Label>
              <Select value={toAccount} onValueChange={(v) => setToAccount(v as InternalFundAccount)}>
                <SelectTrigger id="to-account">
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wallet">{accountLabel.wallet}</SelectItem>
                  <SelectItem value="contribution">{accountLabel.contribution}</SelectItem>
                  <SelectItem value="equity">{accountLabel.equity}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Transfer Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
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
                  <span className="text-muted-foreground">From</span>
                  <span className="font-medium">{accountLabel[fromAccount]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium">{accountLabel[toAccount]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">₦{numericAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Projected source balance</span>
                  <span className="font-medium">₦{(projectedBalances[fromAccount] ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projected destination balance</span>
                  <span className="font-medium">₦{(projectedBalances[toAccount] ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isLoading || !canSubmit || loadingBalances}>
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
