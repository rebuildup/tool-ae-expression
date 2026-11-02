---
name: validate
description: Use when finishing any implementation task in tool-ae-expression — runs the canonical quality gate end-to-end in this repository and reports pass/fail with the exact command output. Triggers on "validate", "run checks", "is it green", "quality gate", "everything passes", or any task ending step.
---

# validate

実装タスク完了直前に必ず通す canonical quality gate。
`AGENTS.md` の validation entry point を具体コマンド列へ展開し、
skip / ignore / suppression を残さずに合格させる。

この repo は **standalone に build できる** (ADR 0004)。validation は
**この repo 単体** で実行する。

## When to use

- 実装 task の完了直前
- 「build 通った?」「全部緑?」と聞かれたとき
- commit 直前の sanity check
- 「CI でコケた」と報告された task の再現

## Canonical command sequence

この repo の scripts を順に実行する。各 step は前の step が green で
ないと意味がない。

```sh
# 1) install (lockfile 変更があれば commit 前)
pnpm install --frozen-lockfile

# 2) type check
pnpm run type-check

# 3) build
pnpm run build
```

build 後に目視確認する:

```sh
# asset 参照が相対であること
grep -o 'src="[^"]*"' dist/index.html

# next import が 0 件であること
grep -rn "next/" src/

# host リポジトリへの相対 import が無いこと
grep -rn "\.\./\.\./\.\./\.\./" src/

# dist が commit 対象に入っていないこと
git status --short
```

## Pre-flight checks

実行前に次を確認:

1. `pnpm` が使えること (Node.js + pnpm 12 系)。
2. `pnpm-lock.yaml` が commit 済みであること。lockfile をした結果
   だけ commit する。
3. `src/` に `next/` の import と host リポジトリへの相対 import が
   無いこと。

## Post-conditions

合格条件:

- 全 step の exit code が 0
- TypeScript / Vite から actionable warning が出ていない
  (suppressed でなく、出ていない)
- `dist/index.html` の asset 参照が相対 (`./assets/...`)
- `dist/` が commit されていない
- skip / `.only` / blanket ignore / warning suppression を使っていない
- scope を縮小していない (要求された全範囲が動作している)

不合格時の対処:

1. 失敗 step を 1 個だけ直す (chercherry-picking で判明する)
2. 同じ fix を `pnpm run type-check` まで繰り返し上流から流す
3. blanket な `--no-warn` / ignore / skip を入れない
4. 必要なら該当 ADR / dev doc を更新する
5. host 側の都合で本 repo の source を host に依存させない (ADR 0004)

## ADR / doc references

- `docs/adr/0001-toolchain.md` — この repo が所有する toolchain
- `docs/adr/0002-architecture.md` — standalone Tool repo の architecture
- `docs/adr/0003-pr-driven-workflow.md` — PR-driven + main protection
- `docs/adr/0004-standalone-embed-build.md` — standalone build と iframe 埋め込み契約
- `docs/DEVELOPMENT.md` — 詳細手順

## Anti-patterns

- `|| true` で exit code を握り潰す
- ignore / suppress を追加して lint を green に見せる
- `pnpm run build` を skip して type-check だけ緑にする (commit の意味が消える)
- `dist/` を commit する
- host への相対 import や `next` import を reinstate する
- 実ブラウザ / iframe 内の操作を未検証のまま「動作する」と報告する
