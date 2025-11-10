"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import type { User, Member } from "@/lib/types/user"
import type { UpdateUserProfilePayload } from "@/lib/api/user-profile"
import type { UseMemberKycResult } from "@/lib/hooks/use-member-kyc"
import { ArrowRight, CheckCircle2, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type TabKey = "personal" | "employment" | "next-of-kin" | "documents" | "account"

type PersonalFormState = {
	first_name: string
	last_name: string
	phone: string
	date_of_birth: string
	gender: string
	marital_status: string
	nationality: string
	state_of_origin: string
	lga: string
	residential_address: string
	city: string
	state: string
}

type EmploymentFormState = {
	staff_id: string
	ippis_number: string
	rank: string
	department: string
	command_state: string
	employment_date: string
	years_of_service: string
}

type SecurityFormState = {
	password: string
	confirmPassword: string
}

type ProfileFormProps = {
	user: User | null
	member: Member | null
	isLoadingProfile: boolean
	updateProfile: (payload: UpdateUserProfilePayload) => Promise<void>
	initialTab?: TabKey
	onTabChange?: (tab: TabKey) => void
	kyc: UseMemberKycResult
}

export function ProfileForm({
	user,
	member,
	isLoadingProfile,
	updateProfile,
	initialTab = "personal",
	onTabChange,
	kyc,
}: ProfileFormProps) {
	const { toast } = useToast()

	const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
	const [isSaving, setIsSaving] = useState(false)

	const [personalForm, setPersonalForm] = useState<PersonalFormState>({
		first_name: "",
		last_name: "",
		phone: "",
		date_of_birth: "",
		gender: "",
		marital_status: "",
		nationality: "",
		state_of_origin: "",
		lga: "",
		residential_address: "",
		city: "",
		state: "",
	})

	const [employmentForm, setEmploymentForm] = useState<EmploymentFormState>({
		staff_id: "",
		ippis_number: "",
		rank: "",
		department: "",
		command_state: "",
		employment_date: "",
		years_of_service: "",
	})

const [nextOfKinForm, setNextOfKinForm] = useState({
	full_name: "",
	relationship: "",
	phone: "",
	email: "",
	address: "",
})

	const [securityForm, setSecurityForm] = useState<SecurityFormState>({
		password: "",
		confirmPassword: "",
	})

	useEffect(() => {
		if (initialTab !== activeTab) {
			setActiveTab(initialTab)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialTab])

	useEffect(() => {
		onTabChange?.(activeTab)
	}, [activeTab, onTabChange])

	useEffect(() => {
		if (!user) return
		setPersonalForm({
			first_name: user.first_name ?? "",
			last_name: user.last_name ?? "",
			phone: user.phone ?? "",
			date_of_birth: member?.date_of_birth ?? "",
			gender: member?.gender ?? "",
			marital_status: member?.marital_status ?? "",
			nationality: member?.nationality ?? "",
			state_of_origin: member?.state_of_origin ?? "",
			lga: member?.lga ?? "",
			residential_address: member?.residential_address ?? "",
			city: member?.city ?? "",
			state: member?.state ?? "",
		})

		setEmploymentForm({
			staff_id: member?.staff_id ?? "",
			ippis_number: member?.ippis_number ?? "",
			rank: member?.rank ?? "",
			department: member?.department ?? "",
			command_state: member?.command_state ?? "",
			employment_date: member?.employment_date ?? "",
			years_of_service: member?.years_of_service?.toString() ?? "",
		})

	setNextOfKinForm({
		full_name: member?.next_of_kin_name ?? "",
		relationship: member?.next_of_kin_relationship ?? "",
		phone: member?.next_of_kin_phone ?? "",
		email: member?.next_of_kin_email ?? "",
		address: member?.next_of_kin_address ?? "",
	})
	}, [user, member])

	useEffect(() => {
		if (!employmentForm.employment_date) {
			setEmploymentForm((prev) => ({ ...prev, years_of_service: "" }))
			return
		}

		const employmentDate = new Date(employmentForm.employment_date)
		if (Number.isNaN(employmentDate.getTime())) return

		const now = new Date()
		let years = now.getFullYear() - employmentDate.getFullYear()
		const monthDiff = now.getMonth() - employmentDate.getMonth()
		const dayDiff = now.getDate() - employmentDate.getDate()

		if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
			years -= 1
		}

		setEmploymentForm((prev) => ({
			...prev,
			years_of_service: years >= 0 ? String(years) : "0",
		}))
	}, [employmentForm.employment_date])

	const handlePersonalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSaving(true)
		try {
			await updateProfile({
				first_name: personalForm.first_name,
				last_name: personalForm.last_name,
				phone: personalForm.phone,
				date_of_birth: personalForm.date_of_birth || null,
				gender: personalForm.gender || null,
				marital_status: personalForm.marital_status || null,
				nationality: personalForm.nationality || null,
				state_of_origin: personalForm.state_of_origin || null,
				lga: personalForm.lga || null,
				residential_address: personalForm.residential_address || null,
				city: personalForm.city || null,
				state: personalForm.state || null,
			})
			toast({ title: "Profile updated", description: "Your personal information was saved successfully." })
		} catch (err: any) {
			toast({
				title: "Unable to update profile",
				description: err?.message ?? "Please review your details and try again.",
				variant: "destructive",
			})
		} finally {
			setIsSaving(false)
		}
	}

	const handleEmploymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSaving(true)
		try {
			await updateProfile({
				rank: employmentForm.rank || null,
				department: employmentForm.department || null,
				command_state: employmentForm.command_state || null,
				employment_date: employmentForm.employment_date || null,
				years_of_service: employmentForm.years_of_service ? Number(employmentForm.years_of_service) : null,
				staff_id: employmentForm.staff_id || null,
				ippis_number: employmentForm.ippis_number || null,
			})
			toast({ title: "Employment updated", description: "Employment details saved successfully." })
		} catch (err: any) {
			toast({
				title: "Unable to update employment",
				description: err?.message ?? "Please review the information and try again.",
				variant: "destructive",
			})
		} finally {
			setIsSaving(false)
		}
	}

	const handleNextOfKinSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSaving(true)
		try {
			await updateProfile({
				next_of_kin_name: nextOfKinForm.full_name || null,
				next_of_kin_relationship: nextOfKinForm.relationship || null,
				next_of_kin_phone: nextOfKinForm.phone || null,
				next_of_kin_email: nextOfKinForm.email || null,
				next_of_kin_address: nextOfKinForm.address || null,
			})
			toast({ title: "Next of kin updated", description: "Next of kin information saved successfully." })
		} catch (err: any) {
			toast({
				title: "Unable to update next of kin",
				description: err?.message ?? "Please review the information and try again.",
				variant: "destructive",
			})
		} finally {
			setIsSaving(false)
		}
	}

	const handleSecuritySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!securityForm.password || securityForm.password !== securityForm.confirmPassword) {
			toast({
				title: "Password mismatch",
				description: "Please ensure the new password and confirmation match.",
				variant: "destructive",
			})
			return
		}

		setIsSaving(true)
		try {
			await updateProfile({ password: securityForm.password })
			setSecurityForm({ password: "", confirmPassword: "" })
			toast({ title: "Password updated", description: "Your password was updated successfully." })
		} catch (err: any) {
			toast({
				title: "Unable to update password",
				description: err?.message ?? "Please try again later.",
				variant: "destructive",
			})
		} finally {
			setIsSaving(false)
		}
	}

	const isBusy = useMemo(() => isLoadingProfile || isSaving, [isLoadingProfile, isSaving])

	const documentStatus = useMemo(
		() =>
			kyc.requiredDocuments.map((type) => {
				const existing = kyc.documents.find((doc) => doc.type === type)
				return {
					type,
					exists: Boolean(existing),
					uploaded_at: existing?.uploaded_at ?? null,
					path: existing?.path ?? "",
				}
			}),
		[kyc.documents, kyc.requiredDocuments],
	)

  return (
		<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className="space-y-6">
			<TabsList className="grid w-full grid-cols-5">
				<TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="employment">Employment</TabsTrigger>
				<TabsTrigger value="next-of-kin">Next of Kin</TabsTrigger>
				<TabsTrigger value="documents">Documents</TabsTrigger>
				<TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <Card className="p-6">
					{isLoadingProfile ? (
						<div className="space-y-4">
							<Skeleton className="h-5 w-64" />
							<div className="grid gap-4 md:grid-cols-2">
								{Array.from({ length: 6 }).map((_, index) => (
									<Skeleton key={`personal-skeleton-${index}`} className="h-10 w-full" />
								))}
              </div>
              </div>
					) : (
						<form onSubmit={handlePersonalSubmit} className="space-y-6">
							<div className="grid gap-4 md:grid-cols-2">
								{[
									{ id: "firstName", label: "First Name", value: personalForm.first_name, required: true },
									{ id: "lastName", label: "Last Name", value: personalForm.last_name, required: true },
									{ id: "phone", label: "Phone Number", value: personalForm.phone, required: true, type: "tel" },
									{ id: "dob", label: "Date of Birth", value: personalForm.date_of_birth, type: "date" },
									{ id: "gender", label: "Gender", value: personalForm.gender, placeholder: "e.g. male, female" },
									{
										id: "maritalStatus",
										label: "Marital Status",
										value: personalForm.marital_status,
										placeholder: "Single, Married...",
									},
									{
										id: "nationality",
										label: "Nationality",
										value: personalForm.nationality,
										placeholder: "e.g. Nigerian",
									},
									{ id: "stateOfOrigin", label: "State of Origin", value: personalForm.state_of_origin },
									{ id: "lga", label: "Local Government Area", value: personalForm.lga },
									{ id: "city", label: "City", value: personalForm.city },
									{ id: "state", label: "State", value: personalForm.state },
								].map((field) => (
									<div key={field.id} className="space-y-2">
										<Label htmlFor={field.id}>{field.label}</Label>
										<Input
											id={field.id}
											type={field.type ?? "text"}
											value={field.value ?? ""}
											placeholder={field.placeholder}
											required={field.required}
											onChange={(event) =>
												setPersonalForm((prev) => ({
													...prev,
													[field.id === "stateOfOrigin" ? "state_of_origin" : field.id === "maritalStatus"
														? "marital_status"
														: field.id === "firstName"
														? "first_name"
														: field.id === "lastName"
														? "last_name"
														: field.id === "dob"
														? "date_of_birth"
														: field.id]: event.target.value,
												}))
											}
										/>
              </div>
								))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Residential Address</Label>
								<Textarea
									id="address"
									value={personalForm.residential_address ?? ""}
									onChange={(event) =>
										setPersonalForm((prev) => ({ ...prev, residential_address: event.target.value }))
									}
								/>
            </div>
							<Button type="submit" disabled={isBusy}>
								{isBusy ? "Saving..." : "Save Changes"}
            </Button>
          </form>
					)}
        </Card>
      </TabsContent>

      <TabsContent value="employment">
        <Card className="p-6">
					{isLoadingProfile ? (
						<div className="grid gap-4 md:grid-cols-2">
							{Array.from({ length: 5 }).map((_, index) => (
								<Skeleton key={`employment-skeleton-${index}`} className="h-10 w-full" />
							))}
						</div>
					) : (
						<form onSubmit={handleEmploymentSubmit} className="space-y-6">
							<div className="grid gap-4 md:grid-cols-2">
								{[
									{ id: "staff_id", label: "Staff ID Number", value: employmentForm.staff_id, required: true },
									{
										id: "ippis_number",
										label: "IPPIS Number",
										value: employmentForm.ippis_number,
										required: true,
									},
									{ id: "rank", label: "Rank / Position", value: employmentForm.rank },
									{ id: "department", label: "Department", value: employmentForm.department },
									{ id: "command_state", label: "Command State", value: employmentForm.command_state },
									{
										id: "employment_date",
										label: "Employment Date",
										value: employmentForm.employment_date,
										type: "date",
										required: true,
									},
								].map((field) => (
									<div key={field.id} className="space-y-2">
										<Label htmlFor={field.id}>{field.label}</Label>
										<Input
											id={field.id}
											type={field.type ?? "text"}
											value={field.value ?? ""}
											required={field.required}
											onChange={(event) =>
												setEmploymentForm((prev) => ({
													...prev,
													[field.id]: event.target.value,
												}))
											}
										/>
									</div>
								))}
								{[
									{
										id: "years_of_service",
										label: "Years of Service",
										value: employmentForm.years_of_service,
										type: "number",
										min: 0,
										disabled: true as const,
									},
								].map((field) => (
									<div key={field.id} className="space-y-2">
										<Label htmlFor={field.id}>{field.label}</Label>
										<Input
											id={field.id}
											type={field.type ?? "text"}
											min={field.min}
											value={field.value ?? ""}
											disabled={Boolean((field as any).disabled)}
										/>
										{field.id === "years_of_service" ? (
											<p className="text-xs text-muted-foreground">
												Automatically calculated from your employment date.
											</p>
										) : null}
									</div>
								))}
							</div>
							<Button type="submit" disabled={isBusy}>
								{isBusy ? "Saving..." : "Save Changes"}
							</Button>
						</form>
					)}
				</Card>
			</TabsContent>

			<TabsContent value="next-of-kin">
				<Card className="p-6">
					{isLoadingProfile ? (
						<div className="space-y-3">
							<Skeleton className="h-5 w-56" />
							{Array.from({ length: 4 }).map((_, index) => (
								<Skeleton key={`nok-skeleton-${index}`} className="h-10 w-full" />
							))}
							<Skeleton className="h-24 w-full" />
						</div>
					) : (
						<form onSubmit={handleNextOfKinSubmit} className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold">Next of Kin</h3>
								<p className="text-sm text-muted-foreground">
									Provide the details of the person the cooperative should contact in case of emergency.
								</p>
              </div>
							<div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
									<Label htmlFor="nok-full-name">Full Name</Label>
									<Input
										id="nok-full-name"
										value={nextOfKinForm.full_name}
										onChange={(event) =>
											setNextOfKinForm((prev) => ({ ...prev, full_name: event.target.value }))
										}
										required
									/>
              </div>
              <div className="space-y-2">
									<Label htmlFor="nok-relationship">Relationship</Label>
									<Input
										id="nok-relationship"
										value={nextOfKinForm.relationship}
										onChange={(event) =>
											setNextOfKinForm((prev) => ({ ...prev, relationship: event.target.value }))
										}
										placeholder="e.g. Spouse, Sibling"
										required
									/>
              </div>
              <div className="space-y-2">
									<Label htmlFor="nok-phone">Phone Number</Label>
									<Input
										id="nok-phone"
										type="tel"
										value={nextOfKinForm.phone}
										onChange={(event) =>
											setNextOfKinForm((prev) => ({ ...prev, phone: event.target.value }))
										}
										required
									/>
              </div>
              <div className="space-y-2">
									<Label htmlFor="nok-email">Email Address (optional)</Label>
									<Input
										id="nok-email"
										type="email"
										value={nextOfKinForm.email}
										onChange={(event) =>
											setNextOfKinForm((prev) => ({ ...prev, email: event.target.value }))
										}
										placeholder="name@example.com"
									/>
              </div>
              </div>
              <div className="space-y-2">
								<Label htmlFor="nok-address">Residential Address</Label>
								<Textarea
									id="nok-address"
									value={nextOfKinForm.address}
									onChange={(event) =>
										setNextOfKinForm((prev) => ({ ...prev, address: event.target.value }))
									}
									rows={3}
								/>
              </div>
							<Button type="submit" disabled={isBusy}>
								{isBusy ? "Saving..." : "Save Next of Kin"}
            </Button>
          </form>
					)}
        </Card>
      </TabsContent>

			<TabsContent value="documents">
				<Card className="p-6 space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">KYC Documents</h3>
						<Badge
							variant="outline"
							className={cn(
								kyc.status === "verified" && "border-green-500 text-green-700",
								kyc.status === "rejected" && "border-red-500 text-red-700",
								(kyc.status === "pending" || kyc.status === "submitted") && "border-yellow-500 text-yellow-700",
							)}
						>
							{kyc.status.toUpperCase()}
						</Badge>
					</div>
					{kyc.rejection_reason ? (
						<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
							<strong>Rejection reason:</strong> {kyc.rejection_reason}
                </div>
					) : null}
					{kyc.isLoading ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton key={`kyc-doc-${index}`} className="h-14 w-full" />
							))}
                </div>
					) : (
						<div className="space-y-3">
							{documentStatus.map((doc) => (
								<div
									key={doc.type}
									className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
								>
									<div className="flex flex-1 items-start gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
											<FileText className="h-5 w-5 text-primary" />
                </div>
										<div>
											<p className="font-medium">{doc.type.replace("_", " ")}</p>
											<p className="text-xs text-muted-foreground">
												{doc.exists
													? `Uploaded ${doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : ""}`
													: "Not uploaded"}
											</p>
                </div>
              </div>
									<div className="flex items-center gap-2">
										{doc.exists ? (
											<Badge className="bg-green-500/10 text-green-700">
												<CheckCircle2 className="mr-1 h-3 w-3" />
												Uploaded
											</Badge>
										) : (
											<Badge className="bg-gray-500/10 text-gray-700">
												<AlertCircle className="mr-1 h-3 w-3" />
												Missing
											</Badge>
										)}
              </div>
            </div>
							))}
						</div>
					)}
					<Button variant="outline" className="w-full justify-between" asChild>
						<Link href="/dashboard/documents">
							<span>Manage documents in the documents center</span>
							<ArrowRight className="h-4 w-4" />
						</Link>
            </Button>
        </Card>
      </TabsContent>

			<TabsContent value="account">
        <Card className="p-6">
					<form onSubmit={handleSecuritySubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
								<Input
									id="newPassword"
									type="password"
									minLength={8}
									value={securityForm.password}
									onChange={(event) =>
										setSecurityForm((prev) => ({ ...prev, password: event.target.value }))
									}
									required
								/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
								<Input
									id="confirmPassword"
									type="password"
									minLength={8}
									value={securityForm.confirmPassword}
									onChange={(event) =>
										setSecurityForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
									}
									required
								/>
              </div>
            </div>
						<Button type="submit" disabled={isBusy}>
							{isBusy ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
