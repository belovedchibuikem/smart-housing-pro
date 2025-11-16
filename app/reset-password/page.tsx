"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api/client"
import Link from "next/link"
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react"

function ResetPasswordForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const email = searchParams.get("email") || ""
	
	const [otp, setOtp] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!email) {
			router.push("/forgot-password")
		}
	}, [email, router])


	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setMessage(null)

		if (password !== confirmPassword) {
			setError("Passwords do not match")
			return
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters")
			return
		}

		if (!otp || otp.length !== 6) {
			setError("Please enter the 6-digit OTP code")
			return
		}

		setLoading(true)

		try {
			const res = await apiFetch<{ success: boolean; message: string }>("/auth/reset-password", {
				method: "POST",
				body: {
					email,
					otp,
					password,
					password_confirmation: confirmPassword,
				},
			})

			if (res.success) {
				setMessage("Password reset successfully! Redirecting to login...")
				setTimeout(() => {
					router.push("/login")
				}, 2000)
			} else {
				throw new Error(res.message || "Failed to reset password")
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to reset password")
		} finally {
			setLoading(false)
		}
	}

	if (!email) {
		return null
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2 mb-2">
						<Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">
							<ArrowLeft className="h-5 w-5" />
						</Link>
						<CardTitle className="text-2xl">Reset Password</CardTitle>
					</div>
					<CardDescription>
						Enter your new password below.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={submit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="otp">Verification Code (OTP)</Label>
							<Input
								id="otp"
								type="text"
								placeholder="Enter 6-digit OTP"
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
								maxLength={6}
								required
								className="text-center text-lg tracking-widest"
							/>
							<p className="text-xs text-muted-foreground">Enter the 6-digit code sent to your email</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">New Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter new password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pl-10 pr-10"
									required
									minLength={8}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
							<p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirm new password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="pl-10 pr-10"
									required
									minLength={8}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
								>
									{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>

						{error && (
							<div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
								{error}
							</div>
						)}

						{message && (
							<div className={`p-3 rounded-md text-sm ${
								message.includes("successfully")
									? "bg-green-50 text-green-800 border border-green-200"
									: "bg-blue-50 text-blue-800 border border-blue-200"
							}`}>
								{message}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
							{loading ? "Resetting Password..." : "Reset Password"}
						</Button>

						<div className="text-center text-sm">
							<Link href="/login" className="text-primary hover:underline">
								Back to Login
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
