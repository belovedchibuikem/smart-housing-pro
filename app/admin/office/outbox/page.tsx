"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getOfficeOutbox } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeOutboxPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [folder, setFolder] = useState("")
  const [docs, setDocs] = useState<any[]>([])

  const load = async () => {
    try {
      setLoading(true)
      const res = await getOfficeOutbox({ q, folder: folder || undefined, per_page: 50 })
      setDocs(res.data?.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load outbox", description: e.message, variant: "destructive" })
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
        <h1 className="text-2xl font-semibold">Outbox</h1>
        <p className="text-muted-foreground">Documents you created.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search subject or reference…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <select
          className="h-10 rounded-md border px-3 text-sm"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
        >
          <option value="">All</option>
          <option value="drafts">Drafts</option>
          <option value="pending">Pending</option>
          <option value="returned">Returned</option>
          <option value="approved">Approved</option>
          <option value="archived">Archived</option>
        </select>
        <Button onClick={load} variant="outline">
          Search
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No documents found.</CardContent>
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
