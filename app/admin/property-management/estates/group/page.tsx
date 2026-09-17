"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Can } from "@/components/admin/can-permission"
import {
  getEstateHousePicker,
  getPropertyEstate,
  groupHousesIntoEstate,
} from "@/lib/api/client"

type HouseRow = {
  id: string
  title: string
  location?: string | null
  city?: string | null
  state?: string | null
  status?: string | null
  estate_id?: string | null
  estate_name?: string | null
}

export default function GroupHousesIntoEstatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const existingEstateId = searchParams.get("estateId") || ""
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [existingName, setExistingName] = useState("")
  const [search, setSearch] = useState("")
  const [unassignedOnly, setUnassignedOnly] = useState(!existingEstateId)
  const [houses, setHouses] = useState<HouseRow[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!existingEstateId) return
    getPropertyEstate(existingEstateId)
      .then((res) => {
        const estate = res.data?.estate || res.data
        if (estate?.name) {
          setExistingName(estate.name)
          setName(estate.name)
          setCity(estate.city || "")
          setState(estate.state || "")
        }
      })
      .catch(() => {
        toast({ title: "Could not load estate", variant: "destructive" })
      })
  }, [existingEstateId, toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadHouses()
    }, search ? 300 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, unassignedOnly])

  const loadHouses = async () => {
    try {
      setLoading(true)
      const res = await getEstateHousePicker({
        search: search.trim() || undefined,
        unassigned_only: unassignedOnly,
        per_page: 300,
      })
      if (res.success) setHouses(res.data || [])
    } catch {
      toast({ title: "Failed to load houses", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected],
  )

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = { ...selected }
    houses.forEach((house) => {
      next[house.id] = checked
    })
    setSelected(next)
  }

  const handleSave = async () => {
    if (!existingEstateId && !name.trim()) {
      toast({ title: "Enter an estate name", variant: "destructive" })
      return
    }
    if (selectedIds.length === 0) {
      toast({ title: "Select at least one house", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const res = await groupHousesIntoEstate({
        estate_id: existingEstateId || undefined,
        name: name.trim(),
        location: name.trim(),
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        property_ids: selectedIds,
      })
      toast({ title: "Houses grouped", description: res.message })
      router.push("/admin/property-management/estates")
    } catch (error: any) {
      toast({
        title: "Could not group houses",
        description: error?.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/property-management/estates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {existingEstateId ? `Add houses to ${existingName || "estate"}` : "Group houses into an estate"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Tick the houses that belong together. You can add more houses to this estate later.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Estate name</CardTitle>
          <CardDescription>This is what you will see on Manage Estates and on the repayment download.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="estate-name">Estate name</Label>
            <Input
              id="estate-name"
              placeholder="e.g. FRSC Estate, Idu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={Boolean(existingEstateId)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City (optional)</Label>
            <Input id="city" placeholder="Abuja" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State (optional)</Label>
            <Input id="state" placeholder="FCT" value={state} onChange={(e) => setState(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Select houses</CardTitle>
          <CardDescription>Search and tick every house that should sit under this estate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by house name or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <Checkbox checked={unassignedOnly} onCheckedChange={(v) => setUnassignedOnly(Boolean(v))} />
              Show ungrouped houses only
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading houses…
            </div>
          ) : houses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No houses match this search.</div>
          ) : (
            <div className="max-h-[480px] overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr>
                    <th className="w-10 p-3 text-left">
                      <Checkbox
                        checked={houses.length > 0 && houses.every((h) => selected[h.id])}
                        onCheckedChange={(v) => toggleAll(Boolean(v))}
                      />
                    </th>
                    <th className="p-3 text-left font-medium">House</th>
                    <th className="p-3 text-left font-medium">Current location</th>
                    <th className="p-3 text-left font-medium">Currently in</th>
                  </tr>
                </thead>
                <tbody>
                  {houses.map((house) => (
                    <tr key={house.id} className="border-t">
                      <td className="p-3">
                        <Checkbox
                          checked={Boolean(selected[house.id])}
                          onCheckedChange={(v) =>
                            setSelected((prev) => ({ ...prev, [house.id]: Boolean(v) }))
                          }
                        />
                      </td>
                      <td className="p-3 font-medium">{house.title || "Untitled house"}</td>
                      <td className="p-3 text-muted-foreground">
                        {[house.location, house.city, house.state].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="p-3 text-muted-foreground">{house.estate_name || "Ungrouped"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">{selectedIds.length} house(s) selected</p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/property-management/estates">Cancel</Link>
              </Button>
              <Can permission="manage_property_estates|edit_properties">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {existingEstateId ? "Add to estate" : "Create estate and group houses"}
                </Button>
              </Can>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
