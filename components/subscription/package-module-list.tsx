"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { sortedPackageModules, type PackageModuleItem } from "@/lib/subscription/package-modules"

interface PackageModuleListProps {
  modules?: PackageModuleItem[]
  heading?: string | null
  className?: string
}

export function PackageModuleList({ modules, heading = "Included modules", className }: PackageModuleListProps) {
  const items = sortedPackageModules(modules)
  if (items.length === 0) return null

  return (
    <div className={cn(className)}>
      {heading ? <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">{heading}</p> : null}
      <ul className="space-y-2">
        {items.map((module) => (
          <li key={module.id ?? module.slug} className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="text-sm">{module.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
