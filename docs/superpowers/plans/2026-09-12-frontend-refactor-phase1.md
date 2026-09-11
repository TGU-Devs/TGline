# フロントエンドリファクタリング Phase 1（courses 重複解消 + 共有レイヤー導入）実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** courses 配下5ページに存在する重複コンポーネントを共有部品へ統合し、あわせて API エラー処理と認証ガードの共有レイヤーを導入する。

**Architecture:** ボトムアップだが「作って即座に採用し、重複元を削除する」ことを各タスクの完了条件とする。共有部品だけを先に追加して未使用のまま残すことはしない。各タスクは独立してレビュー可能で、完了時点で `lint` と `build` が通る。

**Tech Stack:** Next.js 15 App Router / React 19 / TypeScript / TailwindCSS 4 / shadcn-ui

**Spec:** `docs/superpowers/specs/2026-09-11-frontend-refactor-design.md`

## Global Constraints

- **見た目を変えない。** 生成される DOM と className 文字列は移行前と一字一句同一であること。唯一の例外は「明らかなバグの修正」で、それは独立したコミットに分離する。
- 作業ディレクトリは worktree `/Users/takagikuga/Desktop/TGU/.claude/worktrees/refactor-frontend-structure`。元のチェックアウト（`feature/#113`）には触れない。
- すべての npm コマンドは `frontend/` ディレクトリで実行する。
- `npm run lint` は **Task 1 完了後はエラー0件**であること。warning は8件から**増やさない**。
- `npm run build` は毎タスクで成功すること。実行時は環境変数が必要:
  `NEXT_PUBLIC_API_URL=http://localhost:3001 NEXT_PUBLIC_GOOGLE_CLIENT_ID=dummy npm run build`
- テストフレームワークは存在しない。検証は `lint` + `build` + 手動確認で行う。テストの新規導入は本計画のスコープ外。
- 本計画は `feature/#113` が触るファイル（`notifications/*`, `settings/page.tsx`, `posts/[id]/page.tsx`, `layout/sidebar/*`, `constants/*`, `types/user.ts`, `app/providers.tsx`）を**変更しない**。

---

### Task 1: 既存 lint エラーの解消

**Files:**
- Modify: `frontend/src/constants/calendarEvents.ts:512,515`

**Interfaces:**
- Consumes: なし
- Produces: なし（以降の全タスクが「lint エラー0件」を合格条件にできる状態）

- [ ] **Step 1: 現状のエラーを確認する**

`frontend/` で実行:

```
npm run lint 2>&1 | grep error
```

期待される出力:

```
  512:9   error  'generatedEvents' is never reassigned. Use 'const' instead  prefer-const
  515:13  error  'currentDate' is never reassigned. Use 'const' instead      prefer-const
```

- [ ] **Step 2: 該当箇所を確認する**

```
sed -n '510,517p' src/constants/calendarEvents.ts
```

- [ ] **Step 3: 自動修正する**

```
npx eslint src/constants/calendarEvents.ts --fix
```

- [ ] **Step 4: 差分が `let` → `const` の2箇所だけであることを確認する**

差分を表示し、`let generatedEvents` → `const generatedEvents`、`let currentDate` → `const currentDate` の2行のみであることを確認する。これ以外の変更（インデント・クォート等）が含まれていたら変更を破棄し、手動で2行だけ書き換えること。

- [ ] **Step 5: lint がエラー0件になることを確認する**

```
npm run lint 2>&1 | tail -3
```

期待: `✖ 8 problems (0 errors, 8 warnings)`

- [ ] **Step 6: build が通ることを確認する**

```
NEXT_PUBLIC_API_URL=http://localhost:3001 NEXT_PUBLIC_GOOGLE_CLIENT_ID=dummy npm run build 2>&1 | tail -5
```

- [ ] **Step 7: コミット**

`frontend/src/constants/calendarEvents.ts` をステージしてコミットする。メッセージ:

```
fix: calendarEvents.ts の prefer-const エラーを解消

再代入されない let を const に変更。baseline から存在した lint エラー2件を
解消し、以降のフェーズで lint エラー0件を合格条件にできるようにする。
```

---

### Task 2: courses のフォーム入力部品を `ui/form/` へ統合

重複の中心。`FieldLabel` の同一定義3つ、および `TextInput`/`OfferingInput`、`SelectInput`/`OfferingSelect` の同一実装ペアを1つにまとめる。

**Files:**
- Create: `frontend/src/components/ui/form/FieldLabel.tsx`
- Create: `frontend/src/components/ui/form/TextField.tsx`
- Create: `frontend/src/components/ui/form/SelectField.tsx`
- Modify: `frontend/src/app/(public)/courses/new/page.tsx`（ローカル定義3つを削除し import に置換）
- Modify: `frontend/src/app/(public)/courses/[id]/offerings/new/page.tsx`（同上）
- Modify: `frontend/src/app/(public)/courses/[id]/offerings/[offeringId]/reviews/new/page.tsx`（`FieldLabel` のみ）

**Interfaces:**
- Consumes: なし
- Produces:
  - `FieldLabel({ label: string; required: boolean })` — default export
  - `TextField({ label: string; value: string; onChange: (value: string) => void; required?: boolean; inputMode?: "numeric"; surface?: FieldSurface })` — default export
  - `SelectField({ label: string; value: string; onChange: (value: string) => void; options: readonly string[]; required?: boolean; getLabel?: (value: string) => string; surface?: FieldSurface })` — default export
  - `type FieldSurface = "background" | "card"` と `fieldSurfaceClass: Record<FieldSurface, string>` — `TextField.tsx` から named export

**重要（見た目の保持）:** `courses/new` の入力欄は `bg-background`、`offerings/new` は `bg-card` を使っており**同一ではない**。`--background: oklch(0.95 0.01 230)` と `--card: oklch(0.98 0.008 230)` は light モードで別の色なので、どちらかに寄せると見た目が変わる。`surface` プロパティで両方を厳密に保持すること。

- [ ] **Step 1: 移行元の3実装が同一出力であることを確認する**

`frontend/` で実行:

```
sed -n '285,297p' 'src/app/(public)/courses/new/page.tsx'
sed -n '301,311p' 'src/app/(public)/courses/[id]/offerings/new/page.tsx'
sed -n '252,262p' 'src/app/(public)/courses/[id]/offerings/[offeringId]/reviews/new/page.tsx'
```

期待: 3つとも `<span className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">` で始まり、必須/任意バッジの className も同一（改行位置だけが異なる）。差異があれば作業を止めて報告すること。

- [ ] **Step 2: `FieldLabel` を作成する**

`frontend/src/components/ui/form/FieldLabel.tsx`:

```tsx
type FieldLabelProps = {
  label: string;
  required: boolean;
};

const FieldLabel = ({ label, required }: FieldLabelProps) => {
  return (
    <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
      {label}
      <span
        className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold ${
          required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {required ? "必須" : "任意"}
      </span>
    </span>
  );
};

export default FieldLabel;
```

- [ ] **Step 3: `TextField` を作成する**

`frontend/src/components/ui/form/TextField.tsx`:

```tsx
import FieldLabel from "./FieldLabel";

export type FieldSurface = "background" | "card";

export const fieldSurfaceClass: Record<FieldSurface, string> = {
  background: "bg-background",
  card: "bg-card",
};

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "numeric";
  surface?: FieldSurface;
};

const TextField = ({
  label,
  value,
  onChange,
  required = false,
  inputMode,
  surface = "background",
}: TextFieldProps) => {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        inputMode={inputMode}
        className={`h-11 w-full rounded-md border border-input ${fieldSurfaceClass[surface]} px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20`}
      />
    </label>
  );
};

export default TextField;
```

注意: className のクラス順序は移行元と完全に一致させてある。並べ替えないこと。`fieldSurfaceClass` に `"bg-background"` / `"bg-card"` のリテラル文字列が含まれているため Tailwind のスキャナが検出できる。動的な文字列結合にはしないこと。

- [ ] **Step 4: `SelectField` を作成する**

`frontend/src/components/ui/form/SelectField.tsx`:

```tsx
import FieldLabel from "./FieldLabel";
import { fieldSurfaceClass, type FieldSurface } from "./TextField";

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  required?: boolean;
  getLabel?: (value: string) => string;
  surface?: FieldSurface;
};

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
  getLabel,
  surface = "background",
}: SelectFieldProps) => {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`h-11 w-full rounded-md border border-input ${fieldSurfaceClass[surface]} px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel ? getLabel(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SelectField;
```

- [ ] **Step 5: `courses/new/page.tsx` を移行する**

1. ファイル末尾のローカル定義 `TextInput` / `SelectInput` / `FieldLabel`（224行目以降）を**削除**する。
2. import を追加する（既存の import ブロック内、`@/lib/api` の前）:

```tsx
import SelectField from "@/components/ui/form/SelectField";
import TextField from "@/components/ui/form/TextField";
```

3. JSX 内の `<TextInput` を `<TextField`、`<SelectInput` を `<SelectField` に置換する。このページは `bg-background` なので `surface` は**渡さない**（デフォルトが `background`）。

- [ ] **Step 6: `offerings/new/page.tsx` を移行する**

1. ファイル末尾のローカル定義 `FieldLabel` / `OfferingInput` / `OfferingSelect`（301行目以降）を**削除**する。
2. import を追加する:

```tsx
import SelectField from "@/components/ui/form/SelectField";
import TextField from "@/components/ui/form/TextField";
```

3. `<OfferingInput` を `<TextField`、`<OfferingSelect` を `<SelectField` に置換する。
4. **このページは `bg-card` なので、置換した全ての `<TextField` / `<SelectField` に `surface="card"` を追加する。** これを忘れると入力欄の背景色が変わる（= 見た目の変更）。

- [ ] **Step 7: `reviews/new/page.tsx` を移行する**

このページは `FieldLabel` のみを共有する（`ScoreInput` と `OptionGroup` は当ページ固有のため残す）。

1. ローカル定義 `FieldLabel`（252行目）を**削除**する。
2. import を追加する:

```tsx
import FieldLabel from "@/components/ui/form/FieldLabel";
```

- [ ] **Step 8: 重複が消えたことを確認する**

```
grep -rn "^function \(FieldLabel\|TextInput\|SelectInput\|OfferingInput\|OfferingSelect\)" src
```

期待: **出力なし**（1件でも残っていたら削除漏れ）

- [ ] **Step 9: `surface="card"` の付け忘れを確認する**

```
grep -c 'surface="card"' 'src/app/(public)/courses/[id]/offerings/new/page.tsx'
grep -cE '<(TextField|SelectField)$|<(TextField|SelectField) ' 'src/app/(public)/courses/[id]/offerings/new/page.tsx'
```

期待: **2つの数値が一致すること**（実測 11 == 11）。一致しなければ `surface="card"` の付け忘れがある。

要素数のパターンは行末（`$`）も許容する必要がある。この JSX は props が複数行に分かれており、
`<TextField ` のように末尾スペースを要求するパターンでは1件もマッチしない。

あわせて `courses/new` 側も確認する:

```
grep -c 'surface=' 'src/app/(public)/courses/new/page.tsx'
```

期待: **0**（このページは既定の `background` を使うため `surface` を渡さない）。

- [ ] **Step 10: lint と build を確認する**

```
npm run lint 2>&1 | tail -3
NEXT_PUBLIC_API_URL=http://localhost:3001 NEXT_PUBLIC_GOOGLE_CLIENT_ID=dummy npm run build 2>&1 | tail -5
```

期待: lint はエラー0件・warning 8件、build 成功。

- [ ] **Step 11: 手動確認（依頼者に依頼する）**

元のチェックアウトで docker compose が起動していないことを確認してから起動する（ポート3000/3001が衝突するため）。

1. `/courses/new` — 全入力欄の背景が**薄い灰色**（`bg-background`）で、必須/任意バッジが表示される
2. `/courses/<id>/offerings/new` — 全入力欄の背景が**白に近い色**（`bg-card`）である
3. `/courses/<id>/offerings/<offeringId>/reviews/new` — 必須/任意バッジが表示される
4. 各ページでフォームを実際に送信し、作成が成功すること

- [ ] **Step 12: コミット**

`frontend/src/components/ui/form` と `frontend/src/app/(public)/courses` をステージしてコミットする。メッセージ:

```
refactor: courses のフォーム入力部品を ui/form へ統合

FieldLabel の同一定義3つ、TextInput/OfferingInput、SelectInput/OfferingSelect
をそれぞれ1つにまとめる。

courses/new は bg-background、offerings/new は bg-card と背景色が異なるため、
surface プロパティで両方の見た目を厳密に保持している。DOM と className は
移行前と同一。
```

---

### Task 3: courses の表示部品を `features/courses/components/` へ統合

**Files:**
- Create: `frontend/src/components/features/courses/components/Metric.tsx`
- Create: `frontend/src/components/features/courses/components/ScoreSummary.tsx`
- Modify: `frontend/src/app/(public)/courses/[id]/page.tsx:243-266`（ローカル定義を削除し import に置換）
- Modify: `frontend/src/app/(public)/courses/[id]/offerings/[offeringId]/page.tsx:194-214`（同上）

**Interfaces:**
- Consumes: なし
- Produces:
  - `Metric({ label: string; value: string; icon: ReactNode })` — default export
  - `ScoreSummary({ field: RatingScoreField; value: number | null | undefined })` — default export

- [ ] **Step 1: 2つの実装が同一であることを確認する**

`frontend/` で実行:

```
sed -n '243,266p' 'src/app/(public)/courses/[id]/page.tsx' > /tmp/metric_a.txt
sed -n '194,214p' 'src/app/(public)/courses/[id]/offerings/[offeringId]/page.tsx' > /tmp/metric_b.txt
diff /tmp/metric_a.txt /tmp/metric_b.txt
```

**差分が出た場合は統合してはいけない。** 差分の内容を報告し、指示を仰ぐこと。差分が無い場合のみ Step 2 に進む。

- [ ] **Step 2: `Metric.tsx` を作成する**

`frontend/src/components/features/courses/components/Metric.tsx`:

```tsx
import type { ReactNode } from "react";

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-xl font-bold text-slate-900">
        {icon}
        {value}
      </div>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export default Metric;
```

- [ ] **Step 2b: `ScoreSummary.tsx` を作成する**

`ratingLabels` / `formatRatingScore` / `RatingScoreField` はいずれも
`@/components/features/courses/labels` にある（`RatingScoreField` は `labels.ts:46` で定義）。

`frontend/src/components/features/courses/components/ScoreSummary.tsx`:

```tsx
import {
  formatRatingScore,
  ratingLabels,
  type RatingScoreField,
} from "@/components/features/courses/labels";

function ScoreSummary({ field, value }: { field: RatingScoreField; value: number | null | undefined }) {
  return (
    <div className="rounded-md bg-background p-3">
      <p className="text-xs font-semibold text-muted-foreground">{ratingLabels[field]}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{formatRatingScore(field, value)}</p>
    </div>
  );
}

export default ScoreSummary;
```

`ratingLabels` と `formatRatingScore` が `labels.ts` から named export されていることを
事前に確認すること（されていなければ import 元を実際の定義箇所に合わせる）:

```
grep -n "export" src/components/features/courses/labels.ts
```

- [ ] **Step 3: `courses/[id]/page.tsx` を移行する**

ローカル定義の `Metric` と `ScoreSummary` を削除し、import を追加する:

```tsx
import Metric from "@/components/features/courses/components/Metric";
import ScoreSummary from "@/components/features/courses/components/ScoreSummary";
```

JSX の呼び出し箇所は名前が同じなので変更不要。

- [ ] **Step 4: `offerings/[offeringId]/page.tsx` を移行する**

同様にローカル定義の `Metric` と `ScoreSummary` を削除し、同じ import を追加する。このファイルの `ReviewScore` と `ReviewMeta` は当ページ固有のため**残す**。

- [ ] **Step 5: 重複が消えたことを確認する**

```
grep -rn "^function \(Metric\|ScoreSummary\)" src
```

期待: **出力なし**

- [ ] **Step 6: lint と build を確認する**

```
npm run lint 2>&1 | tail -3
NEXT_PUBLIC_API_URL=http://localhost:3001 NEXT_PUBLIC_GOOGLE_CLIENT_ID=dummy npm run build 2>&1 | tail -5
```

- [ ] **Step 7: 手動確認（依頼者に依頼する）**

1. `/courses/<id>` — 授業詳細の指標（Metric）とスコア表示が移行前と同じ見た目であること
2. `/courses/<id>/offerings/<offeringId>` — 同上。レビュー個別のスコア表示も崩れていないこと

- [ ] **Step 8: コミット**

`frontend/src/components/features/courses` と `frontend/src/app/(public)/courses` をステージしてコミットする。メッセージ:

```
refactor: courses の Metric/ScoreSummary の重複定義を統合

courses/[id] と courses/[id]/offerings/[offeringId] に同一定義されていた
2コンポーネントを features/courses/components へ移動。実装は無改変。
```

---

### Task 4: API エラー処理を `lib/api.ts` に集約

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/app/(public)/courses/new/page.tsx`
- Modify: `frontend/src/app/(public)/courses/[id]/offerings/new/page.tsx`
- Modify: `frontend/src/app/(public)/courses/[id]/offerings/[offeringId]/reviews/new/page.tsx`

**Interfaces:**
- Consumes: なし
- Produces:
  - `class ApiError extends Error` with `readonly status: number` — named export from `@/lib/api`
  - `extractApiError(res: Response, fallback: string): Promise<string>` — named export
  - `apiJson<T>(path: string, init?: RequestInit, fallbackMessage?: string): Promise<T>` — named export（`res.ok` が false なら `ApiError` を throw）

- [ ] **Step 1: 既存のエラー抽出パターンを洗い出す**

```
grep -rn "errors?.join\|data?.error" src
```

移行対象を一覧化しておくこと。Task 4 では courses の3フォームページのみを移行する。

- [ ] **Step 2: `lib/api.ts` に追加する**

`frontend/src/lib/api.ts` の末尾に追記する（既存の `apiUrl` / `apiFetch` は変更しない）:

```ts
export class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export const extractApiError = async (
    res: Response,
    fallback: string,
): Promise<string> => {
    const data = await res.json().catch(() => null);
    return data?.error || data?.errors?.join?.(" / ") || fallback;
};

export const apiJson = async <T>(
    path: string,
    init: RequestInit = {},
    fallbackMessage = "エラーが発生しました",
): Promise<T> => {
    const res = await apiFetch(path, init);

    if (!res.ok) {
        throw new ApiError(await extractApiError(res, fallbackMessage), res.status);
    }

    return (await res.json()) as T;
};
```

- [ ] **Step 3: `courses/new/page.tsx` の送信処理を移行する**

移行前（`handleSubmit` 内）:

```tsx
const res = await apiFetch("/api/courses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ /* course, course_offering */ }),
});

if (res.status === 401) {
  setIsAuthenticated(false);
  setShowLoginModal(true);
  return;
}

if (!res.ok) {
  const data = await res.json().catch(() => null);
  throw new Error(data?.error || data?.errors?.join?.(" / ") || "授業の作成に失敗しました");
}

const created = (await res.json()) as Course;
router.push(`/courses/${created.id}`);
```

移行後:

```tsx
try {
  const created = await apiJson<Course>(
    "/api/courses",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ /* course, course_offering — 移行前と同じ内容 */ }),
    },
    "授業の作成に失敗しました",
  );
  router.push(`/courses/${created.id}`);
} catch (err) {
  if (err instanceof ApiError && err.status === 401) {
    setIsAuthenticated(false);
    setShowLoginModal(true);
    return;
  }
  throw err;
}
```

注意点:
- `credentials: "include"` は削除する（`apiFetch` が既定で付与するため挙動は変わらない）
- 401 の分岐は**必ず残す**。`ApiError` の `status` で判定する
- 外側の `catch (err) { setError(...) }` と `finally { setIsCreating(false) }` は既存のまま残す
- import を更新: `import { ApiError, apiJson } from "@/lib/api";`（`apiFetch` が同ファイル内の他所で使われていなければ import から削除する）

- [ ] **Step 4: `offerings/new/page.tsx` を同じ形に移行する**

同じ手順。fallback メッセージは移行前に使われていた文言をそのまま使うこと。勝手に文言を変えない。移行前の文字列を `grep "に失敗しました" 'src/app/(public)/courses/[id]/offerings/new/page.tsx'` で確認する。

- [ ] **Step 5: `reviews/new/page.tsx` を同じ形に移行する**

同じ手順。fallback メッセージは移行前の文言をそのまま使う。

- [ ] **Step 6: 移行した3ファイルから重複パターンが消えたことを確認する**

```
grep -n "errors?.join\|credentials: \"include\"" 'src/app/(public)/courses/new/page.tsx' 'src/app/(public)/courses/[id]/offerings/new/page.tsx' 'src/app/(public)/courses/[id]/offerings/[offeringId]/reviews/new/page.tsx'
```

期待: **出力なし**

- [ ] **Step 7: lint と build を確認する**

```
npm run lint 2>&1 | tail -3
NEXT_PUBLIC_API_URL=http://localhost:3001 NEXT_PUBLIC_GOOGLE_CLIENT_ID=dummy npm run build 2>&1 | tail -5
```

- [ ] **Step 8: 手動確認（依頼者に依頼する）— エラー経路が主目的**

1. `/courses/new` で意図的にサーバ側バリデーションに失敗する値を送信し、**エラーメッセージが移行前と同じ文言で表示される**こと
2. ログアウト状態で `/courses/new` を開き送信 → **ログイン促しモーダルが出る**こと（401 経路。ここが最も壊れやすい）
3. `/courses/<id>/offerings/new` と `.../reviews/new` でも同じ2点を確認
4. 正常系: 各フォームが成功し、期待どおりの画面へ遷移すること

- [ ] **Step 9: コミット**

`frontend/src/lib/api.ts` と `frontend/src/app/(public)/courses` をステージしてコミットする。メッセージ:

```
refactor: API エラー抽出と 401 判定を lib/api へ集約

ApiError / extractApiError / apiJson を追加し、courses の3フォームページを移行。
各所にコピペされていた data?.error || data?.errors?.join() を一元化し、
401 判定は ApiError.status で行うようにした。エラー文言と挙動は移行前と同じ。
```

---

### Task 5: 認証ガードを `useAuthGuard` に集約

courses 配下3ページは `UserContext` があるにもかかわらず `/api/users/me` を個別に直叩きしている。これを解消する。

**Files:**
- Create: `frontend/src/hooks/useAuthGuard.ts`
- Modify: `frontend/src/app/(public)/courses/new/page.tsx`
- Modify: `frontend/src/app/(public)/courses/[id]/offerings/new/page.tsx`
- Modify: `frontend/src/app/(public)/courses/[id]/offerings/[offeringId]/reviews/new/page.tsx`

**Interfaces:**
- Consumes: `useUser()` from `@/contexts/UserContext`（`{ user, isLoading, error, refreshUser, setUser }` を返す）
- Produces:
  - `useAuthGuard(): { isAuthenticated: boolean | null; showLoginModal: boolean; openLoginModal: () => void; closeLoginModal: () => void; requireAuth: () => boolean }` — named export
  - `isAuthenticated` は読み込み中 `null`、未ログイン `false`、ログイン済み `true`（移行前の3値と同じ意味）
  - `requireAuth()` は認証済みなら `true`、未認証ならモーダルを開いて `false`、読み込み中は `false`

- [ ] **Step 1: 移行前の挙動を正確に把握する**

```
grep -n "isAuthenticated\|showLoginModal\|users/me" 'src/app/(public)/courses/new/page.tsx'
```

移行前の意味論:
- 初期値 `null`（読み込み中）→ 送信ボタンは `disabled`
- `/api/users/me` が `res.ok` なら `true`、それ以外・例外なら `false` かつモーダルを開く
- 送信時に `false` ならモーダルを開いて中断、`null` なら何もせず中断

**この3値の意味論を変えないこと。**

- [ ] **Step 2: `useAuthGuard` を作成する**

`frontend/src/hooks/useAuthGuard.ts`:

```ts
"use client";

import { useCallback, useEffect, useState } from "react";

import { useUser } from "@/contexts/UserContext";

export const useAuthGuard = () => {
    const { user, isLoading } = useUser();
    const [showLoginModal, setShowLoginModal] = useState(false);

    const isAuthenticated = isLoading ? null : Boolean(user);

    useEffect(() => {
        if (isAuthenticated === false) {
            setShowLoginModal(true);
        }
    }, [isAuthenticated]);

    const openLoginModal = useCallback(() => setShowLoginModal(true), []);
    const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

    const requireAuth = useCallback(() => {
        if (isAuthenticated === true) return true;
        if (isAuthenticated === false) setShowLoginModal(true);
        return false;
    }, [isAuthenticated]);

    return {
        isAuthenticated,
        showLoginModal,
        openLoginModal,
        closeLoginModal,
        requireAuth,
    };
};
```

移行前は「マウント時に未認証ならモーダルを開く」挙動だった（`useEffect` 内の `if (!res.ok) setShowLoginModal(true)`）。上記の `useEffect` はそれを再現している。**この自動オープンを省略しないこと。**

- [ ] **Step 3: `courses/new/page.tsx` を移行する**

削除するもの:
- `const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);`
- `const [showLoginModal, setShowLoginModal] = useState(false);`
- `/api/users/me` を呼ぶ `useEffect` ブロック全体

追加するもの:

```tsx
import { useAuthGuard } from "@/hooks/useAuthGuard";
```

```tsx
const {
  isAuthenticated,
  showLoginModal,
  openLoginModal,
  closeLoginModal,
  requireAuth,
} = useAuthGuard();
```

書き換えるもの:
- `handleSubmit` 冒頭の `if (isAuthenticated === false) { setShowLoginModal(true); return; } if (isAuthenticated === null) return;` → `if (!requireAuth()) return;`
- Task 4 で入れた 401 分岐内の `setIsAuthenticated(false); setShowLoginModal(true);` → `openLoginModal();`（`setIsAuthenticated` は存在しなくなるため）
- `<LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />` → `<LoginPromptModal isOpen={showLoginModal} onClose={closeLoginModal} />`
- 送信ボタンの `disabled={isCreating || isAuthenticated === null}` は**そのまま残す**

401 は cookie 失効を意味するので `UserContext` の `refreshUser()` を呼ぶのが本来正しいが、**挙動変更になるため本タスクではモーダル表示のみに留める**（申し送り事項に記載済み）。

- [ ] **Step 4: `offerings/new/page.tsx` を移行する（JSX が courses/new と異なる）**

このページは `courses/new` と**認証まわりの JSX が違う**ので、同じ手順では移行できない。

削除するもの:
- `const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);`（59行目付近）
- `const [showLoginModal, setShowLoginModal] = useState(false);`（62行目付近）
- `/api/users/me` を呼ぶ `useEffect`
- `isAuthenticated` を監視してモーダルを開く `useEffect`（96-99行目付近）
  — この挙動は `useAuthGuard` 内の `useEffect` が引き継ぐ

追加・書き換えは Step 3 と同じ（import、フック呼び出し、`requireAuth()`、`closeLoginModal`）。

**加えて、送信ボタンの書き換えが必要**（285-287行目付近）:

移行前:

```tsx
<Button
  type={isAuthenticated === false ? "button" : "submit"}
  disabled={isSubmitting || isAuthenticated === null}
  onClick={isAuthenticated === false ? () => setShowLoginModal(true) : undefined}
  className="h-11 w-full rounded-md"
>
```

移行後（`type` と `disabled` は**変更しない**。`onClick` のみ差し替える）:

```tsx
<Button
  type={isAuthenticated === false ? "button" : "submit"}
  disabled={isSubmitting || isAuthenticated === null}
  onClick={isAuthenticated === false ? openLoginModal : undefined}
  className="h-11 w-full rounded-md"
>
```

- [ ] **Step 5: `reviews/new/page.tsx` を移行する**

このページの構造は `offerings/new` と同じ（`isAuthenticated` 監視の `useEffect` が94-97行目付近、
ボタンの `type`/`onClick` パターンが236-238行目付近）。Step 4 と同じ手順で移行する。
ボタンの `onClick` も同様に `openLoginModal` へ差し替えること。

- [ ] **Step 6: `/api/users/me` の直叩きが消えたことを確認する**

```
grep -rn "users/me" src
```

期待: **courses 配下に1件も残っていないこと。** 残っていたら移行漏れ。

courses 以外には以下が残るが、いずれも Phase 1 のスコープ外なので正常:

| ファイル | 扱い |
|---|---|
| `contexts/UserContext.tsx` | 正規の取得元。変更しない |
| `app/(private)/settings/page.tsx` | `feature/#113` が変更中のため触れない（Global Constraints） |
| `app/(private)/settings/security/delete-account/page.tsx` | Phase 2 以降で `useAuthGuard` 化を検討 |
| `components/features/posts/hooks/useCurrentUser.ts` | Phase 2 以降で `UserContext` への統合を検討 |

- [ ] **Step 7: lint と build を確認する**

```
npm run lint 2>&1 | tail -3
NEXT_PUBLIC_API_URL=http://localhost:3001 NEXT_PUBLIC_GOOGLE_CLIENT_ID=dummy npm run build 2>&1 | tail -5
```

- [ ] **Step 8: 手動確認（依頼者に依頼する）— 本タスク最大のリスク箇所**

**ログイン状態**で:
1. `/courses/new` を開く → **モーダルが出ないこと**（誤ると常時モーダルが出る）
2. 送信ボタンが押せること、送信が成功すること
3. `/courses/<id>/offerings/new` と `.../reviews/new` でも同じ

**ログアウト状態**で:
4. `/courses/new` を開く → ログイン促しモーダルが自動で出ること
5. モーダルを閉じてから送信 → 再びモーダルが出ること
6. 他2ページでも同じ

**リロード直後**:
7. ページ読み込み中に送信ボタンが `disabled` になっていること（`isAuthenticated === null` の間）

**セッション失効（この移行で挙動が変わる唯一の経路。必ず確認すること）**:

`UserContext` は `hasLoadedRef` によりプロバイダ生存中に1度しか `/api/users/me` を取得しない。
移行前は各ページがマウントのたびに再取得していたため、セッション失効を毎回検知できた。
移行後はリロードするまでキャッシュされた認証状態が使われる。

8. ログイン状態で `/courses/new` を開く（モーダルは出ない）
9. **リロードせずに**別タブでログアウトする、または cookie を削除する
10. SPA 内のリンクで `/courses` → `/courses/new` と移動する
11. 期待: マウント時にはモーダルが**出ない**（移行前は出ていた）。送信すると401でモーダルが出る

11 の挙動が許容できない場合は `useAuthGuard` のマウント時に `refreshUser()` を呼ぶ必要があるが、
それは API 呼び出しが増える設計変更であり、Phase 1 のスコープ外として見送っている。

- [ ] **Step 9: コミット**

`frontend/src/hooks/useAuthGuard.ts` と `frontend/src/app/(public)/courses` をステージしてコミットする。メッセージ:

```
refactor: courses の認証チェックを useAuthGuard に集約

UserContext があるにもかかわらず各ページが /api/users/me を直叩きしていた
問題を解消。読み込み中 null / 未認証 false / 認証済み true の3値の意味論と、
マウント時の自動モーダル表示の挙動は移行前と同じ。
```

---

### Task 6: posts のフォーム部品を実態に合う名前へ整理

`features/posts/components/form/` の部品は汎用プリミティブではなく posts 専用だが、名前が汎用に見えるため将来また「共有できそう」と誤解される。実態に合う名前へ移動する。**純粋な改名で、描画結果は変わらない。**

**Files:**
- Rename: `frontend/src/components/features/posts/components/form/FormInput.tsx` → `PostTitleField.tsx`
- Rename: `frontend/src/components/features/posts/components/form/FormTextarea.tsx` → `PostBodyField.tsx`
- Rename: `frontend/src/components/features/posts/components/form/FormActions.tsx` → `PostFormActions.tsx`
- Rename: `frontend/src/components/features/posts/components/form/Error.tsx` → `frontend/src/components/features/posts/components/shared/PostNotFound.tsx`
- Create: `frontend/src/components/features/posts/components/form/Error.tsx`（再エクスポートのみ）
- Modify: `frontend/src/components/features/posts/components/form/Form.tsx`（import 更新）
- Modify: `frontend/src/app/(private)/posts/[id]/edit/page.tsx`（import 更新）

**注意:** `frontend/src/app/(private)/posts/[id]/page.tsx` も `form/Error` を import しているが、**このファイルは `feature/#113` が変更するため本計画では触らない**（Global Constraints 参照）。そのため `form/Error.tsx` は削除せず、再エクスポートを一時的に残す。

**Interfaces:**
- Consumes: なし
- Produces:
  - `PostTitleField({ title: string; setTitle: (title: string) => void; error?: string })` — default export（中身は旧 `FormInput` と同一）
  - `PostBodyField({ body: string; setBody: (body: string) => void; error?: string })` — default export（中身は旧 `FormTextarea` と同一）
  - `PostFormActions({ newPost: boolean; isSubmitting: boolean; cancelUrl: string })` — default export（中身は旧 `FormActions` と同一）
  - `PostNotFound({ error?: string })` — default export（中身は旧 `ErrorUi` と同一）

- [ ] **Step 1: 現在の参照元をすべて洗い出す**

```
grep -rn "components/form/FormInput\|components/form/FormTextarea\|components/form/FormActions\|components/form/Error" src
```

出力された参照元を控えておく。Step 5 で更新する。

- [ ] **Step 2: 3ファイルを `git mv` で改名する**

`frontend/src/components/features/posts/components/form/` で:

```
git mv FormInput.tsx PostTitleField.tsx
git mv FormTextarea.tsx PostBodyField.tsx
git mv FormActions.tsx PostFormActions.tsx
```

各ファイル内の型名とコンポーネント名も合わせて変更する:
- `PostTitleField.tsx`: `FormInputProps` → `PostTitleFieldProps`、`const FormInput` → `const PostTitleField`、`export default PostTitleField`
- `PostBodyField.tsx`: `FormTextareaProps` → `PostBodyFieldProps`、`const FormTextarea` → `const PostBodyField`、`export default PostBodyField`
- `PostFormActions.tsx`: `FormActionsProps` → `PostFormActionsProps`、`const FormActions` → `const PostFormActions`、`export default PostFormActions`

**JSX の中身（className, ラベル文言, maxLength, placeholder 等）は一切変更しないこと。**

`PostTitleField.tsx` の末尾には元ファイル由来の余分なインデント（`export default FormInput;` の後ろ）があるので、そこだけは整えてよい。

- [ ] **Step 3: `Error.tsx` を `shared/PostNotFound.tsx` へ移す**

`frontend/src/components/features/posts/components/` で:

```
git mv form/Error.tsx shared/PostNotFound.tsx
```

`shared/PostNotFound.tsx` 内で `ErrorProps` → `PostNotFoundProps`、`const ErrorUi` → `const PostNotFound`、`export default PostNotFound` に変更する。**JSX は変更しない。**

- [ ] **Step 4: `form/Error.tsx` を再エクスポートとして作り直す**

`frontend/src/components/features/posts/components/form/Error.tsx`:

```tsx
// 互換のための再エクスポート。実体は shared/PostNotFound.tsx にある。
// posts/[id]/page.tsx は feature/#113 が変更中のため本計画では import を更新しない。
// #113 マージ後に posts/[id]/page.tsx の import を更新し、このファイルを削除すること。
export { default } from "../shared/PostNotFound";
```

- [ ] **Step 5: 参照元の import を更新する**

`form/Form.tsx`:

```tsx
import PostTitleField from "./PostTitleField";
import PostBodyField from "./PostBodyField";
import PostFormActions from "./PostFormActions";
```

JSX 内の `<FormInput` → `<PostTitleField`、`<FormTextarea` → `<PostBodyField`、`<FormActions` → `<PostFormActions` に置換する。

`app/(private)/posts/[id]/edit/page.tsx`:

```tsx
import PostNotFound from "@/components/features/posts/components/shared/PostNotFound";
```

JSX 内の使用箇所も新しい名前に合わせる（移行前の変数名は Step 1 の grep 結果で確認する）。

- [ ] **Step 6: 旧名の参照が残っていないことを確認する**

```
grep -rn "FormInput\|FormTextarea\|FormActions" src
```

期待: **出力なし**

`ErrorUi` は別扱いになる:

```
grep -rn "ErrorUi" src
```

期待: **`src/app/(private)/posts/[id]/page.tsx` の2行のみ**（13行目の import と91行目の使用）。
このファイルは `feature/#113` が変更中のため触らない（Global Constraints）。
Step 4 の再エクスポートによって import パスは有効なまま動作する。
`edit/page.tsx` 側の `ErrorUi` は Step 5 で `PostNotFound` に変わるので、ここには出てこない。

- [ ] **Step 7: 描画結果が変わっていないことを確認する**

```
git diff -M --stat
```

期待: 改名されたファイルが `R`（rename）として検出され、**内容の変更行は型名・コンポーネント名の定義行のみ**。JSX 行に差分が出ていたら戻すこと。

- [ ] **Step 8: lint と build を確認する**

```
npm run lint 2>&1 | tail -3
NEXT_PUBLIC_API_URL=http://localhost:3001 NEXT_PUBLIC_GOOGLE_CLIENT_ID=dummy npm run build 2>&1 | tail -5
```

- [ ] **Step 9: 手動確認（依頼者に依頼する）**

1. `/posts/new` — タイトル欄（100文字カウンタ）と本文欄（10000文字カウンタ）が移行前と同じ見た目・同じ挙動であること
2. 投稿を作成できること
3. `/posts/<id>/edit` — 編集フォームが表示され、保存できること
4. 存在しない投稿 `/posts/999999/edit` を開き、「一覧に戻る」付きのエラー画面が出ること
5. `/posts/<id>` — 投稿詳細が表示されること（再エクスポート経由の確認）

- [ ] **Step 10: コミット**

`frontend/src/components/features/posts` と `frontend/src/app/(private)/posts` をステージしてコミットする。メッセージ:

```
refactor: posts のフォーム部品を実態に合う名前へ改名

FormInput/FormTextarea/FormActions/Error はいずれも posts 専用の実装
（文言・文字数・遷移先がハードコード）であり、汎用名が誤解を招いていた。
PostTitleField/PostBodyField/PostFormActions/PostNotFound へ改名する。

posts/[id]/page.tsx は feature/#113 が変更中のため触らず、form/Error.tsx を
再エクスポートとして残している。#113 マージ後に削除すること。
```

---

## Phase 1 完了条件

- [ ] `npm run lint` がエラー0件・warning 8件（baseline から増えていない）
- [ ] `npm run build` が成功する
- [ ] `grep -rn "^function \(FieldLabel\|TextInput\|SelectInput\|OfferingInput\|OfferingSelect\|Metric\|ScoreSummary\)" src` が空
- [ ] `grep -rn "users/me" src` が `UserContext.tsx` の1件のみ
- [ ] 各タスクの手動確認項目がすべて通っている

## Phase 1 で意図的に行わないこと

### `OfferingFormFields` の抽出（設計書 4.3 の記載を訂正）

設計書は開講情報フォームを「11フィールドが丸ごと二重定義」「最大の重複」と記載しているが、
実装を読んだ結果**そのままでは共通化できない**ことが判明した。

| | `courses/new` | `offerings/new` |
|---|---|---|
| グリッド | `grid gap-4 md:grid-cols-2` | `grid gap-3 sm:grid-cols-2` |
| セクション | 「基本情報」「教室情報」の2つ + 区切り線 | 区切りなしの単一グリッド |
| フィールド順 | teacher_name → academic_year → semester → day_of_week → delivery_method → period → target_grade → (区切り) → campus → classroom | teacher_name → academic_year → semester → day_of_week → delivery_method → period → faculty/department → target_grade → campus → classroom |
| 学部・学科の位置 | 基本情報の先頭付近 | period の後 |
| 入力欄の背景 | `bg-background` | `bg-card` |

重複しているのは**フィールドの中身**であって、**レイアウト・順序・グループ化は別物**である。
共通化するには次のいずれかが必要:

1. どちらかのレイアウトに寄せる → **見た目の変更になりスコープ外**
2. 順序・グループ化・グリッドクラスをすべて props で受け取る → 削減する重複より複雑な部品になり、DRY の目的に反する

したがって Phase 1 では**フィールド単位の重複解消（Task 2）に留める**。
レイアウトを揃えてよいなら共通化できるが、それは「UIの統一」という別の意思決定であり、
依頼者の判断を仰いでから着手すること。

### その他

- posts と courses の入力欄スタイル統一（見た目の変更のため）
- `ui/ErrorUI` と `PostNotFound` の統合（挙動が異なる別物のため）
- `posts/page.tsx`（一覧）の分割 — Phase 2。スクロール位置復元を含み最高リスクのため独立させる
- `AuthForm.tsx` の分解 — Phase 3
- settings / notifications / admin — `feature/#113` マージ後に Phase 4
- テストフレームワークの導入

## 次フェーズへの申し送り

- `form/Error.tsx` の再エクスポートは `feature/#113` マージ後に削除する（Task 6 Step 4）
- 401 発生時に `UserContext.refreshUser()` を呼ぶべきだが、挙動変更になるため Phase 1 では見送った（Task 5 Step 3）
- `useApiResource` / `useApiList` / `useSubmit` は Phase 2 で posts 一覧を扱う際に、実際の利用箇所と同時に導入する（先に作ると未使用コードになるため）
