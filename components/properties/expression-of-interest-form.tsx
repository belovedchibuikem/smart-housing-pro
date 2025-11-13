"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import SignaturePad from "signature_pad"
import { differenceInYears } from "date-fns"
import { Upload, FileText, Loader2, AlertTriangle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { fetchUserProfile } from "@/lib/api/user-profile"
import {
	getAvailableProperties,
	submitPropertyInterest,
	getPropertyMortgage,
	type AvailableProperty,
	type PropertyFundingOption,
	type ExistingLoanType,
	type SubmitPropertyInterestPayload,
	type PropertyMortgage,
} from "@/lib/api/client"
import { useWhiteLabelSettings } from "@/lib/hooks/use-white-label"

interface ExpressionOfInterestFormProps {
  propertyId: string
}

type LoanState = {
	fmbn: boolean
	fgshlb: boolean
	homeRenovation: boolean
	cooperative: boolean
}

type SignaturePadWithHandlers = SignaturePad & {
	onEnd?: () => void
	onBegin?: () => void
}

const loanTypeOptions: Array<{ key: keyof LoanState; label: string; value: ExistingLoanType }> = [
	{ key: "fmbn", label: "FMBN", value: "fmbn" },
	{ key: "fgshlb", label: "FGSHLB", value: "fgshlb" },
	{ key: "homeRenovation", label: "HOME RENOVATION", value: "home_renovation" },
	{ key: "cooperative", label: "COOPERATIVE", value: "cooperative" },
]

const MIX_FUNDING_OPTIONS: Array<{ value: PropertyFundingOption; label: string; description: string }> = [
	{
		value: "equity_wallet",
		label: "Equity Wallet",
		description: "Use your accumulated equity contributions as part of the payment plan.",
	},
	{
		value: "loan",
		label: "Loan",
		description: "Tie deductions from an approved loan to this property’s repayment schedule.",
	},
	{
		value: "mortgage",
		label: "Mortgage",
		description: "Apply a mortgage plan configured by the cooperative for this property.",
	},
	{
		value: "cooperative",
		label: "Cooperative Deduction",
		description: "Set up internal cooperative deductions as part of the repayment mix.",
	},
]

type FormState = {
	applicantName: string
	rank: string
	pin: string
	ippis: string
	command: string
	phone: string
	netSalary: string
	nextOfKinName: string
	nextOfKinAddress: string
	nextOfKinPhone: string
	nextOfKinRelationship: string
	propertyName: string
	propertyDescription: string
	propertyCost: string
	signatureDate: string
}

const defaultLoanState: LoanState = {
    fmbn: false,
    fgshlb: false,
    homeRenovation: false,
    cooperative: false,
}

const initialFormState: FormState = {
	applicantName: "",
	rank: "",
	pin: "",
	ippis: "",
	command: "",
	phone: "",
	netSalary: "",
	nextOfKinName: "",
	nextOfKinAddress: "",
	nextOfKinPhone: "",
	nextOfKinRelationship: "",
	propertyName: "",
	propertyDescription: "",
	propertyCost: "",
	signatureDate: new Date().toISOString().slice(0, 10),
}

const formatCurrency = (value?: number | null) => {
	if (value === undefined || value === null) return "₦0"
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value)
}

const sanitizeNumber = (value: string) => Number(String(value).replace(/[^0-9.-]/g, ""))

export function ExpressionOfInterestForm({ propertyId }: ExpressionOfInterestFormProps) {
	const router = useRouter()
	const { toast } = useToast()

	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [property, setProperty] = useState<AvailableProperty | null>(null)
	const [formData, setFormData] = useState<FormState>(initialFormState)
	const [hasExistingLoan, setHasExistingLoan] = useState<"yes" | "no">("no")
	const [loanTypes, setLoanTypes] = useState<LoanState>(defaultLoanState)
	const [fundingOption, setFundingOption] = useState<PropertyFundingOption>("cash")
	const [mixFundingMethods, setMixFundingMethods] = useState<PropertyFundingOption[]>([])
	const MAX_MIX_METHODS = 3
	const MIN_MIX_METHODS = 2
	const [passportPreview, setPassportPreview] = useState<string | null>(null)
	const [passportDataUrl, setPassportDataUrl] = useState<string | null>(null)
	const [paySlipName, setPaySlipName] = useState<string | null>(null)
	const [paySlipDataUrl, setPaySlipDataUrl] = useState<string | null>(null)
	const [signatureData, setSignatureData] = useState<string | null>(null)
	const [memberAge, setMemberAge] = useState<number | null>(null)
	const [yearsOfService, setYearsOfService] = useState<number | null>(null)
	const [mortgageTerms, setMortgageTerms] = useState<PropertyMortgage | null>(null)
	const { getLogo } = useWhiteLabelSettings()

	const expressionHeading = useMemo(() => {
		if (property?.location) {
			return `${property.location} Expression of Interest`.toUpperCase()
		}
		if (property?.title) {
			return `${property.title} Expression of Interest`.toUpperCase()
		}
		return "Expression of Interest"
	}, [property])

	const canvasRef = useRef<HTMLCanvasElement>(null)
	const signaturePadRef = useRef<SignaturePadWithHandlers | null>(null)

	const yearsLeft = useMemo(() => {
		if (yearsOfService === null) return null
		return Math.max(0, 35 - yearsOfService)
	}, [yearsOfService])

	const mortgageOptionBlocked = useMemo(() => {
		if (memberAge !== null && memberAge >= 60) return true
		if (yearsOfService !== null && yearsOfService >= 35) return true
		return false
	}, [memberAge, yearsOfService])

	const mortgageTenureRestriction = useMemo(() => {
		if (yearsLeft === null) return false
		if (yearsLeft > 2) return false
		const tenure = mortgageTerms?.tenure_years
		if (!tenure) return false
		return tenure >= 3
	}, [yearsLeft, mortgageTerms])

	const mortgageMonthlyPayment = useMemo(() => {
		if (!mortgageTerms) return null
		return typeof mortgageTerms.monthly_payment === "number" ? mortgageTerms.monthly_payment : null
	}, [mortgageTerms])

	const mortgageSelected = fundingOption === "mix" && mixFundingMethods.includes("mortgage")
	const mixSelectionCount = mixFundingMethods.length

	const initializeSignaturePad = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const pad = new SignaturePad(canvas, {
			backgroundColor: "#ffffff",
			penColor: "#111827",
		})
		const padWithHandlers = pad as SignaturePadWithHandlers

		const resizeCanvas = () => {
			const ratio = Math.max(window.devicePixelRatio || 1, 1)
			const width = canvas.offsetWidth
			const height = canvas.offsetHeight
			canvas.width = width * ratio
			canvas.height = height * ratio
			const context = canvas.getContext("2d")
			if (context) {
				context.scale(ratio, ratio)
				context.fillStyle = "#ffffff"
				context.fillRect(0, 0, canvas.width, canvas.height)
			}
			pad.clear()
			setSignatureData(null)
		}

		resizeCanvas()
		window.addEventListener("resize", resizeCanvas)

		padWithHandlers.onEnd = () => {
			if (pad.isEmpty()) {
				setSignatureData(null)
			} else {
				setSignatureData(pad.toDataURL("image/png"))
			}
		}

		padWithHandlers.onBegin = () => {
			if (pad.isEmpty()) {
				return
			}
			const update = () => {
				if (!pad.isEmpty()) {
					setSignatureData(pad.toDataURL("image/png"))
				}
			}
			update()
		}

		signaturePadRef.current = pad

		return () => {
			window.removeEventListener("resize", resizeCanvas)
			signaturePadRef.current = null
		}
	}, [])

useEffect(() => {
	if (loading) return
	const teardown = initializeSignaturePad()
	return teardown
}, [initializeSignaturePad, loading])

	const clearSignature = () => {
		signaturePadRef.current?.clear()
		setSignatureData(null)
	}

	const ensureSignatureData = () => {
		const pad = signaturePadRef.current
		if (!pad || pad.isEmpty()) {
			setSignatureData(null)
			return null
		}

		const dataUrl = pad.toDataURL("image/png")
		setSignatureData(dataUrl)
		return dataUrl
	}

	const fileToDataUrl = (file: File) =>
		new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
			reader.onload = () => resolve(reader.result as string)
			reader.onerror = () => reject(new Error("Failed to read file"))
			reader.readAsDataURL(file)
		})

	const handlePassportUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			const dataUrl = await fileToDataUrl(file)
			setPassportPreview(dataUrl)
			setPassportDataUrl(dataUrl)
		} catch (error) {
			console.error(error)
			toast({
				title: "Unable to read passport photo",
				description: "Please try again with a different image.",
				variant: "destructive",
			})
		}
	}

	const handlePaySlipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			const dataUrl = await fileToDataUrl(file)
			setPaySlipDataUrl(dataUrl)
			setPaySlipName(file.name)
		} catch (error) {
			console.error(error)
			toast({
				title: "Unable to read pay slip",
				description: "Please try again with a supported file format.",
				variant: "destructive",
			})
      }
	}

	const loadFormDetails = useCallback(async () => {
		try {
			setLoading(true)
			const [profileResponse, availableResponse] = await Promise.all([
				fetchUserProfile(),
				getAvailableProperties(),
			])

			const propertyMatch = availableResponse.properties.find((item) => item.id === propertyId) ?? null

			if (!propertyMatch) {
				toast({
					title: "Property not found",
					description: "The selected property could not be found. Please select another property.",
					variant: "destructive",
				})
				router.replace("/dashboard/properties")
				return
			}

			setProperty(propertyMatch)

			const user = profileResponse.user
			const member = user.member

			const name = [user.first_name, user.last_name].filter(Boolean).join(" ")

			setFormData((prev) => ({
				...prev,
				applicantName: name,
				rank: member?.rank ?? "",
				pin: member?.member_number ?? member?.staff_id ?? "",
				ippis: member?.ippis_number ?? "",
				command: member?.command_state ?? member?.department ?? "",
				phone: user.phone ?? "",
				netSalary: "",
				nextOfKinName: member?.next_of_kin_name ?? "",
				nextOfKinAddress: member?.next_of_kin_address ?? "",
				nextOfKinPhone: member?.next_of_kin_phone ?? "",
				nextOfKinRelationship: member?.next_of_kin_relationship ?? "",
				propertyName: propertyMatch.title ?? "",
				propertyDescription: propertyMatch.description ?? "",
				propertyCost: propertyMatch.price ? String(propertyMatch.price) : "",
				signatureDate: new Date().toISOString().slice(0, 10),
			}))

			if (member?.date_of_birth) {
				const dob = new Date(member.date_of_birth)
				if (!Number.isNaN(dob.getTime())) {
					setMemberAge(differenceInYears(new Date(), dob))
				}
			}

			if (member?.years_of_service !== undefined && member?.years_of_service !== null) {
				setYearsOfService(member.years_of_service)
			} else if (member?.employment_date) {
				const start = new Date(member.employment_date)
				if (!Number.isNaN(start.getTime())) {
					setYearsOfService(differenceInYears(new Date(), start))
				}
			}

			try {
				const mortgageResponse = await getPropertyMortgage(propertyMatch.id)
				if (mortgageResponse.success) {
					setMortgageTerms(mortgageResponse.mortgage ?? null)
				} else {
					setMortgageTerms(null)
				}
			} catch (mortgageError) {
				console.warn("Unable to load mortgage details for property", mortgageError)
				setMortgageTerms(null)
			}
		} catch (error) {
			console.error(error)
			toast({
				title: "Unable to load form",
				description: "We could not load your profile details. Please try again later.",
				variant: "destructive",
			})
			router.replace("/dashboard/properties")
		} finally {
			setLoading(false)
		}
	}, [propertyId, router, toast])

	useEffect(() => {
		void loadFormDetails()
	}, [loadFormDetails])

	const onChangeField = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[field]: event.target.value,
		}))
    }

	const toggleLoanType = (key: keyof LoanState) => (checked: boolean | string) => {
		setLoanTypes((prev) => ({
			...prev,
			[key]: Boolean(checked),
		}))
	}

	const toggleMixMethod = (method: PropertyFundingOption) => (checked: boolean | string) => {
		const isChecked = checked === true || checked === "true"
		setMixFundingMethods((prev) => {
			if (isChecked) {
				if (prev.includes(method)) {
					return prev
				}
				if (prev.length >= MAX_MIX_METHODS) {
					toast({
						title: "Limit reached",
						description: "You can select up to three payment options for the mix funding plan.",
						variant: "destructive",
					})
					return prev
				}
				return [...prev, method]
			}
			return prev.filter((item) => item !== method)
		})
	}

	const selectedLoanTypes = useMemo<ExistingLoanType[]>(() => {
		const entries = Object.entries(loanTypes).filter(([, value]) => value)
		return entries.map(([key]) => {
			const option = loanTypeOptions.find((item) => item.key === key)
			return option?.value ?? "other"
		})
	}, [loanTypes])

	useEffect(() => {
		if (hasExistingLoan === "no") {
			setLoanTypes(defaultLoanState)
		}
	}, [hasExistingLoan])

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const currentSignature = signaturePadRef.current?.isEmpty()
			? null
			: signaturePadRef.current?.toDataURL("image/png") ?? null

		console.log("Submitting expression of interest", {
			fundingOption,
			hasSignature: Boolean(currentSignature ?? signatureData),
			netSalary: formData.netSalary,
			mixFundingMethods,
		})

		if (!property) {
			toast({
				title: "Property not found",
				description: "Unable to submit because property details are missing.",
				variant: "destructive",
			})
			return
		}

		const latestSignature = ensureSignatureData()

		if (!signaturePadRef.current || signaturePadRef.current.isEmpty() || !latestSignature) {
			toast({
				title: "Signature required",
				description: "Please sign the form digitally before submitting.",
				variant: "destructive",
			})
			console.warn("Submission blocked: signature missing")
			return
		}

		if (fundingOption === "mix") {
			if (mixFundingMethods.length < MIN_MIX_METHODS) {
				toast({
					title: "Select more payment options",
					description: "Please choose at least two payment methods for the mix funding plan.",
					variant: "destructive",
				})
				return
			}

			if (mixFundingMethods.length > MAX_MIX_METHODS) {
				toast({
					title: "Too many payment options selected",
					description: "You can combine a maximum of three payment methods for the mix funding plan.",
					variant: "destructive",
				})
				return
			}

			if (mortgageSelected) {
				if (mortgageOptionBlocked) {
					toast({
						title: "Mortgage not permitted",
						description: "Mortgage funding is not available based on your retirement eligibility.",
						variant: "destructive",
					})
					return
				}

				if (mortgageTenureRestriction) {
					toast({
						title: "Mortgage tenure too long",
						description: "Please adjust your mix selection or work with the cooperative on a shorter tenure.",
						variant: "destructive",
					})
					return
				}
			}
		}

		const netSalaryValue = sanitizeNumber(formData.netSalary)
		if (!Number.isFinite(netSalaryValue) || netSalaryValue <= 0) {
			toast({
				title: "Net salary required",
				description: "Please provide a valid net salary amount.",
				variant: "destructive",
			})
			console.warn("Submission blocked: invalid net salary", { netSalaryValue, raw: formData.netSalary })
			return
		}

		const payload: SubmitPropertyInterestPayload = {
			interest_type: "purchase",
			message: null,
			applicant: {
				name: formData.applicantName,
				rank: formData.rank || undefined,
				pin: formData.pin || undefined,
				ippis_number: formData.ippis || undefined,
				command: formData.command || undefined,
				phone: formData.phone,
			},
			financial: {
				net_salary: netSalaryValue,
				has_existing_loan: hasExistingLoan === "yes",
				existing_loan_types: hasExistingLoan === "yes" && selectedLoanTypes.length > 0 ? selectedLoanTypes : undefined,
			},
			next_of_kin: {
				name: formData.nextOfKinName,
				phone: formData.nextOfKinPhone,
				address: formData.nextOfKinAddress,
				relationship: formData.nextOfKinRelationship || undefined,
			},
			property_snapshot: {
				id: property.id,
				title: property.title,
				description: property.description,
				type: property.type,
				location: property.location,
				price: property.price,
				size: property.size !== undefined && property.size !== null ? String(property.size) : null,
				bedrooms: property.bedrooms ?? null,
				bathrooms: property.bathrooms ?? null,
			},
			funding_option: fundingOption,
			documents: {
				passport: passportDataUrl ?? undefined,
				pay_slip: paySlipDataUrl ?? undefined,
			},
			signature: {
				data_url: latestSignature,
				signed_at: formData.signatureDate,
			},
			mortgage_id: undefined,
		}

		let preferredPaymentMethods: PropertyFundingOption[] | undefined

		if (fundingOption === "cash") {
			preferredPaymentMethods = ["cash"]
		} else if (fundingOption === "loan") {
			preferredPaymentMethods = ["loan"]
		} else if (fundingOption === "mix") {
			preferredPaymentMethods = mixFundingMethods
			payload.funding_breakdown = {
				primary: mixFundingMethods[0] ?? null,
				secondary: mixFundingMethods[1] ?? null,
				tertiary: mixFundingMethods[2] ?? null,
				methods: mixFundingMethods,
			}
		}

		if (preferredPaymentMethods && preferredPaymentMethods.length > 0) {
			payload.preferred_payment_methods = preferredPaymentMethods
		}

		if (mortgageSelected) {
			if (mortgageTerms) {
				payload.mortgage_id = mortgageTerms.id
				payload.mortgage = {
					provider: mortgageTerms.provider?.name,
					tenure_years: mortgageTerms.tenure_years,
					interest_rate: mortgageTerms.interest_rate,
					monthly_payment: mortgageTerms.monthly_payment,
					loan_amount: mortgageTerms.loan_amount,
				}
			} else {
				console.warn("Mortgage selected in mix funding, but no mortgage terms are configured for this property.")
			}
		}

		try {
			if (submitting) {
				console.warn("Submission prevented because another submission is in progress")
				return
			}

			setSubmitting(true)
			const response = await submitPropertyInterest(property.id, payload)

			if (!response.success) {
				toast({
					title: "Unable to submit interest",
					description: response.message ?? "Please review the form and try again.",
					variant: "destructive",
				})
				return
			}

			toast({
				title: "Expression of interest submitted",
				description: "We will review your application and notify you once it is approved.",
				variant: "default",
			})

			router.push(`/dashboard/properties/${property.id}`)
		} catch (error: any) {
			toast({
				title: "Submission failed",
				description: error?.message ?? "Something went wrong while submitting your interest.",
				variant: "destructive",
			})
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<Card className="mx-auto max-w-4xl">
				<CardContent className="flex h-64 items-center justify-center">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Loader2 className="h-5 w-5 animate-spin" />
						<span>Loading expression of interest form…</span>
					</div>
				</CardContent>
			</Card>
		)
  }

	return (
		<form onSubmit={handleSubmit} noValidate>
			<Card className="mx-auto max-w-4xl">
				<CardHeader className="border-b text-center">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex h-24 w-24 items-center justify-center rounded border-2 border-gray-300">
							{getLogo() ? (
								<img src={getLogo() ?? ""} alt="Institution Logo" className="h-20 w-20 object-contain" />
							) : (
								<div className="flex h-20 w-20 items-center justify-center text-xs text-muted-foreground">
									Tenant Logo
								</div>
							)}
            </div>
            <div className="flex-1 text-center">
              <CardTitle className="text-2xl font-bold">FEDERAL ROAD SAFETY CORPS</CardTitle>
							<div className="mt-1 text-sm font-semibold">FRSC HOUSING COOPERATIVE SOCIETY</div>
							<div className="mt-1 text-xs">HOUSING 20000 (ONE MAN, ONE HOUSE) PROJECT</div>
							<div className="mt-1 text-xs text-blue-600">
                <a href="mailto:Housing20000@frsc.gov.ng">Housing20000@frsc.gov.ng</a>,{" "}
                <a href="mailto:frschousingcooperative@gmail.com">frschousingcooperative@gmail.com</a>
              </div>
							<div className="mt-2 text-sm font-semibold uppercase">{expressionHeading}</div>
            </div>
						<div className="flex h-40 w-32 flex-col items-center justify-center rounded border-2 border-gray-300">
							{passportPreview ? (
								<img src={passportPreview} alt="Passport" className="h-full w-full rounded object-cover" />
              ) : (
                <>
									<div className="mb-2 px-2 text-center text-xs">AFFIX YOUR PASSPORT (UNIFORM)</div>
                  <label htmlFor="passport-upload" className="cursor-pointer">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </label>
                  <input
                    id="passport-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePassportUpload}
                  />
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
					<section className="space-y-4">
						<h3 className="border-b pb-2 text-lg font-semibold uppercase">Personal Details</h3>

            <div className="space-y-2">
							<Label htmlFor="applicantName">Name of Applicant</Label>
							<Input
								id="applicantName"
								value={formData.applicantName}
								onChange={onChangeField("applicantName")}
								required
								className="rounded-none border-x-0 border-t-0 border-b border-dotted"
							/>
            </div>

						<div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
								<Label htmlFor="rank">Rank</Label>
								<Input
									id="rank"
									value={formData.rank}
									onChange={onChangeField("rank")}
									required
									className="rounded-none border-x-0 border-t-0 border-b border-dotted"
								/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
								<Input
									id="pin"
									value={formData.pin}
									onChange={onChangeField("pin")}
									required
									className="rounded-none border-x-0 border-t-0 border-b border-dotted"
								/>
              </div>
              <div className="space-y-2">
								<Label htmlFor="ippis">IPPIS No</Label>
								<Input
									id="ippis"
									value={formData.ippis}
									onChange={onChangeField("ippis")}
									required
									className="rounded-none border-x-0 border-t-0 border-b border-dotted"
								/>
              </div>
            </div>

            <div className="space-y-2">
							<Label htmlFor="command">Command</Label>
							<Input
								id="command"
								value={formData.command}
								onChange={onChangeField("command")}
								required
								className="rounded-none border-x-0 border-t-0 border-b border-dotted"
							/>
            </div>

            <div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
								value={formData.phone}
								onChange={onChangeField("phone")}
                required
								className="rounded-none border-x-0 border-t-0 border-b border-dotted"
              />
            </div>
					</section>

					<section className="space-y-4">
						<h3 className="border-b pb-2 text-lg font-semibold uppercase">Affordability Test</h3>

            <div className="space-y-2">
							<Label htmlFor="netSalary">Net Salary (as at last pay slip) ₦</Label>
							<div className="flex flex-col gap-3 md:flex-row md:items-center">
								<div className="flex-1">
                <Input
										id="netSalary"
                  type="number"
										value={formData.netSalary}
										onChange={onChangeField("netSalary")}
										min="0"
                  required
                  placeholder="Enter net salary"
										className="rounded-none border-x-0 border-t-0 border-b border-dotted"
                />
								</div>
								<div className="flex items-center gap-2 text-sm">
									<label
										htmlFor="payslip-upload"
										className="flex cursor-pointer items-center gap-2 rounded border px-3 py-2"
									>
                    <FileText className="h-4 w-4" />
										{paySlipName ?? "Attach pay slip"}
									</label>
                  <input
                    id="payslip-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
										onChange={handlePaySlipUpload}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
							<Label>Are you currently on any loan or mortgage?</Label>
							<RadioGroup value={hasExistingLoan} onValueChange={(value) => setHasExistingLoan(value as "yes" | "no")}>
								<div className="flex flex-wrap gap-8">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="loan-yes" />
										<Label htmlFor="loan-yes" className="cursor-pointer font-normal">
											Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="loan-no" />
										<Label htmlFor="loan-no" className="cursor-pointer font-normal">
											No
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {hasExistingLoan === "yes" && (
							<div className="space-y-3 pl-2 md:pl-4">
								<Label>If yes, tick loan type:</Label>
                <div className="flex flex-wrap gap-6">
									{loanTypeOptions.map((option) => (
										<div key={option.key} className="flex items-center space-x-2">
                    <Checkbox
												id={`loan-${option.key}`}
												checked={loanTypes[option.key]}
												onCheckedChange={toggleLoanType(option.key)}
                    />
											<Label htmlFor={`loan-${option.key}`} className="cursor-pointer font-normal">
												{option.label}
                    </Label>
                  </div>
									))}
                </div>
              </div>
            )}
					</section>

					<section className="space-y-4">
						<h3 className="border-b pb-2 text-lg font-semibold uppercase">Next of Kin Details</h3>

            <div className="space-y-2">
							<Label htmlFor="nok-name">Name</Label>
							<Input
								id="nok-name"
								value={formData.nextOfKinName}
								onChange={onChangeField("nextOfKinName")}
								required
								className="rounded-none border-x-0 border-t-0 border-b border-dotted"
							/>
            </div>

            <div className="space-y-2">
							<Label htmlFor="nok-address">Address</Label>
							<Input
								id="nok-address"
								value={formData.nextOfKinAddress}
								onChange={onChangeField("nextOfKinAddress")}
								required
								className="rounded-none border-x-0 border-t-0 border-b border-dotted"
							/>
            </div>

						<div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
								<Label htmlFor="nok-phone">Phone Number</Label>
              <Input
                id="nok-phone"
                type="tel"
									value={formData.nextOfKinPhone}
									onChange={onChangeField("nextOfKinPhone")}
                required
									className="rounded-none border-x-0 border-t-0 border-b border-dotted"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="nok-relationship">Relationship</Label>
								<Input
									id="nok-relationship"
									value={formData.nextOfKinRelationship}
									onChange={onChangeField("nextOfKinRelationship")}
									className="rounded-none border-x-0 border-t-0 border-b border-dotted"
              />
            </div>
          </div>
					</section>

					<section className="space-y-4">
						<h3 className="border-b pb-2 text-lg font-semibold uppercase">
							Property Details (state the property you are interested in)
            </h3>

            <div className="space-y-2">
							<Label htmlFor="property-name">Property Name</Label>
              <Input
                id="property-name"
								value={formData.propertyName}
								readOnly
								className="cursor-not-allowed rounded-none border-x-0 border-t-0 border-b border-dotted bg-muted"
              />
            </div>

						<div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
								<Label htmlFor="property-description">Property Description</Label>
                <Input
                  id="property-description"
									value={formData.propertyDescription}
									readOnly
									className="cursor-not-allowed rounded-none border-x-0 border-t-0 border-b border-dotted bg-muted"
                />
              </div>
              <div className="space-y-2">
								<Label htmlFor="property-cost">Property Cost ₦</Label>
                <Input
                  id="property-cost"
									value={formData.propertyCost}
									readOnly
									className="cursor-not-allowed rounded-none border-x-0 border-t-0 border-b border-dotted bg-muted"
                />
              </div>
            </div>
					</section>

					<section className="space-y-4">
						<h3 className="border-b pb-2 text-lg font-semibold uppercase">
							Funding (select how you intend to fund your interest)
						</h3>

						<RadioGroup
							value={fundingOption}
							onValueChange={(value) => {
								const option = value as PropertyFundingOption
								setFundingOption(option)
								if (option === "mix" && mixFundingMethods.length === 0) {
									setMixFundingMethods(["equity_wallet", "loan"])
								}
							}}
							className="space-y-3"
						>
							<label className="flex items-center space-x-2 rounded-lg border p-3">
								<RadioGroupItem value="cash" id="fund-cash" />
								<span className="font-normal">100% Cash Payment</span>
							</label>
							<label className="flex items-center space-x-2 rounded-lg border p-3">
								<RadioGroupItem value="loan" id="fund-loan" />
								<span className="font-normal">100% Loan</span>
							</label>
							<label className="flex items-center space-x-2 rounded-lg border p-3">
								<RadioGroupItem value="mix" id="fund-mix" />
								<span className="font-normal">
									Mix Funding (Equity / Loan / Mortgage / Cooperative Deduction)
								</span>
							</label>
						</RadioGroup>

						<div className="rounded-md border border-dashed bg-muted/50 p-3 text-sm text-muted-foreground">
							Select a funding plan that matches how you intend to complete your purchase. Mix funding allows you to combine
							up to three payment options (for example: Equity + Mortgage, Mortgage + Cooperative, or Equity + Loan).
						</div>

						{fundingOption === "loan" && (
							<div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
								If you already have an approved loan with the cooperative, this property can be linked to your loan so that
								deductions reflect automatically in the property payment history.
							</div>
						)}

						{fundingOption === "mix" && (
							<div className="space-y-4">
								<div className="rounded-lg border border-dashed p-4">
									<p className="text-sm text-muted-foreground">
										Choose up to three payment options to combine. Your selections will guide the tenant admin in setting up
										the actual payment plan once your expression of interest is approved.
									</p>
									<div className="mt-4 grid gap-3 md:grid-cols-2">
										{MIX_FUNDING_OPTIONS.map((option) => {
											const checked = mixFundingMethods.includes(option.value)
											const disableSelection = !checked && mixSelectionCount >= MAX_MIX_METHODS

											return (
												<label
													key={option.value}
													className={`flex items-start gap-3 rounded-lg border p-3 ${
														disableSelection ? "opacity-60" : ""
													}`}
													htmlFor={`mix-${option.value}`}
												>
													<Checkbox
														id={`mix-${option.value}`}
														checked={checked}
														disabled={disableSelection}
														onCheckedChange={toggleMixMethod(option.value)}
													/>
													<span className="flex flex-col">
														<span className="font-medium capitalize">{option.label}</span>
														<span className="text-xs text-muted-foreground">{option.description}</span>
													</span>
												</label>
											)
										})}
									</div>
									<p className="mt-2 text-xs text-muted-foreground">
										Currently selected: {mixSelectionCount} / {MAX_MIX_METHODS}
									</p>
								</div>

								{mixFundingMethods.includes("equity_wallet") && (
									<div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
										Equity Wallet: the cooperative will allocate the required amount from your equity balance when setting up
										the repayment schedule.
									</div>
								)}

								{mixFundingMethods.includes("loan") && (
									<div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
										Loan: any approved loan you take through the cooperative can be tied to this property, and deductions will
										reflect in your payment history.
									</div>
								)}

								{mixFundingMethods.includes("cooperative") && (
									<div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
										Cooperative Deduction: the tenant admin will configure the internal deduction schedule for this property
										after your interest is approved.
									</div>
								)}

								{mortgageSelected && (
									<div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
										{mortgageTerms ? (
											<>
												<div className="grid gap-4 md:grid-cols-2">
													<div className="space-y-2">
														<Label className="text-xs uppercase text-muted-foreground">Mortgage Provider</Label>
														<div className="rounded border border-dotted bg-white px-3 py-2 text-sm">
															{mortgageTerms.provider?.name ?? "—"}
														</div>
													</div>
													<div className="space-y-2">
														<Label className="text-xs uppercase text-muted-foreground">Status</Label>
														<div className="rounded border border-dotted bg-white px-3 py-2 text-sm capitalize">
															{mortgageTerms.status}
														</div>
													</div>
												</div>
												<div className="grid gap-4 md:grid-cols-3">
													<div className="space-y-2">
														<Label className="text-xs uppercase text-muted-foreground">Loan Amount</Label>
														<div className="rounded border border-dotted bg-white px-3 py-2 text-sm font-medium">
															{formatCurrency(mortgageTerms.loan_amount)}
														</div>
													</div>
													<div className="space-y-2">
														<Label className="text-xs uppercase text-muted-foreground">Interest Rate</Label>
														<div className="rounded border border-dotted bg-white px-3 py-2 text-sm font-medium">
															{mortgageTerms.interest_rate}%
														</div>
													</div>
													<div className="space-y-2">
														<Label className="text-xs uppercase text-muted-foreground">Tenure (Years)</Label>
														<div className="rounded border border-dotted bg-white px-3 py-2 text-sm font-medium">
															{mortgageTerms.tenure_years}
														</div>
													</div>
												</div>

												{mortgageTenureRestriction && (
													<div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
														<AlertTriangle className="mt-0.5 h-4 w-4" />
														<span>
															Your remaining service years ({yearsLeft} year{yearsLeft !== 1 ? "s" : ""}) cannot support the
															configured mortgage tenure of {mortgageTerms.tenure_years} years. Please speak with your
															administrator for an adjusted mortgage option.
														</span>
													</div>
												)}

												<div className="rounded-md border border-primary/30 bg-white p-3 text-sm">
													<div className="font-semibold text-primary">Mortgage Summary</div>
													<ul className="mt-2 space-y-1 text-muted-foreground">
														<li>
															Monthly repayment:{" "}
															<span className="font-medium text-primary">
																{formatCurrency(mortgageMonthlyPayment ?? 0)}
															</span>
														</li>
														<li>Final loan terms will be confirmed by the cooperative during plan setup.</li>
													</ul>
												</div>

												{mortgageTerms.notes && (
													<div className="rounded-md border border-dashed border-primary/30 bg-white/70 p-3 text-sm text-muted-foreground">
														<strong className="text-primary">Admin Note:</strong> {mortgageTerms.notes}
													</div>
												)}
											</>
										) : (
											<div className="rounded-md border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
												Mortgage parameters will be provided once the cooperative sets up a mortgage plan for this property.
											</div>
										)}
									</div>
								)}
							</div>
						)}
					</section>

					<section className="space-y-4">
						<h3 className="border-b pb-2 text-lg font-semibold uppercase">Certification and Authorization</h3>

            <div className="space-y-4 text-sm">
              <p>
                I,
                <Input
                  type="text"
									value={formData.applicantName}
									onChange={onChangeField("applicantName")}
									className="mx-2 inline-block w-64 rounded-none border-x-0 border-t-0 border-b border-dotted"
                />
								hereby certify that the information provided above is correct. I also authorize the FRSC Housing Cooperative
								to commence deduction from my account to pay for the property of my choice.
              </p>

							<div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2">
									<Label>Signature</Label>
									<div className="rounded-md border border-dotted">
										<canvas ref={canvasRef} className="h-40 w-full" />
									</div>
									<Button type="button" variant="ghost" size="sm" onClick={clearSignature}>
										Clear Signature
									</Button>
                </div>
                <div className="space-y-2">
									<Label htmlFor="signature-date">Date</Label>
									<Input
										id="signature-date"
										type="date"
										value={formData.signatureDate}
										onChange={onChangeField("signatureDate")}
										required
										className="rounded-none border-x-0 border-t-0 border-b border-dotted"
									/>
                </div>
              </div>
            </div>
					</section>

					<div className="flex justify-end gap-4 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
						<Button type="submit" size="lg" disabled={submitting} className="cursor-pointer">
							{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{submitting ? "Submitting..." : "Submit Expression of Interest"}
            </Button>
          </div>

					<p className="text-center text-xs text-muted-foreground">
						Fill the Expression of Interest form to begin your property subscription.
					</p>
        </CardContent>
      </Card>
    </form>
  )
}
