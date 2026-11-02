# 開発ガイド (DEVELOPMENT)

AI コーディングエージェントおよび contributor 向けの internal development guide。
source コードは英語、本ドキュメントは日本語。役割分担の正本は ADR
(`docs/adr/0001-toolchain.md`、`docs/adr/0002-architecture.md`、
`docs/adr/0004-standalone-embed-build.md`)。

## 概要

- **役割**: `my-web-2026` の Tool Registry が同一 origin 配下で配信する
  **standalone static SPA**（per-tool repo）
- **リポジトリ名**: `tool-ae-expression`
- **package 名**: `@rebuildup/tool-ae-expression` (private, 未公開)
- **License**: MIT (Copyright samuido 2026)
- **Runtime**: browser SPA (React 19 + TypeScript) / build は Vite 7
- **UI icons**: `lucide-react`
- **Package manager**: pnpm（`pnpm-lock.yaml` を commit）
- **Validation**: このリポジトリ単体で実施する

## 前提

- 任意の OS: Windows + Git Bash / WSL / Linux / macOS
- Node.js + pnpm 12 系

host リポジトリの sibling 配置は不要になった (ADR 0004)。

## 初回 setup

```sh
pnpm install
```

`pnpm-lock.yaml` を commit しているため、CI / host 側では
`pnpm install --frozen-lockfile` を使う。

## 開発 loop

```sh
# 1. 開発 server
pnpm run dev

# 2. validation
pnpm run type-check
pnpm run build

# 3. build 結果の確認
pnpm run preview
```

## ディレクトリ規約

| 場所 | 役割 |
| --- | --- |
| `src/` | per-tool source |
| `index.html` | standalone SPA の entry document (`#root`) |
| `src/index.ts` | public re-export (host から import される entry point) |
| `src/main.tsx` | standalone SPA の mount (createRoot + StrictMode) |
| `src/AeExpressionApp.tsx` | app shell (breadcrumb はテキスト描画) |
| `src/components/AEExpressionTool.tsx` | tool root、この repo の `ToolWrapper` を使用 |
| `src/components/ToolWrapper.tsx` | この repo が所有する shell (host の値を代替) |
| `src/components/ae-expression-storage.ts` | localStorage アクセス + メモリ fallback |
| `src/components/ae-expression-clipboard.ts` | clipboard アクセス + `execCommand` fallback |
| `src/components/ae-expression-theme.ts` | inline style 用の design token |
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

実装 task 完了直前に必ず以下を green にする。skip / ignore /
suppression 禁止。

```sh
pnpm install --frozen-lockfile
pnpm run type-check
pnpm run build
```

追加で目視確認する点:

- `dist/index.html` の asset 参照が `./assets/...`（相対）であること
- `dist/` が commit 対象に入っていないこと
- `grep -rn "next/" src/` が 0 件であること

host 側での実ブラウザ iframe 埋め込み検証は host の責務
(`my-web-2026` Issue #773)。詳細は `.claude/skills/validate.md` および
`docs/adr/0004-standalone-embed-build.md` を参照。

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

## 現状の known debt

- **lint / test 未導入**: この repo に Biome / Vitest の設定がまだ無い。
  host の lint / test はこの repo の source を traverse しないため、
  必要になった時点で host と重複しない形で導入する (ADR 0001)。
- **export (download)**: iframe の sandbox に `allow-downloads` が無い
  場合、browser がダウンロードを落とす。host 側の manifest 判断事項。
- **実ブラウザ未検証**: standalone build の実ブラウザ / iframe 内
  操作は未検証 (host 側 Issue #773 の責務)。