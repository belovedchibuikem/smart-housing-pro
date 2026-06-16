"use client"

import { useRef, useState } from "react"
import { Camera, Loader2 } from "lucide-react"
import { MemberAvatar } from "@/components/profile/member-avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface ProfilePhotoUploadProps {
	avatarUrl?: string | null
	firstName?: string | null
	lastName?: string | null
	size?: "sm" | "lg"
	onUpload: (file: File) => Promise<void>
	className?: string
}

export function ProfilePhotoUpload({
	avatarUrl,
	firstName,
	lastName,
	size = "lg",
	onUpload,
	className,
}: ProfilePhotoUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [uploading, setUploading] = useState(false)
	const { toast } = useToast()

	const avatarSize = size === "lg" ? "size-24 text-2xl" : "size-16 text-lg"

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		event.target.value = ""
		if (!file) return

		if (!file.type.startsWith("image/")) {
			toast({
				title: "Invalid file",
				description: "Please choose a JPEG or PNG image.",
				variant: "destructive",
			})
			return
		}

		if (file.size > 2 * 1024 * 1024) {
			toast({
				title: "File too large",
				description: "Profile photo must be 2MB or smaller.",
				variant: "destructive",
			})
			return
		}

		try {
			setUploading(true)
			await onUpload(file)
			toast({
				title: "Profile photo updated",
				description: "Your photo will appear on your dashboard and interest forms.",
			})
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Unable to upload photo."
			toast({
				title: "Upload failed",
				description: message,
				variant: "destructive",
			})
		} finally {
			setUploading(false)
		}
	}

	return (
		<div className={cn("relative inline-flex", className)}>
			<MemberAvatar
				avatarUrl={avatarUrl}
				firstName={firstName}
				lastName={lastName}
				className={avatarSize}
				fallbackClassName="bg-primary/10 text-primary"
			/>
			<Button
				type="button"
				size="icon"
				variant="secondary"
				className="absolute -bottom-1 -right-1 size-8 rounded-full shadow-sm"
				disabled={uploading}
				onClick={() => inputRef.current?.click()}
				aria-label="Change profile photo"
			>
				{uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
			</Button>
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/jpg,image/gif"
				className="hidden"
				onChange={handleFileChange}
			/>
		</div>
	)
}
