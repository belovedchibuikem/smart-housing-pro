"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
	getUserSettings,
	updateUserSettings,
	changePassword,
	toggleTwoFactor,
	getUserProfile,
	type UserSettings,
} from "@/lib/api/client"
import { toast } from "sonner"
import { Loader2, AlertCircle, CheckCircle2, Shield, Bell, Globe, Lock } from "lucide-react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [error, setError] = useState<string | null>(null)

	// Password change form
	const [passwordData, setPasswordData] = useState({
		current_password: "",
		new_password: "",
		new_password_confirmation: "",
	})
	const [changingPassword, setChangingPassword] = useState(false)

	// Notification settings state
	const [notificationSettings, setNotificationSettings] = useState({
		email_notifications: true,
		sms_notifications: false,
		payment_reminders: true,
		loan_updates: true,
		investment_updates: true,
		property_updates: true,
		contribution_updates: true,
	})

	// Account settings state
	const [accountSettings, setAccountSettings] = useState({
		language: "en",
		timezone: "Africa/Lagos",
		two_factor_enabled: false,
	})

	const fetchSettings = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)
			const response = await getUserSettings()
			if (response.success && response.settings) {
				setSettings(response.settings)
				setNotificationSettings({
					email_notifications: response.settings.email_notifications,
					sms_notifications: response.settings.sms_notifications,
					payment_reminders: response.settings.payment_reminders,
					loan_updates: response.settings.loan_updates,
					investment_updates: response.settings.investment_updates,
					property_updates: response.settings.property_updates,
					contribution_updates: response.settings.contribution_updates,
				})
				setAccountSettings({
					language: response.settings.language,
					timezone: response.settings.timezone,
					two_factor_enabled: response.settings.two_factor_enabled,
				})
			}
		} catch (err: any) {
			const errorMessage = err?.message || "Failed to load settings"
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchSettings()
	}, [fetchSettings])

	const handleNotificationChange = async (key: keyof typeof notificationSettings, value: boolean) => {
		const updated = { ...notificationSettings, [key]: value }
		setNotificationSettings(updated)

		try {
			setSaving(true)
			const response = await updateUserSettings({ [key]: value })
			if (response.success) {
				setSettings(response.settings)
				toast.success("Notification settings updated")
			}
		} catch (err: any) {
			setNotificationSettings({ ...notificationSettings }) // Revert on error
			toast.error(err?.message || "Failed to update notification settings")
		} finally {
			setSaving(false)
		}
	}

	const handleAccountSettingChange = async (key: string, value: string | boolean) => {
		const updated = { ...accountSettings, [key]: value }
		setAccountSettings(updated)

		try {
			setSaving(true)
			if (key === "two_factor_enabled") {
				const response = await toggleTwoFactor(value as boolean)
				if (response.success) {
					setSettings((prev) =>
						prev
							? {
									...prev,
									two_factor_enabled: response.two_factor_enabled,
									two_factor_secret: response.two_factor_secret,
									two_factor_recovery_codes: response.recovery_codes,
								}
							: null
					)
					toast.success(response.message)
				}
			} else {
				const response = await updateUserSettings({ [key]: value })
				if (response.success) {
					setSettings(response.settings)
					toast.success("Account settings updated")
				}
			}
		} catch (err: any) {
			setAccountSettings({ ...accountSettings }) // Revert on error
			toast.error(err?.message || "Failed to update account settings")
		} finally {
			setSaving(false)
		}
	}

	const handlePasswordChange = async () => {
		if (passwordData.new_password !== passwordData.new_password_confirmation) {
			toast.error("New passwords do not match")
			return
		}

		if (passwordData.new_password.length < 8) {
			toast.error("Password must be at least 8 characters")
			return
		}

		try {
			setChangingPassword(true)
			const response = await changePassword({
				current_password: passwordData.current_password,
				new_password: passwordData.new_password,
				new_password_confirmation: passwordData.new_password_confirmation,
			})

			if (response.success) {
				toast.success(response.message || "Password changed successfully")
				setPasswordData({
					current_password: "",
					new_password: "",
					new_password_confirmation: "",
				})
			}
		} catch (err: any) {
			const errorMessage = err?.message || "Failed to change password"
			toast.error(errorMessage)
		} finally {
			setChangingPassword(false)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
					<p className="text-muted-foreground">Loading settings...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Settings</h1>
				<p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Notification Settings */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Bell className="h-5 w-5" />
						<CardTitle>Notifications</CardTitle>
					</div>
					<CardDescription>Configure how you receive notifications</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Email Notifications</Label>
							<p className="text-sm text-muted-foreground">Receive notifications via email</p>
						</div>
						<Switch
							checked={notificationSettings.email_notifications}
							onCheckedChange={(checked) => handleNotificationChange("email_notifications", checked)}
							disabled={saving}
						/>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>SMS Notifications</Label>
							<p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
						</div>
						<Switch
							checked={notificationSettings.sms_notifications}
							onCheckedChange={(checked) => handleNotificationChange("sms_notifications", checked)}
							disabled={saving}
						/>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Payment Reminders</Label>
							<p className="text-sm text-muted-foreground">Get reminders for upcoming payments</p>
						</div>
						<Switch
							checked={notificationSettings.payment_reminders}
							onCheckedChange={(checked) => handleNotificationChange("payment_reminders", checked)}
							disabled={saving}
						/>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Loan Updates</Label>
							<p className="text-sm text-muted-foreground">Notifications about loan applications and repayments</p>
						</div>
						<Switch
							checked={notificationSettings.loan_updates}
							onCheckedChange={(checked) => handleNotificationChange("loan_updates", checked)}
							disabled={saving}
						/>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Investment Updates</Label>
							<p className="text-sm text-muted-foreground">Notifications about investment activities</p>
						</div>
						<Switch
							checked={notificationSettings.investment_updates}
							onCheckedChange={(checked) => handleNotificationChange("investment_updates", checked)}
							disabled={saving}
						/>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Property Updates</Label>
							<p className="text-sm text-muted-foreground">Notifications about property-related activities</p>
						</div>
						<Switch
							checked={notificationSettings.property_updates}
							onCheckedChange={(checked) => handleNotificationChange("property_updates", checked)}
							disabled={saving}
						/>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Contribution Updates</Label>
							<p className="text-sm text-muted-foreground">Notifications about contribution activities</p>
						</div>
						<Switch
							checked={notificationSettings.contribution_updates}
							onCheckedChange={(checked) => handleNotificationChange("contribution_updates", checked)}
							disabled={saving}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Security Settings */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Lock className="h-5 w-5" />
						<CardTitle>Security</CardTitle>
					</div>
					<CardDescription>Manage your password and security preferences</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="current-password">Current Password</Label>
						<Input
							id="current-password"
							type="password"
							value={passwordData.current_password}
							onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
							disabled={changingPassword}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="new-password">New Password</Label>
						<Input
							id="new-password"
							type="password"
							value={passwordData.new_password}
							onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
							disabled={changingPassword}
							placeholder="Minimum 8 characters"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirm-password">Confirm New Password</Label>
						<Input
							id="confirm-password"
							type="password"
							value={passwordData.new_password_confirmation}
							onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
							disabled={changingPassword}
						/>
					</div>
					<Button onClick={handlePasswordChange} disabled={changingPassword}>
						{changingPassword ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Updating...
							</>
						) : (
							"Update Password"
						)}
					</Button>
				</CardContent>
			</Card>

			{/* Account Settings */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Globe className="h-5 w-5" />
						<CardTitle>Account</CardTitle>
					</div>
					<CardDescription>Manage your account information and preferences</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Two-Factor Authentication</Label>
							<p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
							{accountSettings.two_factor_enabled && (
								<Badge className="mt-1 bg-green-500">
									<CheckCircle2 className="mr-1 h-3 w-3" />
									Enabled
								</Badge>
							)}
						</div>
						<Switch
							checked={accountSettings.two_factor_enabled}
							onCheckedChange={(checked) => handleAccountSettingChange("two_factor_enabled", checked)}
							disabled={saving}
						/>
					</div>
					<Separator />
					<div className="space-y-2">
						<Label>Language</Label>
						<Select
							value={accountSettings.language}
							onValueChange={(value) => handleAccountSettingChange("language", value)}
							disabled={saving}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="ha">Hausa</SelectItem>
								<SelectItem value="yo">Yoruba</SelectItem>
								<SelectItem value="ig">Igbo</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Separator />
					<div className="space-y-2">
						<Label>Time Zone</Label>
						<Select
							value={accountSettings.timezone}
							onValueChange={(value) => handleAccountSettingChange("timezone", value)}
							disabled={saving}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Africa/Lagos">West Africa Time (WAT)</SelectItem>
								<SelectItem value="UTC">UTC</SelectItem>
								<SelectItem value="Africa/Abidjan">Abidjan</SelectItem>
								<SelectItem value="Africa/Accra">Accra</SelectItem>
								<SelectItem value="Africa/Addis_Ababa">Addis Ababa</SelectItem>
								<SelectItem value="Africa/Algiers">Algiers</SelectItem>
								<SelectItem value="Africa/Cairo">Cairo</SelectItem>
								<SelectItem value="Africa/Casablanca">Casablanca</SelectItem>
								<SelectItem value="Africa/Johannesburg">Johannesburg</SelectItem>
								<SelectItem value="Africa/Nairobi">Nairobi</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Danger Zone */}
			<Card className="border-red-200">
				<CardHeader>
					<CardTitle className="text-red-600">Danger Zone</CardTitle>
					<CardDescription>Irreversible account actions</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Deactivate Account</p>
							<p className="text-sm text-muted-foreground">Temporarily disable your account</p>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
									Deactivate
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Deactivate Account?</AlertDialogTitle>
									<AlertDialogDescription>
										This will temporarily disable your account. You can reactivate it later by contacting support.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction className="bg-red-600 hover:bg-red-700">Deactivate</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Delete Account</p>
							<p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">Delete Account</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete Account</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
