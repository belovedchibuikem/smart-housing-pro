"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
	const [email, setEmail] = useState("")
	const [token, setToken] = useState("")
	const [password, setPassword] = useState("")
	const [password_confirmation, setPasswordConfirmation] = useState("")
	const [message, setMessage] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setMessage(null)
		try {
			const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || ""
			const res = await fetch(`${base}/auth/reset-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, token, password, password_confirmation }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data?.message || "Failed to reset password")
			setMessage("Password reset successful. You can now log in.")
		} catch (e) {
			setMessage(e instanceof Error ? e.message : "Failed to reset password")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
			<form onSubmit={submit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="token">Token</Label>
					<Input id="token" value={token} onChange={(e) => setToken(e.target.value)} required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="password">New Password</Label>
					<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="password_confirmation">Confirm Password</Label>
					<Input id="password_confirmation" type="password" value={password_confirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
				</div>
				<Button type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</Button>
				{message && <p className="text-sm text-muted-foreground">{message}</p>}
			</form>
		</div>
	)
}


