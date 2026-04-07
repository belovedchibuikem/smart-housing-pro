"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OtpVerificationDialog } from "@/components/auth/otp-verification-dialog"
import { apiFetch } from "@/lib/api/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import { Recaptcha, RecaptchaRef } from "@/components/auth/recaptcha"
import { useI18n } from "@/lib/i18n/i18n-provider"

export default function ForgotPasswordPage() {
	const { t } = useI18n()
	const router = useRouter()
	const [email, setEmail] = useState("")
	const [showOtpDialog, setShowOtpDialog] = useState(false)
	const [message, setMessage] = useState<string | null>(null)
	const [messageSuccess, setMessageSuccess] = useState(false)
	const [loading, setLoading] = useState(false)
	const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
	const recaptchaRef = useRef<RecaptchaRef>(null)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()

		setLoading(true)
		setMessage(null)
		setMessageSuccess(false)
		try {
			let token: string
			if (recaptchaRef.current) {
				token = await recaptchaRef.current.execute()
			} else {
				setMessage(t("forgotPassword.recaptchaNotReady"))
				setLoading(false)
				return
			}

			const res = await apiFetch<{ success: boolean; message: string; expires_at?: string }>("/auth/forgot-password", {
				method: "POST",
				body: { email, recaptcha_token: token },
			})

			if (res.success) {
				setMessage(t("forgotPassword.otpSent"))
				setMessageSuccess(true)
				setShowOtpDialog(true)
			} else {
				throw new Error(res.message || t("forgotPassword.sendFailed"))
			}
		} catch (e) {
			setMessage(e instanceof Error ? e.message : t("forgotPassword.sendFailed"))
			setMessageSuccess(false)
			setRecaptchaToken(null)
			if (recaptchaRef.current) {
				try {
					await recaptchaRef.current.execute()
				} catch {
					/* ignore */
				}
			}
		} finally {
			setLoading(false)
		}
	}

	const handleRecaptchaVerify = (token: string) => {
		setRecaptchaToken(token)
	}

	const handleRecaptchaError = () => {
		setRecaptchaToken(null)
	}

	const handleOtpSuccess = () => {
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
						<CardTitle className="text-2xl">{t("forgotPassword.title")}</CardTitle>
					</div>
					<CardDescription>{t("forgotPassword.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={submit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">{t("forgotPassword.emailLabel")}</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="email"
									type="email"
									placeholder={t("forgotPassword.emailPlaceholder")}
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-10"
									required
								/>
							</div>
						</div>

						{message && (
							<div
								className={`p-3 rounded-md text-sm ${
									messageSuccess
										? "bg-green-50 text-green-800 border border-green-200"
										: "bg-destructive/10 text-destructive border border-destructive/20"
								}`}
							>
								{message}
							</div>
						)}

						<Recaptcha
							ref={recaptchaRef}
							onVerify={handleRecaptchaVerify}
							onError={handleRecaptchaError}
							action="forgot_password"
						/>

						<p className="text-[11px] text-muted-foreground text-center leading-snug">{t("login.recaptcha")}</p>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? t("forgotPassword.sending") : t("forgotPassword.sendCode")}
						</Button>

						<div className="text-center text-sm">
							<Link href="/login" className="text-primary hover:underline">
								{t("forgotPassword.backToLogin")}
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
