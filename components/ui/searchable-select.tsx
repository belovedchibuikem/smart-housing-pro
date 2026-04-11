"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type SearchableSelectOption = {
	value: string
	label: string
	/** Extra text used only for filtering (e.g. email, ids) */
	searchText?: string
	/** Optional second line in the list */
	description?: string
}

type SearchableSelectProps = {
	value: string
	onValueChange: (value: string) => void
	options: SearchableSelectOption[]
	placeholder?: string
	searchPlaceholder?: string
	emptyText?: string
	disabled?: boolean
	className?: string
	triggerClassName?: string
	/** When true, shows a clear / unselect action when value is set */
	allowEmpty?: boolean
	emptyValueLabel?: string
}

function defaultFilter(query: string, opt: SearchableSelectOption): boolean {
	if (!query.trim()) return true
	const q = query.toLowerCase()
	const hay = [opt.label, opt.searchText, opt.description, opt.value].filter(Boolean).join(" ").toLowerCase()
	return hay.includes(q)
}

export function SearchableSelect({
	value,
	onValueChange,
	options,
	placeholder = "Select…",
	searchPlaceholder = "Search…",
	emptyText = "No results.",
	disabled = false,
	className,
	triggerClassName,
	allowEmpty = false,
	emptyValueLabel = "—",
}: SearchableSelectProps) {
	const [open, setOpen] = React.useState(false)
	const [query, setQuery] = React.useState("")

	const filtered = React.useMemo(() => {
		return options.filter((o) => defaultFilter(query, o))
	}, [options, query])

	const selected = options.find((o) => o.value === value)
	const displayLabel =
		value && selected ? selected.label : allowEmpty && !value ? emptyValueLabel : placeholder

	React.useEffect(() => {
		if (!open) setQuery("")
	}, [open])

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", triggerClassName)}
				>
					<span className="truncate text-left">{displayLabel}</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)} align="start">
				<div className="flex items-center border-b px-3">
					<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
					<Input
						placeholder={searchPlaceholder}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="border-0 focus-visible:ring-0"
					/>
				</div>
				<div className="max-h-[min(320px,50vh)] overflow-y-auto p-1">
					{allowEmpty && (
						<button
							type="button"
							className={cn(
								"flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
								!value && "bg-accent"
							)}
							onClick={() => {
								onValueChange("")
								setOpen(false)
							}}
						>
							<span className="text-muted-foreground">{emptyValueLabel}</span>
						</button>
					)}
					{filtered.length === 0 ? (
						<div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
					) : (
						filtered.map((opt) => (
							<button
								key={opt.value}
								type="button"
								className={cn(
									"flex w-full flex-col gap-0.5 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
									value === opt.value && "bg-accent"
								)}
								onClick={() => {
									onValueChange(opt.value)
									setOpen(false)
								}}
							>
								<span className="flex w-full items-center justify-between gap-2">
									<span className="truncate font-medium">{opt.label}</span>
									{value === opt.value && <Check className="h-4 w-4 shrink-0" />}
								</span>
								{opt.description ? (
									<span className="truncate text-xs text-muted-foreground">{opt.description}</span>
								) : null}
							</button>
						))
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}

/** Build options for admin member lists (MemberResource / normalizeAdminMembersList shape). */
export function membersToSearchableOptions(
	members: Array<{
		id: string
		user?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null
		member_number?: string | null
		member_id?: string | null
		staff_id?: string | null
	}>
): SearchableSelectOption[] {
	return members.map((m) => {
		const name = `${m.user?.first_name ?? ""} ${m.user?.last_name ?? ""}`.trim() || "Member"
		const idPart = m.member_number || m.member_id || m.staff_id || m.id
		const label = `${name} (${idPart})`
		const searchText = [name, idPart, m.user?.email, m.staff_id, m.member_number].filter(Boolean).join(" ")
		return {
			value: m.id,
			label: name,
			description: idPart,
			searchText,
		}
	})
}

export function usersToSearchableOptions(
	users: Array<{ id: string; first_name?: string | null; last_name?: string | null; email?: string | null }>
): SearchableSelectOption[] {
	return users.map((u) => {
		const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "User"
		const label = u.email ? `${name} (${u.email})` : name
		return {
			value: u.id,
			label: name,
			description: u.email || undefined,
			searchText: [name, u.email, u.id].filter(Boolean).join(" "),
		}
	})
}

/** Properties / generic list with id + title + optional location */
export function propertiesToSearchableOptions(
	properties: Array<{ id: string; title?: string; location?: string }>
): SearchableSelectOption[] {
	return properties.map((p) => ({
		value: p.id,
		label: p.title || "Property",
		description: p.location || undefined,
		searchText: [p.title, p.location, p.id].filter(Boolean).join(" "),
	}))
}
