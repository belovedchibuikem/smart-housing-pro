"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getOfficeCategories, getOfficeDocuments } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeRegistrySearchPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [categoryId, setCategoryId] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const res = await getOfficeDocuments({
        q,
        status: status || undefined,
        document_type: documentType || undefined,
        category_id: categoryId || undefined,
        per_page: 50,
      })
      setDocs(res.data?.data || [])
    } catch (e: any) {
      toast({ title: "Search failed", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const c = await getOfficeCategories()
        setCategories(c.data || [])
      } catch {
        /* ignore */
      }
      await load()
    })()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Document Registry</h1>
        <p className="text-muted-foreground">Search the unified Digital Office repository.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          className="max-w-sm"
          placeholder="Subject, reference, keywords…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="h-10 rounded-md border px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {["draft", "in_review", "returned", "approved", "issued", "archived", "rejected", "held"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border px-3 text-sm"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option value="">All types</option>
          <option value="internal_memo">Internal memo</option>
          <option value="issued_filing">Issued filing</option>
        </select>
        <select
          className="h-10 rounded-md border px-3 text-sm"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={load}>
          Search
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Searching…
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No documents matched.</CardContent>
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
                <th className="p-3">Creator</th>
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
                  <td className="p-3">{doc.creator?.name || "—"}</td>
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
