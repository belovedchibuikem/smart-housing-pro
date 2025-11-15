"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { verifyOtpRequest, resendOtpRequest } from "@/lib/api/client"
import { Loader2 } from "lucide-react"

interface OtpVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  phone?: string
  type?: "registration" | "password_reset" | "email_verification"
  onSuccess?: (token?: string, user?: unknown) => void
  onError?: (message: string) => void
}

export function OtpVerificationDialog({
  open,
  onOpenChange,
  email,
  phone,
  type = "registration",
  onSuccess,
  onError,
}: OtpVerificationDialogProps) {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && countdown === 0) {
      setOtp("")
      setError(null)
    }
  }, [open, countdown])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "")
    if (digitsOnly.length <= 6) {
      setOtp(digitsOnly)
      setError(null)
      
      // Auto-submit when 6 digits are entered
      if (digitsOnly.length === 6) {
        handleVerify(digitsOnly)
      }
    }
  }

  const handleVerify = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp
    if (otpToVerify.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await verifyOtpRequest({ email, otp: otpToVerify })
      if (res.success) {
        onSuccess?.(res.token, res.user)
        setOtp("")
      } else {
        throw new Error(res.message || "OTP verification failed")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "OTP verification failed"
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError(null)

    try {
      await resendOtpRequest({ email, type, phone })
      setCountdown(60) // 60 second cooldown
      setOtp("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend OTP"
      setError(message)
      onError?.(message)
    } finally {
      setIsResending(false)
    }
  }

  const title = type === "password_reset" 
    ? "Verify Password Reset" 
    : "Verify Your Account"

  const description = type === "password_reset"
    ? `We've sent a 6-digit verification code to ${email}`
    : `We've sent a 6-digit verification code to ${email}${phone ? ` and ${phone}` : ""}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter Verification Code</Label>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 h-14 text-center text-2xl font-bold"
                  value={otp[index] || ""}
                  onChange={(e) => {
                    const newOtp = otp.split("")
                    newOtp[index] = e.target.value.replace(/\D/g, "")
                    handleOtpChange(newOtp.join(""))
                    
                    // Auto-focus next input
                    if (e.target.value && index < 5) {
                      const nextInput = document.getElementById(`otp-${index + 1}`)
                      nextInput?.focus()
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                      const prevInput = document.getElementById(`otp-${index - 1}`)
                      prevInput?.focus()
                    }
                  }}
                  disabled={isLoading}
                />
              ))}
            </div>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="link"
              onClick={handleResend}
              disabled={isResending || countdown > 0}
              className="h-auto p-0"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                "Resend OTP"
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => handleVerify()}
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

