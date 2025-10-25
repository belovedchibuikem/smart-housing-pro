"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginRequest, setAuthToken } from "@/lib/api/client"
import { getDashboardRoute } from "@/lib/auth/redirect-utils"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await loginRequest({
        email: formData.email,
        password: formData.password,
      })

      // store token
      setAuthToken(result.token)

      // Use user data from login response (no need to call /api/auth/me)
      const user = result.user

      // Store user data in localStorage for super-admin role checking
      if (user.role === 'super-admin' || (user.roles && user.roles.includes('super-admin'))) {
        localStorage.setItem('user_data', JSON.stringify(user))
      }

      // Role-based redirection using utility function
      const dashboardRoute = getDashboardRoute(user)
      router.push(dashboardRoute)
    } catch (err) {
      // basic error feedback
      const message = err instanceof Error ? err.message : "Login failed"
      alert(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={formData.rememberMe}
          onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
        />
        <label
          htmlFor="remember"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Remember me
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
