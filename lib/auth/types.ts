export interface AuthUser {
	id: string | number
	email: string
	first_name?: string
	last_name?: string
	roles?: string[]
	permissions?: string[]
}


