---
name: validate
description: Use when finishing any implementation task in tool-ae-expression — runs the canonical quality gate end-to-end via the host app's toolchain and reports pass/fail with the exact command output. Triggers on "validate", "run checks", "is it green", "quality gate", "everything passes", or any task ending step.
---

# validate

実装タスク完了直前に必ず通す canonical quality gate。
`AGENTS.md` の validation entry point を具体コマンド列へ展開し、
skip / ignore / suppression を残さずに合格させる。

この repo は **per-tool source-only** であり build / lint / type-check /
test pipeline を持たない (ADR 0001)。validation は **host
(`my-web-2025`) 側** で実行する。

## When to use

- 実装 task の完了直前
- 「build 通った?」「全部緑?」と聞かれたとき
- commit 直前の sanity check
- 「CI でコケた」と報告された task の再現

## Canonical command sequence

host (`my-web-2025`) 側の scripts を順に実行する。各 step は前の step が
green でないと意味がない。`cd ../my-web-2025` で sibling に移動してから
host の commands を直接叩く:

```sh
# sibling の host に移動
cd ../my-web-2025

# 1) install (lockfile 変更があれば commit 前)
bun install --frozen-lockfile

# 2) type check (host)
bun run type-check

# 3) formatter / lint (host)
bun run lint

# 4) build (host)
bun run build

# 5) tests (host)
bun run test
```

`my-web-2025` の host toolchain がこの tool の source を filesystem
traversal でカバーする。host の CI が green であればこの tool も green。

## Pre-flight checks

実行前に次を確認:

1. `my-web-2025` が sibling として存在するか
   (`ls ../my-web-2025/package.json` で確認)。無ければ host 側 setup が
   完了していない。
2. `my-web-2025` の `package.json` scripts に上記 5 step が全て存在するか
   (ADR 0001 を満たす前提)。
3. `my-web-2025/src/components/tools-ui/ToolWrapper.tsx` が存在するか。
   import 経路の前提条件。
4. host package の `tsconfig.json` がこの repo の source をカバーするか
   (host の `include` 設定に依存)。
5. host 側で `bun install` 済みか。`node_modules` が無ければ 1) を最初に
   1 回だけ実行。

## Post-conditions

合格条件:

- 全 step の exit code が 0
- Biome / TypeScript / Next.js から actionable warning が出ていない
  (suppressed でなく、出ていない)
- skip / `.only` / blanket ignore / warning suppression を使っていない
- scope を縮小していない (要求された全範囲が動作している)

不合格時の対処:

1. 失敗 step を 1 個だけ直す (chercherry-picking で判明する)
2. 同じ fix を `bun run type-check` まで繰り返し上流から流す
3. blanket な `--no-warn` / ignore / skip を入れない
4. 必要なら該当 ADR / dev doc を更新する
5. tool 単独の pipeline  を追加したくなる誘惑に負けない — 必ず host 側で
   直す (ADR 0001)

## ADR / doc references

- `docs/adr/0001-toolchain.md` — host 側 toolchain への参照、per-tool
  pipeline を持たない理由
- `docs/adr/0002-architecture.md` — sibling layout 制約、embed 経路
- `docs/adr/0003-pr-driven-workflow.md` — PR-driven + main protection
- `docs/DEVELOPMENT.md` — 詳細手順

## Anti-patterns

- `|| true` で exit code を握り潰す
- ignore / suppress を追加して lint を green に見せる
- tool 単体に `tsconfig.json` / `biome.json` / `package.json` scripts を
  追加して host と重複させる (ADR 0001)
- `bun run build` を skip して type-check だけ緑にする (commit の意味が消える)
- `bun run test` だけが緑なら満足し、type-check を走らせない
- sibling layout を崩したまま validation を強行する (host の import が
  解決できない)