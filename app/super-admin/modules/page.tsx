"use client"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  Wallet,
  TrendingUp,
  Building2,
  PieChart,
  Home,
  Mail,
  BarChart,
  FileText,
  Receipt,
  Check,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface Module {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  is_active: boolean
  packages_count: number
  created_at: string
  updated_at: string
}

export default function ModulesPage() {
  const { isLoading, data, error, loadData } = usePageLoading<{ modules: Module[] }>()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ modules: Module[] }>("/super-admin/modules")
      return response
    })
  }, [loadData])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const modules = data?.modules || []

  const handleToggleModule = async (moduleId: string, isActive: boolean) => {
    try {
      await apiFetch(`/super-admin/modules/${moduleId}/toggle`, {
        method: 'POST',
        body: { is_active: !isActive }
      })
      // Reload modules
      loadData(async () => {
        const response = await apiFetch<{ modules: Module[] }>("/super-admin/modules")
        return response
      })
    } catch (error) {
      console.error('Failed to toggle module:', error)
    }
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Users,
      Wallet,
      TrendingUp,
      Building2,
      PieChart,
      Home,
      Mail,
      BarChart,
      FileText,
      Receipt,
    }
    return icons[iconName] || Users
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Modules</h1>
        <p className="text-muted-foreground mt-2">Manage available features and modules</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = getIcon(module.icon)
          return (
            <Card key={module.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  {module.is_active ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Check className="h-4 w-4" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <X className="h-4 w-4" />
                      Inactive
                    </div>
                  )}
                  <Switch 
                    checked={module.is_active} 
                    onCheckedChange={() => handleToggleModule(module.id, module.is_active)}
                  />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{module.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Included in <span className="font-medium text-foreground">{module.packages_count}</span> packages
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
