"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

export type MailPerson = {
  id: string
  name: string
  email?: string | null
  ippis_number?: string | null
  audience?: string
}

const GROUPS = [
  { value: "admins", label: "All admins" },
  { value: "managers", label: "All managers" },
  { value: "all", label: "All members" },
  { value: "active", label: "Active members only" },
  { value: "specific", label: "Specific people" },
]

export function RecipientPicker({
  audience,
  onAudienceChange,
  selected,
  onSelectedChange,
  loadPeople,
}: {
  audience: string
  onAudienceChange: (value: string) => void
  selected: MailPerson[]
  onSelectedChange: (people: MailPerson[]) => void
  loadPeople: (search: string, audience?: string) => Promise<MailPerson[]>
}) {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [people, setPeople] = useState<MailPerson[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const searchAudience = audience === "specific"
    ? (roleFilter === "all" ? undefined : roleFilter)
    : audience === "all"
      ? "members"
      : audience

  const activeChip = audience === "admins" || audience === "managers"
    ? audience
    : audience === "all" || audience === "active"
      ? "members"
      : roleFilter

  useEffect(() => {
    if (search.trim().length < 1) {
      setPeople([])
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const rows = await loadPeople(search.trim(), searchAudience)
        setPeople(rows)
        setOpen(true)
      } catch {
        setPeople([])
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [search, searchAudience, loadPeople])

  const addPerson = (person: MailPerson) => {
    if (!selected.some((item) => item.id === person.id)) {
      onSelectedChange([...selected, person])
    }
    if (audience !== "specific") onAudienceChange("specific")
    setSearch("")
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <Label>Recipients</Label>
      <Select value={audience} onValueChange={onAudienceChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GROUPS.map((group) => (
            <SelectItem key={group.value} value={group.value}>
              {group.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Search by name, IPPIS, or email in any category, then select one or more people.
      </p>

      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "Anyone"],
            ["admins", "Admins"],
            ["managers", "Managers"],
            ["members", "Members"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs ${activeChip === value ? "bg-emerald-800 text-white border-emerald-800" : "bg-background"}`}
              onClick={() => {
                setRoleFilter(value)
                onAudienceChange("specific")
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Input
            placeholder="Search name, IPPIS, or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => {
              if (people.length > 0) setOpen(true)
            }}
          />
          {open && search.trim().length >= 1 && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-popover shadow-lg">
              {loading ? (
                <div className="p-3 text-sm text-muted-foreground">Searching...</div>
              ) : people.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">No one matches that name, IPPIS, or email.</div>
              ) : (
                people.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    className="flex w-full items-start justify-between gap-3 border-b px-3 py-2 text-left last:border-b-0 hover:bg-accent"
                    onClick={() => addPerson(person)}
                  >
                    <span>
                      <span className="block text-sm font-medium">{person.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {[person.ippis_number ? `IPPIS ${person.ippis_number}` : null, person.email].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    {person.audience ? (
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{person.audience}</span>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((person) => (
              <Badge key={person.id} variant="secondary" className="gap-1">
                {person.name}
                {person.ippis_number ? <span className="text-[10px] opacity-70">{person.ippis_number}</span> : null}
                <button type="button" onClick={() => onSelectedChange(selected.filter((item) => item.id !== person.id))} aria-label={`Remove ${person.name}`}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function recipientSendLabel(audience: string, count: number) {
  if (audience === "admins") return "all admins"
  if (audience === "managers") return "all managers"
  if (audience === "all") return "all members"
  if (audience === "active") return "active members"
  return count === 1 ? "1 person" : `${count} people`
}
