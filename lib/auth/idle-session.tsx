"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { handleLogout } from "@/lib/auth/auth-utils"
import { getAuthToken, meRequest } from "@/lib/api/client"
import {
	getLastActivityAt,
	getSessionTimeoutMinutes,
	IDLE_WARNING_SECONDS,
	touchSessionActivity,
} from "@/lib/auth/session-timeout"

const HEARTBEAT_MIN_INTERVAL_MS = 2 * 60 * 1000

/**
 * Tracks user activity and signs out after session_timeout idle minutes.
 * Shows a 60s warning dialog before logout.
 */
export function IdleSessionGuard() {
	const [warningOpen, setWarningOpen] = useState(false)
	const [secondsLeft, setSecondsLeft] = useState(IDLE_WARNING_SECONDS)
	const warningOpenRef = useRef(false)
	const loggingOutRef = useRef(false)
	const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const lastHeartbeatRef = useRef(0)

	const clearCountdown = useCallback(() => {
		if (countdownRef.current) {
			clearInterval(countdownRef.current)
			countdownRef.current = null
		}
	}, [])

	const staySignedIn = useCallback(() => {
		clearCountdown()
		warningOpenRef.current = false
		setWarningOpen(false)
		setSecondsLeft(IDLE_WARNING_SECONDS)
		touchSessionActivity()
	}, [clearCountdown])

	const forceLogout = useCallback(async () => {
		if (loggingOutRef.current) return
		loggingOutRef.current = true
		clearCountdown()
		warningOpenRef.current = false
		setWarningOpen(false)
		try {
			await handleLogout()
		} catch {
			window.location.href = "/login?reason=session"
		}
	}, [clearCountdown])

	const openWarning = useCallback(() => {
		if (warningOpenRef.current || loggingOutRef.current) return
		warningOpenRef.current = true
		setWarningOpen(true)
		setSecondsLeft(IDLE_WARNING_SECONDS)
		clearCountdown()
		countdownRef.current = setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					void forceLogout()
					return 0
				}
				return prev - 1
			})
		}, 1000)
	}, [clearCountdown, forceLogout])

	useEffect(() => {
		if (typeof window === "undefined") return
		if (!getAuthToken()) return

		touchSessionActivity(getLastActivityAt())

		const onActivity = () => {
			if (loggingOutRef.current) return
			if (warningOpenRef.current) return
			touchSessionActivity()

			// Keep server last_used_at aligned while the user is active in the UI
			// (even if they are not firing other API calls).
			const now = Date.now()
			if (now - lastHeartbeatRef.current >= HEARTBEAT_MIN_INTERVAL_MS) {
				lastHeartbeatRef.current = now
				const path = window.location.pathname || ""
				if (!path.startsWith("/super-admin")) {
					void meRequest().catch(() => {
						// 401 handler clears the session
					})
				}
			}
		}

		const events: Array<keyof WindowEventMap> = [
			"pointerdown",
			"keydown",
			"scroll",
			"touchstart",
			"mousemove",
		]

		events.forEach((event) => {
			window.addEventListener(event, onActivity, { passive: true })
		})

		const onVisibility = () => {
			if (document.visibilityState === "visible") {
				onActivity()
			}
		}
		document.addEventListener("visibilitychange", onVisibility)

		const onCustomActivity = () => {
			if (warningOpenRef.current || loggingOutRef.current) return
			// API success already wrote sessionStorage; just keep warning closed.
		}
		window.addEventListener("sh-session-activity", onCustomActivity)

		const tick = () => {
			if (!getAuthToken() || loggingOutRef.current) return

			const idleMs = getSessionTimeoutMinutes() * 60 * 1000
			const elapsed = Date.now() - getLastActivityAt()
			const remainingMs = idleMs - elapsed

			if (remainingMs <= 0) {
				void forceLogout()
				return
			}

			if (remainingMs <= IDLE_WARNING_SECONDS * 1000) {
				openWarning()
			}
		}

		const interval = setInterval(tick, 1000)
		tick()

		return () => {
			clearInterval(interval)
			clearCountdown()
			events.forEach((event) => {
				window.removeEventListener(event, onActivity)
			})
			document.removeEventListener("visibilitychange", onVisibility)
			window.removeEventListener("sh-session-activity", onCustomActivity)
		}
	}, [clearCountdown, forceLogout, openWarning])

	return (
		<Dialog
			open={warningOpen}
			onOpenChange={(open) => {
				if (!open) {
					staySignedIn()
				}
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Still there?</DialogTitle>
					<DialogDescription>
						You’ll be signed out due to inactivity in{" "}
						<span className="font-semibold text-foreground">{secondsLeft}</span>{" "}
						seconds.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button variant="outline" onClick={() => void forceLogout()}>
						Sign out
					</Button>
					<Button onClick={staySignedIn}>Stay signed in</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
