import { meRequest } from "@/lib/api/client"
import type { AuthUser } from "./types"

export async function fetchCurrentUser(): Promise<AuthUser | null> {
	try {
		const res = await meRequest()
		const user = (res as any).user as AuthUser | undefined
		return user || null
	} catch {
		return null
	}
}

export function userHasRole(user: AuthUser | null | undefined, role: string): boolean {
	if (!user?.roles) return false
	return user.roles.includes(role)
}

export function userHasAnyRole(user: AuthUser | null | undefined, roles: string[]): boolean {
	if (!user?.roles) return false
	return roles.some((r) => user.roles!.includes(r))
}


