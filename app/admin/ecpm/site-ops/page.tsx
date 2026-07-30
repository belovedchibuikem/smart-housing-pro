"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  completeEcpmInspection,
  createEcpmDiary,
  createEcpmHse,
  createEcpmInspection,
  createEcpmProgress,
  listEcpmDiaries,
  listEcpmHse,
  listEcpmInspections,
  listEcpmProgress,
  listEcpmProjects,
} from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmSiteOpsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [diaries, setDiaries] = useState<any[]>([])
  const [inspections, setInspections] = useState<any[]>([])
  const [hse, setHse] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [projectId, setProjectId] = useState("")
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().slice(0, 10))
  const [workDone, setWorkDone] = useState("")
  const [inspType, setInspType] = useState("foundation")
  const [inspTitle, setInspTitle] = useState("")
  const [hseTitle, setHseTitle] = useState("")
  const [progressPct, setProgressPct] = useState("")
  const [progressSummary, setProgressSummary] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const [p, d, i, h, pr] = await Promise.all([
        listEcpmProjects(),
        listEcpmDiaries(),
        listEcpmInspections(),
        listEcpmHse(),
        listEcpmProgress(),
      ])
      setProjects(p.data?.data || p.data || [])
      setDiaries(d.data?.data || d.data || [])
      setInspections(i.data?.data || i.data || [])
      setHse(h.data?.data || h.data || [])
      setProgress(pr.data?.data || pr.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load site ops", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Operations</h1>
        <p className="text-muted-foreground">Daily diaries, inspections/QA, HSE and progress evidence</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Site Diary</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
            <div><Label>Date</Label><Input type="date" value={diaryDate} onChange={(e) => setDiaryDate(e.target.value)} /></div>
            <div><Label>Work done</Label><Input value={workDone} onChange={(e) => setWorkDone(e.target.value)} /></div>
            <Button disabled={!projectId} onClick={async () => {
              await createEcpmDiary({ project_id: projectId, diary_date: diaryDate, work_done: workDone, weather: "fair" })
              toast({ title: "Diary saved" }); await load()
            }}>Save Diary</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Inspection</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
            <div>
              <Label>Type</Label>
              <select className="w-full border rounded-md h-10 px-3" value={inspType} onChange={(e) => setInspType(e.target.value)}>
                {["foundation","reinforcement","columns","beams","slabs","roofing","electrical","plumbing","finishing","external_works"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div><Label>Title</Label><Input value={inspTitle} onChange={(e) => setInspTitle(e.target.value)} /></div>
            <Button disabled={!projectId || !inspTitle} onClick={async () => {
              await createEcpmInspection({ project_id: projectId, inspection_type: inspType, title: inspTitle })
              toast({ title: "Inspection created" }); await load()
            }}>Create Inspection</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">HSE Record</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
            <div><Label>Title</Label><Input value={hseTitle} onChange={(e) => setHseTitle(e.target.value)} /></div>
            <Button disabled={!projectId || !hseTitle} onClick={async () => {
              await createEcpmHse({ project_id: projectId, record_type: "toolbox_talk", title: hseTitle, ppe_compliant: true })
              toast({ title: "HSE recorded" }); await load()
            }}>Record HSE</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Progress Update</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />
            <div><Label>% Complete</Label><Input type="number" value={progressPct} onChange={(e) => setProgressPct(e.target.value)} /></div>
            <div><Label>Summary</Label><Input value={progressSummary} onChange={(e) => setProgressSummary(e.target.value)} /></div>
            <Button disabled={!projectId} onClick={async () => {
              await createEcpmProgress({ project_id: projectId, percent_complete: Number(progressPct || 0), summary: progressSummary, visible_to_client: true })
              toast({ title: "Progress posted" }); await load()
            }}>Post Progress</Button>
          </CardContent>
        </Card>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <ListCard title="Recent diaries" rows={diaries.slice(0, 8)} render={(r) => `${r.diary_date} — ${r.work_done || "—"}`} />
          <ListCard title="Inspections" rows={inspections.slice(0, 8)} render={(r) => (
            <div className="flex justify-between gap-2">
              <span>{r.title} ({r.result})</span>
              {r.result === "pending" && (
                <Button size="sm" variant="outline" onClick={async () => {
                  await completeEcpmInspection(r.id, { result: "pass" }); toast({ title: "Passed" }); await load()
                }}>Pass</Button>
              )}
            </div>
          )} />
          <ListCard title="HSE" rows={hse.slice(0, 8)} render={(r) => `${r.record_type}: ${r.title}`} />
          <ListCard title="Progress" rows={progress.slice(0, 8)} render={(r) => `${r.update_date} — ${r.percent_complete ?? "—"}%`} />
        </div>
      )}
    </div>
  )
}

function ProjectSelect({ projects, value, onChange }: { projects: any[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>Project</Label>
      <select className="w-full border rounded-md h-10 px-3" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>
  )
}

function ListCard({ title, rows, render }: { title: string; rows: any[]; render: (r: any) => any }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? <p className="text-muted-foreground">None yet</p> : rows.map((r) => <div key={r.id} className="border-b py-1">{render(r)}</div>)}
      </CardContent>
    </Card>
  )
}
