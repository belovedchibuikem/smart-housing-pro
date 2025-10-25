"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function UpgradeMembershipPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/membership/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "current-user-id", // TODO: Get from auth context
          membershipType: "member",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Membership upgraded successfully!")
        toast.info("Your transaction history has been migrated to your member account")
        router.push("/dashboard")
      } else {
        toast.error(data.error || "Failed to upgrade membership")
      }
    } catch (error) {
      console.error("Upgrade error:", error)
      toast.error("An error occurred during upgrade")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Upgrade to Full Member</h1>
        <p className="text-muted-foreground mt-1">
          Convert your non-member account to full membership and enjoy exclusive benefits
        </p>
      </div>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm">
          <strong>Note:</strong> This upgrade is specifically for non-members who want to become full FRSC members. All
          your transaction history will be preserved and migrated automatically.
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Status */}
        <Card className="p-6">
          <Badge variant="secondary" className="mb-4">
            Current Status
          </Badge>
          <h3 className="text-xl font-semibold mb-4">Non-Member</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>Higher interest rates on loans</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>Limited loan products</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>No voting rights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>Limited property access</span>
            </li>
          </ul>
        </Card>

        {/* Member Benefits */}
        <Card className="p-6 border-primary">
          <Badge className="mb-4">Upgrade Benefits</Badge>
          <h3 className="text-xl font-semibold mb-4">Full Member</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Lower interest rates (up to 40% savings)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Access to all loan products</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Voting rights in cooperative decisions</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Priority property allocation</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Dividend payments</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>Member badge on your profile</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* History Migration Notice */}
      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">Your History Will Be Preserved</h3>
        <p className="text-sm text-muted-foreground">
          When you upgrade to full membership, all your non-member history including contributions, loans, and
          transactions will be automatically migrated to your member account. You won't lose any data.
        </p>
      </Card>

      {/* Membership Requirements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Membership Requirements</h3>
        <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
          <li>Must be an FRSC staff member</li>
          <li>Valid FRSC ID and IPPIS number</li>
          <li>Minimum initial contribution of ₦50,000</li>
          <li>Monthly contribution commitment</li>
          <li>Complete KYC verification</li>
        </ul>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleUpgrade} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Upgrade to Member"
          )}
        </Button>
      </div>
    </div>
  )
}
