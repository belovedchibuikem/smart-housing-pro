import { spawnSync } from "node:child_process"

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

process.exit(result.status ?? 1)
