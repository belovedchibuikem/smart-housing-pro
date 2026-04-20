export interface AuthRole {
	id: string | number | null
	/** Human-readable label for UI (e.g. "Finance Manager") */
	name: string
	/** Machine name / Spatie role name (e.g. "finance_manager") */
	slug: string
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
}
