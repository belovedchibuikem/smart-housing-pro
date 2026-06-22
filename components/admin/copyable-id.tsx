"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface CopyableIdProps {
  label: string
  value: string | null | undefined
  hint?: string
  className?: string
  /** When true, long values are shortened in the UI but the full value is copied */
  truncate?: boolean
}

export function CopyableId({ label, value, hint, className, truncate }: CopyableIdProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const id = (value ?? "").trim()
  const shouldTruncate = truncate ?? id.length > 24
  const displayValue =
    !id ? "—" : shouldTruncate ? `${id.slice(0, 10)}…${id.slice(-10)}` : id

  const handleCopy = async () => {
    if (!id) return
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      toast({ title: "Copied", description: `${label} copied to clipboard` })
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard", variant: "destructive" })
    }
  }

  return (
    <div className={cn("rounded-md border bg-muted/40 px-3 py-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="truncate font-mono text-xs" title={id || undefined}>
            {displayValue}
          </div>
          {hint ? <div className="mt-0.5 text-[10px] text-muted-foreground">{hint}</div> : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => void handleCopy()}
          disabled={!id}
          title={`Copy ${label}`}
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
