# ADR 0002 — Architecture: standalone Tool repo (revised)

- Status: Revised (2026-11-03)
- Date: 2026-08-29
- Revision: 2026-11-03 — ADR 0004 の決定に伴い、per-tool **source-only
  repo**（host が filesystem-relative import するモデル）から、
  **standalone static SPA を build して host が同一 origin 配下で配信する
  モデル**へ移行した。host への相対 import・sibling layout 前提は
  廃止する。

## Context

この repo は 1 つの Tool（After Effects Expression Helper）を所有する
per-tool repo である。ADR 0004 適用後の実測事実:

- `package.json` は `scripts`（`dev` / `build` / `preview` /
  `type-check`）と `devDependencies`（Vite 7 / `@vitejs/plugin-react` /
  TypeScript / `@types/react` / `@types/react-dom`）を持ち、
  `pnpm-lock.yaml` を commit する。`main` / `types` / `exports` は
  `src/index.ts` を向く（host との識別子契約として維持）。
- `peerDependencies.next` は削除した。`src/` に `next` の import は
  0 件である。
- `src/AeExpressionApp.tsx` は `next/link` を使わず、host ルートを
  指す breadcrumb をテキスト描画する。
- `src/components/AEExpressionTool.tsx` は host の
  `../../../../src/components/tools-ui/ToolWrapper` を import せず、
  repo 内の `src/components/ToolWrapper.tsx` を使う。
- `src/components/useAEExpressionTool.ts` は
  `src/components/ae-expression-storage.ts`（localStorage + メモリ
  fallback）と `src/components/ae-expression-clipboard.ts`
  （Clipboard API + `execCommand` fallback）経由で副作用を扱う。
- 見た目は Tailwind utility class ではなく inline style
  （`src/components/ae-expression-theme.ts` の token）で表現する。
- 外部 origin への参照は 0 件。web font も CDN も使わない。

## Decision

### Role boundaries

この repo は:

- 1 つの Tool の **source と build 済み artefact の両方を所有**する。
- **standalone に build できる**（`pnpm run build` → `dist/`）。
- host には **filesystem-relative import ではなく build 済み artefact**
  で統合される。host は `dist/` を同一 origin の
  `/tools/ae-expression/app/` に配信し、`sandbox="allow-scripts"` の
  iframe で埋め込む。
- **private** のまま。npm には publish しない（`@rebuildup/tool-*` は
  workspace 内識別子として予約）。

### Host への依存を禁ずる

- `next/*` の import 禁止。
- host リポジトリの相対 import 禁止（`../../../../src/...` 形）。
- host ルート（`/` / `/tools`）へのリンク禁止。iframe 内で辿ると
  frame が tool から host へ遷移するため、breadcrumb / navigation は
  テキスト描画とする。
- host の `ToolWrapper` 相当は自前で持つ
  （`src/components/ToolWrapper.tsx`）。prop 契約は host 版と同じ。

### 副作用の境界

- `localStorage` は **try/catch で保護**して使う。sandbox 付き iframe
  （opaque origin）では `SecurityError` になるため、失敗時はメモリ内
  state に fallback する（`src/components/ae-expression-storage.ts`）。
- `navigator.clipboard` は reject / 未実装があり得るため、
  `document.execCommand("copy")` への fallback を持つ
  （`src/components/ae-expression-clipboard.ts`）。
- 外部 origin への通信は 0 件。fetch / beacon / 外部 web font を
  追加しない。

### Source layout

```
.
├── AGENTS.md                              # dispatcher
├── README.md                              # public overview (English)
├── LICENSE                                # MIT
├── index.html                             # standalone SPA entry (#root)
├── package.json                           # @rebuildup/tool-ae-expression, private
├── pnpm-lock.yaml                         # committed lockfile (pnpm)
├── pnpm-workspace.yaml                    # pnpm settings (allowBuilds)
├── tsconfig.json                          # per-repo type check
├── vite.config.ts                         # standalone build (base: "./")
├── src/
│   ├── index.ts                           # public re-export (entry point)
│   ├── main.tsx                           # standalone SPA mount (createRoot)
│   ├── AeExpressionApp.tsx                # app shell (breadcrumb as text)
│   └── components/
│       ├── AEExpressionTool.tsx           # tool root; uses the local ToolWrapper
│       ├── ToolWrapper.tsx                # standalone shell (replaces the host one)
│       ├── ExpressionControls.tsx         # search/filter/preferences UI
│       ├── ExpressionList.tsx             # selectable list of expressions
│       ├── ExpressionParameters.tsx       # per-expression parameter inputs
│       ├── ExpressionOutput.tsx           # generated code + validation + preview
│       ├── useAEExpressionTool.ts         # state hook (all tool-local state)
│       ├── ae-expression-clipboard.ts     # clipboard access + execCommand fallback
│       ├── ae-expression-storage.ts       # localStorage access + in-memory fallback
│       ├── ae-expression-theme.ts         # inline-style design tokens
│       ├── ae-expression-data.ts          # static expression definitions
│       ├── ae-expression-types.ts         # domain types
│       └── ae-expression-utils.ts         # filtering / generation / validation
├── docs/
│   ├── DEVELOPMENT.md                     # internal dev guide (Japanese)
│   └── adr/
│       ├── 0001-toolchain.md              # AI agent toolchain (revised)
│       ├── 0002-architecture.md           # this ADR (revised)
│       ├── 0003-pr-driven-workflow.md     # PR-driven + main protection
│       └── 0004-standalone-embed-build.md # standalone build + iframe embed
├── .claude/
│   └── skills/                            # project-local Agent Skills
└── .github/
    ├── PULL_REQUEST_TEMPLATE.md
    └── branch-protection.json
```

### Dependency direction

- `src/index.ts` → `src/AeExpressionApp.tsx`
- `src/main.tsx` → `src/AeExpressionApp.tsx`（standalone mount）
- `src/AeExpressionApp.tsx` → `src/components/AEExpressionTool.tsx`
- `src/components/AEExpressionTool.tsx` → `src/components/ToolWrapper.tsx`
  + sibling components in `src/components/`
- `src/components/useAEExpressionTool.ts` →
  `src/components/ae-expression-{clipboard,storage,data,types,utils}.ts`
- `src/components/*`（view）→ `src/components/ae-expression-theme.ts`

外部への依存は **host 側の build 済み artefact 配信** のみ。

### State ownership

- すべての tool-local state は `useAEExpressionTool`（1 hook, ~16
  `useState`）。UI component は props で state と setter を受け取る。
- Persistence: tool が **localStorage を 직접所有**し、memory fallback
  を持つ。host の adapter 注入は当面行わない（sandbox 前提では host
  storage は reach できないため、host 側が persistence を担う意味が
  ない）。

### Naming

- `src/AeExpressionApp.tsx` は **app レベル entry**。`App` suffix で
  「1 つの Tool アプリ」を表す。
- `src/components/AEExpressionTool.tsx` は **tool レベル root**。
- `src/components/ToolWrapper.tsx` は **この repo の shell**。host 版と
  同じ名前・同じ prop 契約を保ち、差し替え点的互換性を保つ。
- 内部 component（`ExpressionControls` 等）は tool 内 scope では
  `AE` / `Tool` prefix を落とす。
- `ae-expression-*` は kebab-case の domain 名。
- Dumping-ground 名称（`utils`, `helpers`, `common`, `misc`, `manager`）
  禁止。`ae-expression-utils.ts` は dumping-ground ではなく、この
  tool の domain 固有の pure function（filtering / generation /
  validation）を持つ。

### Side-effect boundaries

- `fetch` / `WebSocket` / `Worker` を使わない（外部 origin 0 件）。
- `validateExpression` は pure（I/O なし）。この invariant を保つ。

## Consequences

- この repo 単体で build / type-check できる。sibling layout 制約は
  なくなった。
- host 側は submodule を取り込み `pnpm install --frozen-lockfile &&
  pnpm run build` を実行し、`dist/` を `/tools/<slug>/app/` に配信
  すればよい。
- `@rebuildup/tool-ae-expression` は workspace 内識別子のみ。npm へ
  publish しない。
- export（ダウンロード）は sandbox に `allow-downloads` が無い限り
  browser が落とす。host 側の manifest 判断事項。

## Reproduction

本 ADR の前提は次が成り立つ間有効である:

1. `pnpm run build` が `dist/index.html` を生成する。
2. `dist/index.html` の asset 参照が `./assets/...` である。
3. `grep -rn "next/" src/` が 0 件である。
4. `src/` に host リポジトリへの相対 import がない。

## Re-evaluation

Revisit when:

- host 側の embed 契約（sandbox token、allowlist）が変更されたとき。
- tool が host へ 保存済みデータ を渡す必要が生じたとき。
- この repo が複数 Tool を含む構成へ変更されたとき。
