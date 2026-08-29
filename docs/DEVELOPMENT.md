# 開発ガイド (DEVELOPMENT)

AI コーディングエージェントおよび contributor 向けの internal development guide。
source コードは英語、本ドキュメントは日本語。役割分担の正本は ADR
(`docs/adr/0001-toolchain.md`、`docs/adr/0002-architecture.md`)。

## 概要

- **役割**: `@rebuildup/my-web-tools-ui` 配下に embed される per-tool React アプリ
- **名前**: `tool-ae-expression`
- **License**: MIT (Copyright samuido 2026)
- **Runtime**: Vite 6 + React 19 + TypeScript 5.6 / Bun / Biome 1.9

## 前提

- Bun 1.x (本リポジトリ開発では 1.4.0 で確認)
- Node.js は Bun が同梱するため必須ではない
- 任意の OS: Windows + Git Bash / WSL / Linux / macOS

## 初回 setup

```sh
bun install
```

これで host package (`link:../../ui/src`) も link される。host がまだ存在しない
場合は `bun install` が失敗するため、host 側を先に用意するか、ADR 0002 の
scope ownership を確認する。

## 開発 loop

```sh
bun run dev        # vite dev server
bun run build      # tsc -b && vite build
bun run typecheck  # tsc -b
bun run lint       # biome check .
bun run format     # biome format . --write
bun run preview    # vite preview (built artifact を serve)
bun run test       # lint && build (現状 test framework なし)
```

## ディレクトリ規約

| 場所 | 役割 |
| --- | --- |
| `src/` | per-tool source |
| `src/index.ts` | host 向け public re-export |
| `docs/DEVELOPMENT.md` | 本ファイル |
| `docs/adr/` | ADR (MADR minimal subset) |
| `.claude/skills/` | project-local Agent Skills |
| `.tmp/` | 検証 artifact (gitignored) |
| `.reference/` | 参照 repo clone (gitignored) |

新規ファイルは以下の責務名を使う (dumping-ground 名禁止):

- `utils`, `helpers`, `common`, `misc`, `manager`

## 検証 (canonical quality gate)

実装 task 完了直前に必ず以下を green にする。skip / ignore / suppression 禁止。

```sh
bun install
bun run lint
bun run typecheck
bun run build
bun run test
```

`bun run test` は現状 lint + build の合成 gate。test framework が入ったとき (Vitest)
は unit / component test を加える。詳細は `docs/adr/0001-toolchain.md` §
"Test framework" を参照。

## 言語ポリシー

- source code (filename / identifier / comment / code doc / config identifier): 英語
- internal document (本ファイル / ADR / Agent Skills / AGENTS.md): 日本語
- public README / LICENSE: 英語
- commit message / GitHub Issue / PR: 英語

## AI agent 動作規約

- `AGENTS.md` (dispatcher) と `.claude/skills/` (詳細) を常に参照する。
- ADR は「あるべき最終状態」を記述する。実装 diary / TODO / 過去 idea は ADR に書かない。
- local `main` のみで作業し、worktree / temporary branch を勝手に作らない。
- 並列 subagent は disjoint file ownership のみ。同 file の同時編集は禁止。
- commit 操作は直列化し、agent / 論理単位ごとに dedicated commit にする。
- error / warning / skip を suppression で隠さない。root cause を直す。
- user-requested scope を勝手に MVP へ縮小しない。

## 現状の known debt (per-tool 単体では解決しないもの)

- `tsconfig.json` 未作成: 最初の feature 実装時に Vite 公式 recommendation に従って
  `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` を追加する。
- `vite.config.ts` 未作成: 同上の場で `@vitejs/plugin-react` を最小 plugin で構成する。
- `biome.json` 未作成: 同上の場で Biome 推奨 config を作成する (extends 不要)。
- host package (`@rebuildup/my-web-tools-ui`) が host machine 上に存在しない:
  `bun install` が失敗するため、host 側 setup 完了後に初めて依存解決できる。

これらは本 ADR 初期化の scope 外 (application bootstrap) であり、AI agent が
最初の feature 実装 task に入った時点で着手する。