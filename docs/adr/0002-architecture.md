# ADR 0002 — Architecture: per-tool source-only repo (revised)

- Status: Revised (2026-08-29)
- Date: 2026-08-29
- Supersedes: the original "Vite standalone" assumption documented in
  this ADR's prior version and in `AGENTS.md` Toolchain section before
  PR #1. The previous "the host machine has no `ui/src` link target"
  claim was wrong — `my-web-2025` IS present at `Desktop/my-web-2025/`
  and the embed model is filesystem-relative import, not package
  linking.
- Revision: 2026-08-29 — revised to match the Next.js consumer model
  introduced by PR #1 (`feat: migrate AE Expression sources from
  my-web-2025`).

## Context

This repository is a **per-tool source-only repo** that contributes one
tool (`tool-ae-expression`) to the host application (`my-web-2025`).
PR #1 migrated the actual React/Next.js implementation from
`my-web-2025`'s monorepo into this repo.

Observed facts after PR #1:

- `package.json` declares `@rebuildup/tool-ae-expression` as a `private`
  package with `main` / `types` / `exports` all pointing at
  `./src/index.ts`. No Vite, no Biome, no build script. No
  `packageManager` field, no committed lockfile.
- `dependencies`: `react`, `react-dom`, `lucide-react`.
  `peerDependencies`: `next ^16.3.0`.
- `src/components/AEExpressionTool.tsx` imports
  `../../../../src/components/tools-ui/ToolWrapper` — a relative path
  that resolves to
  `Desktop/my-web-2025/src/components/tools-ui/ToolWrapper.tsx` when
  this repo lives at `Desktop/tool-ae-expression/` as a sibling of
  `my-web-2025/`.
- `src/AeExpressionApp.tsx` is a Next.js page wrapper using `next/link`
  and Tailwind utility classes.
- `src/components/useAEExpressionTool.ts` owns ~15 pieces of tool-local
  state via `useState` (search term, selected category, parameters,
  saved expressions, etc.). No persistence beyond in-memory state.
- `src/components/ae-expression-data.ts` holds ~286 lines of static
  expression definitions (no I/O, no fetch).
- Total source surface: ~1320 LOC across `src/`.

The repo is therefore:

- A pure source-only package — no standalone build, no dev server, no
  test framework, no formatter/lint config.
- Validated indirectly by `my-web-2025`'s build (`bun run type-check`,
  `bun run build`, `bun run lint`) which traverses this code via the
  filesystem layout.

## Decision

### Role boundaries

This repository:

- Owns **per-tool source** for one tool: `tool-ae-expression`.
- Has **no build pipeline of its own**. Compilation, lint, type-check,
  and bundling all happen in the host app's context.
- Is consumed by `my-web-2025` via filesystem-relative imports, **not**
  via `package.json` `link:` and **not** via registry publishing. Layout
  requirement: this repo must live at `Desktop/tool-ae-expression/` as a
  sibling of `Desktop/my-web-2025/`.
- Is **private** — never published to npm. The `@rebuildup/tool-*`
  namespace is reserved for in-workspace identifiers only.

### What is intentionally out of scope here

- Build / dev server / bundler config (host owns these).
- Test framework (host owns these; tool-level tests would re-enter
  host's test runner when added).
- Lint / formatter config (host owns these).
- Documentation for host-side embedding protocol
  (`my-web-2025/spec/`); that spec lives in `my-web-2025` itself.
- Internationalization (decided at host level).
- Persistence of user data (`savedExpressions` etc.). Tool owns the
  in-memory state shape; persistence layer (host CMS / localStorage /
  etc.) is host's responsibility.

### Source layout

```
.
├── AGENTS.md                              # dispatcher
├── README.md                              # public overview (English)
├── LICENSE                                # MIT
├── package.json                           # @rebuildup/tool-ae-expression, private
├── src/
│   ├── index.ts                           # public re-export (entry point)
│   ├── AeExpressionApp.tsx                # Next.js page wrapper (Breadcrumb + tool)
│   └── components/
│       ├── AEExpressionTool.tsx           # tool root; uses host's ToolWrapper
│       ├── ExpressionControls.tsx         # search/filter/preferences UI
│       ├── ExpressionList.tsx             # selectable list of expressions
│       ├── ExpressionParameters.tsx       # per-expression parameter inputs
│       ├── ExpressionOutput.tsx           # generated code + validation + preview
│       ├── useAEExpressionTool.ts         # state hook (all tool-local state)
│       ├── ae-expression-data.ts          # static expression definitions
│       ├── ae-expression-types.ts         # domain types
│       └── ae-expression-utils.ts         # filtering / generation / validation
├── docs/
│   ├── DEVELOPMENT.md                     # internal dev guide (Japanese)
│   └── adr/
│       ├── 0001-toolchain.md              # AI agent toolchain (revised)
│       ├── 0002-architecture.md           # this ADR (revised)
│       └── 0003-pr-driven-workflow.md     # PR-driven + main protection
├── .claude/
│   └── skills/                            # project-local Agent Skills
└── .github/
    ├── PULL_REQUEST_TEMPLATE.md
    └── branch-protection.json
```

### Dependency direction

- `src/index.ts` → `src/AeExpressionApp.tsx`
- `src/AeExpressionApp.tsx` → `src/components/AEExpressionTool.tsx`
  + `next/link` (peer)
- `src/components/AEExpressionTool.tsx` →
  `../../../../src/components/tools-ui/ToolWrapper` (host app, **not**
  this repo) + sibling components in `src/components/`
- `src/components/useAEExpressionTool.ts` →
  `src/components/ae-expression-{data,types,utils}.ts`

The cross-host relative import is the **single fragile coupling** of
this model. The tool repo MUST live as a sibling of `my-web-2025` for
the import to resolve. If this layout changes, the import must be
updated here.

### State ownership

- All tool-local state lives in `useAEExpressionTool` (one hook, ~15
  `useState` calls). UI components receive state and setters as props
  from `AEExpressionTool`.
- Persistence: not implemented at tool level. `savedExpressions` is
  in-memory only. If persistence is needed, the hook should be
  refactored to accept a persistence adapter from the host.

### Naming

- `src/AeExpressionApp.tsx` is the **Next.js page-level entry**. The
  `App` suffix communicates "Next.js route entry".
- `src/components/AEExpressionTool.tsx` is the **tool-level root** (the
  unit the host treats as embeddable). The `Tool` suffix matches the
  host's `ToolWrapper` naming convention.
- Internal components (`ExpressionControls`, `ExpressionList`, etc.)
  drop the `AE` / `Tool` prefix when scoped within the tool — the
  surrounding folder already conveys context.
- `ae-expression-data.ts` / `ae-expression-types.ts` /
  `ae-expression-utils.ts` use kebab-case (matches the file's domain
  name, not the namespace).
- Dumping-ground names (`utils`, `helpers`, `common`, `misc`, `manager`)
  forbidden. Note: `ae-expression-utils.ts` is **not** a dumping-ground;
  it holds this tool's domain-specific pure functions (filtering /
  generation / validation).

### Persistence boundaries

- Per-tool: none. State resets on remount.
- If persistence is added: receive a `persistenceAdapter` prop or
  context from host; do not touch `localStorage` / `IndexedDB` directly.

### Side-effect boundaries

- No `fetch` / `WebSocket` / `Worker` in current code. If added: go
  through host's effect API, not directly.
- `validateExpression` is pure (no I/O). Keep this invariant.

## Consequences

- This repo alone cannot be built, linted, type-checked, or tested. The
  canonical validation entry point lives in `my-web-2025`'s scripts.
- Moving this repo to a different filesystem path will break the
  `../../../../src/components/tools-ui/ToolWrapper` import.
- The `@rebuildup/tool-ae-expression` package name is reserved for
  in-workspace identification only. Do not publish to npm.

## Reproduction

This ADR's assumptions are satisfied when:

1. `Desktop/tool-ae-expression/` exists as a sibling of
   `Desktop/my-web-2025/`.
2. `my-web-2025/src/components/tools-ui/ToolWrapper.tsx` exists.
3. `my-web-2025`'s `bun run type-check` and `bun run build` traverse
   this tool's source.

## Re-evaluation

Revisit when:

- The embed mechanism changes (e.g. switch to `link:` protocol,
  monorepo tool, or published package).
- Tool gains its own persistence layer.
- A per-tool test runner is required (Vitest in this repo).
- Host's `ToolWrapper` interface changes in a breaking way.
- Next.js major version is bumped.
- This repo's filesystem layout changes (host import path must be
  updated).