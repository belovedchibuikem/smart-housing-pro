import type { Member, User } from "@/lib/types/user"

export type ProfileWizardStep = "personal" | "employment" | "next-of-kin"

export type ProfileCompletionStatus = {
	isComplete: boolean
	completedCount: number
	totalCount: number
	nextStep: ProfileWizardStep
	sections: Record<ProfileWizardStep, boolean>
}

function hasText(value: unknown): boolean {
	return typeof value === "string" ? value.trim().length > 0 : Boolean(value)
}

function isPersonalComplete(user: User | null, member: Member | null): boolean {
	return Boolean(
		user &&
			hasText(user.first_name) &&
			hasText(user.last_name) &&
			hasText(user.phone) &&
			member &&
			hasText(member.date_of_birth) &&
			hasText(member.residential_address) &&
			hasText(member.city) &&
			hasText(member.state),
	)
}

function isEmploymentRequired(member: Member | null): boolean {
	if (!member) return true
	return member.membership_type !== "non-member"
}

function isEmploymentComplete(member: Member | null): boolean {
	if (!isEmploymentRequired(member)) return true
	return Boolean(
		member &&
			hasText(member.rank) &&
			hasText(member.department) &&
			hasText(member.command_state) &&
			hasText(member.employment_date),
	)
}

function isNextOfKinComplete(member: Member | null): boolean {
	return Boolean(
		member &&
			hasText(member.next_of_kin_name) &&
			hasText(member.next_of_kin_relationship) &&
			hasText(member.next_of_kin_phone),
	)
}

export function getMemberProfileCompletionStatus(
	user: User | null,
	member: Member | null,
): ProfileCompletionStatus {
	const sections: Record<ProfileWizardStep, boolean> = {
		personal: isPersonalComplete(user, member),
		employment: isEmploymentComplete(member),
		"next-of-kin": isNextOfKinComplete(member),
	}

	const totalCount = Object.keys(sections).length
	const completedCount = Object.values(sections).filter(Boolean).length
	const isComplete = completedCount === totalCount
	const nextStep =
		(Object.entries(sections).find(([, completed]) => !completed)?.[0] as ProfileWizardStep | undefined) ??
		"personal"

	return {
		isComplete,
		completedCount,
		totalCount,
		nextStep,
		sections,
	}
}

export function isMemberProfileComplete(user: User | null, member: Member | null): boolean {
	return getMemberProfileCompletionStatus(user, member).isComplete
}
