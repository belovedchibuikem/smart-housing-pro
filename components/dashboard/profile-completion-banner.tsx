"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchUserProfile } from "@/lib/api/user-profile"
import { isMemberProfileComplete } from "@/lib/profile/profile-completion"

const DISMISS_KEY = "member_profile_completion_banner_dismissed"

/**
 * Soft reminder for incomplete member profiles. Never blocks dashboard access.
 */
export function ProfileCompletionBanner() {
	const pathname = usePathname()
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		if (pathname === "/dashboard/complete-profile") {
			setVisible(false)
			return
		}

		let cancelled = false
		const run = async () => {
			try {
				if (typeof window !== "undefined" && window.sessionStorage.getItem(DISMISS_KEY) === "1") {
					if (!cancelled) setVisible(false)
					return
				}
				const response = await fetchUserProfile()
				const complete = isMemberProfileComplete(response.user, response.user.member ?? null)
				if (!cancelled) setVisible(!complete)
			} catch {
				if (!cancelled) setVisible(false)
			}
		}
		void run()
		return () => {
			cancelled = true
		}
	}, [pathname])

	if (!visible) return null

	return (
		<div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
			<div className="min-w-0 space-y-0.5">
				<p className="text-sm font-medium">Finish your profile when you can</p>
				<p className="text-xs text-amber-900/80 dark:text-amber-100/80">
					You can use your account now. Complete your details later from Profile.
				</p>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<Button asChild size="sm" variant="default">
					<Link href="/dashboard/complete-profile">Complete profile</Link>
				</Button>
				<Button
					size="icon"
					variant="ghost"
					className="h-8 w-8 text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/40"
					aria-label="Dismiss profile reminder"
					onClick={() => {
						try {
							window.sessionStorage.setItem(DISMISS_KEY, "1")
						} catch {
							/* ignore */
						}
						setVisible(false)
					}}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
