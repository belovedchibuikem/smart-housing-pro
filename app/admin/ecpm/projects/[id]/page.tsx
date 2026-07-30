"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getEcpmProject, updateEcpmStageItem } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function EcpmProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await getEcpmProject(id)
      setProject(res.data)
    } catch (e: any) {
      toast({ title: "Failed to load project", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) load()
  }, [id])

  const completeItem = async (itemId: string) => {
    try {
      await updateEcpmStageItem(itemId, { status: "completed" })
      toast({ title: "Stage item completed" })
      await load()
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" })
    }
  }

  if (loading || !project) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/ecpm/projects" className="text-sm text-primary underline">Back to projects</Link>
          <h1 className="text-2xl font-bold mt-2">{project.name}</h1>
          <p className="text-muted-foreground font-mono text-sm">{project.project_number} · {project.status} · {project.progress_percent}%</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Budget</CardTitle></CardHeader><CardContent className="text-xl font-bold">₦{Number(project.budget || 0).toLocaleString()}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Client</CardTitle></CardHeader><CardContent className="text-xl font-bold">{project.client_name || "—"}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Handover</CardTitle></CardHeader><CardContent className="text-xl font-bold">{project.handover_status}</CardContent></Card>
      </div>

      {(project.stages || []).map((stage: any) => (
        <Card key={stage.id}>
          <CardHeader>
            <CardTitle className="text-base">{stage.stage_name} — {stage.progress_percent}%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(stage.items || []).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between border-b py-2 text-sm">
                <span>{item.item_name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.status}</span>
                  {item.status !== "completed" && (
                    <Button size="sm" variant="outline" onClick={() => completeItem(item.id)}>Complete</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
