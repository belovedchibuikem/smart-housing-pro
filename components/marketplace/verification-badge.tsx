import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, Clock } from "lucide-react"

export function VerificationBadge({
  status,
  className,
}: {
  status?: string | null
  className?: string
}) {
  if (status === "verified") {
    return (
      <Badge className={className ?? "bg-emerald-600 hover:bg-emerald-600 gap-1"}>
        <ShieldCheck className="h-3 w-3" />
        Verified
      </Badge>
    )
  }
  if (status === "rejected") {
    return (
      <Badge variant="destructive" className={className ?? "gap-1"}>
        <ShieldAlert className="h-3 w-3" />
        Rejected
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className={className ?? "gap-1"}>
      <Clock className="h-3 w-3" />
      Pending review
    </Badge>
  )
}
