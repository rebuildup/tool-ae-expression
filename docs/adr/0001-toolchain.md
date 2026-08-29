# ADR 0001 — AI agent toolchain

- Status: Accepted
- Date: 2026-08-29
- Scope: AI agent tooling and validation surface for this repository

## Context

このリポジトリは per-tool workspace の最小 scaffold である。AI コーディングエージェントが
日常的に使う validation surface、LSP、設定再現性を、project-local に閉じ込めて固定する
必要がある。`README.md` は host app への embed を前提とする per-tool であることを示し、
`package.json` には Bun / Vite / React 19 / TypeScript / Biome が既に宣言されている。

## Decision

### Package manager
Bun を唯一の package manager として採用する。`bun install`、`bun run`、`bunx` を使う。
`package-lock.json`、`pnpm-lock.yaml`、`yarn.lock`、`bun.lockb` の混在は禁止。
Bun 自体は official maintained distribution (`oven-sh/bun`) で、cross-platform
(Windows / WSL / Linux / macOS) の動作が確認済み。host toolchain に既に `bun 1.4.0`
が導入されている。

Rejected:
- npm: lockfile semantics と script 解決が Bun より冗長
- pnpm: workspace 機能を本リポジトリで使う予定がないため導入コストが見合わない
- Yarn: 公式の新規採用は衰退傾向

### Formatter / Lint
Biome を formatter と lint に使う。Biome は Rust 単一バイナリで高速、
TypeScript / JSX / JSON を内包し、ESLint + Prettier の二重管理を避けられる。
`package.json` の `lint` / `format` script は Biome を呼ぶ。

Rejected:
- ESLint + Prettier: 設定ファイルが 2 系統に分裂し、`.eslintrc` と `.prettierrc` の
  同期が必要
- dprint: 安定だが Biome ほど TypeScript エコシステムで普及していない

### Type check
TypeScript 5.6 を `tsc -b` (project references mode) で動かす。type errors は warning
扱いにせず、CI / `bun run typecheck` で必ず fail させる。

Note: 現時点で `tsconfig.json` が未作成。最初の実装タスクで `tsconfig` + 必要な
sub-config (`tsconfig.app.json`, `tsconfig.node.json`) を Vite 公式 recommendation に
従って追加する (ADR 0002 参照)。

### Code intelligence (LSP)
TypeScript LSP は `typescript` パッケージ内蔵の server を Claude Code の LSP 機能から
利用することを前提とする。重複した LSP server (deno-lsp / biome LSP) は導入しない。
`ast-grep` は structural refactor が必要になった時点で再評価する。

Rejected:
- `tsserver` 単独設定: agent harness から見ると TypeScript LSP と等価で重複
- serena: symbol-level navigation は本リポジトリの規模 (< 100 source LOC) では不要

### Text search
ripgrep を標準 text search として使う。Glob はリポジトリ規模では ripgrep の
`--files` / glob filter で十分に代替可能。rg がない環境でも `bunx --bun ripgrep`
または git の `grep` で代替できるが、project-local な必須要件にはしない。

### Browser / UI verification
Vite 経由の `vite preview` で local build を確認するのは充分。当面 Playwright の
導入は不要。`vite preview` が production build 不可になった時点、または
実際に screenshot / interaction 検証が必要になった時点で Playwright を再評価する。

Rejected:
- Playwright: 導入コスト (browser binaries) が現実の利点を上回らない
- chrome-devtools MCP: 人間の対話的 debugging には有用だが、agent の通常 operation
  には重い。Chrome DevTools 系の Skill は既存 (`chrome-devtools-mcp:chrome-devtools`)
  なので、必要時に global skill として呼び出し可能

### Test framework
現時点では test framework を導入しない。`package.json` の `test` script は
lint + build の合成 gate として残っている。Vitest を導入するなら:
1. `Vitest` の `pnpm dlx create-vitest` ではなく手動で `vitest`, `@vitest/ui`,
   `jsdom` を dependency に追加
2. behavior-based test を書く (private implementation detail はテストしない)
3. coverage は lines / statements / functions / branches すべて ≥ 80%

を導入条件とする。テストが意味を持つ機能が増えるまで保留する。

Rejected:
- Jest: ESM での挙動差分が大きく、Biome とも競合しがち
- Node `node:test`: native だが coverage / mock 機能が貧弱

### Dependency analysis
当面の dependency 表面が小さい (5 packages) ため Knip は導入しない。
dependency が 20 を超えた時点、または unused 候補を見つけた時点で再評価する。

### Container / Nix
container deliverable ではないため Dockerfile / Containerfile / Nix flake を
導入しない。system dependency は host の Bun + Node で完結する。

### Persistent memory
暗黙の persistent memory (claude-mem 等) を project truth として使わない。
repository の `docs/`、`AGENTS.md`、ADR、Skill が source of truth。

## Reproduction

この ADR の決定を fresh clone から再現するには:

```sh
bun install
bun run lint
bun run typecheck  # 最初の実装タスクで tsconfig 配置後に成立
bun run build
```

`node_modules` を超えて再現性に必須なものは `bun.lockb` (将来生成される) のみ。

## Re-evaluation

次のいずれかに該当したら本 ADR を見直す:

- このリポジトリが test framework を必要とする規模に達した
- 別 host toolchain (Deno / Node-only) への移行指示が出た
- Biome がメンテナンスを停止した
- 規模拡大により Knip / ast-grep などの static analysis が必要になった