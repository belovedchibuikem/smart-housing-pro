export interface BrandColors {
  primary?: string
  secondary?: string
  accent?: string
  background?: string
  text?: string
}

function asHex(value?: string): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  const match = trimmed.match(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
  if (!match) return undefined
  const hex = match[1]
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase()
  }
  return `#${hex.toLowerCase()}`
}

function luminance(hex: string): number {
  const raw = hex.slice(1)
  const channel = (pair: string) => {
    const value = parseInt(pair, 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  const r = channel(raw.slice(0, 2))
  const g = channel(raw.slice(2, 4))
  const b = channel(raw.slice(4, 6))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const light = Math.max(luminance(a), luminance(b))
  const dark = Math.min(luminance(a), luminance(b))
  return (light + 0.05) / (dark + 0.05)
}

/** Label color that stays readable on a filled button or bar. */
export function readableOn(background: string, preferred?: string): string {
  const fill = asHex(background) ?? "#292265"
  const white = "#ffffff"
  const ink = "#111827"
  const choice = asHex(preferred)
  if (choice && contrast(choice, fill) >= 4.5) return choice
  return contrast(white, fill) >= contrast(ink, fill) ? white : ink
}

export function brandColorVariables(colors: BrandColors): Record<string, string> {
  const vars: Record<string, string> = {}
  const text = asHex(colors.text)
  const primary = asHex(colors.primary)
  const secondary = asHex(colors.secondary)
  const accent = asHex(colors.accent)
  const background = asHex(colors.background)

  if (primary) {
    const onPrimary = readableOn(primary, text)
    vars["--primary"] = primary
    vars["--primary-color"] = primary
    vars["--primary-foreground"] = onPrimary
    vars["--ring"] = primary
    vars["--chart-1"] = primary
    vars["--sidebar-primary"] = primary
    vars["--sidebar-primary-foreground"] = onPrimary
    vars["--sidebar-ring"] = primary
  }

  if (secondary) {
    vars["--secondary"] = secondary
    vars["--secondary-color"] = secondary
    vars["--secondary-foreground"] = readableOn(secondary, text)
    vars["--chart-2"] = secondary
  }

  if (accent) {
    vars["--accent"] = accent
    vars["--accent-color"] = accent
    vars["--accent-foreground"] = readableOn(accent, text)
  }

  if (background) {
    vars["--background"] = background
    vars["--background-color"] = background
    vars["--card"] = background
    vars["--popover"] = background
  }

  if (text) {
    vars["--text-color"] = text
    const surface = background ?? "#ffffff"
    const body = readableOn(surface, text)
    vars["--foreground"] = body
    vars["--card-foreground"] = body
    vars["--popover-foreground"] = body
  }

  return vars
}

export function applyBrandColorVariables(root: HTMLElement, colors: BrandColors) {
  for (const [name, value] of Object.entries(brandColorVariables(colors))) {
    root.style.setProperty(name, value)
  }
}

export function brandColorCss(colors: BrandColors): string {
  return Object.entries(brandColorVariables(colors))
    .map(([name, value]) => `${name}: ${value};`)
    .join("\n")
}
