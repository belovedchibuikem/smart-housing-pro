/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js")

let messagingReady = false

function initFirebase(config) {
	if (!config || !config.apiKey || messagingReady) return
	try {
		if (!firebase.apps.length) {
			firebase.initializeApp(config)
		}
		const messaging = firebase.messaging()
		messaging.onBackgroundMessage((payload) => {
			const title = payload?.notification?.title || payload?.data?.title || "Smart Housing"
			const body = payload?.notification?.body || payload?.data?.body || ""
			self.registration.showNotification(title, {
				body,
				data: payload?.data || {},
			})
		})
		messagingReady = true
	} catch (e) {
		console.warn("firebase-messaging-sw init failed", e)
	}
}

self.addEventListener("message", (event) => {
	if (event?.data?.type === "FIREBASE_CONFIG" && event.data.config) {
		initFirebase(event.data.config)
	}
})

self.addEventListener("notificationclick", (event) => {
	event.notification.close()
	const href = event.notification?.data?.href || "/"
	event.waitUntil(
		self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
			for (const client of clients) {
				if ("focus" in client) {
					client.navigate(href)
					return client.focus()
				}
			}
			if (self.clients.openWindow) {
				return self.clients.openWindow(href)
			}
		})
	)
})
