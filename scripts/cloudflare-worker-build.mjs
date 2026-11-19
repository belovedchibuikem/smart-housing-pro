import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import { readdir, readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"

// Workers Builds runs `pnpm run build`, then `npx wrangler deploy`.
// Package the Next.js output for OpenNext here so deploy does not run
// Wrangler's interactive migrator, which reinstalls dependencies with npm
// and drops the platform lightningcss binary.
if (process.env.WORKERS_CI !== "1") {
  process.exit(0)
}

// Each page manifest repeats the same ~76 KiB clientModules map. OpenNext
// inlines those copies into the Worker, and the resulting ~52 MiB script
// exceeds the 128 MiB isolate memory limit at runtime (Error 1102).
const dedupe = spawnSync(process.execPath, ["./scripts/dedupe-rsc-manifests.mjs"], {
  stdio: "inherit",
})
if ((dedupe.status ?? 1) !== 0) {
  process.exit(dedupe.status ?? 1)
}

// Matches Next's minified installChunk:
//   b=b=>{var d=b.modules,e=b.ids,f=b.runtime;for(var g in d)c.o(d,g)&&(c.m[g]=d[g]);f&&f(c);for(var h=0;h<e.length;h++)a[e[h]]=1}
const INSTALL_CHUNK =
  /([A-Za-z_$][\w$]*)=(\1)=>\{var ([A-Za-z_$][\w$]*)=\1\.modules,([A-Za-z_$][\w$]*)=\1\.ids,([A-Za-z_$][\w$]*)=\1\.runtime;for\(var ([A-Za-z_$][\w$]*) in \3\)([A-Za-z_$][\w$]*)\.o\(\3,\6\)&&\(\7\.m\[\6\]=\3\[\6\]\);\5&&\5\(\7\);for\(var ([A-Za-z_$][\w$]*)=0;\8<\4\.length;\8\+\+\)([A-Za-z_$][\w$]*)\[\4\[\8\]\]=1\}/g

async function patchWebpackChunkInstall() {
  const roots = [".next/server", ".next/standalone/.next/server"]
  let patched = 0
  for (const root of roots) {
    let names = []
    try {
      names = await readdir(root)
    } catch {
      continue
    }
    for (const name of names) {
      if (name !== "webpack-runtime.js" && name !== "webpack-api-runtime.js") continue
      const file = path.join(root, name)
      const source = await readFile(file, "utf8")
      if (source.includes(".default.modules")) {
        patched++
        continue
      }
      INSTALL_CHUNK.lastIndex = 0
      if (!INSTALL_CHUNK.test(source)) {
        throw new Error(
          `Could not patch webpack chunk install in ${file}. The not-found page would keep crashing on missing chunk.ids.`,
        )
      }
      INSTALL_CHUNK.lastIndex = 0
      const next = source.replace(INSTALL_CHUNK, (_match, fn, _same, modules, ids, runtime, key, webpack, index, installed) => {
        return (
          `${fn}=${fn}=>{` +
          `if(${fn}&&${fn}.default&&${fn}.default.modules)${fn}=${fn}.default;` +
          `var ${modules}=${fn}&&${fn}.modules,${ids}=${fn}&&${fn}.ids,${runtime}=${fn}&&${fn}.runtime;` +
          `if(${modules})for(var ${key} in ${modules})${webpack}.o(${modules},${key})&&(${webpack}.m[${key}]=${modules}[${key}]);` +
          `${runtime}&&${runtime}(${webpack});` +
          `if(${ids})for(var ${index}=0;${index}<${ids}.length;${index}++)${installed}[${ids}[${index}]]=1;` +
          `else if(${fn}&&typeof ${fn}.id=="number")${installed}[${fn}.id]=1}`
        )
      })
      await writeFile(file, next)
      patched++
      console.log(`Patched webpack chunk install in ${file}`)
    }
  }
  if (patched === 0) {
    throw new Error("No webpack runtime was found to patch. Refusing to build a worker that crashes on unknown paths.")
  }
}

// A missing static file (for example /favicon.ico) is rendered by
// app/_not-found/page.js. That page installs webpack chunks with
// `for (...; h < chunk.ids.length; ...)`. After Wrangler bundles the worker,
// the required chunk can be a module namespace that has `.modules` but not
// `.ids`, and reading `.length` throws before the 404 can render.
await patchWebpackChunkInstall()

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
