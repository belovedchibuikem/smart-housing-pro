"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DocumentBodyEditor } from "@/components/documents/document-body-editor"
import { useToast } from "@/hooks/use-toast"
import {
	DOCUMENT_TYPE_LABELS,
	createDocumentTemplate,
	listDocumentTemplateVariables,
	listDocumentTemplates,
	resetDocumentTemplate,
	updateDocumentTemplate,
} from "@/lib/api/issued-documents"

interface TemplateRow {
	id: string
	document_type: string
	name: string
	subject: string | null
	body_html: string | null
	version: number
	is_active: boolean
}

export default function DocumentTemplatesPage() {
	const { toast } = useToast()
	const [templates, setTemplates] = useState<TemplateRow[]>([])
	const [variables, setVariables] = useState<string[]>([])
	const [selectedId, setSelectedId] = useState<string>("")
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [name, setName] = useState("")
	const [subject, setSubject] = useState("")
	const [bodyHtml, setBodyHtml] = useState("")
	const [newType, setNewType] = useState("")
	const [newName, setNewName] = useState("")

	const previewHtml = useMemo(() => {
		let html = bodyHtml
		for (const variable of variables) {
			html = html.replaceAll(`{{${variable}}}`, `<strong>[${variable}]</strong>`)
		}
		return `
			<div style="font-family: Georgia, serif; padding: 24px; background:#fffef9; min-height:100%;">
				<div style="border-bottom:2px solid #111; margin-bottom:16px; padding-bottom:8px;">
					<div style="font-weight:700; text-transform:uppercase;">Letterhead preview</div>
					<div style="font-size:12px;color:#666;">Subject: ${subject || "—"}</div>
				</div>
				${html || "<p>Empty body</p>"}
			</div>
		`
	}, [bodyHtml, subject, variables])

	const load = async () => {
		setLoading(true)
		try {
			const [res, vars] = await Promise.all([listDocumentTemplates(), listDocumentTemplateVariables()])
			setTemplates(res.templates || [])
			setVariables(vars.variables || [])
			const first = res.templates?.[0]
			if (first && !selectedId) {
				setSelectedId(first.id)
				setName(first.name)
				setSubject(first.subject || "")
				setBodyHtml(first.body_html || "")
			}
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		void load()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const selected = templates.find((t) => t.id === selectedId)
		if (!selected) return
		setName(selected.name)
		setSubject(selected.subject || "")
		setBodyHtml(selected.body_html || "")
	}, [selectedId, templates])

	const insertVariable = (variable: string) => {
		setBodyHtml((prev) => {
			const token = `{{${variable}}}`
			if (!prev || prev === "<p></p>") {
				return `<p>${token}</p>`
			}
			if (prev.endsWith("</p>")) {
				return `${prev.slice(0, -4)}${token}</p>`
			}
			return `${prev}${token}`
		})
	}

	const save = async () => {
		if (!selectedId) return
		setSaving(true)
		try {
			await updateDocumentTemplate(selectedId, { name, subject, body_html: bodyHtml })
			toast({ title: "Template saved" })
			await load()
		} catch (e) {
			toast({
				title: "Save failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		} finally {
			setSaving(false)
		}
	}

	const reset = async () => {
		if (!selectedId) return
		try {
			await resetDocumentTemplate(selectedId)
			toast({ title: "Template reset to default" })
			await load()
		} catch (e) {
			toast({
				title: "Reset failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	const createCustom = async () => {
		if (!newType || !newName) return
		try {
			const res = await createDocumentTemplate({
				document_type: newType.trim().toLowerCase().replace(/\s+/g, "_"),
				name: newName,
				subject: newName.toUpperCase(),
				body_html: "<p>Dear {{member_name}},</p><p>...</p>",
			})
			toast({ title: "Custom template created" })
			setNewType("")
			setNewName("")
			await load()
			const id = (res.template as { id?: string })?.id
			if (id) setSelectedId(id)
		} catch (e) {
			toast({
				title: "Create failed",
				description: e instanceof Error ? e.message : "Please try again",
				variant: "destructive",
			})
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20 text-muted-foreground">
				<Loader2 className="h-5 w-5 mr-2 animate-spin" />
				Loading templates…
			</div>
		)
	}

	const selected = templates.find((t) => t.id === selectedId)

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Document templates</h1>
				<p className="text-muted-foreground">
					Edit document bodies with the rich text editor and variables. Create custom types without code changes.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Create custom document type</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col md:flex-row gap-3">
					<Input placeholder="document_type (snake_case)" value={newType} onChange={(e) => setNewType(e.target.value)} />
					<Input placeholder="Display name" value={newName} onChange={(e) => setNewName(e.target.value)} />
					<Button onClick={() => void createCustom()}>
						<Plus className="h-4 w-4 mr-2" />
						Create
					</Button>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-[240px_1fr_1fr]">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Templates</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						{templates.map((template) => (
							<button
								key={template.id}
								type="button"
								onClick={() => setSelectedId(template.id)}
								className={`w-full text-left rounded-md border px-3 py-2 text-sm ${
									selectedId === template.id ? "border-primary bg-primary/5" : "hover:bg-muted"
								}`}
							>
								<div className="font-medium">{DOCUMENT_TYPE_LABELS[template.document_type] || template.name}</div>
								<div className="text-xs text-muted-foreground">
									{template.document_type} · v{template.version}
								</div>
							</button>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-start justify-between gap-3">
						<div>
							<CardTitle>{selected ? DOCUMENT_TYPE_LABELS[selected.document_type] || selected.name : "Template"}</CardTitle>
							<CardDescription>Insert variables, then preview on the right.</CardDescription>
						</div>
						<div className="flex gap-2">
							<Button variant="outline" onClick={() => void reset()}>
								<RotateCcw className="h-4 w-4 mr-2" />
								Reset
							</Button>
							<Button onClick={() => void save()} disabled={saving}>
								{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
								Save
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Name</Label>
							<Input value={name} onChange={(e) => setName(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label>Subject</Label>
							<Input value={subject} onChange={(e) => setSubject(e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label>Variables</Label>
							<div className="flex flex-wrap gap-1 max-h-28 overflow-auto">
								{variables.map((variable) => (
									<button
										key={variable}
										type="button"
										className="rounded border px-2 py-0.5 text-[11px] hover:bg-muted"
										onClick={() => insertVariable(variable)}
									>
										{`{{${variable}}}`}
									</button>
								))}
							</div>
						</div>
						<div className="space-y-2">
							<Label>Body</Label>
							<DocumentBodyEditor value={bodyHtml} onChange={setBodyHtml} />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">Live preview</CardTitle>
						<CardDescription>Sample variable placeholders shown in bold.</CardDescription>
					</CardHeader>
					<CardContent>
						<iframe title="Template preview" className="w-full min-h-[560px] rounded border bg-white" srcDoc={previewHtml} />
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
