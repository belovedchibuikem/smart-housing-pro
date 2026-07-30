"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getMemberOfficeFile } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function MemberDigitalFilePage() {
  const { memberId } = useParams<{ memberId: string }>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [docs, setDocs] = useState<any[]>([])

  const load = async () => {
    try {
      setLoading(true)
      const res = await getMemberOfficeFile(memberId, { q, per_page: 100 })
      setDocs(res.data?.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load member file", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (memberId) load()
  }, [memberId])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Digital Member File</h1>
        <p className="text-muted-foreground">Registry documents linked to member {memberId}</p>
      </div>

      <div className="flex gap-2">
        <Input
          className="max-w-sm"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button variant="outline" onClick={load}>
          Search
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No filed documents for this member yet.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="p-3">
                    <Link className="text-primary hover:underline" href={`/admin/office/documents/${doc.id}`}>
                      {doc.reference_number}
                    </Link>
                  </td>
                  <td className="p-3">{doc.subject}</td>
                  <td className="p-3">{doc.document_type}</td>
                  <td className="p-3 capitalize">{doc.status?.replace("_", " ")}</td>
                  <td className="p-3">{doc.updated_at ? new Date(doc.updated_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
