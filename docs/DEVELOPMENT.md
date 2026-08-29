# 開発ガイド (DEVELOPMENT)

AI コーディングエージェントおよび contributor 向けの internal development guide。
source コードは英語、本ドキュメントは日本語。役割分担の正本は ADR
(`docs/adr/0001-toolchain.md`、`docs/adr/0002-architecture.md`)。

## 概要

- **役割**: `my-web-2025` host app に embed される per-tool の Next.js
  source-only repo
- **リポジトリ名**: `tool-ae-expression`
- **package 名**: `@rebuildup/tool-ae-expression` (private, 未公開)
- **License**: MIT (Copyright samuido 2026)
- **Runtime**: Next.js 16 (peer, host 提供) + React 19 + TypeScript
- **UI icons**: `lucide-react`
- **Validation**: host (`my-web-2025`) 側で実施

## 前提

- `my-web-2025` リポジトリが sibling として存在すること
  (filesystem-relative import のため)
- host toolchain: Bun + Next.js 16 + React 19 + Biome
- 任意の OS: Windows + Git Bash / WSL / Linux / macOS

## 初回 setup

このリポジトリ単独では `bun install` は実行しない。host 側で setup する:

```sh
cd ../my-web-2025
bun install
```

host の `tsc --noEmit` / Biome / Next build がこの tool の source を
traverse する形で validation する。

## 開発 loop

```sh
# 1. host の dev server を起動 (tool の source を hot-reload で見れる)
cd ../my-web-2025
bun run dev

# 2. host 側で validation を流す
bun run type-check
bun run lint
bun run build
bun run test
```

## ディレクトリ規約

| 場所 | 役割 |
| --- | --- |
| `src/` | per-tool source |
| `src/index.ts` | public re-export (host から import される entry point) |
| `src/AeExpressionApp.tsx` | Next.js page-level entry (Breadcrumb + tool 読み込み) |
| `src/components/AEExpressionTool.tsx` | tool root、host の `ToolWrapper` を使用 |
| `src/components/ExpressionControls.tsx` | search / filter / preferences UI |
| `src/components/ExpressionList.tsx` | 選択可能式 expression 一覧 |
| `src/components/ExpressionParameters.tsx` | パラメータ入力 |
| `src/components/ExpressionOutput.tsx` | 生成コード / validation / preview |
| `src/components/useAEExpressionTool.ts` | tool-local state を一元管理する hook |
| `src/components/ae-expression-data.ts` | static な expression 定義 (~286 LOC) |
| `src/components/ae-expression-types.ts` | domain types |
| `src/components/ae-expression-utils.ts` | filtering / generation / validation の pure utilities |
| `docs/DEVELOPMENT.md` | 本ファイル |
| `docs/adr/` | ADR (MADR minimal subset) |
| `.claude/skills/` | project-local Agent Skills |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR テンプレート |
| `.github/branch-protection.json` | branch protection rule の source of truth |
| `.tmp/` | 検証 artifact (gitignored) |
| `.reference/` | 参照 repo clone (gitignored) |

新規ファイルは以下の責務名を使う (dumping-ground 名禁止):

- `utils`, `helpers`, `common`, `misc`, `manager`

注意: `src/components/ae-expression-utils.ts` は **この tool の domain
logic に特化した** utilities (filtering / generation / validation) であり、
generic dumping-ground ではない。

## 検証 (canonical quality gate)

実装 task 完了直前に必ず host 側で以下を green にする。skip / ignore /
suppression 禁止。

```sh
cd ../my-web-2025
bun install --frozen-lockfile
bun run type-check
bun run lint
bun run build
bun run test
```

host の CI が green であればこの tool も green。tool 単体に閉じた
validation pipeline は存在しない。詳細は `.claude/skills/validate.md` および
`docs/adr/0001-toolchain.md` § Decision を参照。

## 言語ポリシー

- source code (filename / identifier / comment / code doc / config identifier): 英語
- internal document (本ファイル / ADR / Agent Skills / AGENTS.md): 日本語
- public README / LICENSE: 英語
- commit message / GitHub Issue / PR: 英語

## AI agent 動作規約

- `AGENTS.md` (dispatcher) と `.claude/skills/` (詳細) を常に参照する。
- ADR は「あるべき最終状態」を記述する。実装 diary / TODO / 過去 idea は ADR に書かない。
- すべての変更は Pull Request 経由で `main` へマージする (PR駆動)。
  `main` は branch protection で保護されており直 push / force push は不可。
  詳細は `docs/adr/0003-pr-driven-workflow.md`。
- 並列 subagent は disjoint file ownership のみ。同 file の同時編集は禁止。
- commit 操作は直列化し、agent / 論理単位ごとに dedicated commit にする。
- error / warning / skip を suppression で隠さない。root cause を直す。
- user-requested scope を勝手に MVP へ縮小しない。

## 現状の known debt (per-tool 単体では解決しないもの)

- **sibling layout 依存**: `src/components/AEExpressionTool.tsx` の
  `../../../../src/components/tools-ui/ToolWrapper` import は
  `Desktop/tool-ae-expression/` が `Desktop/my-web-2025/` の sibling
  という layout を前提とする fragile coupling。layout が変わると
  import path の修正が必要 (ADR 0002 § Dependency direction)。
- **永続化なし**: `useAEExpressionTool` 内の `savedExpressions` は
  in-memory のみで永続化されない。永続化が必要になったら host の
  storage adapter 経由で実装する (ADR 0002 § Persistence boundaries)。
- **per-tool 設定なし**: `tsconfig.json` / `biome.json` / `package.json`
  scripts は host (`my-web-2025`) が所有し、この repo には存在しない
  (ADR 0001)。per-tool 設定を追加する場合は host と重複しないよう
  慎重に設計する。
- **per-tool test framework 未導入**: host の test runner に統合する形で
  追加する。per-repo Vitest は host と重複するため避ける。