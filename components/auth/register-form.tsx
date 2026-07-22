"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OtpVerificationDialog } from "@/components/auth/otp-verification-dialog"
import { Recaptcha, RecaptchaRef } from "@/components/auth/recaptcha"
import { meRequest, registerRequest, setAuthToken, setTenantSlug, getTenantSlug } from "@/lib/api/client"
import { persistSessionTimeout, touchSessionActivity } from "@/lib/auth/session-timeout"
import { persistAuthSession } from "@/lib/auth/auth-cookies"
import type { AuthUser } from "@/lib/auth/types"
import { useI18n } from "@/lib/i18n/i18n-provider"

type RegisterStep = "account" | "verify"

export function RegisterForm() {
	const { t } = useI18n()
	const router = useRouter()
	const recaptchaRef = useRef<RecaptchaRef>(null)

	const [isLoading, setIsLoading] = useState(false)
	const [showOtpDialog, setShowOtpDialog] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [currentStep, setCurrentStep] = useState<RegisterStep>("account")
	const [formData, setFormData] = useState({
		membershipType: "member",
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		idType: "",
		idNumber: "",
		agreeToTerms: false,
	})

	const validateAccountStep = (): boolean => {
		if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
			alert(t("register.valPersonal"))
			return false
		}
		if (!formData.password || !formData.confirmPassword) {
			alert(t("register.valPassword"))
			return false
		}
		if (formData.password !== formData.confirmPassword) {
			alert(t("register.valPasswordMatch"))
			return false
		}
		if (formData.membershipType === "non-member" && (!formData.idType || !formData.idNumber)) {
			alert(t("register.valId"))
			return false
		}
		if (!formData.agreeToTerms) {
			alert(t("register.valTerms"))
			return false
		}
		return true
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!validateAccountStep()) return

		setIsLoading(true)
		try {
			let token: string
			if (recaptchaRef.current) {
				token = await recaptchaRef.current.execute()
			} else {
				alert(t("register.recaptchaNotReady"))
				setIsLoading(false)
				return
			}

			const payload: Record<string, unknown> = {
				recaptcha_token: token,
				first_name: formData.firstName,
				last_name: formData.lastName,
				email: formData.email,
				phone: formData.phone,
				password: formData.password,
				password_confirmation: formData.confirmPassword,
				membership_type: formData.membershipType,
			}

			if (formData.membershipType === "non-member") {
				payload.id_type = formData.idType
				payload.id_number = formData.idNumber
			}

			const defaultSlug =
				getTenantSlug() || process.env.NEXT_PUBLIC_DEFAULT_MEMBER_TENANT_SLUG || "smarthousing"
			if (!getTenantSlug()) {
				setTenantSlug(defaultSlug)
			}

			const response = await registerRequest({
				...payload,
				tenant_slug: defaultSlug,
			})

			if (response.success || response.requires_otp_verification) {
				const slugFromApi = (response as { tenant_slug?: string }).tenant_slug
				if (slugFromApi) setTenantSlug(slugFromApi)
				setCurrentStep("verify")
				setShowOtpDialog(true)
				return
			}

			throw new Error(response.message || t("register.registrationFailed"))
		} catch (err) {
			const message = err instanceof Error ? err.message : t("register.registrationFailed")
			alert(message)
			if (recaptchaRef.current) {
				try {
					await recaptchaRef.current.execute()
				} catch {
					/* ignore recaptcha retry errors */
				}
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleOtpSuccess = async (token?: string, user?: unknown) => {
		if (!token) return

		setAuthToken(token)
		touchSessionActivity()

		let sessionUser = user as AuthUser | undefined
		try {
			const me = await meRequest()
			if (me?.user) {
				sessionUser = me.user as AuthUser
			}
			if (typeof me?.session_timeout === "number") {
				persistSessionTimeout(me.session_timeout)
			}
		} catch {
			// Continue with OTP response user fallback
		}

		if (sessionUser) {
			const normalizedUser: AuthUser = {
				...sessionUser,
				auth_context: sessionUser.auth_context ?? "tenant",
			}
			localStorage.setItem("user_data", JSON.stringify(normalizedUser))
			persistAuthSession(normalizedUser, token)
		}

		setShowOtpDialog(false)
		router.push("/dashboard/complete-profile")
	}

	const accountStep = (
		<div className="space-y-4">
			<div>
				<h2 className="text-xl font-semibold">{t("register.personalTitle")}</h2>
				<p className="text-sm text-muted-foreground">Step 1 of 2: Create your account details.</p>
			</div>

			<div className="space-y-3">
				<Label>{t("register.membershipType")}</Label>
				<RadioGroup
					value={formData.membershipType}
					onValueChange={(value) => setFormData((prev) => ({ ...prev, membershipType: value }))}
					className="flex gap-4"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="member" id="member" />
						<Label htmlFor="member" className="font-normal cursor-pointer">
							{t("register.frscMember")}
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="non-member" id="non-member" />
						<Label htmlFor="non-member" className="font-normal cursor-pointer">
							{t("register.nonMember")}
						</Label>
					</div>
				</RadioGroup>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="firstName">{t("register.firstName")}</Label>
					<Input
						id="firstName"
						value={formData.firstName}
						onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
						required
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="lastName">{t("register.lastName")}</Label>
					<Input
						id="lastName"
						value={formData.lastName}
						onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
						required
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">{t("register.email")}</Label>
				<Input
					id="email"
					type="email"
					value={formData.email}
					onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="phone">{t("register.phone")}</Label>
				<Input
					id="phone"
					type="tel"
					value={formData.phone}
					onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
					required
				/>
			</div>

			{formData.membershipType === "non-member" ? (
				<>
					<div className="space-y-2">
						<Label htmlFor="idType">{t("register.idType")}</Label>
						<Select value={formData.idType} onValueChange={(value) => setFormData((prev) => ({ ...prev, idType: value }))}>
							<SelectTrigger id="idType">
								<SelectValue placeholder={t("register.idTypePlaceholder")} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="drivers-license">{t("register.idDrivers")}</SelectItem>
								<SelectItem value="nin">{t("register.idNin")}</SelectItem>
								<SelectItem value="frsc-id">{t("register.idFrsc")}</SelectItem>
								<SelectItem value="international-passport">{t("register.idPassport")}</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="idNumber">{t("register.idNumber")}</Label>
						<Input
							id="idNumber"
							value={formData.idNumber}
							onChange={(e) => setFormData((prev) => ({ ...prev, idNumber: e.target.value }))}
							required
						/>
					</div>
				</>
			) : null}

			<div className="space-y-2">
				<Label htmlFor="password">{t("register.password")}</Label>
				<div className="relative">
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						value={formData.password}
						onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
						className="pr-10"
						required
					/>
					<button
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
					</button>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">{t("register.confirmPassword")}</Label>
				<div className="relative">
					<Input
						id="confirmPassword"
						type={showConfirmPassword ? "text" : "password"}
						value={formData.confirmPassword}
						onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
						className="pr-10"
						required
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword((prev) => !prev)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
					</button>
				</div>
			</div>

			<div className="flex items-start space-x-2 pt-2">
				<Checkbox
					id="terms"
					checked={formData.agreeToTerms}
					onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
				/>
				<label htmlFor="terms" className="text-sm leading-relaxed">
					{t("register.termsPrefix")}{" "}
					<a href="/terms" className="text-primary hover:underline">
						{t("register.termsLink")}
					</a>{" "}
					{t("register.termsAnd")}{" "}
					<a href="/privacy" className="text-primary hover:underline">
						{t("register.privacyLink")}
					</a>
				</label>
			</div>

			<Recaptcha ref={recaptchaRef} onVerify={() => {}} onError={() => {}} action="register" />
			<p className="text-[11px] text-muted-foreground text-center leading-snug">{t("register.recaptcha")}</p>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? t("register.creating") : "Continue to Verification"}
			</Button>
		</div>
	)

	const verifyStep = (
		<div className="space-y-5">
			<div>
				<h2 className="text-xl font-semibold">Verify your account</h2>
				<p className="text-sm text-muted-foreground">
					Step 2 of 2: Enter the OTP sent to `{formData.email}` to activate your account.
				</p>
			</div>

			<div className="rounded-lg border bg-muted/30 p-4 space-y-3">
				<p className="text-sm">Your account is created. Complete OTP verification to sign in.</p>
				<div className="flex flex-col sm:flex-row gap-2">
					<Button type="button" onClick={() => setShowOtpDialog(true)}>
						Enter OTP Code
					</Button>
					<Button type="button" variant="outline" onClick={() => setCurrentStep("account")}>
						Back to Account
					</Button>
				</div>
			</div>
		</div>
	)

	return (
		<>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">
							{currentStep === "account" ? "Step 1 of 2" : "Step 2 of 2"}
						</span>
						<span className="text-muted-foreground">{currentStep === "account" ? "50%" : "100%"}</span>
					</div>
					<div className="h-2 bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-primary transition-all duration-300"
							style={{ width: currentStep === "account" ? "50%" : "100%" }}
						/>
					</div>
				</div>

				{currentStep === "account" ? accountStep : verifyStep}
			</form>

			<OtpVerificationDialog
				open={showOtpDialog}
				onOpenChange={setShowOtpDialog}
				email={formData.email}
				phone={formData.phone}
				type="registration"
				onSuccess={handleOtpSuccess}
				onError={(msg) => alert(msg)}
			/>
		</>
	)
}
