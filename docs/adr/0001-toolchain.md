# ADR 0001 — AI agent toolchain (revised)

- Status: Revised (2026-11-03)
- Date: 2026-08-29
- Revision: 2026-11-03 — ADR 0004 の決定に伴い、この repo は host
  (`my-web-2025` / `my-web-2026`) 準拠の「source-only, host 側で検証」
  モデルから、**単体で build できる standalone SPA** のモデルへ移った。
  package manager は Bun → pnpm、lockfile / `tsconfig.json` /
  `vite.config.ts` / `index.html` はこの repo が所有する。

## Context

この repo は per-tool の source を所有し、host へ埋め込む Tool である。
ADR 0004 適用後、この repo は:

- `pnpm` で **`pnpm-lock.yaml` を commit** する（host と同じ
  `lockfileVersion: 9.0`）。
- **Vite 7** で `dist/` を build する（`pnpm run build`）。
- **`tsconfig.json` を所有**し、`tsc --noEmit` で型検査する
  （`pnpm run type-check`）。
- 検証は **この repo 単体で完結**する。host の filesystem traversal に
  依存しない。

## Decision

### Package manager
**pnpm**。lockfile (`pnpm-lock.yaml`) を commit する。

Rationale: host (`my-web-2026`) が `pnpm install --frozen-lockfile &&
pnpm run build` を submodule 内で実行する前提で、host と同じ package
manager を使うことで lockfile 形式・解決挙動の不一致を無くす。

Rejected:
- Bun: host は pnpm 前提。lockfile 形式が別になるため host 側で
  変換処理が必要になる。
- npm / yarn: host と異なる解決挙動を持ち、frozen install の再現性が
  落ちる。

### Formatter / Lint
**未設定**。host の lint はこの repo の source を traverse しないため、
現時点でこの repo 単体に lint ゲートは無い（known debt。ADR 0004 の
Re-evaluation 参照）。

### Type check
**この repo が所有する**（`tsconfig.json` + `pnpm run type-check`）。
`strict: true`, `noEmit: true`, `moduleResolution: bundler`。

### Build
**Vite 7**（`@vitejs/plugin-react`）。`base: "./"` により
`dist/index.html` の asset 参照を相対に保つ。出力は `dist/` で、
commit しない。

### Code intelligence
TypeScript LSP（`typescript` package同梱）。この repo 単体の project
context で module 解決する（host への相対 import が無いため、host 側の
project graph は不要になった）。

### Text search
`rg` / `rg --files`。repo 固有の設定なし。

### Browser / UI verification
`pnpm run dev`（開発） / `pnpm run preview`（build 結果の確認）。
実ブラウザでの iframe 埋め込み検証は host 側の責務
（`my-web-2026` Issue #773）。

### Test framework
**未導入**。既存の test framework 追加は本 ADR の範囲外であり、
必要になった時点で再評価する。

### Dependency analysis
Knip は host 側。 この repo は依存が小さく（runtime 3 + dev 5）、
host 側 Knip の対象から外れるため per-repo Knip は不要。

### Container / Nix
なし。host owns containerization.

### Persistent memory
なし。repository files が source of truth。

## Reproduction

本 ADR の決定は次が成り立つ間有効である:

1. `pnpm install --frozen-lockfile` が exit 0。
2. `pnpm run type-check` が exit 0。
3. `pnpm run build` が `dist/index.html` を生成する。
4. `pnpm-lock.yaml` が commit されている。

## Re-evaluation

Revisit when:

- この repo に lint / test の gate を追加する必要が生じたとき。
- host が pnpm 以外の package manager を採用したとき。
- TypeScript / Vite のメジャーバージョン更新的必要が生じたとき。
