"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiFetch } from "@/lib/api/client"
import { useRoles } from "@/lib/hooks/use-roles"
import { Loader2, Search, UserPlus } from "lucide-react"

type MemberPick = {
  id: string
  member_number?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
}

export default function AdminUserCreatePage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const { roles } = useRoles()
  const [promoteRoles, setPromoteRoles] = useState<string[]>([])
  const [manualRoles, setManualRoles] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [promoteError, setPromoteError] = useState<string | null>(null)
  const [manualError, setManualError] = useState<string | null>(null)

  const [memberQuery, setMemberQuery] = useState("")
  const [memberSearching, setMemberSearching] = useState(false)
  const [memberHits, setMemberHits] = useState<MemberPick[]>([])
  const [selectedMember, setSelectedMember] = useState<MemberPick | null>(null)
  const [promotePassword, setPromotePassword] = useState("")

  const searchMembers = useCallback(async (q: string) => {
    const term = q.trim()
    if (term.length < 2) {
      setMemberHits([])
      return
    }
    setMemberSearching(true)
    try {
      const res = await apiFetch<{
        success?: boolean
        members?: MemberPick[]
      }>(`/admin/members?search=${encodeURIComponent(term)}&per_page=15`)
      setMemberHits(res.members ?? [])
    } catch {
      setMemberHits([])
    } finally {
      setMemberSearching(false)
    }
  }, [])

  useEffect(() => {
    if (selectedMember) return
    const t = window.setTimeout(() => {
      searchMembers(memberQuery)
    }, 350)
    return () => window.clearTimeout(t)
  }, [memberQuery, searchMembers, selectedMember])

  const sortedRoles = [...roles].sort((a, b) => {
    const rank = (n: string) =>
      n === "super_admin" ? 0 : n === "admin" ? 1 : 2
    return rank(a.name) - rank(b.name)
  })

  const addPromoteRole = (value: string) => {
    if (value && !promoteRoles.includes(value)) {
      setPromoteRoles([...promoteRoles, value])
    }
  }

  const addManualRole = (value: string) => {
    if (value && !manualRoles.includes(value)) {
      setManualRoles([...manualRoles, value])
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setManualError(null)
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          password,
          roles: manualRoles,
          status: "active",
        },
      })
      router.push("/admin/users")
    } catch (err) {
      setManualError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) {
      setPromoteError("Select a member first.")
      return
    }
    setSubmitting(true)
    setPromoteError(null)
    try {
      await apiFetch("/admin/users/promote-from-member", {
        method: "POST",
        body: {
          member_id: selectedMember.id,
          roles: promoteRoles,
          ...(promotePassword.trim().length >= 8 ? { password: promotePassword } : {}),
          status: "active",
        },
      })
      router.push("/admin/users")
    } catch (err) {
      setPromoteError(err instanceof Error ? err.message : "Failed to promote member")
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = (m: MemberPick) => {
    const n = [m.first_name, m.last_name].filter(Boolean).join(" ").trim()
    return n || m.email || m.member_number || "Member"
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add admin user</CardTitle>
          <CardDescription>
            Promote an existing member in one step, or create a standalone admin account manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="from-member" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="from-member" className="gap-2">
                <UserPlus className="h-4 w-4" />
                From member
              </TabsTrigger>
              <TabsTrigger value="manual">Create manually</TabsTrigger>
            </TabsList>

            <TabsContent value="from-member">
              <form onSubmit={handlePromoteSubmit} className="space-y-4">
                {promoteError && <p className="text-red-500 text-sm">{promoteError}</p>}

                <div className="space-y-2">
                  <Label htmlFor="memberSearch">Find member</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="memberSearch"
                      className="pl-9"
                      placeholder="Type name, email, or member number…"
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Search the members directory. Select someone to grant admin access using their existing login.
                  </p>
                  {memberSearching && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching…
                    </div>
                  )}
                  {!memberSearching && memberQuery.trim().length >= 2 && memberHits.length === 0 && (
                    <p className="text-sm text-muted-foreground">No members match that search.</p>
                  )}
                  {memberHits.length > 0 && !selectedMember && (
                    <ul className="border rounded-md divide-y max-h-48 overflow-auto bg-muted/30">
                      {memberHits.map((m) => (
                        <li key={m.id}>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onClick={() => {
                              setSelectedMember(m)
                              setMemberHits([])
                              setMemberQuery(displayName(m))
                            }}
                          >
                            <span className="font-medium">{displayName(m)}</span>
                            {m.member_number && (
                              <span className="text-muted-foreground"> · {m.member_number}</span>
                            )}
                            {m.email && (
                              <span className="block text-xs text-muted-foreground">{m.email}</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedMember && (
                  <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{displayName(selectedMember)}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMember(null)
                          setMemberQuery("")
                        }}
                      >
                        Change
                      </Button>
                    </div>
                    {selectedMember.email && (
                      <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                    )}
                    {selectedMember.phone && (
                      <p className="text-sm text-muted-foreground">{selectedMember.phone}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Roles</Label>
                    <Select value="" onValueChange={addPromoteRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select roles (Admin or Super Admin required)" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedRoles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Include <strong>Admin</strong> or <strong>Super Admin</strong> so they can open this dashboard.
                      Selected roles replace their current roles—add <strong>Member</strong> too if they should keep member-portal access.
                    </p>
                    {promoteRoles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {promoteRoles.map((r) => (
                          <Badge key={r} variant="secondary" className="flex items-center gap-1">
                            {r.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            <button
                              type="button"
                              onClick={() => setPromoteRoles(promoteRoles.filter((x) => x !== r))}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="promotePassword">New password (optional)</Label>
                    <Input
                      id="promotePassword"
                      type="password"
                      autoComplete="new-password"
                      value={promotePassword}
                      onChange={(e) => setPromotePassword(e.target.value)}
                      placeholder="Leave blank to keep their current password"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only fill this if you want to set a new password for admin login.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={submitting || !selectedMember || promoteRoles.length === 0}>
                    {submitting ? "Saving…" : "Grant admin access"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => router.push("/admin/users")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="manual">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                {manualError && <p className="text-red-500 text-sm">{manualError}</p>}

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
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <Label>Roles</Label>
                    <Select value="" onValueChange={addManualRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select roles" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedRoles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {manualRoles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {manualRoles.map((r) => (
                          <Badge key={r} variant="secondary" className="flex items-center gap-1">
                            {r.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            <button
                              type="button"
                              onClick={() => setManualRoles(manualRoles.filter((x) => x !== r))}
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
                    {submitting ? "Creating…" : "Create user"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => router.push("/admin/users")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
