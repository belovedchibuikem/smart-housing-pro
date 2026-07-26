"use client"

import { useEffect, type ReactNode } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Heading2, Italic, List, ListOrdered, Redo, Undo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DocumentBodyEditorProps = {
	value: string
	onChange: (html: string) => void
	className?: string
}

export function DocumentBodyEditor({ value, onChange, className }: DocumentBodyEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: { levels: [2, 3] },
			}),
		],
		content: value || "<p></p>",
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class:
					"prose prose-sm max-w-none min-h-[320px] px-3 py-2 focus:outline-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2",
			},
		},
		onUpdate: ({ editor: current }) => {
			onChange(current.getHTML())
		},
	})

	useEffect(() => {
		if (!editor) return
		const current = editor.getHTML()
		const next = value || "<p></p>"
		if (current !== next) {
			editor.commands.setContent(next, { emitUpdate: false })
		}
	}, [editor, value])

	if (!editor) {
		return <div className={cn("min-h-[360px] rounded-md border bg-muted/20", className)} />
	}

	return (
		<div className={cn("rounded-md border bg-background", className)}>
			<div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5">
				<ToolbarButton
					active={editor.isActive("bold")}
					onClick={() => editor.chain().focus().toggleBold().run()}
					label="Bold"
				>
					<Bold className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive("italic")}
					onClick={() => editor.chain().focus().toggleItalic().run()}
					label="Italic"
				>
					<Italic className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive("heading", { level: 2 })}
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					label="Heading"
				>
					<Heading2 className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive("bulletList")}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					label="Bullet list"
				>
					<List className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive("orderedList")}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					label="Ordered list"
				>
					<ListOrdered className="h-3.5 w-3.5" />
				</ToolbarButton>
				<div className="mx-1 h-5 w-px bg-border" />
				<ToolbarButton onClick={() => editor.chain().focus().undo().run()} label="Undo">
					<Undo className="h-3.5 w-3.5" />
				</ToolbarButton>
				<ToolbarButton onClick={() => editor.chain().focus().redo().run()} label="Redo">
					<Redo className="h-3.5 w-3.5" />
				</ToolbarButton>
			</div>
			<EditorContent editor={editor} />
		</div>
	)
}

function ToolbarButton({
	children,
	onClick,
	active,
	label,
}: {
	children: ReactNode
	onClick: () => void
	active?: boolean
	label: string
}) {
	return (
		<Button
			type="button"
			variant={active ? "secondary" : "ghost"}
			size="sm"
			className="h-8 w-8 p-0"
			onClick={onClick}
			aria-label={label}
			title={label}
		>
			{children}
		</Button>
	)
}
