---
name: project-context
description: Use when starting any task in tool-ae-expression to confirm the current project brief, what is in scope, what is owned by the host app, and which ADR / dev doc governs the area you are touching. Triggers on "what is this repo", "where does X live", "is Y in scope", or any task that has not yet been grounded in repo state.
---

# project-context

`AGENTS.md` を補完する repo brief。project-local の source of truth は
`AGENTS.md` / `docs/DEVELOPMENT.md` / `docs/adr/` / `package.json` の 4 系統。

## When to use

- task が始まった直後で repo state を再確認したいとき
- 自分の書いた変更が host app 側 (`my-web-2025`) に属するか、この per-tool
  repo に属するか判断したいとき
- 「Y は in scope?」と疑ったとき

## Repo state (snapshot)

- Repo: `tool-ae-expression`
- Package: `@rebuildup/tool-ae-expression` (private)
- Owner: rebuildup (per-tool workspace under `my-web-2025` host)
- Runtime: Next.js 16 (peer) + React 19 + TypeScript
- Icons: `lucide-react`
- Package manager: Bun (host-managed; no committed lockfile here)
- Lint / format: Biome (host-managed; no config here)
- Remote: `github.com/rebuildup/tool-ae-expression`
- License: MIT
- Source surface: ~1320 LOC across `src/`

## Layout

| 場所 | 役割 |
| --- | --- |
| `src/index.ts` | public re-export (host の embed entry point) |
| `src/AeExpressionApp.tsx` | Next.js page-level entry (Breadcrumb + tool) |
| `src/components/AEExpressionTool.tsx` | tool root; host の `ToolWrapper` を使用 |
| `src/components/ExpressionControls.tsx` | search / filter / preferences UI |
| `src/components/ExpressionList.tsx` | 選択可能式 expression 一覧 |
| `src/components/ExpressionParameters.tsx` | パラメータ入力 |
| `src/components/ExpressionOutput.tsx` | 生成コード + validation + preview |
| `src/components/useAEExpressionTool.ts` | state hook (tool-local state 全部) |
| `src/components/ae-expression-data.ts` | static expression 定義 |
| `src/components/ae-expression-types.ts` | domain types |
| `src/components/ae-expression-utils.ts` | filtering / generation / validation |
| `docs/DEVELOPMENT.md` | 開発手順 (日本語) |
| `docs/adr/0001-toolchain.md` | AI agent toolchain 決定 (revised) |
| `docs/adr/0002-architecture.md` | per-tool source-only architecture (revised) |
| `docs/adr/0003-pr-driven-workflow.md` | PR-driven workflow + main protection |
| `.claude/skills/` | project-local Skills |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR テンプレート |
| `.github/branch-protection.json` | branch protection rule の source of truth |
| `.tmp/` | 検証 artifact (gitignored) |
| `.reference/` | 参照 clone (gitignored) |

## Scope ownership

| 対象 | Owner |
| --- | --- |
| `src/**` | tool-ae-expression |
| `package.json` | tool-ae-expression (name / deps / peerDeps のみ) |
| `docs/**` (ADR, dev doc) | tool-ae-expression |
| `.claude/**` | tool-ae-expression |
| `.github/PULL_REQUEST_TEMPLATE.md` / `branch-protection.json` | tool-ae-expression |
| `ToolWrapper` (`my-web-2025/src/components/tools-ui/ToolWrapper.tsx`) | `my-web-2025` — このリポジトリでは **触らない** |
| host app の routing / state / design system | `my-web-2025` |
| build / lint / type-check / test pipeline | `my-web-2025` |
| `bun.lock` | `my-web-2025` |
| `tsconfig.json` / `biome.json` | `my-web-2025` |

## Boundaries

- 単一 source-only repo として host の filesystem traversal で評価される
- host に embed される前提だが、host 側の source は触らない
- per-tool 単体での release / versioning は行わない (host の lockfile に
  従属)
- per-tool 単体に build / lint / test pipeline は持たない (ADR 0001)
- CI / release workflow を勝手に追加しない
- sibling layout (`Desktop/tool-ae-expression/` の隣に
  `Desktop/my-web-2025/`) を維持しないと host からの import が壊れる

## Reading order when unsure

1. `docs/DEVELOPMENT.md` — 何が動く状態かの最新 ground truth
2. `docs/adr/0002-architecture.md` — 責務 / 依存方向 / sibling layout 制約
3. `docs/adr/0001-toolchain.md` — tool 採否 (host 側 toolchain の参照)
4. `docs/adr/0003-pr-driven-workflow.md` — PR-driven + main protection
5. `AGENTS.md` — dispatcher (不変条件)

ADR 同士の前後関係 (supersede / revise / 無効化) は各 ADR 先頭の
`Status:` / `Supersedes:` / `Revision:` 行で確認する。