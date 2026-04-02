"use client"

import type React from "react"
import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { MemberService, type Member } from "@/lib/api/member-service"
import { toast as sonnerToast } from "sonner"

function emptyForm() {
	return {
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
		staff_id: "",
		ippis_number: "",
		frsc_pin: "",
		date_of_birth: "",
		gender: "",
		marital_status: "",
		nationality: "",
		state_of_origin: "",
		lga: "",
		residential_address: "",
		city: "",
		state: "",
		rank: "",
		department: "",
		command_state: "",
		employment_date: "",
		years_of_service: "",
		membership_type: "",
	}
}

function memberToForm(m: Member) {
	const u = m.user
	return {
		first_name: m.first_name ?? u?.first_name ?? "",
		last_name: m.last_name ?? u?.last_name ?? "",
		email: m.email ?? u?.email ?? "",
		phone: m.phone ?? u?.phone ?? "",
		staff_id: m.staff_id ?? "",
		ippis_number: m.ippis_number ?? "",
		frsc_pin: m.frsc_pin ?? "",
		date_of_birth: m.date_of_birth ? String(m.date_of_birth).slice(0, 10) : "",
		gender: m.gender ?? "",
		marital_status: m.marital_status ?? "",
		nationality: m.nationality ?? "",
		state_of_origin: m.state_of_origin ?? "",
		lga: m.lga ?? "",
		residential_address: m.residential_address ?? "",
		city: m.city ?? "",
		state: m.state ?? "",
		rank: m.rank ?? "",
		department: m.department ?? "",
		command_state: m.command_state ?? "",
		employment_date: m.employment_date ? String(m.employment_date).slice(0, 10) : "",
		years_of_service: m.years_of_service != null ? String(m.years_of_service) : "",
		membership_type: m.membership_type ?? "",
	}
}

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState(emptyForm)
	const [memberNumber, setMemberNumber] = useState("")

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				setLoading(true)
				const { member } = await MemberService.getMember(id)
				if (!cancelled && member) {
					setForm(memberToForm(member))
					setMemberNumber(member.member_number ?? "")
				}
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Error"
				if (!cancelled) {
					sonnerToast.error("Failed to load member", { description: msg })
					router.push("/admin/members")
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [id, router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			setSaving(true)
			const body: Record<string, string | number | null | undefined> = {
				first_name: form.first_name || undefined,
				last_name: form.last_name || undefined,
				email: form.email || undefined,
				phone: form.phone || null,
				staff_id: form.staff_id || null,
				ippis_number: form.ippis_number || null,
				frsc_pin: form.frsc_pin || null,
				date_of_birth: form.date_of_birth || null,
				gender: form.gender || null,
				marital_status: form.marital_status || null,
				nationality: form.nationality || null,
				state_of_origin: form.state_of_origin || null,
				lga: form.lga || null,
				residential_address: form.residential_address || null,
				city: form.city || null,
				state: form.state || null,
				rank: form.rank || null,
				department: form.department || null,
				command_state: form.command_state || null,
				employment_date: form.employment_date || null,
				membership_type: form.membership_type || null,
			}
			if (form.years_of_service !== "") {
				const y = parseInt(form.years_of_service, 10)
				if (Number.isFinite(y)) body.years_of_service = y
			}
			const res = await MemberService.updateMember(id, body)
			if (res.success) {
				sonnerToast.success(res.message || "Member updated")
				router.push(`/admin/members/${id}`)
			}
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Error"
			sonnerToast.error("Update failed", { description: msg })
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return (
			<div className="max-w-3xl mx-auto flex justify-center py-16">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		)
	}

	const field = (key: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
		<div className="space-y-2">
			<Label htmlFor={key}>{label}</Label>
			<Input
				id={key}
				value={form[key]}
				onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
				{...props}
			/>
		</div>
	)

	return (
		<div className="max-w-3xl mx-auto space-y-6 pb-12">
			<div>
				<Button variant="ghost" size="sm" asChild>
					<Link href={`/admin/members/${id}`}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Link>
				</Button>
				<h1 className="text-3xl font-bold mt-2">Edit member</h1>
			</div>
			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Member ID</CardTitle>
						<CardDescription>Cooperative housing member identifier (assigned by the system)</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Label>Member ID</Label>
							<Input value={memberNumber} readOnly className="font-mono bg-muted/50" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Contact</CardTitle>
						<CardDescription>User profile fields</CardDescription>
					</CardHeader>
					<CardContent className="grid sm:grid-cols-2 gap-4">
						{field("first_name", "First name", { required: true })}
						{field("last_name", "Last name", { required: true })}
						{field("email", "Email", { type: "email", required: true })}
						{field("phone", "Phone")}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Employment</CardTitle>
					</CardHeader>
					<CardContent className="grid sm:grid-cols-2 gap-4">
						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor="ippis_number">IPPIS number</Label>
							<Input
								id="ippis_number"
								value={form.ippis_number}
								onChange={(e) => setForm((f) => ({ ...f, ippis_number: e.target.value }))}
								placeholder="Civil servants (federal/state)"
							/>
							<p className="text-xs text-muted-foreground">For all civil servants using IPPIS.</p>
						</div>
						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor="frsc_pin">FRSC PIN</Label>
							<Input
								id="frsc_pin"
								value={form.frsc_pin}
								onChange={(e) => setForm((f) => ({ ...f, frsc_pin: e.target.value }))}
								placeholder="FRSC staff only"
							/>
							<p className="text-xs text-muted-foreground">Strictly for FRSC personnel.</p>
						</div>
						{field("staff_id", "Legacy reference ID (optional)")}
						<div className="space-y-2">
							<Label>Gender</Label>
							<Select
								value={form.gender || "unset"}
								onValueChange={(v) => setForm((f) => ({ ...f, gender: v === "unset" ? "" : v }))}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="unset">—</SelectItem>
									<SelectItem value="male">Male</SelectItem>
									<SelectItem value="female">Female</SelectItem>
									<SelectItem value="other">Other</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Marital status</Label>
							<Select
								value={form.marital_status || "unset"}
								onValueChange={(v) => setForm((f) => ({ ...f, marital_status: v === "unset" ? "" : v }))}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="unset">—</SelectItem>
									<SelectItem value="single">Single</SelectItem>
									<SelectItem value="married">Married</SelectItem>
									<SelectItem value="divorced">Divorced</SelectItem>
									<SelectItem value="widowed">Widowed</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{field("date_of_birth", "Date of birth", { type: "date" })}
						{field("employment_date", "Employment date", { type: "date" })}
						{field("years_of_service", "Years of service", { type: "number", min: 0 })}
						{field("rank", "Rank")}
						{field("department", "Department")}
						{field("command_state", "Command / state")}
						{field("membership_type", "Membership type")}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Location</CardTitle>
					</CardHeader>
					<CardContent className="grid sm:grid-cols-2 gap-4">
						{field("nationality", "Nationality")}
						{field("state_of_origin", "State of origin")}
						{field("lga", "LGA")}
						{field("city", "City")}
						{field("state", "State")}
						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor="residential_address">Residential address</Label>
							<Textarea
								id="residential_address"
								rows={3}
								value={form.residential_address}
								onChange={(e) => setForm((f) => ({ ...f, residential_address: e.target.value }))}
							/>
						</div>
					</CardContent>
				</Card>
				<div className="flex gap-3">
					<Button type="button" variant="outline" asChild>
						<Link href={`/admin/members/${id}`}>Cancel</Link>
					</Button>
					<Button type="submit" disabled={saving}>
						{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
						Save
					</Button>
				</div>
			</form>
		</div>
	)
}
