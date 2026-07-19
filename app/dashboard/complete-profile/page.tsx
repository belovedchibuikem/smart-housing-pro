"use client"

import { useEffect, useMemo, useState } from "react"
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

	useEffect(() => {
		setActiveTab(STEP_TO_TAB[completion.nextStep])
	}, [completion.nextStep])

	useEffect(() => {
		if (!isLoading && completion.isComplete) {
			router.replace("/dashboard")
		}
	}, [completion.isComplete, isLoading, router])

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Complete your profile</h1>
				<p className="mt-1 text-muted-foreground">
					Add your profile details once so you can unlock all member experiences.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Profile completion</CardTitle>
					<CardDescription>
						{completion.completedCount} of {completion.totalCount} sections complete
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
									onClick={() => setActiveTab(STEP_TO_TAB[item.id])}
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
				onTabChange={(tab) => setActiveTab(tab)}
				kyc={kyc}
			/>
		</div>
	)
}
