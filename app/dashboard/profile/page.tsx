'use client'

import { useState } from "react"
import { ProfileForm } from "@/components/profile/profile-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useMemberProfile } from "@/lib/hooks/use-member-profile"
import { useMemberKyc } from "@/lib/hooks/use-member-kyc"
import { User, Mail, Phone, MapPin, Briefcase, Calendar, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
	const { user, member, isLoading, error, updateProfile } = useMemberProfile()
	const kyc = useMemberKyc()
	const [activeTab, setActiveTab] = useState<"personal" | "employment" | "next-of-kin" | "documents" | "account">(
		"personal",
	)
	const fullName = user ? `${user.first_name} ${user.last_name}` : "—"
	const memberNumber = member?.member_number ?? "—"
	const kycStatus = member?.kyc_status ?? "pending"
	const location =
		member?.city && member?.state ? `${member.city}, ${member.state}` : member?.city ?? member?.state ?? "—"

	const memberSince = member?.created_at
		? new Date(member.created_at).toLocaleDateString()
		: user?.created_at
		? new Date(user.created_at).toLocaleDateString()
		: "—"

	const kycBadgeVariant = (() => {
		switch (kycStatus) {
			case "verified":
				return { label: "KYC Verified", className: "bg-green-500/10 text-green-700 hover:bg-green-500/20" }
			case "rejected":
				return { label: "KYC Rejected", className: "bg-red-500/10 text-red-700 hover:bg-red-500/20" }
			case "submitted":
				return { label: "KYC Submitted", className: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20" }
			default:
				return { label: "KYC Pending", className: "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20" }
		}
	})()

  return (
		<div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
				<p className="mt-1 text-muted-foreground">Manage your personal information and account settings</p>
      </div>

			{error ? (
				<Card className="border-red-200 bg-red-50 p-6 text-sm text-red-600">
					<div className="flex items-start gap-3">
						<AlertTriangle className="mt-0.5 h-4 w-4" />
						<p>{error}</p>
					</div>
				</Card>
			) : null}

			<Card className="p-6">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{[
						{
							key: "personal",
							title: "Personal Information",
							description: "Name, contact details, and home address",
							completed: Boolean(
								member?.date_of_birth &&
									member.residential_address &&
									member.nationality &&
									member.state &&
									user?.phone,
							),
						},
						{
							key: "employment",
							title: "Employment Details",
							description: "Rank, department and FRSC command",
							completed: Boolean(member?.rank && member.department && member.command_state),
						},
						{
							key: "next-of-kin",
							title: "Next of Kin",
							description: "Emergency contact details",
							completed: Boolean(
								member?.next_of_kin_name && member?.next_of_kin_relationship && member?.next_of_kin_phone,
							),
						},
						{
							key: "documents",
							title: "Documents & KYC",
							description: "Upload required identity documents",
							completed: kyc.status === "verified",
							inProgress: kyc.status === "submitted" || kyc.status === "pending",
						},
					].map((step) => (
						<div
							key={step.key}
							className={cn(
								"rounded-lg border p-4",
								step.completed
									? "border-green-200 bg-green-50"
									: step.inProgress
									? "border-yellow-200 bg-yellow-50"
									: "border-border bg-muted/30",
							)}
						>
							<div className="mb-2 flex items-center justify-between">
								<h3 className="text-sm font-semibold">{step.title}</h3>
								<Badge
									variant="outline"
									className={cn(
										step.completed && "border-green-500 text-green-700",
										step.inProgress && "border-yellow-500 text-yellow-700",
										!step.completed && !step.inProgress && "border-muted-foreground/40 text-muted-foreground",
									)}
								>
									{step.completed ? "Complete" : step.inProgress ? "In Review" : "Incomplete"}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground">{step.description}</p>
							<Button
								variant="outline"
								size="sm"
								className="mt-3"
								onClick={() => setActiveTab(step.key as typeof activeTab)}
							>
								Review
							</Button>
						</div>
					))}
				</div>
			</Card>

      <Card className="p-6">
				<div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-shrink-0">
						<div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <User className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
						<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
								{isLoading ? (
									<>
										<Skeleton className="mb-2 h-6 w-40" />
										<Skeleton className="h-4 w-48" />
									</>
								) : (
									<>
										<h2 className="text-2xl font-bold">{fullName}</h2>
										<p className="text-sm text-muted-foreground">Member ID: {memberNumber}</p>
									</>
								)}
              </div>
							<Badge className={kycBadgeVariant.className}>{kycBadgeVariant.label}</Badge>
            </div>

						<div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
								{isLoading ? <Skeleton className="h-4 w-32" /> : <span>{user?.email ?? "—"}</span>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
								{isLoading ? <Skeleton className="h-4 w-24" /> : <span>{user?.phone ?? "—"}</span>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
								{isLoading ? <Skeleton className="h-4 w-28" /> : <span>{location}</span>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
								{isLoading ? (
									<Skeleton className="h-4 w-40" />
								) : (
									<span>{member?.rank ?? member?.department ?? "—"}</span>
								)}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
								{isLoading ? <Skeleton className="h-4 w-28" /> : <span>Member since {memberSince}</span>}
              </div>
            </div>
          </div>
        </div>
      </Card>

			<ProfileForm
				user={user}
				member={member}
				isLoadingProfile={isLoading}
				updateProfile={updateProfile}
				initialTab={activeTab}
				onTabChange={setActiveTab}
				kyc={kyc}
			/>

			{kyc.error ? (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="py-6">
						<div className="flex items-center gap-3 text-sm text-red-700">
							<AlertTriangle className="h-4 w-4" />
							<span>{kyc.error}</span>
						</div>
					</CardContent>
				</Card>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle>Need to finish later?</CardTitle>
					<CardDescription>Jump back to where you left off in your onboarding journey.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab("personal")}>
						→ Update personal information
					</Button>
					<Button
						variant="outline"
						className="w-full justify-start gap-2"
						onClick={() => setActiveTab("employment")}
					>
						→ Review employment details
					</Button>
					<Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActiveTab("documents")}>
						→ Manage KYC documents
					</Button>
					<Button variant="link" className="px-0" asChild>
						<Link href="/dashboard/documents">Go to full documents center</Link>
					</Button>
				</CardContent>
			</Card>
    </div>
  )
}
