"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getAuthToken, meRequest } from "@/lib/api/client"
import { useRouter } from "next/navigation"

export function AuthGuard({ children, redirectTo = "/login" }: { children: React.ReactNode; redirectTo?: string }) {
	const router = useRouter()
	const [checking, setChecking] = useState(true)
	const [authorized, setAuthorized] = useState(false)

	useEffect(() => {
		let cancelled = false
		async function check() {
			try {
				const token = getAuthToken()
				if (!token) {
					router.replace(redirectTo)
					return
				}
				await meRequest()
				if (!cancelled) setAuthorized(true)
			} catch {
				router.replace(redirectTo)
			} finally {
				if (!cancelled) setChecking(false)
			}
		}
		check()
		return () => {
			cancelled = true
		}
	}, [router, redirectTo])

	if (checking) {
		return <div className="py-10 text-center text-muted-foreground">Checking authentication...</div>
	}

	if (!authorized) return null

	return <>{children}</>
}


