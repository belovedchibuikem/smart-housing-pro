"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { resolveStorageUrl } from "@/lib/api/config"
import { cn } from "@/lib/utils"

interface MemberAvatarProps {
	avatarUrl?: string | null
	firstName?: string | null
	lastName?: string | null
	className?: string
	fallbackClassName?: string
}

export function MemberAvatar({
	avatarUrl,
	firstName,
	lastName,
	className,
	fallbackClassName,
}: MemberAvatarProps) {
	const initials =
		[firstName?.trim()?.[0], lastName?.trim()?.[0]].filter(Boolean).join("").toUpperCase() || "?"
	const src = avatarUrl ? resolveStorageUrl(avatarUrl) : undefined

	return (
		<Avatar className={cn("size-8", className)}>
			{src ? <AvatarImage src={src} alt="Profile photo" /> : null}
			<AvatarFallback className={cn("text-xs font-semibold", fallbackClassName)}>{initials}</AvatarFallback>
		</Avatar>
	)
}
