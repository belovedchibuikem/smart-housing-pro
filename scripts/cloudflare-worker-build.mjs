import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import { readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"

// Workers Builds runs `pnpm run build`, then `npx wrangler deploy`.
// Package the Next.js output for OpenNext here so deploy does not run
// Wrangler's interactive migrator, which reinstalls dependencies with npm
// and drops the platform lightningcss binary.
if (process.env.WORKERS_CI !== "1") {
  process.exit(0)
}

const result = spawnSync(
  "pnpm",
  ["exec", "opennextjs-cloudflare", "build", "--skipNextBuild"],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  },
)

if ((result.status ?? 1) !== 0) {
  process.exit(result.status ?? 1)
}

// `wrangler deploy` detects this OpenNext app and bundles `.open-next/worker.js`
// again. That second bundle does not minify unless wrangler.jsonc sets
// `"minify": true`, so it pretty-prints handler.mjs and the uploaded module
// is larger than the file this script writes (about 51 MiB on disk vs
// ~66,223 KiB in the Wrangler size report). Keep names intact: OpenNext
// refuses identifier mangling because Next's server runtime depends on them.
await minifyWorkerBundles()

async function minifyWorkerBundles() {
  const require = createRequire(import.meta.url)
  const wranglerDir = path.dirname(require.resolve("wrangler/package.json"))
  const esbuild = require(require.resolve("esbuild", { paths: [wranglerDir] }))
  const files = [
    ".open-next/server-functions/default/handler.mjs",
    ".open-next/middleware/handler.mjs",
  ]

  for (const file of files) {
    let before = 0
    try {
      before = (await stat(file)).size
    } catch {
      continue
    }
    const source = await readFile(file, "utf8")
    const transformed = await esbuild.transform(source, {
      minifyWhitespace: true,
      minifySyntax: true,
      minifyIdentifiers: false,
      legalComments: "none",
      target: "esnext",
    })
    await writeFile(file, transformed.code)
    const after = (await stat(file)).size
    console.log(
      `Minified ${file}: ${(before / 1024 / 1024).toFixed(1)} MiB -> ${(after / 1024 / 1024).toFixed(1)} MiB`,
    )
  }
}
