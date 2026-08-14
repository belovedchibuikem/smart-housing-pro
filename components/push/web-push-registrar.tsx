"use client"

import { useEffect } from "react"
import { apiFetch } from "@/lib/api/client"
import { getApiBaseUrl } from "@/lib/api/config"
import { isPlatformSuperAdminSession } from "@/lib/auth/platform-host"

type FirebaseCompat = {
	apps: unknown[]
	initializeApp: (config: Record<string, string>) => unknown
	messaging: (app?: unknown) => {
		getToken: (opts: { vapidKey: string; serviceWorkerRegistration?: ServiceWorkerRegistration }) => Promise<string>
	}
}

declare global {
	interface Window {
		firebase?: FirebaseCompat
	}
}

const FIREBASE_APP_SRC = "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
const FIREBASE_MSG_SRC = "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"

function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (document.querySelector(`script[src="${src}"]`)) {
			resolve()
			return
		}
		const script = document.createElement("script")
		script.src = src
		script.async = true
		script.onload = () => resolve()
		script.onerror = () => reject(new Error(`Failed to load ${src}`))
		document.head.appendChild(script)
	})
}

async function registerToken(token: string, audience: "platform" | "tenant") {
	const path =
		audience === "platform" ? "/super-admin/notifications/push-token" : "/notifications/push-token"
	await apiFetch(path, {
		method: "POST",
		body: {
			token,
			platform: "web",
			device_name: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "web",
		},
	})
}

export function WebPushRegistrar() {
	useEffect(() => {
		let cancelled = false

		async function run() {
			if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
				return
			}

			try {
				const cfgRes = await apiFetch<{
					success?: boolean
					config?: Record<string, string | boolean>
					push_enabled?: boolean
				}>("/platform/notification-config")
				const config = cfgRes.config || {}
				const enabled = cfgRes.push_enabled !== false && String(config.notifications_push_enabled ?? "true") !== "false"
				if (!enabled) return

				const apiKey = String(config.firebase_api_key || "")
				const projectId = String(config.firebase_project_id || "")
				const appId = String(config.firebase_app_id || "")
				const vapid = String(config.firebase_vapid_key || "")
				const senderId = String(config.firebase_messaging_sender_id || "")
				if (!apiKey || !projectId || !appId || !vapid) return

				if (Notification.permission === "default") {
					await Notification.requestPermission()
				}
				if (Notification.permission !== "granted" || cancelled) return

				await loadScript(FIREBASE_APP_SRC)
				await loadScript(FIREBASE_MSG_SRC)
				if (cancelled || !window.firebase) return

				const firebaseConfig = {
					apiKey,
					authDomain: String(config.firebase_auth_domain || `${projectId}.firebaseapp.com`),
					projectId,
					storageBucket: String(config.firebase_storage_bucket || `${projectId}.appspot.com`),
					messagingSenderId: senderId,
					appId,
					measurementId: String(config.firebase_measurement_id || ""),
				}

				if (!window.firebase.apps.length) {
					window.firebase.initializeApp(firebaseConfig)
				}

				const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
				await navigator.serviceWorker.ready
				registration.active?.postMessage({
					type: "FIREBASE_CONFIG",
					config: firebaseConfig,
					apiBase: getApiBaseUrl(),
				})

				const messaging = window.firebase.messaging()
				const token = await messaging.getToken({
					vapidKey: vapid,
					serviceWorkerRegistration: registration,
				})
				if (!token || cancelled) return

				const audience = isPlatformSuperAdminSession() ? "platform" : "tenant"
				await registerToken(token, audience)
			} catch (error) {
				console.warn("Web push registration skipped", error)
			}
		}

		void run()
		return () => {
			cancelled = true
		}
	}, [])

	return null
}
