export interface AuthUser {
	id: string | number
	email: string
	first_name?: string
	last_name?: string
	/** Singular role from API (e.g. login / UserResource) */
	role?: string
	roles?: string[]
	permissions?: string[]
}


