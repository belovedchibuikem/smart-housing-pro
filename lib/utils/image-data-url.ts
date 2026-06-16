export async function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = () => reject(new Error("Failed to read file"))
		reader.readAsDataURL(blob)
	})
}

export async function remoteImageToDataUrl(url: string): Promise<string> {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error("Failed to fetch image")
	}
	return blobToDataUrl(await response.blob())
}
