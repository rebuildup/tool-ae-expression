# ADR 0002 — Architecture: per-tool workspace

- Status: Accepted
- Date: 2026-08-29
- Supersedes: implicit assumption in `README.md` referencing an external
  `my-web-2025` specification that is **not present in this repository or any
  sibling directory on the working machine**. The repo is currently a standalone
  scaffold; the "embed via my-web-2025 spec" claim is unverified.

## Context

このリポジトリは `README.md` によれば「Standalone ae-expression tool. See
my-web-2025 spec for embed instructions.」と説明されている。`package.json` の
dependencies には `link:../../ui/src` で `@rebuildup/my-web-tools-ui` を相対パス link
している。

ただし:

- `../../ui/src` は host machine 上に存在しない (`C:\Users\rebui\Desktop\ui`
  ディレクトリは未作成)。
- `my-web-2025` 仕様書はこのリポジトリにも `../../../docs` 等の親にも存在しない。
- source は placeholder 1 ファイル (`AeExpressionApp.tsx` が `AeExpression placeholder`
  を返すのみ)。

つまり、現状は「per-tool workspace として独立した最小 scaffold」が reality であり、
「host app に embed される」前提は将来設計である。

## Decision

### 役割の境界

このリポジトリは:

- 単一の独立 React アプリとして build / preview できる
- 将来、host から `link:../../ui/src` 経由で embed される可能性に備えている
- host (`@rebuildup/my-web-tools-ui`) の source には触らない
- host 側の routing / state / styling convention には現状依存しない
  (host package が存在しない以上、依存先不明)

### 何が意図的に out of scope か

- host app の routing / state 管理 / design system の詳細
  (host package が存在しないため抽象的にしか参照できない)
- test framework の選択 (機能実装が必要になった時点で ADR 0001 に従って導入)
- CI / CD (release / deploy の責任は host app に集約する想定。per-tool 単体での
  release は当面考えない)
- 国際化対応 (UI 実装が先に立って判断する)

### Source layout

```
.
├── AGENTS.md              # AI agent dispatcher (canonical project contract)
├── README.md              # Public-facing repo overview (English)
├── LICENSE                # MIT, Copyright samuido 2026
├── package.json           # Bun / Vite / React 19 / TS 5.6 / Biome 1.9
├── src/
│   ├── index.ts           # Public re-export (entry point for embed)
│   └── AeExpressionApp.tsx # Placeholder root component
├── docs/
│   ├── DEVELOPMENT.md     # Internal dev guide (Japanese)
│   └── adr/               # Architecture Decision Records
│       ├── 0001-toolchain.md
│       └── 0002-architecture.md
└── .claude/
    └── skills/            # Project-local Agent Skills
```

この layout は Vite + React 19 official scaffold (`bun create vite`) の最小形を
踏襲し、`docs/` と `.claude/skills/` を追加する。`docs/adr/` は
[MADR](https://adr.github.io/madr/) の minimal subset (Context / Decision /
Consequences / Re-evaluation) に従う。

### Dependency direction

- `src/index.ts` → `src/AeExpressionApp.tsx` (single component export)
- `@rebuildup/my-web-tools-ui` は `link:../../ui/src` で link。host 側に
  変更が入った場合は `bun install` で再 link し直す
- `@rebuildup/my-web-tools-ui` の type / API 不整合はこのリポジトリの責務ではなく
  host の責務。import path が壊れたら host 側で修正されるか、このリポジトリで
  adapter を 1 枚挟むかは host の判断に従う

### State ownership

- 状態 (現在のモード / 入力値 / ユーザー設定) は当面 host / link 先に集約
- この per-tool 単体で完結する state を持つ場合は `src/state/` 以下に
  colocate する設計を将来採る

### Naming

- 階層名は責務を表し、上位で表現済みの語を leaf で繰り返さない
- `src/AeExpressionApp.tsx` は host に embed される root component であり、
  将来 feature が入ったら `src/AeExpressionApp/` 配下に sub-component を置く
- dumping-ground 名 (`utils`, `helpers`, `common`, `misc`, `manager`) を避ける

### Persistence boundaries

- per-tool 単体では永続化を持たない
- 設定 / 履歴は host の storage 抽象 (将来判明) 経由で使う
- localStorage を直接触る必要がある場合でも、host の helper を経由する

### Side-effect boundaries

- 自動 fetch / WebSocket / Worker は host の境界に合わせる
- 単発 notification / 効果音を host の effect API 経由で使う

## Consequences

- host が link path 先に実在しない現在の状態では `bun install` は失敗する
  (これは host 側 setup の未完了を示しており、本リポジトリの責務ではない)
- `link:` 依存を採用している以上、このリポジトリ単独では完全な CI が成立しない
- source が極小なので、過度な architecture を立てると prematurely abstract になる

## Re-evaluation

次のいずれかに該当したら本 ADR を見直す:

- `link:../../ui/src` 先の host package が実体化し、API contract が現れた
- per-tool として独立 release / versioning を行う必要が出た
- test framework / CI を per-tool 単位で運用する必要が出た
- このリポジトリが host embed ではなく standalone web app として確定した