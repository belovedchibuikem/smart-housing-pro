"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Loader2, UserPlus, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  deleteStatutoryChargeDefinition,
  getStatutoryChargeDefinitions,
  assignStatutoryChargeDefinition,
  applyStatutoryChargeDefinition,
  apiFetch,
} from "@/lib/api/client"
import { Can } from "@/components/admin/can-permission"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { normalizeAdminMembersList } from "@/lib/api/normalize-admin-members"

interface DefinitionRow {
  id: string
  name: string
  type: string
  charge_category: string
  calculation_type: string
  amount?: number | null
  percentage?: number | null
  percentage_base?: string | null
  property_id?: string | null
  property_type?: string | null
  property?: { id: string; title?: string } | null
  is_active: boolean
}

type MemberOption = {
  id: string
  label: string
  searchText: string
}

const MAX_ASSIGN = 100

function categoryLabel(category: string) {
  switch (category) {
    case "estate_wide":
      return "Estate-Wide"
    case "member_based":
      return "Member"
    case "event_based":
      return "Event"
    default:
      return category
  }
}

function calcLabel(row: DefinitionRow) {
  if (row.calculation_type === "percentage") {
    return `${row.percentage ?? 0}% of ${row.percentage_base?.replace(/_/g, " ") || "base"}`
  }
  const amount = Math.round((Number(row.amount) || 0) * 100) / 100
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

function memberLabel(m: Record<string, unknown>): MemberOption {
  const user = (m.user as Record<string, unknown> | undefined) || undefined
  const first = String(user?.first_name ?? m.first_name ?? "")
  const last = String(user?.last_name ?? m.last_name ?? "")
  const name = `${first} ${last}`.trim() || String(user?.email ?? m.email ?? "Member")
  const memberNumber = String(m.member_number ?? "")
  const staffId = String(m.staff_id ?? m.ippis_number ?? m.frsc_pin ?? "")
  const email = String(user?.email ?? m.email ?? "")
  return {
    id: String(m.id),
    label: memberNumber ? `${name} (${memberNumber})` : name,
    searchText: [name, memberNumber, staffId, email, String(m.id)].filter(Boolean).join(" "),
  }
}

export default function StatutoryChargeDefinitionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [rows, setRows] = useState<DefinitionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; id: string | null; name: string }>({
    open: false,
    id: null,
    name: "",
  })
  const [applyDialog, setApplyDialog] = useState<{ open: boolean; id: string | null; name: string }>({
    open: false,
    id: null,
    name: "",
  })
  const [memberSearch, setMemberSearch] = useState("")
  const [memberResults, setMemberResults] = useState<MemberOption[]>([])
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [searchingMembers, setSearchingMembers] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    fetchRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, activeFilter])

  const searchMembersRemote = useCallback(async (term: string) => {
    setSearchingMembers(true)
    try {
      const qs = new URLSearchParams({ per_page: "50" })
      if (term.trim()) qs.set("search", term.trim())
      const res = await apiFetch(`/admin/members?${qs.toString()}`)
      const list = normalizeAdminMembersList(res).map(memberLabel)
      setMemberResults(list)
    } catch {
      setMemberResults([])
    } finally {
      setSearchingMembers(false)
    }
  }, [])

  useEffect(() => {
    if (!assignDialog.open) return
    const t = setTimeout(() => {
      void searchMembersRemote(memberSearch)
    }, 300)
    return () => clearTimeout(t)
  }, [assignDialog.open, memberSearch, searchMembersRemote])

  const selectedSet = useMemo(() => new Set(selectedMemberIds), [selectedMemberIds])

  const fetchRows = async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number> = { per_page: 100 }
      if (searchQuery) params.search = searchQuery
      if (categoryFilter !== "all") params.charge_category = categoryFilter
      if (activeFilter !== "all") params.is_active = activeFilter
      const response = await getStatutoryChargeDefinitions(params)
      if (response.success) {
        setRows(response.data || [])
      }
    } catch {
      toast({ title: "Error", description: "Failed to load charge definitions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.id) return
    try {
      const response = await deleteStatutoryChargeDefinition(deleteDialog.id)
      if (response.success) {
        toast({ title: "Success", description: response.message || "Definition deleted" })
        setDeleteDialog({ open: false, id: null })
        fetchRows()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete definition",
        variant: "destructive",
      })
    }
  }

  const openAssign = (row: DefinitionRow) => {
    setSelectedMemberIds([])
    setMemberSearch("")
    setMemberResults([])
    setAssignDialog({ open: true, id: row.id, name: row.name })
  }

  const toggleMember = (id: string, checked: boolean) => {
    setSelectedMemberIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev
        if (prev.length >= MAX_ASSIGN) {
          toast({
            title: "Limit reached",
            description: `You can assign at most ${MAX_ASSIGN} members at once.`,
            variant: "destructive",
          })
          return prev
        }
        return [...prev, id]
      }
      return prev.filter((x) => x !== id)
    })
  }

  const handleAssign = async () => {
    if (!assignDialog.id || selectedMemberIds.length === 0) {
      toast({ title: "Validation", description: "Select at least one member", variant: "destructive" })
      return
    }
    setAssigning(true)
    try {
      const response = await assignStatutoryChargeDefinition(assignDialog.id, {
        member_ids: selectedMemberIds,
      })
      if (response.success) {
        const created = response.data?.created_count ?? 0
        const skipped = response.data?.skipped?.length ?? 0
        const failed = response.data?.failed?.length ?? 0
        toast({
          title: "Assignment complete",
          description: response.message || `Created ${created}, skipped ${skipped}, failed ${failed}`,
        })
        setAssignDialog({ open: false, id: null, name: "" })
        setSelectedMemberIds([])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to assign charge",
        variant: "destructive",
      })
    } finally {
      setAssigning(false)
    }
  }

  const handleApplyExisting = async (event?: { preventDefault: () => void }) => {
    event?.preventDefault()
    const definitionId = applyDialog.id
    if (!definitionId) {
      toast({
        title: "Error",
        description: "No charge definition selected.",
        variant: "destructive",
      })
      return
    }
    setApplying(true)
    try {
      const response = await applyStatutoryChargeDefinition(definitionId)
      const created = response.data?.created_count ?? 0
      const skipped = response.data?.skipped ?? 0
      const failed = response.data?.failed?.length ?? 0
      const scanned = (response.data as { scanned?: number } | undefined)?.scanned

      toast({
        title: created > 0 ? "Charges created" : "Apply finished",
        description:
          response.message ||
          `Created ${created}, skipped ${skipped}, failed ${failed}` +
            (typeof scanned === "number" ? ` (scanned ${scanned})` : ""),
        variant: created > 0 || skipped > 0 ? "default" : "destructive",
      })
      setApplyDialog({ open: false, id: null, name: "" })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to apply definition",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">Charge Definitions</h1>
            <p className="text-muted-foreground mt-1">
              Templates that create member ledger charges (in addition to house/land cost)
            </p>
          </div>
          <Can permission="create_statutory_charges">
            <Link href="/admin/statutory-charges/definitions/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Definition
              </Button>
            </Link>
          </Can>
        </div>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">How categories work</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Estate-Wide:</strong> when a member gets a matching house allocation or
              land subscription, the system auto-creates an approved statutory charge for them. Scope with a specific
              property, a property type (or <em>land</em>), or leave blank for any. Creating a definition does{" "}
              <em>not</em> backfill existing holders — use <strong>Apply to existing</strong> for that.
            </p>
            <p>
              <strong className="text-foreground">Member-Based:</strong> assign manually (up to {MAX_ASSIGN} at once).
              Search by name, member ID, staff ID, IPPIS, etc.
            </p>
            <p>
              <strong className="text-foreground">Event-Based:</strong> assigned when the configured event fires (e.g.
              reallocation). You can also mass-assign for testing.
            </p>
            <p>
              Members see assigned charges under Statutory Charges / property details. Record payments from{" "}
              <Link href="/admin/statutory-charges/payments/new" className="underline text-foreground">
                Record Payment
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Definitions</CardTitle>
                <CardDescription>Estate-wide auto-assign, member-based mass assign, and event rules</CardDescription>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search definitions..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="estate_wide">Estate-Wide</SelectItem>
                    <SelectItem value="member_based">Member</SelectItem>
                    <SelectItem value="event_based">Event</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No charge definitions found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{categoryLabel(row.charge_category)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{calcLabel(row)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.property?.title || row.property_type || "Any"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.is_active ? "default" : "secondary"}>
                          {row.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {row.charge_category === "estate_wide" && row.is_active && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Apply to existing house/land holders"
                              onClick={() => setApplyDialog({ open: true, id: row.id, name: row.name })}
                            >
                              <Building2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Mass assign to members"
                            onClick={() => openAssign(row)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/statutory-charges/definitions/${row.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog({ open: true, id: row.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete definition?</AlertDialogTitle>
            <AlertDialogDescription>
              Inactive definitions are preferred when ledger rows already exist. Delete only unused templates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={applyDialog.open}
        onOpenChange={(open) => {
          if (applying) return
          setApplyDialog({
            open,
            id: open ? applyDialog.id : null,
            name: open ? applyDialog.name : "",
          })
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply to existing holders?</AlertDialogTitle>
            <AlertDialogDescription>
              Create ledger charges for current house/land holders that match{" "}
              <strong>{applyDialog.name || "this definition"}</strong>. Members who already have this charge are skipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={applying}>Cancel</AlertDialogCancel>
            <Button onClick={(e) => void handleApplyExisting(e)} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Applying…
                </>
              ) : (
                "Apply now"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={assignDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setAssignDialog({ open: false, id: null, name: "" })
            setSelectedMemberIds([])
            setMemberSearch("")
          } else {
            setAssignDialog((prev) => ({ ...prev, open: true }))
          }
        }}
      >
        <AlertDialogContent className="max-h-[90vh] w-full max-w-[calc(100%-2rem)] overflow-hidden sm:max-w-2xl flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>Mass assign members</AlertDialogTitle>
            <AlertDialogDescription>
              Assign <strong>{assignDialog.name || "this charge"}</strong> to up to {MAX_ASSIGN} members. Search by name,
              member ID, staff ID, IPPIS, or email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2 min-h-0 flex-1 overflow-hidden flex flex-col">
            <div className="space-y-2">
              <Label>Search members</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Type at least 1 character to search all members…"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedMemberIds.length} selected (max {MAX_ASSIGN})
              </p>
            </div>
            <div className="rounded-md border max-h-[40vh] overflow-y-auto">
              {searchingMembers ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching…
                </div>
              ) : memberResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {memberSearch.trim() ? "No members match that search." : "Start typing to find members."}
                </div>
              ) : (
                <ul className="divide-y">
                  {memberResults.map((m) => {
                    const checked = selectedSet.has(m.id)
                    return (
                      <li key={m.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/40">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => toggleMember(m.id, Boolean(v))}
                          id={`m-${m.id}`}
                        />
                        <label htmlFor={`m-${m.id}`} className="flex-1 cursor-pointer text-sm">
                          <div className="font-medium">{m.label}</div>
                          <div className="text-xs text-muted-foreground truncate">{m.searchText}</div>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssign} disabled={assigning || selectedMemberIds.length === 0}>
              {assigning ? "Assigning…" : `Assign (${selectedMemberIds.length})`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
