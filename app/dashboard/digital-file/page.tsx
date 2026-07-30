"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { downloadMemberDigitalFile, getMemberDigitalFile } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function MemberDigitalFilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [docs, setDocs] = useState<any[]>([])

  const load = async (sync = false) => {
    try {
      setLoading(true)
      const res = await getMemberDigitalFile({ q, sync: sync ? 1 : undefined, per_page: 100 })
      setDocs(res.data?.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load digital file", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(true)
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Digital File</h1>
          <p className="text-muted-foreground">Read-only electronic dossier of your cooperative documents.</p>
        </div>
        <Button variant="outline" onClick={() => load(true)}>
          Refresh & sync
        </Button>
      </div>

      <div className="flex gap-2">
        <Input className="max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
        <Button variant="outline" onClick={() => load(false)}>
          Search
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No documents in your file yet.</CardContent>
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
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="p-3">{doc.reference_number}</td>
                  <td className="p-3">{doc.subject}</td>
                  <td className="p-3">{doc.document_type}</td>
                  <td className="p-3 capitalize">{doc.status?.replace("_", " ")}</td>
                  <td className="p-3">
                    {doc.file_path ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            const blob = await downloadMemberDigitalFile(doc.id)
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = `${doc.reference_number || "document"}.pdf`
                            a.click()
                            URL.revokeObjectURL(url)
                          } catch (e: any) {
                            toast({ title: "Download failed", description: e.message, variant: "destructive" })
                          }
                        }}
                      >
                        Download
                      </Button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
