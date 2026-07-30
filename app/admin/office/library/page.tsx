"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createOfficeFolder, createOfficeTag, getOfficeFolders, getOfficeTags } from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function OfficeLibraryPage() {
  const { toast } = useToast()
  const [folders, setFolders] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [folderName, setFolderName] = useState("")
  const [tagName, setTagName] = useState("")
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const [f, t] = await Promise.all([getOfficeFolders(), getOfficeTags()])
      setFolders(f.data || [])
      setTags(t.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load library", description: e.message, variant: "destructive" })
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
        <h1 className="text-2xl font-semibold">Library — Folders & Tags</h1>
        <p className="text-muted-foreground">Organize the document repository with folders, tags, and labels.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Folders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="New folder" />
                <Button
                  onClick={async () => {
                    if (!folderName.trim()) return
                    await createOfficeFolder({ name: folderName })
                    setFolderName("")
                    await load()
                  }}
                >
                  Add
                </Button>
              </div>
              <ul className="space-y-1 text-sm">
                {folders.map((f) => (
                  <li key={f.id} className="rounded border px-3 py-2">
                    {f.name}{" "}
                    <span className="text-muted-foreground">({f.documents_count ?? 0} docs)</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags / Labels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="New tag" />
                <Button
                  onClick={async () => {
                    if (!tagName.trim()) return
                    await createOfficeTag({ name: tagName, kind: "tag" })
                    setTagName("")
                    await load()
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t.id}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{ borderColor: t.color || undefined }}
                  >
                    {t.name} · {t.kind}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
