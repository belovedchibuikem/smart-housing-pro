"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OtpVerificationDialog } from "@/components/auth/otp-verification-dialog"
import { apiFetch } from "@/lib/api/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
	const router = useRouter()
	const [email, setEmail] = useState("")
	const [showOtpDialog, setShowOtpDialog] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setMessage(null)
		try {
			const res = await apiFetch<{ success: boolean; message: string; expires_at?: string }>("/auth/forgot-password", {
				method: "POST",
				body: { email },
			})
			
			if (res.success) {
				setMessage("OTP sent successfully. Please check your email.")
				setShowOtpDialog(true)
			} else {
				throw new Error(res.message || "Failed to send OTP")
			}
		} catch (e) {
			setMessage(e instanceof Error ? e.message : "Failed to send OTP")
		} finally {
			setLoading(false)
		}
	}

	const handleOtpSuccess = () => {
		// Redirect to reset password page with email
		router.push(`/reset-password?email=${encodeURIComponent(email)}`)
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2 mb-2">
						<Link href="/login" className="text-muted-foreground hover:text-foreground">
							<ArrowLeft className="h-5 w-5" />
						</Link>
						<CardTitle className="text-2xl">Forgot Password</CardTitle>
					</div>
					<CardDescription>
						Enter your email address and we'll send you a verification code to reset your password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={submit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-10"
									required
								/>
							</div>
						</div>
						
						{message && (
							<div className={`p-3 rounded-md text-sm ${
								message.includes("successfully") 
									? "bg-green-50 text-green-800 border border-green-200" 
									: "bg-destructive/10 text-destructive border border-destructive/20"
							}`}>
								{message}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Sending..." : "Send Verification Code"}
						</Button>

						<div className="text-center text-sm">
							<Link href="/login" className="text-primary hover:underline">
								Back to Login
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>

			<OtpVerificationDialog
				open={showOtpDialog}
				onOpenChange={setShowOtpDialog}
				email={email}
				type="password_reset"
				onSuccess={handleOtpSuccess}
				onError={(msg) => setMessage(msg)}
			/>
		</div>
	)
}


