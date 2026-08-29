# ADR 0001 — AI agent toolchain (revised)

- Status: Revised (2026-08-29)
- Date: 2026-08-29
- Revision: 2026-08-29 — revised to reflect the actual source-only
  model introduced by PR #1 (`feat: migrate AE Expression sources from
  my-web-2025`). The previous version assumed a Vite-standalone toolchain
  with Bun / Biome / TypeScript configs in this repo. Those configs do not
  exist; validation now happens in the host (`my-web-2025`).

## Context

This repository is a per-tool source-only repo (see ADR 0002 for the
embed model). Observed facts after PR #1:

- `package.json` declares `@rebuildup/tool-ae-expression` as a
  `private: true` package with `main` / `types` / `exports` all pointing
  at `./src/index.ts`. **No** `scripts`, **no** `packageManager` field,
  **no** committed lockfile, **no** `devDependencies`.
- `dependencies`: `react`, `react-dom`, `lucide-react`.
  `peerDependencies`: `next ^16.3.0`.
- No `tsconfig.json`, no `biome.json`, no `vite.config.ts`.
- Source is TypeScript (`src/**/*.ts(x)`) validated only when the host's
  `tsc --noEmit` traverses this repo via filesystem layout.

## Decision

### Package manager
Bun is the host's package manager. **This repo does not commit a
lockfile** because `bun install` is not run here. The host maintains the
lockfile that transitively covers this code.

Rejected for this repo:
- npm / pnpm / yarn: would require lockfile + scripts that don't exist
- Adding `bun install` here: would re-create a separate dependency
  surface that diverges from the host

### Formatter / Lint
**None configured here.** The host (`my-web-2025`) runs Biome on its
full tree, which includes this repo's source via filesystem traversal.
No duplicate config in this repo.

Rejected:
- Adding Biome / ESLint / Prettier config here: creates dual config
  churn and drifts from host's choices
- Per-repo `lint` script with no config: would silently no-op

### Type check
**None configured here.** The host's `tsc --noEmit` covers this repo's
source.

If a per-repo type check becomes necessary later (e.g. to validate this
repo in isolation in CI), add `tsconfig.json` extending the host's
config. Deferred — adding it now would either duplicate host config or
introduce divergent config.

### Code intelligence (LSP)
TypeScript LSP via the `typescript` package's bundled server. Use the
host's project context (`my-web-2025`) for accurate module resolution,
because relative imports climb out of this repo into the host.

Rejected:
- Per-repo LSP setup: unnecessary because source resolves in the
  host's project graph

### Text search
`rg` / `rg --files`. Standard. No repo-specific config.

### Browser / UI verification
Performed in the host's context (`my-web-2025`'s `bun --bun next dev`).
This repo has no standalone dev server. Playwright / chrome-devtools MCP
operate at host level.

### Test framework
**None here.** When added (ADR 0002 § Re-evaluation conditions), prefer
Vitest in the host's context so tool tests integrate with the host's
runner. Per-repo Vitest would duplicate the host's setup.

### Dependency analysis
Knip at host level. Per-repo Knip is unnecessary given the small surface
(2 direct deps + 1 peer + no source exports beyond the public re-export).

### Container / Nix
None here. Host owns containerization.

### Persistent memory
None. Repository files are the source of truth per policy.

## Reproduction

This ADR's decisions are valid as long as:

1. Host `my-web-2025` has its own Bun / Biome / TypeScript toolchain
   that covers this repo's source via filesystem traversal.
2. Validation of any change to this repo runs the host's
   `bun run type-check`, `bun run lint`, `bun run build`, `bun run test`.

## Re-evaluation

Revisit when:

- A per-repo build pipeline becomes necessary (e.g. standalone
  previewing, isolated CI).
- Tool grows to a size where isolated CI is valuable.
- Host's toolchain changes in a way that breaks traversal of this repo.
- A per-repo test runner is requested and the duplication cost is
  justified.