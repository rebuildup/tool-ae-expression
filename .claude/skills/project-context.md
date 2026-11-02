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
- Owner: rebuildup (per-tool repo; built artefact is embedded by the
  `my-web-2026` Tool Registry as a `same_origin_static` iframe)
- Runtime: browser SPA (React 19 + TypeScript); build は Vite 7
- Icons: `lucide-react`
- Package manager: pnpm (committed `pnpm-lock.yaml`)
- Lint / format: 未設定 (known debt, ADR 0001)
- Remote: `github.com/rebuildup/tool-ae-expression`
- License: MIT
- Source surface: ~1500 LOC across `src/`

## Layout

| 場所 | 役割 |
| --- | --- |
| `index.html` | standalone SPA の entry document (`#root`) |
| `src/index.ts` | public re-export (host の embed entry point) |
| `src/main.tsx` | standalone SPA の mount (createRoot + StrictMode) |
| `src/AeExpressionApp.tsx` | app shell (breadcrumb はテキスト描画) |
| `src/components/AEExpressionTool.tsx` | tool root; この repo の `ToolWrapper` を使用 |
| `src/components/ToolWrapper.tsx` | この repo が所有する shell |
| `src/components/ExpressionControls.tsx` | search / filter / preferences UI |
| `src/components/ExpressionList.tsx` | 選択可能式 expression 一覧 |
| `src/components/ExpressionParameters.tsx` | パラメータ入力 |
| `src/components/ExpressionOutput.tsx` | 生成コード + validation + preview |
| `src/components/useAEExpressionTool.ts` | state hook (tool-local state 全部) |
| `src/components/ae-expression-storage.ts` | localStorage + メモリ fallback |
| `src/components/ae-expression-clipboard.ts` | clipboard + `execCommand` fallback |
| `src/components/ae-expression-theme.ts` | inline style 用の design token |
| `src/components/ae-expression-data.ts` | static expression 定義 |
| `src/components/ae-expression-types.ts` | domain types |
| `src/components/ae-expression-utils.ts` | filtering / generation / validation |
| `docs/DEVELOPMENT.md` | 開発手順 (日本語) |
| `docs/adr/0001-toolchain.md` | AI agent toolchain 決定 (revised) |
| `docs/adr/0002-architecture.md` | standalone Tool repo architecture (revised) |
| `docs/adr/0003-pr-driven-workflow.md` | PR-driven workflow + main protection |
| `docs/adr/0004-standalone-embed-build.md` | standalone build + iframe 埋め込み契約 |
| `.claude/skills/` | project-local Skills |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR テンプレート |
| `.github/branch-protection.json` | branch protection rule の source of truth |
| `.tmp/` | 検証 artifact (gitignored) |
| `.reference/` | 参照 clone (gitignored) |

## Scope ownership

| 対象 | Owner |
| --- | --- |
| `src/**` | tool-ae-expression |
| `package.json` / `pnpm-lock.yaml` / `pnpm-workspace.yaml` | tool-ae-expression |
| `tsconfig.json` / `vite.config.ts` / `index.html` | tool-ae-expression |
| `docs/**` (ADR, dev doc) | tool-ae-expression |
| `.claude/**` | tool-ae-expression |
| `.github/PULL_REQUEST_TEMPLATE.md` / `branch-protection.json` | tool-ae-expression |
| host app の routing / state / design system | host (`my-web-2026`) — このリポジトリでは **触らない** |
| Tool Registry manifest / delivery 設定 | host (`my-web-2026`) — Issue #773 |

## Boundaries

- standalone に build できる per-tool repo (ADR 0004)。host には build 済み
  artefact (`dist/`) を同一 origin 配下で配信する artefact として統合される
- host 側の source は触らない。host への import (`next/*` /
  `../../../../src/...`) を新たに持ち込まない
- host ルート (`/` / `/tools`) はテキスト描画。iframe 内で link を辿ると
  frame が host へ遷移するため
- per-tool 単体の release / versioning は行わない
- CI / release workflow を勝手に追加しない

## Reading order when unsure

1. `docs/DEVELOPMENT.md` — 何が動く状態かの最新 ground truth
2. `docs/adr/0004-standalone-embed-build.md` — standalone build と埋め込み契約
3. `docs/adr/0002-architecture.md` — 責務 / 依存方向
4. `docs/adr/0001-toolchain.md` — tool 採否 (この repo が所有する toolchain)
5. `docs/adr/0003-pr-driven-workflow.md` — PR-driven + main protection
6. `AGENTS.md` — dispatcher (不変条件)

ADR 同士の前後関係 (supersede / revise / 無効化) は各 ADR 先頭の
`Status:` / `Supersedes:` / `Revision:` 行で確認する。