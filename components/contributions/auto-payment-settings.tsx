"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, CreditCard, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type ContributionAutoPaySetting = {
  is_enabled: boolean
  payment_method: "wallet" | "card"
  amount: number | null
  day_of_month: number
  card_reference?: string | null
  metadata?: Record<string, unknown>
  last_run_at?: string | null
  next_run_at?: string | null
}

type AutoPaymentSettingsProps = {
  setting: ContributionAutoPaySetting | null
  saving: boolean
  onSave: (payload: ContributionAutoPaySetting) => Promise<void>
}

export function AutoPaymentSettings({ setting, saving, onSave }: AutoPaymentSettingsProps) {
  const [enabled, setEnabled] = useState(setting?.is_enabled ?? false)
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card">(setting?.payment_method ?? "wallet")
  const [amount, setAmount] = useState<string>(setting?.amount ? String(setting.amount) : "")
  const [dayOfMonth, setDayOfMonth] = useState<number>(setting?.day_of_month ?? 1)
  const [cardReference, setCardReference] = useState<string>(setting?.card_reference ?? "")
  const [notes, setNotes] = useState<string>("")

  useEffect(() => {
    setEnabled(setting?.is_enabled ?? false)
    setPaymentMethod(setting?.payment_method ?? "wallet")
    setAmount(setting?.amount ? String(setting.amount) : "")
    setDayOfMonth(setting?.day_of_month ?? 1)
    setCardReference(setting?.card_reference ?? "")
    const metadataNotes = typeof setting?.metadata?.notes === "string" ? (setting?.metadata?.notes as string) : ""
    setNotes(metadataNotes)
  }, [setting])

  const handleSubmit = async () => {
    await onSave({
      is_enabled: enabled,
      payment_method: paymentMethod,
      amount: amount ? Number(amount) : null,
      day_of_month: dayOfMonth,
      card_reference: paymentMethod === "card" ? (cardReference || null) : null,
      metadata: notes ? { notes } : {},
      last_run_at: setting?.last_run_at ?? null,
      next_run_at: setting?.next_run_at ?? null,
    })
  }

  const upcomingSchedule = () => {
    if (!enabled || !setting?.next_run_at) return null
    const date = new Date(setting.next_run_at)
    return `${date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`
  }

  const lastRun = () => {
    if (!setting?.last_run_at) return null
    const date = new Date(setting.last_run_at)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
          <Label className="text-base font-semibold">Enable Auto-Payment</Label>
              <p className="text-sm text-muted-foreground">
            Automatically settle your monthly contributions using wallet balance or debit card.
              </p>
            </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

      {enabled && (
        <div className="space-y-6 border-t pt-6">
          <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
              <Label htmlFor="auto-pay-amount">Monthly Contribution Amount</Label>
              <Input
                id="auto-pay-amount"
                type="number"
                min={0}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="e.g. 50000"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use your active contribution plan amount automatically.
              </p>
                </div>

                <div className="space-y-2">
              <Label htmlFor="auto-pay-day">Payment Day</Label>
              <Select value={String(dayOfMonth)} onValueChange={(value) => setDayOfMonth(Number(value))}>
                <SelectTrigger id="auto-pay-day">
                  <SelectValue placeholder="Select day of month" />
                    </SelectTrigger>
                    <SelectContent>
                  {Array.from({ length: 28 }).map((_, index) => {
                    const day = index + 1
                    return (
                      <SelectItem value={String(day)} key={day}>
                        {day}{day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} of every month
                      </SelectItem>
                    )
                  })}
                    </SelectContent>
                  </Select>
            </div>
                </div>

                <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(value: "wallet" | "card") => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                <SelectItem value="wallet">Wallet Balance</SelectItem>
                <SelectItem value="card">Debit / Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
            <div className={cn("rounded-md border p-4 text-sm", paymentMethod === "wallet" ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50")}>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5" />
                <p className="text-muted-foreground">
                  {paymentMethod === "wallet"
                    ? "We will debit your wallet balance on the scheduled day. Ensure you have sufficient funds."
                    : "Card payments will require a saved card token (reference). A ₦0 test charge may occur during setup."}
                </p>
              </div>
                  </div>
                </div>

          {paymentMethod === "card" && (
            <div className="space-y-2">
              <Label htmlFor="card-reference">Card Reference</Label>
              <Input
                id="card-reference"
                value={cardReference}
                onChange={(event) => setCardReference(event.target.value)}
                placeholder="Enter saved card reference"
              />
              <p className="text-xs text-muted-foreground">
                Use the persistent card reference from your last successful card payment. Contact support to tokenize a new card.
              </p>
              </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="auto-pay-notes">Notes (optional)</Label>
            <Textarea
              id="auto-pay-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Special instructions or notes for your contributions team"
            />
          </div>

          <div className="grid gap-3 bg-muted/40 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                <p className="text-sm font-medium">Next scheduled auto-payment</p>
                <p className="text-sm text-muted-foreground">
                  {upcomingSchedule() || `On the ${dayOfMonth}${dayOfMonth === 1 ? "st" : dayOfMonth === 2 ? "nd" : dayOfMonth === 3 ? "rd" : "th"} of every month.`}
                </p>
              </div>
            </div>
            {lastRun() && (
              <p className="text-xs text-muted-foreground">
                Last attempt recorded on <strong>{lastRun()}</strong>.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={() => setEnabled(false)} disabled={!enabled || saving}>
          Disable Auto-Pay
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </Card>
  )
}
