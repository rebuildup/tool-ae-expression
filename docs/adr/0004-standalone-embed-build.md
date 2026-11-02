# ADR 0004 — standalone build と same-origin iframe 埋め込み

- Status: Accepted
- Date: 2026-11-03
- Issue: rebuildup/tool-ae-expression#6 (host 側: rebuildup/my-web-2026#773)
- 改訂対象: ADR 0001 (toolchain) / ADR 0002 (architecture)

## Context

`my-web-2026` の Tool Registry は、各 Tool を `same_origin_static` として
同一 origin 配下に配信し、`sandbox="allow-scripts"`（`allow-same-origin`
なし）の iframe で埋め込む。ADR-0020（host 側）がその delivery 契約 owning
authority である。

この repo は ADR 0002 制定時、host (`my-web-2025`) に同一リポジトリの
source を filesystem-relative import する「source-only repo」であり、
単体で build できる artifact を持たなかった。host が `my-web-2026` へ
移った時点でこの前提はすでに壊れていた。

実測した事実:

1. `package.json` に `scripts` / `devDependencies` が無く、lockfile /
   `tsconfig.json` / `vite.config.ts` / `index.html` も無い。
2. `src/AeExpressionApp.tsx` が `next/link` を import していた。
3. `src/components/AEExpressionTool.tsx` が
   `../../../../src/components/tools-ui/ToolWrapper`（host リポジトリの
   相対パス）を import していた。この path は sibling layout 前提であり、
   `my-web-2026` には `src/components/tools-ui/` が存在しないため解決
   できない。
4. `src/components/useAEExpressionTool.ts` が `localStorage` を、
   同 hook が `navigator.clipboard` を使っていた。sandbox 付き iframe
   （opaque origin）では前者は `SecurityError`、後者は reject になりうる。
5. 見た目は Tailwind utility class に依存していたが、この repo には
   Tailwind pipeline が無かった。

## Decision

### 1. この repo は単体で build できる static SPA を所有する

- package manager は **pnpm**。`pnpm-lock.yaml` を commit する。
  lockfile の version は host（`my-web-2026`）と同じ `lockfileVersion: 9.0`。
- build は **Vite 7** + `@vitejs/plugin-react`。`pnpm run build` が
  `dist/` を出力し、`dist/` は commit しない。
- `vite.config.ts` の `base` は `"./"`。host は `/tools/ae-expression/app/`
  配下で配信するため、asset 参照は相対である必要がある（`/assets/...` は
  host root を指して 404 になる）。
- `main` / `types` / `exports` は host との識別子契約として維持する。
  `peerDependencies.next` は削除する（`next` を import しないため）。

### 2. Tool は host に依存しない

- `next/link` を撤去する。host のルート（`/` / `/tools`）を指す
  breadcrumb は **テキスト** として描画する。iframe 内で link を辿ると
  host を乗っ取る（frame が tool から離れる）ため、link にしてはいけない。
- host の `ToolWrapper` import を、`src/components/ToolWrapper.tsx` に
  よる repo 内の shell 実装に置き換える。prop 契約
  （`toolName` / `description` / `category` / `children`）は host 版と
  同じに保ち、host 側の navigation もテキスト描画とする。
- host の filesystem-relative import 前提（ADR 0002 の
  sibling layout 制約）は廃止する。

### 3. 埋め込み前提の欠陥は tool 側で閉じる

- `localStorage` の read / write は `src/components/ae-expression-storage.ts`
  に集約し、try/catch で保護する。store が使えない場合（opaque origin）
  は **メモリ内 state** に fallback し、frame 内では保存済み一覧の
  参照と削除が機能し続ける。
- clipboard は `src/components/ae-expression-clipboard.ts` に集約する。
  `navigator.clipboard.writeText` を先に試し、reject / 未実装時は
  `document.execCommand("copy")` に fallback する。両方失敗した場合は
  成功扱いしない。
- 見た目は Tailwind utility class ではなく **inline style** で担保する。
  値は `src/components/ae-expression-theme.ts` の token に集約する。
  web font は取得せず system font stack を使う。
- 外部 origin への通信は **0 件** を維持する（web font / CDN を使わない）。

### 4. 検証はこの repo 単体で完結する

ADR 0001 / 0002 が「host 側で検証する」 Decide していた validation
entry point を、本 ADR でこの repo 自身の gate へ置き換える:

```
pnpm install --frozen-lockfile
pnpm run type-check
pnpm run build
```

host 側での追加検証（Tool Registry への登録、実ブラウザでの iframe
埋め込み確認）は host 側の Issue (#773) の責務とする。

## Consequences

- この repo は単体で build / type-check できる。sibling layout は不要に
  なった。
- host が iframe 内で使う artefact は `dist/` であり、host 側は
  submodule の `dist/` を `/tools/ae-expression/app/` に配信するだけで
  よい。
- export（ダウンロード）は sandbox に `allow-downloads` が無い限り
  browser が落とす。これは host 側の manifest 判断事項であり、本 ADR の
  範囲外。
- host の Tool Registry は `same_origin_static` のため consent gate は
  不要（third-party origin 0 件）。

## Reproduction

1. `pnpm install --frozen-lockfile` が通る（`pnpm-lock.yaml` が commit
   されている）。
2. `pnpm run type-check` が exit 0。
3. `pnpm run build` が `dist/index.html` を生成する。
4. `dist/index.html` の asset 参照が `./assets/...` である。
5. `grep -rn "next/" src/` が 0 件である。
6. `dist/assets/*.js` に third-party origin が含まれない。

## Re-evaluation

- host が `allow-same-origin` を許可する判断を将来的に採った場合、
  storage fallback の意味が変わる（再検討）。
- host 側が download を許可する判断をした場合、export 経路の検証を追加
  する。
