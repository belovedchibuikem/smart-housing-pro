"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ProfileForm } from "@/components/profile/profile-form"
import { useMemberProfile } from "@/lib/hooks/use-member-profile"
import { useMemberKyc } from "@/lib/hooks/use-member-kyc"
import { getMemberProfileCompletionStatus, type ProfileWizardStep } from "@/lib/profile/profile-completion"

type WizardTab = "personal" | "employment" | "next-of-kin" | "documents" | "account"

const STEP_TO_TAB: Record<ProfileWizardStep, WizardTab> = {
	personal: "personal",
	employment: "employment",
	"next-of-kin": "next-of-kin",
}

export default function CompleteProfilePage() {
	const router = useRouter()
	const { user, member, isLoading, error, updateProfile } = useMemberProfile()
	const kyc = useMemberKyc()
	const [activeTab, setActiveTab] = useState<WizardTab>("personal")

	const completion = useMemo(() => getMemberProfileCompletionStatus(user, member), [user, member])
	const completionPercent = Math.round((completion.completedCount / completion.totalCount) * 100)
	const handleTabChange = useCallback((tab: WizardTab) => {
		setActiveTab((prev) => (prev === tab ? prev : tab))
	}, [])

	useEffect(() => {
		const nextTab = STEP_TO_TAB[completion.nextStep]
		setActiveTab((prev) => (prev === nextTab ? prev : nextTab))
	}, [completion.nextStep])

	useEffect(() => {
		if (!isLoading && completion.isComplete) {
			router.replace("/dashboard")
		}
	}, [completion.isComplete, isLoading, router])

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold">Complete your profile</h1>
					<p className="mt-1 text-muted-foreground">
						Add your details when you can. You can skip this and use your account now, then finish later.
					</p>
				</div>
				<Button
					variant="outline"
					onClick={() => {
						try {
							window.sessionStorage.setItem("member_profile_completion_banner_dismissed", "1")
						} catch {
							/* ignore */
						}
						router.push("/dashboard")
					}}
				>
					Skip for now
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Profile completion</CardTitle>
					<CardDescription>
						{completion.completedCount} of {completion.totalCount} sections complete — optional until you need
						them for some services
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Progress value={completionPercent} />
					<div className="grid gap-2 sm:grid-cols-3">
						{(
							[
								{ id: "personal", label: "Personal information" },
								{ id: "employment", label: "Employment details" },
								{ id: "next-of-kin", label: "Next of kin" },
							] as Array<{ id: ProfileWizardStep; label: string }>
						).map((item) => {
							const done = completion.sections[item.id]
							return (
								<Button
									key={item.id}
									variant="outline"
									className="justify-start gap-2"
									onClick={() => handleTabChange(STEP_TO_TAB[item.id])}
								>
									{done ? (
										<CheckCircle2 className="h-4 w-4 text-green-600" />
									) : (
										<Circle className="h-4 w-4 text-muted-foreground" />
									)}
									{item.label}
								</Button>
							)
						})}
					</div>
					<div className="flex flex-wrap gap-2 border-t pt-4">
						<Button
							variant="secondary"
							onClick={() => {
								try {
									window.sessionStorage.setItem("member_profile_completion_banner_dismissed", "1")
								} catch {
									/* ignore */
								}
								router.push("/dashboard")
							}}
						>
							Continue to dashboard
						</Button>
						<p className="self-center text-xs text-muted-foreground">
							You can return anytime from Profile → Complete profile.
						</p>
					</div>
				</CardContent>
			</Card>

			{error ? (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="py-4 text-sm text-red-700">{error}</CardContent>
				</Card>
			) : null}

			<ProfileForm
				user={user}
				member={member}
				isLoadingProfile={isLoading}
				updateProfile={updateProfile}
				initialTab={activeTab}
				onTabChange={handleTabChange}
				kyc={kyc}
			/>
		</div>
	)
}
