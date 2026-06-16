import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Send, FileText, Home } from "lucide-react"
import Link from "next/link"
import { resolveMemberHrefModule } from "@/lib/modules/module-config"

interface QuickActionsProps {
  enabledModules?: string[]
}

export function QuickActions({ enabledModules }: QuickActionsProps) {
  const actions = [
    {
      title: "Make Contribution",
      description: "Add funds to your wallet",
      icon: Plus,
      href: "/dashboard/contributions/new",
      variant: "default" as const,
    },
    {
      title: "Apply for Loan",
      description: "Submit a loan application",
      icon: FileText,
      href: "/dashboard/loans/apply",
      variant: "outline" as const,
    },
    {
      title: "Browse Properties",
      description: "View available properties",
      icon: Home,
      href: "/dashboard/browse-properties",
      variant: "outline" as const,
    },
    {
      title: "Transfer Funds",
      description: "Send money from wallet",
      icon: Send,
      href: "/dashboard/wallet/transfer",
      variant: "outline" as const,
    },
  ]

  const visibleActions =
    enabledModules && enabledModules.length > 0
      ? actions.filter((action) => {
          const moduleSlug = resolveMemberHrefModule(action.href)
          return !moduleSlug || enabledModules.includes(moduleSlug)
        })
      : actions

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visibleActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.href}>
              <Button variant={action.variant} className="w-full h-auto flex-col items-start p-4 gap-2">
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold text-sm">{action.title}</div>
                  <div className="text-xs opacity-80 font-normal">{action.description}</div>
                </div>
              </Button>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
