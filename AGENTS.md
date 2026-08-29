AI コーディングエージェント向けの canonical project contract (dispatcher)。
詳細はプロジェクト内 `.claude/skills/`、`docs/DEVELOPMENT.md`、`docs/adr/` を参照。

## Project identity

- **Name**: `tool-ae-expression`
- **Role**: per-tool React component under `@rebuildup/my-web-tools-ui`
- **License**: MIT (Copyright samuido 2026)
- **Remote**: `github.com/rebuildup/tool-ae-expression`
- **Boundaries**: source under `src/` only. Host app source (linked via
  `link:../../ui/src`) is owned by `@rebuildup/my-web-tools-ui`, not this repo.

## Toolchain (project-local)

- **Package manager / runner**: Bun (single lockfile, no npm/pnpm/yarn)
- **Build / dev**: Vite 6 + `@vitejs/plugin-react`
- **Language**: TypeScript 5.6 (strict)
- **UI**: React 19 + react-dom 19
- **Formatter / Lint**: Biome 1.9
- **Runtime target**: Bun on Windows, WSL, Linux, macOS

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

canonical 検証コマンドは `docs/DEVELOPMENT.md` を参照。
基本形:

```
bun install
bun run lint
bun run typecheck
bun run build
bun run test
```

`bun run test` は lint + build の合成 gate (現状 test framework なし)。
詳細は `.claude/skills/validate.md` を参照。

## Skill discovery

project-local Skill は `.claude/skills/` 以下。発火条件が明確な単位で分割してあり、
例:

- `project-context`: リポジトリ brief (常時 load される dispatcher の補完)
- `validate`: 検証コマンドの正確実行

## Branch / worktree policy

- **local `main` のみで作業**。
- 明示指定なく feature branch / temporary branch / worktree を作成しない。
- parallel subagent も local `main` 上で disjoint file ownership で並行実装する。
- コミット操作は直列化し、各 subagent / 論理単位ごとに独立 commit する。

## Mode / permission / trust

- active mode の範囲内で動く。permission gate の bypass を試さない。
- global plugin / global agent memory / undocumented host state に依存しない。
- project-local files (`AGENTS.md`, `.claude/skills/`, `docs/adr/`,
  `package.json`, `bun.lock`) を source of truth とする。

## Working directories

- 検証 artifact / log / screenshot / trace / 一次生成物 → `.tmp/` (gitignored)
- 参照用外部 repository clone → `.reference/` (gitignored)
- どちらも repository root へ直接置かない。

## Documentation index

- `README.md` — public overview (English)
- `docs/DEVELOPMENT.md` — internal development guide (日本語)
- `docs/adr/0001-toolchain.md` — AI agent toolchain decision
- `docs/adr/0002-architecture.md` — per-tool workspace architecture
- `.claude/skills/*.md` — project-local Skills