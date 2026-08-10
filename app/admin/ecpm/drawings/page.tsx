"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  listEcpmDrawings,
  listEcpmProjects,
  reviseEcpmDrawing,
  uploadEcpmDrawing,
} from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload } from "lucide-react"

const DISCIPLINES = [
  "architectural",
  "structural",
  "electrical",
  "mechanical",
  "civil",
  "other",
]

export default function EcpmDrawingsPage() {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const reviseFileRef = useRef<HTMLInputElement>(null)
  const reviseTargetId = useRef<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [revisingId, setRevisingId] = useState<string | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [form, setForm] = useState({
    project_id: "",
    title: "",
    drawing_number: "",
    discipline: "architectural",
    description: "",
    change_notes: "Initial upload",
  })
  const [file, setFile] = useState<File | null>(null)
  const [reviseNotes, setReviseNotes] = useState("Revision upload")

  const load = async () => {
    try {
      setLoading(true)
      const [d, p] = await Promise.all([listEcpmDrawings(), listEcpmProjects()])
      setRows(d.data?.data || d.data || [])
      const projectList = p.data?.data || p.data || []
      setProjects(projectList)
      if (!form.project_id && projectList[0]?.id) {
        setForm((f) => ({ ...f, project_id: projectList[0].id }))
      }
    } catch (e: any) {
      toast({ title: "Failed to load drawings", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const upload = async () => {
    if (!form.project_id || !form.title.trim()) {
      toast({ title: "Project and title are required", variant: "destructive" })
      return
    }
    if (!file) {
      toast({ title: "Choose a drawing file to upload", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      await uploadEcpmDrawing({
        project_id: form.project_id,
        title: form.title.trim(),
        file,
        drawing_number: form.drawing_number.trim() || undefined,
        discipline: form.discipline || undefined,
        description: form.description.trim() || undefined,
        change_notes: form.change_notes.trim() || undefined,
      })
      toast({ title: "Drawing uploaded", description: "Revision submitted for approval." })
      setForm((f) => ({
        ...f,
        title: "",
        drawing_number: "",
        description: "",
        change_notes: "Initial upload",
      }))
      setFile(null)
      if (fileRef.current) fileRef.current.value = ""
      await load()
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const revise = async (drawingId: string, nextFile: File) => {
    setRevisingId(drawingId)
    try {
      await reviseEcpmDrawing(drawingId, {
        file: nextFile,
        change_notes: reviseNotes.trim() || undefined,
      })
      toast({ title: "Revision uploaded", description: "Approval request created." })
      if (reviseFileRef.current) reviseFileRef.current.value = ""
      await load()
    } catch (e: any) {
      toast({ title: "Revision failed", description: e.message, variant: "destructive" })
    } finally {
      setRevisingId(null)
      reviseTargetId.current = null
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Drawing Register</h1>
        <p className="text-muted-foreground">
          Upload architectural and engineering drawings. Each new revision creates an approval request.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload drawing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Project</Label>
            <select
              className="h-10 w-full rounded-md border px-3 text-sm"
              value={form.project_id}
              onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.project_number || p.id}
                </option>
              ))}
            </select>
            {projects.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Create a project under ECPM → Projects before uploading drawings.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Ground floor plan"
            />
          </div>
          <div className="space-y-2">
            <Label>Drawing number (optional)</Label>
            <Input
              value={form.drawing_number}
              onChange={(e) => setForm((f) => ({ ...f, drawing_number: e.target.value }))}
              placeholder="Auto-generated if blank"
            />
          </div>
          <div className="space-y-2">
            <Label>Discipline</Label>
            <select
              className="h-10 w-full rounded-md border px-3 text-sm"
              value={form.discipline}
              onChange={(e) => setForm((f) => ({ ...f, discipline: e.target.value }))}
            >
              {DISCIPLINES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description (optional)</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>File</Label>
            <Input
              ref={fileRef}
              type="file"
              accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.tif,.tiff"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? <p className="text-xs text-muted-foreground">{file.name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Change notes</Label>
            <Input
              value={form.change_notes}
              onChange={(e) => setForm((f) => ({ ...f, change_notes: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Button onClick={upload} disabled={saving || !form.project_id || !form.title.trim() || !file}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload drawing
            </Button>
          </div>
        </CardContent>
      </Card>

      <input
        ref={reviseFileRef}
        type="file"
        className="hidden"
        accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.tif,.tiff"
        onChange={(e) => {
          const next = e.target.files?.[0]
          const id = reviseTargetId.current
          if (next && id) revise(id, next)
        }}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Registered drawings</CardTitle>
            <div className="pt-2 max-w-sm space-y-1">
              <Label className="text-xs">Notes for next revision</Label>
              <Input value={reviseNotes} onChange={(e) => setReviseNotes(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3">Number</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Discipline</th>
                  <th className="p-3">Rev</th>
                  <th className="p-3">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="p-6 text-muted-foreground" colSpan={6}>
                      No drawings yet. Use the upload form above.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-3 font-mono text-xs">{r.drawing_number}</td>
                      <td className="p-3">{r.title}</td>
                      <td className="p-3">{r.discipline}</td>
                      <td className="p-3">{r.current_revision}</td>
                      <td className="p-3">{r.status}</td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={revisingId === r.id}
                          onClick={() => {
                            reviseTargetId.current = r.id
                            reviseFileRef.current?.click()
                          }}
                        >
                          {revisingId === r.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Upload revision"
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
