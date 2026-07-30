"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  createOfficeCircular,
  getOfficeBranchMonitor,
  getOfficeCirculars,
  getOfficeOrgUnits,
  publishOfficeCircular,
} from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeCircularsPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<any[]>([])
  const [orgUnits, setOrgUnits] = useState<any[]>([])
  const [monitor, setMonitor] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [orgUnitIds, setOrgUnitIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const [c, o, m] = await Promise.all([
        getOfficeCirculars(),
        getOfficeOrgUnits(),
        getOfficeBranchMonitor(),
      ])
      setRows(c.data?.data || [])
      setOrgUnits(o.data || [])
      setMonitor(m.data)
    } catch (e: any) {
      toast({ title: "Failed to load circulars", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">HQ Circulars & Branch Monitor</h1>
        <p className="text-muted-foreground">Publish directives to branches and track acknowledgements.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Open circulars</div>
            <div className="text-3xl font-semibold">{monitor?.open_circulars ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Pending acks</div>
            <div className="text-3xl font-semibold">{monitor?.pending_acks ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Branches tracked</div>
            <div className="text-3xl font-semibold">{monitor?.branches?.length ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New circular / directive</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" />
          <div className="flex flex-wrap gap-2">
            {orgUnits.map((u) => (
              <label key={u.id} className="flex items-center gap-1 text-xs border rounded px-2 py-1">
                <input
                  type="checkbox"
                  checked={orgUnitIds.includes(u.id)}
                  onChange={(e) =>
                    setOrgUnitIds((ids) =>
                      e.target.checked ? [...ids, u.id] : ids.filter((x) => x !== u.id)
                    )
                  }
                />
                {u.name}
              </label>
            ))}
          </div>
          <Button
            onClick={async () => {
              try {
                await createOfficeCircular({
                  title,
                  body_html: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
                  org_unit_ids: orgUnitIds,
                  directive_type: "circular",
                })
                toast({ title: "Circular drafted" })
                setTitle("")
                setBody("")
                await load()
              } catch (e: any) {
                toast({ title: "Failed", description: e.message, variant: "destructive" })
              }
            }}
          >
            Create draft
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-muted-foreground">
                    {r.circular_number} · {r.status} · {r.directive_type}
                  </div>
                </div>
                {r.status === "draft" && (
                  <Button size="sm" onClick={() => publishOfficeCircular(r.id).then(load)}>
                    Publish
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
