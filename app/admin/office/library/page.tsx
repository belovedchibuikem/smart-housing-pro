"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createOfficeFolder, createOfficeTag, getOfficeFolders, getOfficeTags } from "@/lib/api/office"
import { FolderOpen, Loader2, Tag } from "lucide-react"

export default function OfficeLibraryPage() {
  const { toast } = useToast()
  const [folders, setFolders] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [folderName, setFolderName] = useState("")
  const [tagName, setTagName] = useState("")
  const [loading, setLoading] = useState(true)
  const [savingFolder, setSavingFolder] = useState(false)
  const [savingTag, setSavingTag] = useState(false)

  const load = async (opts?: { quiet?: boolean }) => {
    try {
      if (!opts?.quiet) setLoading(true)
      const [f, t] = await Promise.all([getOfficeFolders(), getOfficeTags()])
      setFolders(Array.isArray(f.data) ? f.data : [])
      setTags(Array.isArray(t.data) ? t.data : [])
    } catch (e: any) {
      toast({ title: "Failed to load library", description: e.message, variant: "destructive" })
    } finally {
      if (!opts?.quiet) setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addFolder = async () => {
    const name = folderName.trim()
    if (!name) {
      toast({ title: "Enter a folder name", variant: "destructive" })
      return
    }
    try {
      setSavingFolder(true)
      const res = await createOfficeFolder({ name })
      setFolderName("")
      if (res?.data) {
        setFolders((prev) => {
          const next = [...prev.filter((f) => f.id !== res.data.id), res.data]
          return next.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
        })
      }
      toast({ title: "Folder created", description: `"${name}" is ready. Use it when filing documents in Registry Search.` })
      await load({ quiet: true })
    } catch (e: any) {
      toast({ title: "Could not create folder", description: e.message, variant: "destructive" })
    } finally {
      setSavingFolder(false)
    }
  }

  const addTag = async () => {
    const name = tagName.trim()
    if (!name) {
      toast({ title: "Enter a tag name", variant: "destructive" })
      return
    }
    try {
      setSavingTag(true)
      const res = await createOfficeTag({ name, kind: "tag" })
      setTagName("")
      if (res?.data) {
        setTags((prev) => [...prev.filter((t) => t.id !== res.data.id), res.data])
      }
      toast({ title: "Tag created", description: `"${name}" can be applied to documents.` })
      await load({ quiet: true })
    } catch (e: any) {
      toast({ title: "Could not create tag", description: e.message, variant: "destructive" })
    } finally {
      setSavingTag(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Library — Folders & Tags</h1>
        <p className="text-muted-foreground">
          Create filing folders and labels here. They appear on this page, then you assign them when
          working documents in{" "}
          <Link href="/admin/office/documents" className="text-primary underline-offset-2 hover:underline">
            Registry Search
          </Link>
          .
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="h-4 w-4" /> Folders
              </CardTitle>
              <CardDescription>
                Root folders for the document repository. Created folders list below immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="New folder"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      void addFolder()
                    }
                  }}
                />
                <Button onClick={() => void addFolder()} disabled={savingFolder}>
                  {savingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>
              {folders.length === 0 ? (
                <p className="rounded border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                  No folders yet. Type a name and click Add — the folder will show here.
                </p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {folders.map((f) => (
                    <li key={f.id} className="rounded border px-3 py-2 flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{f.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        {f.documents_count ?? 0} docs
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" /> Tags / Labels
              </CardTitle>
              <CardDescription>Reusable labels for search and classification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="New tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      void addTag()
                    }
                  }}
                />
                <Button onClick={() => void addTag()} disabled={savingTag}>
                  {savingTag ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>
              {tags.length === 0 ? (
                <p className="rounded border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                  No tags yet. Add one to classify documents.
                </p>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
