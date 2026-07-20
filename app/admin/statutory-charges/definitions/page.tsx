"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  deleteStatutoryChargeDefinition,
  getStatutoryChargeDefinitions,
  assignStatutoryChargeDefinition,
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
import { SearchableSelect, membersToSearchableOptions } from "@/components/ui/searchable-select"
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
  return `₦${Number(row.amount || 0).toLocaleString()}`
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
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; id: string | null; memberId: string }>({
    open: false,
    id: null,
    memberId: "",
  })
  const [members, setMembers] = useState<any[]>([])
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter, activeFilter])

  useEffect(() => {
    apiFetch("/admin/members?per_page=100")
      .then((res) => setMembers(normalizeAdminMembersList(res)))
      .catch(() => undefined)
  }, [])

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

  const handleAssign = async () => {
    if (!assignDialog.id || !assignDialog.memberId) {
      toast({ title: "Validation", description: "Select a member to assign", variant: "destructive" })
      return
    }
    setAssigning(true)
    try {
      const response = await assignStatutoryChargeDefinition(assignDialog.id, {
        member_id: assignDialog.memberId,
      })
      if (response.success) {
        toast({ title: "Success", description: response.message || "Charge assigned" })
        setAssignDialog({ open: false, id: null, memberId: "" })
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

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Charge Definitions</h1>
            <p className="text-muted-foreground mt-1">
              Templates that drive fixed or percentage statutory charges by category
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Definitions</CardTitle>
                <CardDescription>Estate-wide auto-assign, member-based, and event-based rules</CardDescription>
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
                          {(row.charge_category === "member_based" || row.charge_category === "event_based") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Assign to member"
                              onClick={() => setAssignDialog({ open: true, id: row.id, memberId: "" })}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
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
        open={assignDialog.open}
        onOpenChange={(open) => setAssignDialog({ open, id: open ? assignDialog.id : null, memberId: open ? assignDialog.memberId : "" })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign to member</AlertDialogTitle>
            <AlertDialogDescription>Create a ledger charge for the selected member from this definition.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label>Member</Label>
            <SearchableSelect
              options={membersToSearchableOptions(members)}
              value={assignDialog.memberId}
              onValueChange={(value) => setAssignDialog((prev) => ({ ...prev, memberId: value }))}
              placeholder="Select member..."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssign} disabled={assigning}>
              {assigning ? "Assigning..." : "Assign"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
