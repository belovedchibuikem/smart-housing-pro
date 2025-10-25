"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("")
	const [message, setMessage] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setMessage(null)
		try {
			const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || ""
			const res = await fetch(`${base}/auth/forgot-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data?.message || "Failed to send reset link")
			setMessage("Reset link sent. Check your email.")
		} catch (e) {
			setMessage(e instanceof Error ? e.message : "Failed to send reset link")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>
			<form onSubmit={submit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
				</div>
				<Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
				{message && <p className="text-sm text-muted-foreground">{message}</p>}
			</form>
		</div>
	)
}


