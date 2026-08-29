---
name: validate
description: Use when finishing any implementation task in tool-ae-expression — runs the canonical quality gate end-to-end (install, lint, type-check, build, smoke test) and reports pass/fail with the exact command output. Triggers on "validate", "run checks", "is it green", "quality gate", "everything passes", or any task ending step.
---

# validate

実装タスク完了直前に必ず通す canonical quality gate。
`AGENTS.md` の validation entry point を具体コマンド列へ展開し、
skip / ignore / suppression を残さずに合格させる。

## When to use

- 実装 task の完了直前
- 「build 通った?」「全部緑?」と聞かれたとき
- commit 直前の sanity check
- 「CI でコケた」と報告された task の再現

## Canonical command sequence

現行 `package.json` scripts に基づく順序 (依存関係あり: 後の step は前の step
が green でないと意味がない):

```sh
# 1) install (lockfile 変更があれば commit 前)
bun install

# 2) formatter / lint
bun run lint

# 3) type check
bun run typecheck

# 4) build (prod bundle)
bun run build

# 5) 合成 gate (lint + build の逐次実行)
bun run test
```

`bun run test` は現状 `bun run lint && bun run build` の合成。test framework
未導入の段階では最後の gate として扱う。

## Pre-flight checks

実行前に次を確認:

1. `package.json` に上記 scripts が全て存在するか。
   無ければ ADR 0001 / `docs/DEVELOPMENT.md` を読んで正しい script 名を使う。
2. `bun.lock` (Bun lockfile) が committed されているか。
3. `node_modules/` が missing なら `bun install` を最初に 1 回だけ実行。
4. host package (`link:../../ui/src`) が無くて `bun install` が失敗する場合、
   失敗を逆手に取り ADR 0002 の scope 確認 — host 依存は per-tool の責務外。

## Post-conditions

合格条件:

- 全 step の exit code が 0
- Biome / TypeScript / Vite から actionable warning が出ていない
  (suppressed でなく、出ていない)
- skip / `.only` / blanket ignore / warning suppression を使っていない
- scope を縮小していない (要求された全範囲が動作している)

不合格時の対処:

1. 失敗 step を 1 個だけ直す (cherry-picking で判明する)
2. 同じ cherry-picked fix を `bun run typecheck` まで繰り返し上流から流す
3. blanket な `--no-warn` / ignore / skip を入れない
4. 必要なら該当 ADR / dev doc を更新する

## ADR / doc references

- `docs/adr/0001-toolchain.md` — Bun / Biome / Vite / TS の根拠
- `docs/adr/0002-architecture.md` — host 依存失敗時の責務境界
- `docs/DEVELOPMENT.md` — 詳細手順

## Anti-patterns

- `|| true` で exit code を握り潰す
- ignore / suppress を追加して lint を green に見せる
- `bun run build` を skip して type-check だけ緑にする (commit の意味が消える)
- `bun run test` だけが緑なら満足し、type-check を走らせない