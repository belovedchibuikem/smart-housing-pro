import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const MARKER = "/*__SH_RSC_BASE_END__*/"
const FIELDS = [
  ["clientModules", "__SH_BASE_CLIENT_MODULES"],
  ["ssrModuleMapping", "__SH_BASE_SSR_MODULES"],
  ["edgeSSRModuleMapping", "__SH_BASE_EDGE_SSR_MODULES"],
  ["rscModuleMapping", "__SH_BASE_RSC_MODULES"],
  ["edgeRscModuleMapping", "__SH_BASE_EDGE_RSC_MODULES"],
]

const manifestFiles = [
  ...(await walk(".next/server")),
  ...(await walk(".next/standalone/.next/server")),
].filter((file) => file.endsWith("_client-reference-manifest.js"))

const sources = new Map()
for (const file of manifestFiles) sources.set(file, await readFile(file, "utf8"))

const assignments = []
let before = 0
let after = 0
for (const source of sources.values()) before += Buffer.byteLength(source)

for (const [field, globalName] of FIELDS) {
  const parsed = []
  for (const [file, source] of sources) {
    const modulesText = extractValue(source, field)
    if (!modulesText) continue
    parsed.push({ file, modulesText, modules: JSON.parse(modulesText) })
  }
  if (parsed.length === 0) continue
  const base = mostCommonModules(parsed.map((entry) => entry.modules))
  if (Object.keys(base).length === 0 || Buffer.byteLength(JSON.stringify(base)) < 1024) continue
  assignments.push(`globalThis.${globalName}=${JSON.stringify(base)};`)
  for (const entry of parsed) {
    const source = sources.get(entry.file)
    const overrides = {}
    const missing = []
    for (const key of Object.keys(base)) {
      if (!(key in entry.modules)) missing.push(key)
      else if (JSON.stringify(entry.modules[key]) !== JSON.stringify(base[key])) overrides[key] = entry.modules[key]
    }
    for (const key of Object.keys(entry.modules)) {
      if (!(key in base)) overrides[key] = entry.modules[key]
    }
    const expression = sharedExpression(globalName, overrides, missing)
    const next = source.replace(`"${field}":${entry.modulesText}`, `"${field}":${expression}`)
    if (next === source) throw new Error(`Could not rewrite ${field} in ${entry.file}`)
    sources.set(entry.file, next)
  }
}

if (assignments.length === 0) {
  console.log("RSC manifests already share their repeated maps.")
  process.exit(0)
}

for (const [file, source] of sources) {
  after += Buffer.byteLength(source)
  await writeFile(file, source)
}

const prefix = `${assignments.join("")}${MARKER}\n`
const loaders = await walk(".next/standalone/node_modules")
let patchedLoaders = 0
for (const file of loaders) {
  const normalized = file.replaceAll("\\", "/")
  if (!/\/dist\/server\/load-manifest(\.external)?\.js$/.test(normalized)) continue
  let source = await readFile(file, "utf8")
  if (source.includes(MARKER)) {
    const additions = assignments.filter((assignment) => {
      const name = assignment.slice(0, assignment.indexOf("="))
      return !source.includes(`${name}=`)
    })
    source = source.replace(MARKER, `${additions.join("")}${MARKER}`)
  } else if (source.startsWith('"use strict";')) {
    source = `"use strict";\n${prefix}${source.slice('"use strict";'.length)}`
  } else {
    source = prefix + source
  }
  await writeFile(file, source)
  patchedLoaders++
}

console.log(
  `Shared repeated RSC maps across ${manifestFiles.length} manifests: ${(before / 1024 / 1024).toFixed(1)} MiB -> ${(after / 1024 / 1024).toFixed(1)} MiB (${patchedLoaders} load-manifest files).`,
)

function sharedExpression(globalName, overrides, missing) {
  const base = `globalThis.${globalName}`
  if (Object.keys(overrides).length === 0 && missing.length === 0) return `structuredClone(${base})`
  const cloned = `Object.assign(structuredClone(${base}),${JSON.stringify(overrides)})`
  if (missing.length === 0) return cloned
  const deletes = missing.map((key) => `delete m[${JSON.stringify(key)}];`).join("")
  return `(()=>{const m=${cloned};${deletes}return m})()`
}

function mostCommonModules(maps) {
  const votes = new Map()
  for (const modules of maps) {
    for (const [key, value] of Object.entries(modules)) {
      const encoded = JSON.stringify(value)
      let bucket = votes.get(key)
      if (!bucket) {
        bucket = new Map()
        votes.set(key, bucket)
      }
      bucket.set(encoded, (bucket.get(encoded) ?? 0) + 1)
    }
  }
  const base = {}
  const fileCount = maps.length
  for (const [key, bucket] of votes) {
    let winner = null
    let winnerCount = 0
    let total = 0
    for (const [encoded, count] of bucket) {
      total += count
      if (count > winnerCount) {
        winner = encoded
        winnerCount = count
      }
    }
    if (total === fileCount && winner !== null) base[key] = JSON.parse(winner)
  }
  return base
}

function extractValue(source, key) {
  const marker = `"${key}":`
  const start = source.indexOf(marker)
  if (start < 0) return null
  let index = start + marker.length
  while (source[index] === " " || source[index] === "\n") index++
  const open = source[index]
  if (open !== "{" && open !== "[") return null
  const close = open === "{" ? "}" : "]"
  let depth = 0
  let inString = false
  let escaped = false
  for (let cursor = index; cursor < source.length; cursor++) {
    const char = source[cursor]
    if (inString) {
      if (escaped) escaped = false
      else if (char === "\\") escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === open) depth++
    else if (char === close) {
      depth--
      if (depth === 0) return source.slice(index, cursor + 1)
    }
  }
  return null
}

async function walk(dir, out = []) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(fullPath, out)
    else out.push(fullPath)
  }
  return out
}
