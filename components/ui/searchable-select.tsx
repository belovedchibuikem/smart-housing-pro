"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatCompactNaira } from "@/lib/utils/currency"
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
	/**
	 * Server-side search. When provided, typing queries the API instead of
	 * filtering only the preloaded `options` list (needed for large member directories).
	 */
	onSearch?: (query: string) => Promise<SearchableSelectOption[]>
	/** Debounce for remote search in ms (default 300) */
	searchDebounceMs?: number
}

function normalizeSearchToken(value: string): string {
	return value.toLowerCase().replace(/[\s\-_/.,]/g, "")
}

function defaultFilter(query: string, opt: SearchableSelectOption): boolean {
	if (!query.trim()) return true
	const q = query.toLowerCase().trim()
	const hay = [opt.label, opt.searchText, opt.description, opt.value].filter(Boolean).join(" ").toLowerCase()
	if (hay.includes(q)) return true
	const qCompact = normalizeSearchToken(q)
	if (!qCompact) return true
	return normalizeSearchToken(hay).includes(qCompact)
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
	onSearch,
	searchDebounceMs = 300,
}: SearchableSelectProps) {
	const [open, setOpen] = React.useState(false)
	const [query, setQuery] = React.useState("")
	const [remoteOptions, setRemoteOptions] = React.useState<SearchableSelectOption[] | null>(null)
	const [searching, setSearching] = React.useState(false)
	const searchSeq = React.useRef(0)

	const useRemote = typeof onSearch === "function"

	React.useEffect(() => {
		if (!open || !useRemote || !onSearch) {
			return
		}
		const q = query.trim()
		if (!q) {
			setRemoteOptions(null)
			setSearching(false)
			return
		}

		const seq = ++searchSeq.current
		const handle = window.setTimeout(() => {
			setSearching(true)
			void onSearch(q)
				.then((rows) => {
					if (searchSeq.current !== seq) return
					setRemoteOptions(Array.isArray(rows) ? rows : [])
				})
				.catch(() => {
					if (searchSeq.current !== seq) return
					setRemoteOptions([])
				})
				.finally(() => {
					if (searchSeq.current === seq) setSearching(false)
				})
		}, searchDebounceMs)

		return () => window.clearTimeout(handle)
	}, [open, onSearch, query, searchDebounceMs, useRemote])

	const listOptions = React.useMemo(() => {
		if (useRemote && remoteOptions) {
			const selected = options.find((o) => o.value === value)
			if (selected && !remoteOptions.some((o) => o.value === selected.value)) {
				return [selected, ...remoteOptions]
			}
			return remoteOptions
		}
		return options
	}, [options, remoteOptions, useRemote, value])

	const filtered = React.useMemo(() => {
		if (useRemote && query.trim()) {
			return listOptions
		}
		return listOptions.filter((o) => defaultFilter(query, o))
	}, [listOptions, query, useRemote])

	const selected = options.find((o) => o.value === value) || listOptions.find((o) => o.value === value)
	const displayLabel =
		value && selected ? selected.label : allowEmpty && !value ? emptyValueLabel : placeholder

	React.useEffect(() => {
		if (!open) {
			setQuery("")
			setRemoteOptions(null)
			setSearching(false)
		}
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
					{searching ? (
						<Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin opacity-70" />
					) : (
						<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
					)}
					<Input
						placeholder={searchPlaceholder}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="border-0 focus-visible:ring-0"
						autoComplete="off"
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
						<div className="py-6 text-center text-sm text-muted-foreground">
							{searching
								? "Searching…"
								: useRemote && query.trim()
									? emptyText
									: useRemote
										? "Type to search all members…"
										: emptyText}
						</div>
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
		first_name?: string | null
		last_name?: string | null
		email?: string | null
		user?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null
		member_number?: string | null
		member_id?: string | null
		staff_id?: string | null
		ippis_number?: string | null
		frsc_pin?: string | null
		id_number?: string | null
	}>
): SearchableSelectOption[] {
	return members.map((m) => {
		const first = m.user?.first_name ?? m.first_name ?? ""
		const last = m.user?.last_name ?? m.last_name ?? ""
		const email = m.user?.email ?? m.email ?? ""
		const name = `${first} ${last}`.trim() || "Member"
		const idParts = [
			m.member_number ? `Member No: ${m.member_number}` : null,
			m.staff_id ? `Staff ID: ${m.staff_id}` : null,
			m.ippis_number ? `IPPIS: ${m.ippis_number}` : null,
			m.frsc_pin ? `PIN: ${m.frsc_pin}` : null,
			m.id_number ? `ID: ${m.id_number}` : null,
			!m.member_number && m.member_id ? m.member_id : null,
		].filter(Boolean) as string[]
		const description = idParts.join(" · ") || m.id
		const searchText = [
			name,
			email,
			description,
			m.member_number,
			m.member_id,
			m.staff_id,
			m.ippis_number,
			m.frsc_pin,
			m.id_number,
			m.id,
			m.ippis_number ? `ippis ${m.ippis_number}` : null,
			m.staff_id ? `staff ${m.staff_id}` : null,
		]
			.filter(Boolean)
			.join(" ")
		return {
			value: m.id,
			label: name,
			description,
			searchText,
		}
	})
}

export function usersToSearchableOptions(
	users: Array<{ id: string; first_name?: string | null; last_name?: string | null; email?: string | null }>
): SearchableSelectOption[] {
	return users.map((u) => {
		const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "User"
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
	properties: Array<{
		id: string
		title?: string
		location?: string
		type?: string
		property_type?: string
		type_label?: string
		price?: number | string
		total_slots?: number | null
		slots_available?: number | null
	}>
): SearchableSelectOption[] {
	const formatPrice = (value?: number | string) => {
		const amount = Number(value ?? 0)
		if (!Number.isFinite(amount) || amount <= 0) return ""
		return formatCompactNaira(amount)
	}

	return properties.map((p) => {
		const typeLabel = p.type_label || p.property_type || p.type || "House"
		const priceLabel = formatPrice(p.price)
		const slotsLabel =
			p.total_slots != null
				? `${p.slots_available ?? 0} of ${p.total_slots} slots free`
				: "Unlimited slots"

		return {
			value: p.id,
			label: [p.title || "Property", typeLabel, priceLabel].filter(Boolean).join(" · "),
			description: [p.location, slotsLabel].filter(Boolean).join(" · "),
			searchText: [p.title, p.location, typeLabel, priceLabel, p.property_type, p.type, p.id]
				.filter(Boolean)
				.join(" "),
		}
	})
}
