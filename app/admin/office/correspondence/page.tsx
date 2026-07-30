"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  ackOfficeCorrespondence,
  createOfficeCorrespondence,
  dispatchOfficeCorrespondence,
  getOfficeCorrespondence,
} from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeCorrespondencePage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    subject: "",
    external_party_name: "",
    external_party_type: "vendor",
    direction: "outbound",
    body: "",
  })

  const load = async () => {
    try {
      setLoading(true)
      const res = await getOfficeCorrespondence({ per_page: 50 })
      setRows(res.data?.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load correspondence", description: e.message, variant: "destructive" })
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
        <h1 className="text-2xl font-semibold">External Correspondence</h1>
        <p className="text-muted-foreground">Track outbound/inbound letters with dispatch and acknowledgement.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Register correspondence</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <Input
            placeholder="External party"
            value={form.external_party_name}
            onChange={(e) => setForm({ ...form, external_party_name: e.target.value })}
          />
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={form.external_party_type}
            onChange={(e) => setForm({ ...form, external_party_type: e.target.value })}
          >
            {["vendor", "bank", "government", "contractor", "member", "mortgage_institution", "other"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}
          >
            <option value="outbound">Outbound</option>
            <option value="inbound">Inbound</option>
          </select>
          <Textarea
            className="sm:col-span-2"
            rows={3}
            placeholder="Body / notes"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <Button
            onClick={async () => {
              try {
                await createOfficeCorrespondence(form)
                toast({ title: "Correspondence registered" })
                setForm({ ...form, subject: "", external_party_name: "", body: "" })
                await load()
              } catch (e: any) {
                toast({ title: "Failed", description: e.message, variant: "destructive" })
              }
            }}
          >
            Create
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
                  <div className="font-medium">{r.subject}</div>
                  <div className="text-muted-foreground">
                    {r.direction} · {r.external_party_name} · {r.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  {r.status === "draft" && (
                    <Button size="sm" onClick={() => dispatchOfficeCorrespondence(r.id).then(load)}>
                      Dispatch
                    </Button>
                  )}
                  {r.status === "dispatched" && (
                    <Button size="sm" variant="outline" onClick={() => ackOfficeCorrespondence(r.id).then(load)}>
                      Acknowledge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
