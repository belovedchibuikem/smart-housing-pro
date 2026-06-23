"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getAuthToken, setAuthToken } from "@/lib/api/client"
import { useRouter } from "next/navigation"
import { hasTenantStaffDashboardAccess } from "@/lib/auth/staff-access"
import { persistAuthSessionFromStorage } from "@/lib/auth/auth-cookies"
import { getEffectiveRoleNames } from "@/lib/auth/user-roles"
import { getDashboardRoute } from "@/lib/auth/redirect-utils"

interface AuthGuardProps {
	children: React.ReactNode
	redirectTo?: string
	requiredRole?: string | string[]
	/** When true, allows any tenant staff user (access_admin_panel or staff Spatie role), not only legacy Admin role */
	requireStaffDashboardAccess?: boolean
	/** When true, only non-staff users may access (member portal). Staff are sent to /admin. */
	requireMemberDashboard?: boolean
}

export function AuthGuard({ 
	children, 
	redirectTo = "/login",
	requiredRole,
	requireStaffDashboardAccess,
	requireMemberDashboard,
}: AuthGuardProps) {
	const router = useRouter()
	const [checking, setChecking] = useState(true)
	const [authorized, setAuthorized] = useState(false)

	useEffect(() => {
		let cancelled = false
		function check() {
			try {
				const token = getAuthToken()
				const userDataStr = localStorage.getItem("user_data")
				
				// Check if both token and user data exist
				if (!token || !userDataStr) {
					// Clear any stale data
					setAuthToken(null)
					localStorage.removeItem("user_data")
					if (!cancelled) router.replace(redirectTo)
					return
				}

				// Parse user data
				let userData
				try {
					userData = JSON.parse(userDataStr)
				} catch {
					// Invalid user data, clear and redirect
					setAuthToken(null)
					localStorage.removeItem("user_data")
					if (!cancelled) router.replace(redirectTo)
					return
				}

				// Tenant staff dashboard (permission-based; not limited to Admin / Super Admin roles)
				if (requireStaffDashboardAccess) {
					if (!hasTenantStaffDashboardAccess(userData)) {
						if (!cancelled) router.replace(getDashboardRoute(userData))
						return
					}
				}

				// Member portal — staff belong on /admin, not /dashboard
				if (requireMemberDashboard) {
					if (hasTenantStaffDashboardAccess(userData)) {
						if (!cancelled) router.replace("/admin")
						return
					}
				}

				// Check role if required (legacy / specific screens)
				if (requiredRole) {
					const userRoles = getEffectiveRoleNames(userData)
					const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
					
					// Normalize roles for comparison (handle both hyphen and underscore)
					const normalizeRole = (role: string) => role?.toLowerCase().replace(/_/g, '-') || role
					const normalizedUserRoles = userRoles.map(normalizeRole)
					const normalizedRequiredRoles = roles.map(normalizeRole)
					
					// Check if user has any of the required roles
					const hasRequiredRole = normalizedUserRoles.some(role => 
						normalizedRequiredRoles.includes(role)
					)
					
					if (!hasRequiredRole) {
						const fallbackRoute = getDashboardRoute(userData)
						if (!cancelled) router.replace(fallbackRoute)
						return
					}
				}

				// Both token and user data exist, and role matches (if required)
				if (!cancelled) {
					persistAuthSessionFromStorage()
					setAuthorized(true)
				}
			} catch (error) {
				// Any error, clear everything and redirect
				console.error("Auth validation failed:", error)
				setAuthToken(null)
				localStorage.removeItem("user_data")
				if (!cancelled) router.replace(redirectTo)
			} finally {
				if (!cancelled) setChecking(false)
			}
		}
		check()
		return () => {
			cancelled = true
		}
	}, [router, redirectTo, requiredRole, requireStaffDashboardAccess, requireMemberDashboard])

	if (checking) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Checking authentication...</p>
				</div>
			</div>
		)
	}

	if (!authorized) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Redirecting…</p>
				</div>
			</div>
		)
	}

	return <>{children}</>
}


