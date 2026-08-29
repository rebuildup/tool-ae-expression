# ADR 0003 — PR-driven workflow and `main` branch protection

- Status: Accepted
- Date: 2026-08-29
- Supersedes: project default policy "local `main` のみで作業 / feature branch を作らない"
  encoded in `AGENTS.md` § "Branch / worktree policy" and
  `docs/DEVELOPMENT.md` § "AI agent 動作規約". ユーザーから明示指定があったため、
  PR駆動ワークフローへ移行する。

## Context

これまでこのリポジトリの AI agent はローカル `main` のみで作業し、feature
branch や Git worktree を新規作成しないという policy で運用してきた (親 policy
§21 由来)。しかし以下が必要になった:

1. 変更の reviewability。1ファイル 1 commit でも変更の意図と evidence は
   PR description / thread に集約したい。
2. `main` の safety。誤って force push や直 push が入ると history が壊れる
   ため、GitHub 側で防ぎたい。
3. CI 等の future gate をPR時に確実に走らせる土台。

## Decision

### ブランチ保護 (GitHub branch protection rule)

GitHub branch protection を `main` に対して有効化する。設定値:

| Key | Value | 根拠 |
| --- | --- | --- |
| `enforce_admins` | `true` | admin も同 rule を守る。緊急時のみ `--admin` で bypass |
| `required_pull_request_reviews.required_approving_review_count` | `0` | PR 必須、ただし solo maintainer なので review は必須としない |
| `required_pull_request_reviews.dismiss_stale_reviews` | `true` | PR への追加 commit で過去の review を無効化 |
| `required_pull_request_reviews.require_code_owner_reviews` | `false` | CODEOWNERS 未設定 |
| `required_pull_request_reviews.require_last_push_approval` | `false` | solo 運用で過剰 friction |
| `required_status_checks` | (none) | 後述 — host package 不在で CI を通せないため、PR マージを CI で block しない |
| `required_linear_history` | `false` | solo 運用で過剰。rebase merge 強制はしない |
| `allow_force_pushes` | `false` | 履歴保護 |
| `allow_deletions` | `false` | branch 削除防止 |
| `restrictions` (push / merge ACL) | `null` | 全員に merge 可 (private repo + solo maintainer) |
| `lock_branch` | `false` | 通常運用 |
| `block_creations` | `false` | 通常運用 |
| `required_conversation_resolution` | `false` | 過剰 friction |
| `allow_fork_syncing` | `false` | 不要 |

### CI check の扱い

当面 `required_status_checks` は設定しない。これは:

- `bun install` が `link:../../ui/src` 先 host package の不在で失敗する
  (ADR 0002 の documented known debt)
- CI を required にすると、現状 PR が一切 merge できない
- CI workflow 自体は将来追加予定 (host package 配備後)

CI check を required に昇格する condition は ADR 0003 § Re-evaluation に記載。

### 新しい branch / PR policy

- 全変更は Pull Request 経由で `main` へマージする (PR駆動)
- 直 push を禁止
- force push を禁止
- 1 maintainer (`rebuildup`) の solo 運用を前提とし、PR review は必須としない
- parallel subagent も disjoint file ownership を保ったまま、共通の
  feature branch を共有するか、または subagent ごとに branch を切るかは
  task 単位で判断する (ADR 0002 の disjoint ownership rule は維持)
- 緊急時 (`enforce_admins: true` 由来) は admin が `--admin` フラグで bypass できる

### コミット policy の維持

PR駆動になっても commit message / 並列 subagent の disjoint file ownership /
直列化された commit 操作 は維持する。branch を切っても commit policy は不変。

## Consequences

- solo 運用なので `required_approving_review_count: 0` で「自分の PR を自分で
  merge できる」が成立する
- 誤って `git push origin main` を直接実行しても GitHub が拒否する
- 緊急 hotfix で admin bypass したい場合は `gh pr merge --admin` を使う
- CI workflow を後付けで追加しても、PR を merge するために既存 CI を再実行
  する必要はない (`required_status_checks` 未設定のため)
- 別途 CODEOWNERS を整備すれば `require_code_owner_reviews: true` に昇格できる

## Reproduction

この ADR の決定を fresh clone から再現するには:

```sh
# 1. ローカルで commit を作る
git checkout -b chore/init-pr-driven
# ... edit, commit ...

# 2. branch を push し PR を作る
git push origin chore/init-pr-driven
gh pr create --base main --title "chore: ..." --body-file .github/PULL_REQUEST_TEMPLATE.md

# 3. solo maintainer のため admin bypass で merge
gh pr merge --admin --merge

# 4. (maintainer だけが実行する) branch protection を反映
gh api -X PUT /repos/rebuildup/tool-ae-expression/branches/main/protection \
  --input .github/branch-protection.json
```

## Re-evaluation

次のいずれかに該当したら本 ADR を見直す:

- CI workflow が追加され、`required_status_checks` 昇格できる状態になった
- 別 maintainer が join し、review を必須化したい
- `link:../../ui/src` 先の host package が配備され、`bun install` が CI で
  green になった
- Conventional Commits / squash merge / linear history 等の追加 rule を
  導入したい
- per-tool release が host 側で決まり、tag-triggered release rule を
  加えたくなった