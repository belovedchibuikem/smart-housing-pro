"use client"

import { RegisterForm } from "@/components/auth/register-form"
import { Building2 } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/i18n-provider"

export default function RegisterPage() {
	const { t } = useI18n()

	return (
		<div className="min-h-screen grid lg:grid-cols-2">
			<div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
				<Link href="/" className="flex items-center gap-2">
					<Building2 className="h-8 w-8" />
					<div>
						<h1 className="font-bold text-xl">{t("registerPage.brandTitle")}</h1>
						<p className="text-xs opacity-90">{t("registerPage.brandSubtitle")}</p>
					</div>
				</Link>
				<div className="space-y-6">
					<h2 className="text-4xl font-bold text-balance">{t("registerPage.heroTitle")}</h2>
					<p className="text-lg opacity-90 text-balance">{t("registerPage.heroBody")}</p>
					<div className="space-y-4 pt-4">
						<div className="flex items-start gap-3">
							<div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
								<span className="text-sm">✓</span>
							</div>
							<div>
								<div className="font-semibold">{t("registerPage.bullet1Title")}</div>
								<div className="text-sm opacity-75">{t("registerPage.bullet1Desc")}</div>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
								<span className="text-sm">✓</span>
							</div>
							<div>
								<div className="font-semibold">{t("registerPage.bullet2Title")}</div>
								<div className="text-sm opacity-75">{t("registerPage.bullet2Desc")}</div>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
								<span className="text-sm">✓</span>
							</div>
							<div>
								<div className="font-semibold">{t("registerPage.bullet3Title")}</div>
								<div className="text-sm opacity-75">{t("registerPage.bullet3Desc")}</div>
							</div>
						</div>
					</div>
				</div>
				<div className="text-sm opacity-75">{t("registerPage.copyright")}</div>
			</div>

			<div className="flex items-center justify-center p-8">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center lg:text-left">
						<Link href="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
							<Building2 className="h-8 w-8 text-primary" />
							<span className="font-bold text-xl">{t("registerPage.brandTitle")}</span>
						</Link>
						<h1 className="text-3xl font-bold">{t("registerPage.createTitle")}</h1>
						<p className="text-muted-foreground mt-2">{t("registerPage.createSubtitle")}</p>
					</div>
					<RegisterForm />
					<p className="text-center text-sm text-muted-foreground">
						{t("registerPage.haveAccount")}{" "}
						<Link href="/login" className="text-primary font-medium hover:underline">
							{t("registerPage.signIn")}
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
