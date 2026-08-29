---
name: project-context
description: Use when starting any task in tool-ae-expression to confirm the current project brief, what is in scope, what is owned by the host app, and which ADR / dev doc governs the area you are touching. Triggers on "what is this repo", "where does X live", "is Y in scope", or any task that has not yet been grounded in repo state.
---

# project-context

`AGENTS.md` を補完する repo brief。project-local の source of truth は
`AGENTS.md` / `docs/DEVELOPMENT.md` / `docs/adr/` / `package.json` の 4 系統。

## When to use

- task が始まった直後で repo state を再確認したいとき
- 自分の書いた変更が host app 側 (`@rebuildup/my-web-tools-ui`) に属するか
  この per-tool repo に属するか判断したいとき
- 「Y は in scope?」と疑ったとき

## Repo state (snapshot)

- Name: `tool-ae-expression`
- Owner: rebuildup (single-tool workspace under `@rebuildup/my-web-tools-ui`)
- Runtime: Vite 6 + React 19 + TypeScript 5.6
- Package manager: Bun
- Lint / format: Biome 1.9
- Remote: `github.com/rebuildup/tool-ae-expression`
- License: MIT

## Layout

| 場所 | 役割 |
| --- | --- |
| `src/` | この per-tool の source のみ |
| `src/AeExpressionApp.tsx` | placeholder root component |
| `src/index.ts` | public re-export (host の embed entry point) |
| `docs/DEVELOPMENT.md` | 開発手順 (日本語) |
| `docs/adr/0001-toolchain.md` | AI agent toolchain 決定 |
| `docs/adr/0002-architecture.md` | 役割 / 依存方向 / state 所有 |
| `.claude/skills/` | project-local Skills |
| `.tmp/` | 検証 artifact (gitignored) |
| `.reference/` | 参照 clone (gitignored) |

## Scope ownership

| 対象 | Owner |
| --- | --- |
| `src/**` | tool-ae-expression |
| `package.json` の `dependencies` / `devDependencies` | tool-ae-expression |
| `docs/**` (ADR, dev doc) | tool-ae-expression |
| `.claude/**` | tool-ae-expression |
| `link:../../ui/src` (host package) | `@rebuildup/my-web-tools-ui` — このリポジトリでは触らない |
| host app の routing / state / design system | `@rebuildup/my-web-tools-ui` |

## Boundaries

- 単一 React アプリとして `vite dev` / `vite build` できる
- host に embed される前提だが、host 側の変更を取り込まない
- per-tool 単体での release / versioning は当面行わない
- CI / release workflow を勝手に追加しない

## Reading order when unsure

1. `docs/DEVELOPMENT.md` — 何が動く状態かの最新 ground truth
2. `docs/adr/0002-architecture.md` — 責務 / 依存方向
3. `docs/adr/0001-toolchain.md` — tool 採否
4. `AGENTS.md` — dispatcher (不変条件)

ADR 同士の前後関係 (supersede / revise / 無効化) は各 ADR 先頭の
`Status:` / `Supersedes:` 行で確認する。