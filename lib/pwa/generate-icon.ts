import { readFile } from "fs/promises"
import path from "path"
import { DEFAULT_BRANDING } from "@/lib/pwa/branding"

const DEFAULT_ICON_PATH = path.join(process.cwd(), "public", "branding", "smarthousing-icon.svg")

function clampSize(size: number): number {
  return Math.min(512, Math.max(32, Math.round(size)))
}

function parseHexColor(hex: string): { r: number; g: number; b: number; alpha: number } {
  const normalized = hex.replace("#", "").trim()
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16)
    const g = parseInt(normalized[1] + normalized[1], 16)
    const b = parseInt(normalized[2] + normalized[2], 16)
    return { r, g, b, alpha: 1 }
  }
  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16)
    const g = parseInt(normalized.slice(2, 4), 16)
    const b = parseInt(normalized.slice(4, 6), 16)
    return { r, g, b, alpha: 1 }
  }
  return { r: 255, g: 255, b: 255, alpha: 1 }
}

async function loadIconBytes(iconUrl: string): Promise<Buffer> {
  if (iconUrl.startsWith("http://") || iconUrl.startsWith("https://")) {
    const response = await fetch(iconUrl, { cache: "no-store" })
    if (!response.ok) {
      throw new Error(`Failed to fetch icon: ${response.status}`)
    }
    return Buffer.from(await response.arrayBuffer())
  }

  const relativePath = iconUrl.startsWith("/") ? iconUrl.slice(1) : iconUrl
  const localPath = path.join(process.cwd(), "public", relativePath)
  return readFile(localPath)
}

async function getSharp() {
  const mod = await import("sharp")
  return mod.default
}

export async function generatePwaIconPng(
  iconUrl: string,
  size: number,
  backgroundColor = DEFAULT_BRANDING.backgroundColor,
): Promise<Buffer> {
  const sharp = await getSharp()
  const dimension = clampSize(size)
  const background = parseHexColor(backgroundColor)

  let inputBuffer: Buffer
  try {
    inputBuffer = await loadIconBytes(iconUrl)
  } catch {
    inputBuffer = await readFile(DEFAULT_ICON_PATH)
  }

  try {
    return await sharp(inputBuffer)
      .resize(dimension, dimension, {
        fit: "contain",
        background,
      })
      .png()
      .toBuffer()
  } catch {
    const fallback = await readFile(DEFAULT_ICON_PATH)
    return sharp(fallback)
      .resize(dimension, dimension, {
        fit: "contain",
        background,
      })
      .png()
      .toBuffer()
  }
}
