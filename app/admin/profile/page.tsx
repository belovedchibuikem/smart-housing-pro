"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ProfilePhotoUpload } from "@/components/profile/profile-photo-upload"
import { fetchUserProfile, updateUserProfile, uploadProfileAvatar } from "@/lib/api/user-profile"
import { changePassword } from "@/lib/api/client"
import { persistAuthSession } from "@/lib/auth/auth-cookies"
import type { User } from "@/lib/types/user"

export default function AdminProfilePage() {
	const { toast } = useToast()
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [changingPassword, setChangingPassword] = useState(false)
	const [form, setForm] = useState({
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
	})
	const [passwordForm, setPasswordForm] = useState({
		current_password: "",
		new_password: "",
		new_password_confirmation: "",
	})

	const persistUser = (next: User) => {
		setUser(next)
		try {
			const token = localStorage.getItem("auth_token")
			const raw = localStorage.getItem("user_data")
			const prev = raw ? JSON.parse(raw) : {}
			const merged = { ...prev, ...next }
			localStorage.setItem("user_data", JSON.stringify(merged))
			if (token) persistAuthSession(merged, token)
			window.dispatchEvent(new Event("sh-auth-updated"))
		} catch {
			/* ignore */
		}
	}

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetchUserProfile()
			setUser(res.user)
			setForm({
				first_name: res.user.first_name || "",
				last_name: res.user.last_name || "",
				email: res.user.email || "",
				phone: res.user.phone || "",
			})
		} catch (e: any) {
			toast({
				title: "Failed to load profile",
				description: e?.message,
				variant: "destructive",
			})
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void load()
	}, [load])

	const saveProfile = async () => {
		if (!form.first_name.trim() || !form.last_name.trim()) {
			toast({ title: "First and last name are required", variant: "destructive" })
			return
		}
		setSaving(true)
		try {
			const res = await updateUserProfile({
				first_name: form.first_name.trim(),
				last_name: form.last_name.trim(),
				phone: form.phone.trim(),
			})
			persistUser(res.user)
			toast({ title: "Profile updated" })
		} catch (e: any) {
			toast({ title: "Update failed", description: e?.message, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const onUpload = async (file: File) => {
		const res = await uploadProfileAvatar(file)
		persistUser(res.user)
	}

	const savePassword = async () => {
		if (passwordForm.new_password.length < 8) {
			toast({ title: "New password must be at least 8 characters", variant: "destructive" })
			return
		}
		if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
			toast({ title: "New passwords do not match", variant: "destructive" })
			return
		}
		setChangingPassword(true)
		try {
			await changePassword({
				current_password: passwordForm.current_password,
				new_password: passwordForm.new_password,
				new_password_confirmation: passwordForm.new_password_confirmation,
			})
			setPasswordForm({ current_password: "", new_password: "", new_password_confirmation: "" })
			if (user) {
				persistUser({ ...user, must_change_password: false })
			}
			toast({
				title: "Password updated",
				description: "Your temporary or previous password has been replaced.",
			})
		} catch (e: any) {
			toast({ title: "Password change failed", description: e?.message, variant: "destructive" })
		} finally {
			setChangingPassword(false)
		}
	}

	if (loading) {
		return (
			<div className="flex justify-center py-16">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		)
	}

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">My profile</h1>
				<p className="text-sm text-muted-foreground">
					Update your photo, contact details, and password (including a temporary login password).
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Photo and details</CardTitle>
					<CardDescription>This photo appears in the admin header and on notices you send.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<ProfilePhotoUpload
						avatarUrl={user?.avatar_url}
						firstName={form.first_name}
						lastName={form.last_name}
						onUpload={onUpload}
					/>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1">
							<Label htmlFor="first_name">First name</Label>
							<Input
								id="first_name"
								value={form.first_name}
								onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="last_name">Last name</Label>
							<Input
								id="last_name"
								value={form.last_name}
								onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
							/>
						</div>
						<div className="space-y-1">
							<Label htmlFor="email">Email</Label>
							<Input id="email" value={form.email} disabled />
						</div>
						<div className="space-y-1">
							<Label htmlFor="phone">Phone</Label>
							<Input
								id="phone"
								value={form.phone}
								onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
							/>
						</div>
					</div>
					<Button onClick={() => void saveProfile()} disabled={saving}>
						{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
						Save profile
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Change password</CardTitle>
					<CardDescription>
						Enter your current password (or the temporary password you were given), then choose a new one.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 sm:grid-cols-1">
					{user?.must_change_password ? (
						<p className="text-sm text-amber-700">
							You are still using a temporary password. Change it here to finish account setup.
						</p>
					) : null}
					<div className="space-y-1">
						<Label htmlFor="current_password">Current password</Label>
						<Input
							id="current_password"
							type="password"
							autoComplete="current-password"
							value={passwordForm.current_password}
							onChange={(e) => setPasswordForm((f) => ({ ...f, current_password: e.target.value }))}
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="new_password">New password</Label>
						<Input
							id="new_password"
							type="password"
							autoComplete="new-password"
							value={passwordForm.new_password}
							onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor="new_password_confirmation">Confirm new password</Label>
						<Input
							id="new_password_confirmation"
							type="password"
							autoComplete="new-password"
							value={passwordForm.new_password_confirmation}
							onChange={(e) =>
								setPasswordForm((f) => ({ ...f, new_password_confirmation: e.target.value }))
							}
						/>
					</div>
					<Button onClick={() => void savePassword()} disabled={changingPassword}>
						{changingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
						Update password
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
