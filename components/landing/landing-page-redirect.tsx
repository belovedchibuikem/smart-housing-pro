"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/api/client"
import { getDashboardRoute } from "@/lib/auth/redirect-utils"

/**
 * Client-side component that redirects authenticated users away from landing page
 */
export function LandingPageRedirect() {
  const router = useRouter()

  useEffect(() => {
    const token = getAuthToken()
    
    if (token) {
      // User is authenticated, check localStorage for user data
      try {
        const userDataStr = localStorage.getItem('user_data')
        if (userDataStr) {
          const user = JSON.parse(userDataStr)
          const dashboardRoute = getDashboardRoute(user)
          
          console.log('Authenticated user detected on landing page, redirecting to:', dashboardRoute)
          
          // Redirect to appropriate dashboard
          router.replace(dashboardRoute)
        } else {
          // Has token but no user data, redirect to login
          router.replace('/login')
        }
      } catch (error) {
        console.error('Error checking user data:', error)
        // If error, clear token and redirect to login
        localStorage.removeItem('auth_token')
        router.replace('/login')
      }
    }
  }, [router])

  // This component doesn't render anything
  return null
}

