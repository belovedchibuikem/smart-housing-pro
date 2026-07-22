export interface AuthRole {
	id: string | number | null
	/** Human-readable label for UI (e.g. "Finance Manager") */
	name: string
	/** Machine name / Spatie role name (e.g. "finance_manager") */
	slug: string
	/** Exact Role.display_name from the database when present */
	display_name?: string | null
}

export interface AuthUser {
	id: string | number
	email: string
	first_name?: string
	last_name?: string
	/** Primary role from API (preferred). Legacy responses may use a string. */
	role?: AuthRole | string
	roles?: string[]
	permissions?: string[]
	/** Set by API UserResource; mirrors User::isAdmin() */
	is_staff?: boolean
	/** `tenant` = cooperative user; `platform` = central SuperAdmin operator */
	auth_context?: "tenant" | "platform"
}
