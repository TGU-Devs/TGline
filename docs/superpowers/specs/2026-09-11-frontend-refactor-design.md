# フロントエンド リファクタリング設計

- 日付: 2026-09-11
- 対象: `frontend/src` 全体（12,282行）
- 分岐元: `origin/main`（47014e2）
- 作業ブランチ: `refactor/frontend-structure`
- 作業場所: git worktree `.claude/worktrees/refactor-frontend-structure`（`feature/#113` の作業ツリーを占有しないため）

## 1. 目的

現状のフロントエンドは、構造（`features/` 分割・`ui/` プリミティブ）自体は妥当だが、
**共有レイヤーが存在しない**ために以下が発生している。

1. 同一コンポーネントの重複定義
2. データ取得・エラー処理の定型コードが28ファイルに散在
3. ページファイルにロジック・UI・サブコンポーネントが同居して肥大化

本リファクタは共有レイヤーを新設し、各画面をそこへ寄せることで重複を解消する。

## 2. 現状の問題（調査結果）

### 2.1 重複コンポーネント

| 重複 | 箇所 |
|---|---|
| `FieldLabel` 完全同一定義 ×3 | `courses/new:285`, `courses/[id]/offerings/new:301`, `.../reviews/new:252` |
| `TextInput`/`SelectInput` と `OfferingInput`/`OfferingSelect` | 名前が違うだけの同一実装 |
| `Metric` / `ScoreSummary` ×2 | `courses/[id]:243,255`, `courses/[id]/offerings/[offeringId]:194,206` |
| 開講情報フォーム11フィールド | `courses/new` と `offerings/new` に丸ごと二重定義（最大の重複） |

### 2.2 データ取得の定型コード散在

- `apiFetch` 呼び出しが28ファイル
- `setIsLoading` / `setError` / `try-catch-finally` の手書きが18ファイル
- エラー抽出 `data?.error || data?.errors?.join(" / ")` が各所にコピペ
- `credentials: "include"` の冗長指定24箇所（`apiFetch` が既定で付与済み）

### 2.3 認証チェックの手書き重複

`UserContext` があるにもかかわらず、courses配下3ページは
`isAuthenticated` state + `/api/users/me` 直叩き + `LoginPromptModal` を個別実装。
401ハンドリングも各所にコピペされている。

### 2.4 肥大化ページ

`AuthForm 524` / `posts/page 479` / `courses/page 437` / `offerings/new 371` / `reviews/new 354` / `settings/page 295`

### 2.5 テストが存在しない

`*.test.*` / `*.spec.*` / テストランナー設定ともにゼロ。
検証は `npm run lint` + `npm run build` + 手動確認に依存する。

## 3. 方針

**共有レイヤー先行 → 機能別に段階移行**（ボトムアップ）。

問題の根が共有レイヤーの不在であるため、先に土台を作らずに画面分割から始めると
「似て非なる部品」が再生産される。土台を先に固定する。

挙動方針: **明らかなバグは直す**。リファクタ差分とは別コミット（`fix:`）に分離し、最終報告で一覧化する。

## 4. 設計

### 4.1 既存資産の実地調査（重要・当初想定を訂正）

当初は「`features/posts/components/form/` の既存部品を共有層へ昇格させる」方針を立てたが、
実装を読んだ結果**これらは汎用プリミティブではなかった**ため、方針を訂正する。

| ファイル | 実態 |
|---|---|
| `FormInput` | ラベル「タイトル」・`maxLength={100}`・`id="title"`・placeholder がハードコード。実質 PostTitleField |
| `FormTextarea` | ラベル「本文」・`maxLength={10000}`・`rows={12}` 固定。実質 PostBodyField |
| `Error`（`ErrorUi`） | フォーム用エラーではなく、「一覧に戻る」リンク付きの全画面エラー。配置が誤っている |
| `FormActions` | ボタン文言「投稿する」「保存する」固定。posts 専用 |

さらに posts と courses は入力欄のスタイルが異なる。

- posts: `px-4 py-2 border rounded-lg`、ラベルに `※必須` をインライン表示
- courses: `h-11 rounded-md`、`FieldLabel` が必須/任意のバッジを表示

**この2系統を1つのスタイルに統一することは「見た目の変更」であり、本作業のスコープ外。**

訂正後の方針:

1. `ui/form/` の共通部品は **courses 側の重複から抽出する**（posts からの昇格はしない）
2. posts の form 部品は **posts 固有であることが分かる名前に整理する**（純粋な移動・改名。描画結果は変えない）
3. posts と courses のスタイル統一は行わない

同様に、`ui/ErrorUI`（再試行ボタン付き）と posts の `Error`（一覧に戻るリンク）は
**挙動の異なる別コンポーネント**であり、統合は UX 変更になるためスコープ外とする。

### 4.2 共有レイヤー

**`src/lib/api.ts` 拡張**

- `class ApiError extends Error` — `status` を保持し、呼び出し側が `err.status === 401` で認証切れを判別できる
- `extractApiError(res): Promise<string>` — `data?.error || data?.errors?.join(" / ")` を一元化
- `apiJson<T>(path, init): Promise<T>` — ok判定 → JSONパース → 失敗時 `ApiError` throw

**`src/hooks/` 追加**

| フック | 返り値 | 置き換える対象 |
|---|---|---|
| `useApiResource<T>(path)` | `{ data, isLoading, error, reload }` | 単体取得の定型（18ファイル） |
| `useApiList<T>(path, params)` | `{ items, isLoading, isLoadingMore, hasMore, loadMore, reload }` | posts/courses の一覧＋追加読み込み |
| `useSubmit(fn)` | `{ submit, isSubmitting, error }` | フォーム送信の try/catch/finally |
| `useAuthGuard()` | `{ user, requireAuth(), loginModal }` | courses配下3ページの `/api/users/me` 直叩き |

`useAuthGuard` は既存 `UserContext` を利用する。新たな認証状態は持たない。

### 4.3 共通UI部品

**`src/components/ui/form/`（courses の重複から抽出。新規作成）**

| 新規部品 | 統合元 |
|---|---|
| `FieldLabel` | `courses/new:285` / `offerings/new:301` / `reviews/new:252` の同一定義3つ |
| `TextField` | `courses/new` の `TextInput` と `offerings/new` の `OfferingInput`（同一実装） |
| `SelectField` | `courses/new` の `SelectInput` と `offerings/new` の `OfferingSelect`（同一実装） |

posts 側の `FormInput` / `FormTextarea` とは名前が衝突しないため、posts は無改修で共存できる。

**`src/components/features/posts/components/` の整理（純粋な移動・改名、描画結果は不変）**

| 現在 | 移動後 |
|---|---|
| `form/FormInput.tsx` | `form/PostTitleField.tsx` |
| `form/FormTextarea.tsx` | `form/PostBodyField.tsx` |
| `form/FormActions.tsx` | `form/PostFormActions.tsx` |
| `form/Error.tsx`（`ErrorUi`） | `shared/PostNotFound.tsx` |

**`src/components/features/courses/components/`**

`Metric` / `ScoreSummary` / `ReviewScore` / `ReviewMeta` / `RatingStars`（重複解消）、
`CourseCard` / `CourseFilters` / **`OfferingFormFields`**（2.1 の最大重複を解消）

### 4.4 ページの薄化

各 `page.tsx` を「params取得 + フック呼び出し + featuresコンポーネント配置」のみに縮小する。**目標: 全 page.tsx 150行以下。**

- `posts/page 479` → `PostsFeed` + `usePostsList`
- `courses/page 437` → `CourseFilters` + `CourseList`
- `AuthForm 524` → `LoginForm` / `RegisterForm` / `GoogleAuthButton` / `useAuthSubmit` / `validateAuthForm`
- `settings/page 295` → 既存 `features/settings/` へ

## 5. フェーズ

各フェーズは1コミット。**各コミット時点で `npm run lint` と `npm run build` が通ることを必須条件とする。**

### 5.1 `feature/#113` との衝突面

本ブランチは main から分岐しており、`feature/#113`（未マージ、frontend 22ファイル・712行変更）の内容を含まない。
差分を調査した結果、#113 が触る frontend は以下に限られる。

`notifications/*` / `settings/page.tsx` / `settings/NotificationSection.tsx` / `posts/[id]/page.tsx` /
`layout/sidebar/*` / `constants/app.ts` / `constants/settings.ts` / `types/user.ts` / `app/providers.tsx`

**courses 配下・`posts/page.tsx`（一覧）・`AuthForm.tsx` には #113 は一切触れていない。**
したがって衝突リスクは P5 に集中し、P2〜P4 は衝突しない。

緩和策: 衝突しないフェーズを先に進める。#113 が main にマージされた時点で速やかに rebase し、
その後に P5 へ着手する。#113 が長期間マージされない場合は P5 を保留し、P6 まで先に完了させる。

### 5.2 フェーズ一覧

| # | 内容 | #113衝突 | リスク |
|---|---|---|---|
| P0 | 既存 lint エラー2件の修正（別コミット）+ `lib/api.ts` 拡張 + `hooks/` 4種の追加（既存コードは未変更、純粋な追加） | なし | 低 |
| P1 | 共通UI部品の抽出・昇格（posts の描画結果は不変であること） | なし | 中 |
| P2 | courses 5ページの移行（重複の中心） | なし | 中 |
| P3 | posts 一覧の移行 | なし | **高** |
| P4 | auth（`AuthForm` 分解） | なし | 中 |
| P6 | 仕上げ（`credentials` 冗長指定24箇所の除去、デッドコード除去） | 一部 | 低 |
| P5 | settings / notifications / admin（**#113 マージ後に実施**） | **あり** | 中 |

**P3 が最高リスク**: `posts/page.tsx` はスクロール位置復元（`usePostsListRestore`、`skipNextFetchRef` 等の ref 群）を含む。
この復元ロジックは**意味を変えずフックへ丸ごと移設する**こと。ロジックの「整理」を同時に行わない。

## 6. 検証

テストが存在しないため、以下で担保する。

1. 各フェーズ末に `npm run lint` と `npm run build`

   **baseline 状態（origin/main 47014e2）**: `build` は成功。`lint` は既存エラー2件で失敗する。
   - `src/constants/calendarEvents.ts:512,515` — `prefer-const`（`--fix` で自動修正可能）
   - その他 warning 8件（`no-img-element` ×3、`react-hooks/exhaustive-deps` ×1 等）

   **P0 冒頭でこの既存エラー2件を `eslint --fix` で解消し、以降は「`npm run lint` がエラー0件」を合格条件とする。**
   この修正はリファクタ差分と混ぜず、単独コミットにする。
   warning 8件（`no-img-element` ×3、`react-hooks/exhaustive-deps` 等）は挙動を変えるリスクがあるため本作業のスコープ外とし、
   **件数を増やさないこと**のみを条件とする。
2. `docker compose up` で主要フローを手動確認
   （**注意**: 本作業は worktree 内で行うため、元のチェックアウトで docker compose が起動中だと
   ポート3000/3001が衝突する。手動確認時はどちらか一方のみを起動すること）
   - 投稿一覧 / 投稿詳細 / 新規投稿 / 投稿編集
   - ログイン / 新規登録 / Googleログイン
   - 授業一覧 / 授業詳細 / 授業登録 / 開講情報追加 / レビュー投稿
   - 設定 / 通知
   - **スクロール位置復元**（P3 の回帰確認として必須）
3. **各フェーズ完了ごとに依頼者が動作確認する**。P6まで通しで進めてから一括確認はしない。
4. 挙動を変えた箇所は全てコミットメッセージと最終報告に明記する

## 7. スコープ外

- バックエンド（`backend/`）の変更
- 未コミットの `backend/db/schema.rb` の差分（触らない）
- テストフレームワークの導入（依頼者が「テストは後」と判断済み）
- 機能追加・UIデザインの変更（バグ修正を除く）

## 8. 既知のリスク

テスト無しでのフロントエンド全体リファクタは、デグレ検出を手動確認のみに依存する。
本設計ではフェーズ分割と各フェーズでの依頼者確認によってこれを緩和するが、リスクをゼロにはできない。
