"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberAvatar } from "@/components/profile/member-avatar"
import { handleLogout } from "@/lib/auth/auth-utils"
import { useMemberProfile } from "@/lib/hooks/use-member-profile"

export function MemberAccountMenu() {
	const { user } = useMemberProfile()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					<MemberAvatar
						avatarUrl={user?.avatar_url}
						firstName={user?.first_name}
						lastName={user?.last_name}
						className="size-9"
						fallbackClassName="bg-primary/10 text-primary"
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/dashboard/profile">Profile</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/dashboard/settings">Settings</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => handleLogout()}>
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
