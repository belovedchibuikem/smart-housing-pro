"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { apiFetch } from "@/lib/api/client"

interface ModuleItem {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  is_active: boolean
}

interface ModulePickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

const CATEGORY_ORDER = [
  { key: "core", label: "Core", slugs: ["members", "wallet", "documents", "settings", "notifications", "activity_logs"] },
  { key: "finance", label: "Finance", slugs: ["contributions", "equity", "loans", "refunds", "investments", "mortgages", "statutory"] },
  { key: "property", label: "Property", slugs: ["properties", "property_management"] },
  { key: "communication", label: "Communication", slugs: ["mail", "reports"] },
  { key: "admin", label: "Admin Tools", slugs: ["admin_users", "roles_permissions", "payment_manager", "landing_page"] },
  { key: "branding", label: "Branding & Advanced", slugs: ["white_label", "blockchain", "ai", "withdraw_membership"] },
]

function categorizeModules(modules: ModuleItem[]) {
  const assigned = new Set<string>()
  const groups: Array<{ label: string; items: ModuleItem[] }> = []

  for (const category of CATEGORY_ORDER) {
    const items = modules.filter((m) => category.slugs.includes(m.slug))
    if (items.length > 0) {
      groups.push({ label: category.label, items })
      items.forEach((m) => assigned.add(m.id))
    }
  }

  const uncategorized = modules.filter((m) => !assigned.has(m.id))
  if (uncategorized.length > 0) {
    groups.push({ label: "Other", items: uncategorized })
  }

  return groups
}

export function ModulePicker({ selectedIds, onChange }: ModulePickerProps) {
  const [modules, setModules] = useState<ModuleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch<{ modules: ModuleItem[] }>("/super-admin/modules")
        setModules((res.modules || []).filter((m) => m.is_active))
      } catch {
        setModules([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  if (loading) {
    return (
      <Card className="p-6 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  const groups = categorizeModules(modules)

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-2">Included Modules</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Select which platform modules tenants on this package can access. Tenants unlock more modules only by upgrading to a higher plan.
      </p>
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{group.label}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {group.items.map((module) => (
                <div
                  key={module.id}
                  className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/40 transition-colors"
                >
                  <Checkbox
                    id={`module-${module.id}`}
                    checked={selectedIds.includes(module.id)}
                    onCheckedChange={() => toggle(module.id)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={`module-${module.id}`} className="cursor-pointer font-medium">
                      {module.name}
                    </Label>
                    {module.description ? (
                      <p className="text-xs text-muted-foreground">{module.description}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground font-mono">{module.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
