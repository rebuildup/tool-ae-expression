AI コーディングエージェント向けの canonical project contract (dispatcher)。
詳細はプロジェクト内 `.claude/skills/`、`docs/DEVELOPMENT.md`、`docs/adr/` を参照。

## Project identity

- **Repo name**: `tool-ae-expression` (GitHub repo)
- **Package name**: `@rebuildup/tool-ae-expression` (private npm name; never
  published — reserved for in-workspace identification only)
- **Role**: per-tool repo for one tool (After Effects Expression Helper).
  It builds a **standalone static SPA** (`dist/`) that the `my-web-2026`
  Tool Registry embeds as a `same_origin_static` iframe
  (`sandbox="allow-scripts"`).
- **License**: MIT (Copyright samuido 2026)
- **Remote**: `github.com/rebuildup/tool-ae-expression`
- **Boundaries**:
  - Source under `src/` is owned by this repo.
  - The tool owns its own shell (`src/components/ToolWrapper.tsx`). It
    must **not** import from a host repository (`../../../../src/...`).
  - The tool must **not** import `next/*`. Host routes (`/`, `/tools`)
    are rendered as **text**, never as links, so a framed document cannot
    navigate the frame away from the Tool.
  - Third-party origins: **0**. No web font, no CDN, no fetch.
  - Embed mechanism is the **built artefact**, **not** npm `link:` and
    **not** registry publishing.
  - Layout requirement: **none**. This repo builds standalone
    (ADR 0004).

## Toolchain (project-local)

- **Language**: TypeScript (strict; `tsconfig.json` owned by this repo)
- **UI**: React 19 + react-dom 19
- **Icons**: `lucide-react`
- **Runtime target**: browser SPA (no Next.js peer dependency)
- **Package manager**: **pnpm** (committed `pnpm-lock.yaml`)
- **Build**: **Vite 7** (`pnpm run build` → `dist/`; `base: "./"`)
- **Type check**: `pnpm run type-check` (`tsc --noEmit`)
- **Lint / test**: not configured yet (known debt, ADR 0001)

詳細決定は `docs/adr/0001-toolchain.md` を参照。

## Source language policy

- **Source code**: English only (filenames, identifiers, comments, code docs,
  config identifiers).
- **Internal development documentation** (`docs/`, ADR, Agent Skills, AGENTS.md):
  日本語。

## Task-scope policy

- User-requested scope を勝手に MVP へ縮小しない。完了 = 要求された全範囲。
- 初期開発段階のため backward compatibility / migration code は原則不要。
- 「念のため」の compatibility layer を残さない。

## Design-first gate

- `docs/DEVELOPMENT.md` または明示的な design doc がある場合、実装前に変更点を整理し合意する。
- design がない新規領域では、`docs/adr/` に decisions を残してから実装する。

## Validation entry point

このリポジトリは**単体で build / type-check できる** (ADR 0004)。
canonical 検証はこの repo 内で完結する:

```
pnpm install --frozen-lockfile
pnpm run type-check
pnpm run build
```

`dist/` は commit しない。host 側での実ブラウザ iframe 埋め込み検証は
host の責務 (`my-web-2026` Issue #773)。
詳細は `.claude/skills/validate.md` を参照。

## Skill discovery

project-local Skill は `.claude/skills/` 以下。発火条件が明確な単位で分割してあり、

- `project-context`: リポジトリ brief (常時 load される dispatcher の補完)
- `validate`: 検証コマンドの正確実行 (host 側の validation を呼び出す)

## Branch / worktree policy

- **PR-driven**: すべての変更は Pull Request 経由で `main` へマージする。
- `main` は GitHub branch protection rule で保護されている
  (PR 必須 / 直 push禁止 / force push 禁止 / admin も enforce / 詳細は
  `docs/adr/0003-pr-driven-workflow.md`)。
- solo maintainer 運用に合わせ、PR review は必須としない
  (`required_approving_review_count: 0`)。
- parallel subagent は disjoint file ownership を保ったまま、共通の
  feature branch を共有するか、または subagent ごとに branch を切るかは
  task 単位で判断する (ADR 0002 の disjoint ownership rule は維持)。
- コミット操作は直列化し、各 subagent / 論理単位ごとに独立 commit する。
- 緊急時の admin bypass は `gh pr merge --admin` 等で明示的に行う。

## Mode / permission / trust

- active mode の範囲内で動く。permission gate の bypass を試さない。
- global plugin / global agent memory / undocumented host state に依存しない。
- project-local files (`AGENTS.md`, `.claude/skills/`, `docs/adr/`,
  `package.json`) を source of truth とする (lockfile は host 側で
  保有)。

## Working directories

- 検証 artifact / log / screenshot / trace / 一次生成物 → `.tmp/` (gitignored)
- 参照用外部 repository clone → `.reference/` (gitignored)
- どちらも repository root へ直接置かない。

## Documentation index

- `README.md` — public overview (English)
- `docs/DEVELOPMENT.md` — internal development guide (日本語)
- `docs/adr/0001-toolchain.md` — AI agent toolchain decision (revised)
- `docs/adr/0002-architecture.md` — standalone Tool repo architecture (revised)
- `docs/adr/0003-pr-driven-workflow.md` — PR-driven workflow + `main` branch protection
- `docs/adr/0004-standalone-embed-build.md` — standalone build + same-origin iframe embed
- `.claude/skills/*.md` — project-local Skills

## Constitution / operating profile

- 最上位 contract: [`constitution/CONSTITUTION.md`](constitution/CONSTITUTION.md)
- current Operating Model: [`organization/profiles/release-driven-solo.md`](organization/profiles/release-driven-solo.md)
- 上記 host/source boundary と既存 ADR は、Constitution と両立する限り generic upstream Practice より具体的な authority として維持する。
- project-init operational Skills は `bunx skills` + `skills-lock.json` で project-local に継続更新する。
- **Tool の埋め込み前提**（iframe 内での storage / clipboard / 外部 origin）は
  この repo の責務であり、host に依存しない (ADR 0004)。
