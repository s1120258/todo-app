# Todo App

Next.js (App Router) + TypeScript で実装したシンプルな TODO アプリ。バックエンド不要、データは localStorage に保存する。

## Tech Stack

| カテゴリ       | 技術                           |
| -------------- | ------------------------------ |
| フレームワーク | Next.js 16 (App Router)        |
| 言語           | TypeScript (strict)            |
| スタイリング   | Tailwind CSS v4                |
| ユニットテスト | Vitest + React Testing Library |
| E2E テスト     | Playwright (Chromium)          |
| CI             | GitHub Actions                 |

## 機能

- タスクの作成・完了切替・編集・削除
- 優先度設定（高 / 中 / 低）、期限日設定
- カテゴリの作成・削除・カラー設定
- カテゴリ / 優先度 / 完了状態によるフィルタリング（AND 条件）
- データは localStorage に永続化（`todos` / `categories` キー）

## アーキテクチャ

```text
app/
  layout.tsx              # ルートレイアウト
  page.tsx                # エントリーポイント。フックを呼び出して子コンポーネントに渡す

src/
  components/
    TodoForm.tsx          # タスク新規作成フォーム
    TodoList.tsx          # タスク一覧
    TodoItem.tsx          # タスク1件：完了切替・優先度バッジ・期限・編集/削除
    TodoEditModal.tsx     # タイトル・優先度・期限・カテゴリの編集モーダル
    FilterBar.tsx         # カテゴリ / 優先度 / 完了状態フィルタ
    CategoryManager.tsx   # カテゴリ作成・削除モーダル
  hooks/
    useTodos.ts           # Todo CRUD + localStorage 同期
    useCategories.ts      # Category CRUD + localStorage 同期
  types/
    todo.ts               # Todo / Category / Priority 型定義
  lib/
    storage.ts            # localStorage 読み書きユーティリティ

e2e/
  pages/
    TodoPage.ts           # Page Object Model（POM）
  specs/
    todo.spec.ts          # タスク CRUD シナリオ（4件）
    category.spec.ts      # カテゴリ管理シナリオ（3件）
```

すべて Client Component (`'use client'`)。状態管理は React useState + カスタムフックのみ。

## データモデル

```typescript
type Priority = "high" | "medium" | "low";

interface Category {
  id: string;
  name: string;
  color: string; // hex (e.g. "#ef4444")
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  categoryId: string | null;
  dueDate: string | null; // ISO 8601
  createdAt: string; // ISO 8601
}
```

## コマンド

```bash
npm run dev          # 開発サーバー起動 (http://localhost:3000)
npm run build        # プロダクションビルド
npm start            # プロダクションサーバー起動

npm test             # Vitest をウォッチモードで起動
npm run test:run     # Vitest を1回実行（60テスト）
npm run test:e2e     # Playwright E2E テスト実行（7テスト）
npm run test:e2e:ui  # Playwright UI モードで実行

npm run lint         # ESLint 実行
```

## テスト戦略

### ユニットテスト（Vitest + React Testing Library）

ソースファイルと同階層にコロケーション配置（`*.test.ts` / `*.test.tsx`）。

| ファイル                              | テスト数 | 対象                        |
| ------------------------------------- | -------- | --------------------------- |
| `lib/storage.test.ts`                 | 5        | localStorage ユーティリティ |
| `hooks/useTodos.test.ts`              | 8        | Todo CRUD・永続化           |
| `hooks/useCategories.test.ts`         | 4        | Category CRUD・永続化       |
| `components/TodoForm.test.tsx`        | 5        | フォーム入力・送信          |
| `components/TodoItem.test.tsx`        | 9        | 表示・操作コールバック      |
| `components/FilterBar.test.tsx`       | 5        | フィルター変更              |
| `components/CategoryManager.test.tsx` | 7        | カテゴリ追加・削除          |
| `components/TodoEditModal.test.tsx`   | 9        | 編集フォーム・保存          |
| `components/TodoList.test.tsx`        | 5        | 一覧表示・空状態            |
| **合計**                              | **60**   |                             |

### E2E テスト（Playwright + Chromium）

Page Object Model（POM）採用。`e2e/pages/TodoPage.ts` にすべてのセレクターと操作メソッドを集約し、テストファイルはシナリオ記述のみに集中する。

| ファイル           | シナリオ                                               |
| ------------------ | ------------------------------------------------------ |
| `todo.spec.ts`     | 空状態表示 / タスク追加 / 完了切替（打ち消し線）/ 削除 |
| `category.spec.ts` | カテゴリ作成 / カテゴリフィルター / カテゴリ削除       |

各テストは `beforeEach` で localStorage をクリアしてページをリロードし、テスト間の状態干渉を防ぐ。

## CI（GitHub Actions）

`main` ブランチへの push / PR 時に2ジョブを並列実行：

```text
unit-test  ─── npm run test:run
e2e        ─── npm run build → npm run test:e2e
```

E2E ジョブは Playwright ブラウザキャッシュ付き。失敗・キャンセル時は `playwright-report/` をアーティファクトとしてアップロード（7日間保持）。
