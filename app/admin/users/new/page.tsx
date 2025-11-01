"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { apiFetch } from "@/lib/api/client"
import { useRoles } from "@/lib/hooks/use-roles"

export default function AdminUserCreatePage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const { roles } = useRoles()
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          password,
          roles: selectedRoles,
          status: "active",
        },
      })
      router.push("/admin/users")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div>
                <Label>Roles</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !selectedRoles.includes(value)) {
                      setSelectedRoles([...selectedRoles, value])
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select roles" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRoles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRoles.map((r) => (
                      <Badge key={r} variant="secondary" className="flex items-center gap-1">
                        {r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        <button
                          type="button"
                          onClick={() => setSelectedRoles(selectedRoles.filter(x => x !== r))}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create User"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/admin/users")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


