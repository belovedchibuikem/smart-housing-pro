"use client"



import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { createInternalMortgagePlan, searchMembers, getApprovedPropertyInterests, type SearchedMember, type ApprovedPropertyInterest } from "@/lib/api/client"
import { ArrowLeft, Calculator, Search, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type FrequencyOption = "monthly" | "quarterly" | "biannually" | "annually"
type PlanStatusOption = "draft" | "active"
type SelectValueChangeHandler = (value: string) => void

export default function NewInternalMortgagePlanPage() {
	const router = useRouter()
	const { toast } = useToast()

	const [title, setTitle] = useState("")
	const [description, setDescription] = useState("")
	const [principal, setPrincipal] = useState("")
	const [interestRate, setInterestRate] = useState("")
	const [tenureMonths, setTenureMonths] = useState("")
	const [frequency, setFrequency] = useState<FrequencyOption>("monthly")
	const [propertyId, setPropertyId] = useState("")
	const [memberId, setMemberId] = useState("")
	const [startsOn, setStartsOn] = useState("")
	const [endsOn, setEndsOn] = useState("")
	const [status, setStatus] = useState<PlanStatusOption>("draft")
	const [notes, setNotes] = useState("")
	const [linkProperty, setLinkProperty] = useState(false)
	const [linkMember, setLinkMember] = useState(false)
	const [submitting, setSubmitting] = useState(false)

	// Member search state
	const [memberSearchQuery, setMemberSearchQuery] = useState("")
	const [memberSearchResults, setMemberSearchResults] = useState<SearchedMember[]>([])
	const [selectedMember, setSelectedMember] = useState<SearchedMember | null>(null)
	const [searchingMembers, setSearchingMembers] = useState(false)
	const [memberSearchOpen, setMemberSearchOpen] = useState(false)

	// Property selection state
	const [propertyOptions, setPropertyOptions] = useState<ApprovedPropertyInterest[]>([])
	const [loadingProperties, setLoadingProperties] = useState(false)

	const handleFrequencyChange: SelectValueChangeHandler = (value) => {
		setFrequency(value as FrequencyOption)
	}

	const handleStatusChange: SelectValueChangeHandler = (value) => {
		setStatus(value as PlanStatusOption)
	}

	// Member search handler
	const handleMemberSearch = useCallback(async (query: string) => {
		setMemberSearchQuery(query)
		if (query.length < 2) {
			setMemberSearchResults([])
			return
		}

		setSearchingMembers(true)
		try {
			const response = await searchMembers(query)
			if (response.success && response.data) {
				setMemberSearchResults(response.data)
			} else {
				setMemberSearchResults([])
			}
		} catch (error) {
			console.error("Failed to search members:", error)
			setMemberSearchResults([])
		} finally {
			setSearchingMembers(false)
		}
	}, [])

	// Handle member selection
	const handleSelectMember = (member: SearchedMember) => {
		setSelectedMember(member)
		setMemberId(member.id)
		setMemberSearchQuery(`${member.name} (${member.member_number})`)
		setMemberSearchOpen(false)
		setPropertyId("") // Reset property when member changes
		setPropertyOptions([])
	}

	// Load approved property interests when member is selected
	useEffect(() => {
		if (memberId && linkMember) {
			setLoadingProperties(true)
			getApprovedPropertyInterests(memberId)
				.then((response) => {
					if (response.success && response.data) {
						setPropertyOptions(response.data)
					} else {
						setPropertyOptions([])
					}
				})
				.catch((error) => {
					console.error("Failed to load property interests:", error)
					setPropertyOptions([])
				})
				.finally(() => {
					setLoadingProperties(false)
				})
		} else {
			setPropertyOptions([])
			setPropertyId("")
		}
	}, [memberId, linkMember])

	// Reset member when link is unchecked
	useEffect(() => {
		if (!linkMember) {
			setSelectedMember(null)
			setMemberId("")
			setMemberSearchQuery("")
			setPropertyOptions([])
			setPropertyId("")
		}
	}, [linkMember])

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!title.trim()) {
			toast({
				title: "Title required",
				description: "Please provide a descriptive title for this mortgage plan.",
				variant: "destructive",
			})
			return
		}

		if (!principal || Number(principal) <= 0) {
			toast({
				title: "Principal required",
				description: "Please enter the principal amount for this mortgage plan.",
				variant: "destructive",
			})
			return
		}

		if (!interestRate || Number(interestRate) < 0) {
			toast({
				title: "Interest rate required",
				description: "Please provide the annual interest rate.",
				variant: "destructive",
			})
			return
		}

		if (!tenureMonths || Number(tenureMonths) <= 0) {
			toast({
				title: "Tenure required",
				description: "Please enter the tenure in months.",
				variant: "destructive",
			})
			return
		}

		try {
			setSubmitting(true)
			const response = await createInternalMortgagePlan({
				title,
				description: description || undefined,
				principal: Number(principal),
				interest_rate: Number(interestRate),
				tenure_months: Number(tenureMonths),
				frequency,
				property_id: linkProperty && propertyId ? propertyId : undefined,
				member_id: linkMember && memberId ? memberId : undefined,
				starts_on: startsOn || undefined,
				ends_on: endsOn || undefined,
				status,
				metadata: notes ? { notes } : undefined,
			})

			if (!response.success) {
				toast({
					title: "Unable to create mortgage plan",
					description: response.message ?? "Please review the form and try again.",
					variant: "destructive",
				})
				return
			}

			toast({
				title: "Internal mortgage plan created",
				description:
					"The plan is now available for linking to payment plans or property interests. Configure a detailed schedule when ready.",
			})

			router.push(`/admin/internal-mortgages/${response.data.id}`)
		} catch (error: any) {
			toast({
				title: "Creation failed",
				description: error?.message ?? "Something went wrong while creating the mortgage plan.",
				variant: "destructive",
			})
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/admin/internal-mortgages">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Create Internal Mortgage Plan</h1>
					<p className="text-muted-foreground">
						Define a cooperative-managed mortgage schedule that can be tied to property payment plans.
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Plan Details</CardTitle>
					<CardDescription>Start with the core information for this internal mortgage plan.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								placeholder="e.g., Corporate Mortgage Plan – 5 Years"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="principal">Principal Amount</Label>
							<Input
								id="principal"
								type="number"
								min="0"
								value={principal}
								onChange={(event) => setPrincipal(event.target.value)}
								placeholder="e.g., 25000000"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="interest-rate">Interest Rate (%)</Label>
							<Input
								id="interest-rate"
								type="number"
								min="0"
								step="0.01"
								value={interestRate}
								onChange={(event) => setInterestRate(event.target.value)}
								placeholder="e.g., 12.5"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="tenure-months">Tenure (Months)</Label>
							<Input
								id="tenure-months"
								type="number"
								min="1"
								value={tenureMonths}
								onChange={(event) => setTenureMonths(event.target.value)}
								placeholder="e.g., 60"
								required
							/>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Repayment Frequency</Label>
							<Select value={frequency} onValueChange={handleFrequencyChange}>
								<SelectTrigger>
									<SelectValue placeholder="Select frequency" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="monthly">Monthly</SelectItem>
									<SelectItem value="quarterly">Quarterly</SelectItem>
									<SelectItem value="biannually">Biannually</SelectItem>
									<SelectItem value="annually">Annually</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Plan Status</Label>
							<Select value={status} onValueChange={handleStatusChange}>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="draft">Draft</SelectItem>
									<SelectItem value="active">Active</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description (optional)</Label>
						<Textarea
							id="description"
							rows={3}
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Provide additional context or terms for this mortgage plan."
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Optional Links</CardTitle>
					<CardDescription>Associate this mortgage plan with a property or member right away, or keep it generic.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center space-x-2">
						<Checkbox id="link-member" checked={linkMember} onCheckedChange={(checked) => setLinkMember(checked === true)} />
						<Label htmlFor="link-member">Link to a Member</Label>
					</div>
					{linkMember && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="member-search">Search Member</Label>
								<Popover open={memberSearchOpen} onOpenChange={setMemberSearchOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											className={cn("w-full justify-between", !selectedMember && "text-muted-foreground")}
										>
											{selectedMember ? `${selectedMember.name} (${selectedMember.member_number})` : "Search and select a member..."}
											<Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-full p-0" align="start">
										<div className="flex items-center border-b px-3">
											<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
											<Input
												placeholder="Search by name, email, phone, or member number..."
												value={memberSearchQuery}
												onChange={(e) => handleMemberSearch(e.target.value)}
												className="border-0 focus-visible:ring-0"
											/>
										</div>
										<div className="max-h-[300px] overflow-auto">
											{searchingMembers ? (
												<div className="flex items-center justify-center p-4">
													<Loader2 className="h-4 w-4 animate-spin" />
													<span className="ml-2 text-sm text-muted-foreground">Searching...</span>
												</div>
											) : memberSearchResults.length === 0 ? (
												<div className="p-4 text-center text-sm text-muted-foreground">
													{memberSearchQuery.length < 2 ? "Enter at least 2 characters to search" : "No members found"}
												</div>
											) : (
												memberSearchResults.map((member) => (
													<button
														key={member.id}
														type="button"
														className={cn(
															"flex w-full items-center justify-between px-4 py-2 text-left hover:bg-accent",
															selectedMember?.id === member.id && "bg-accent",
														)}
														onClick={() => handleSelectMember(member)}
													>
														<div className="flex flex-col">
															<span className="font-medium">{member.name}</span>
															<span className="text-xs text-muted-foreground">
																{member.member_number} • {member.email || member.phone_number || "No contact"}
															</span>
														</div>
														{selectedMember?.id === member.id && <Check className="h-4 w-4" />}
													</button>
												))
											)}
										</div>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					)}

					<div className="flex items-center space-x-2">
						<Checkbox id="link-property" checked={linkProperty} onCheckedChange={(checked) => setLinkProperty(checked === true)} />
						<Label htmlFor="link-property">Link to a Property</Label>
					</div>
					{linkProperty && (
						<div className="space-y-2">
							<Label htmlFor="property-select">
								{linkMember && memberId ? "Select Property (Approved Interests)" : "Property ID"}
							</Label>
							{linkMember && memberId ? (
								<Select value={propertyId} onValueChange={setPropertyId} disabled={loadingProperties || propertyOptions.length === 0}>
									<SelectTrigger id="property-select">
										<SelectValue placeholder={loadingProperties ? "Loading properties..." : propertyOptions.length === 0 ? "No approved properties found" : "Select a property"} />
									</SelectTrigger>
									<SelectContent>
										{propertyOptions.map((interest) => (
											<SelectItem key={interest.id} value={interest.property_id}>
												<div className="flex flex-col">
													<span className="font-medium">{interest.property.title}</span>
													<span className="text-xs text-muted-foreground">
														{interest.property.location || interest.property.address || "No location"}
														{interest.property.price && ` • ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(interest.property.price)}`}
													</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							) : (
								<Input
									id="property-id"
									value={propertyId}
									onChange={(event) => setPropertyId(event.target.value)}
									placeholder="Enter property ID (or link a member first to see approved properties)"
								/>
							)}
							{linkMember && memberId && propertyOptions.length === 0 && !loadingProperties && (
								<p className="text-xs text-muted-foreground">This member has no approved property interests yet.</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Schedule & Notes</CardTitle>
					<CardDescription>
						Specify optional timeline details now, or use the calculators to compute a detailed amortization schedule later.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="starts-on">Starts On</Label>
						<Input
							id="starts-on"
							type="date"
							value={startsOn}
							onChange={(event) => setStartsOn(event.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="ends-on">Ends On</Label>
						<Input
							id="ends-on"
							type="date"
							value={endsOn}
							onChange={(event) => setEndsOn(event.target.value)}
						/>
					</div>
					<div className="md:col-span-2 space-y-2">
						<Label htmlFor="notes">Administrative Notes</Label>
						<Textarea
							id="notes"
							rows={3}
							value={notes}
							onChange={(event) => setNotes(event.target.value)}
							placeholder="Any guidance for the cooperative team handling this mortgage."
						/>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline" type="button" asChild>
						<Link href="/admin/tools/mortgage-calculators">
							<Calculator className="mr-2 h-4 w-4" />
							Use Amortization Calculator
						</Link>
					</Button>
					<Button type="submit" disabled={submitting}>
						{submitting ? "Creating..." : "Create Mortgage Plan"}
					</Button>
				</CardFooter>
			</Card>
		</form>
	)
}



