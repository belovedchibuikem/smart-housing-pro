"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, KeyRound, Mail } from "lucide-react"
import { toast } from "sonner"
import {
  adminSendPasswordResetOtp,
  adminSetTemporaryPassword,
  adminSendMemberPasswordResetOtp,
  adminSetMemberTemporaryPassword,
} from "@/lib/api/admin-password-reset"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Staff/user account id */
  userId?: string | null
  /** Member id — uses member password endpoints when set without userId */
  memberId?: string | null
  displayName?: string
  email?: string
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  userId,
  memberId,
  displayName,
  email,
}: Props) {
  const [tab, setTab] = useState("temporary")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setPassword("")
    setPasswordConfirmation("")
    setTab("temporary")
  }

  const handleClose = (next: boolean) => {
    if (!next) resetForm()
    onOpenChange(next)
  }

  const handleTemporary = async () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      if (userId) {
        await adminSetTemporaryPassword(userId, password, passwordConfirmation)
      } else if (memberId) {
        await adminSetMemberTemporaryPassword(memberId, password, passwordConfirmation)
      } else {
        throw new Error("No user or member selected")
      }
      toast.success("Temporary password set. User must change it on next login.")
      handleClose(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to set temporary password")
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = async () => {
    setLoading(true)
    try {
      if (userId) {
        await adminSendPasswordResetOtp(userId)
      } else if (memberId) {
        await adminSendMemberPasswordResetOtp(memberId)
      } else {
        throw new Error("No user or member selected")
      }
      toast.success(email ? `Reset OTP sent to ${email}` : "Reset OTP sent")
      handleClose(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to send reset OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            {displayName ? `Reset password for ${displayName}` : "Reset user password"}
            {email ? ` (${email})` : ""}. Choose a temporary password or email a reset OTP.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="temporary">
              <KeyRound className="h-4 w-4 mr-1" />
              Temporary
            </TabsTrigger>
            <TabsTrigger value="otp">
              <Mail className="h-4 w-4 mr-1" />
              Email OTP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temporary" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="temp-password">Temporary password</Label>
              <Input
                id="temp-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-password-confirm">Confirm password</Label>
              <Input
                id="temp-password-confirm"
                type="password"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The user will be signed out and must change this password on next login.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleTemporary} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Set temporary password
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="otp" className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Sends a 6-digit password reset OTP to the user&apos;s email. They complete reset on
              the forgot-password flow.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleOtp} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send reset OTP
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
