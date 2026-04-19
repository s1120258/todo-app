# Todo App — Design Spec

Date: 2026-04-18  
Status: Approved

## Overview

Next.js 13+ (App Router) で実装するシンプルなTODOアプリ。データはlocalStorageに保存し、バックエンド不要のフロントエンド完結構成。目的はClaude Codeの試運転。

## セットアップ

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

TypeScript + Tailwind CSS + ESLint + App Router + `src/` ディレクトリ + `@/*` エイリアスを一括セットアップ。

## データモデル

```typescript
type Priority = 'high' | 'medium' | 'low'

interface Category {
  id: string
  name: string
  color: string  // hex値 (e.g. "#ef4444")。CategoryManagerで事前定義パレットから選択
}

interface Todo {
  id: string
  title: string
  completed: boolean
  priority: Priority
  categoryId: string | null
  dueDate: string | null  // ISO 8601 (e.g. "2026-04-30")
  createdAt: string       // ISO 8601
}
```

localStorageに `todos`（`Todo[]`）と `categories`（`Category[]`）を別キーで保存。初回起動時は両方空。

## コンポーネント構成

```
app/
  layout.tsx              # フォント・グローバルスタイルのみ
  page.tsx                # ルート。useTodos/useCategories を呼び出し、子に渡す

src/
  components/
    TodoList.tsx          # Todo一覧（フィルタ済みリストを受け取り表示）
    TodoItem.tsx          # 1件分：完了切替・優先度バッジ・期限・編集/削除
    TodoForm.tsx          # インライン新規作成フォーム
    TodoEditModal.tsx     # タイトル・優先度・期限・カテゴリの編集モーダル
    CategoryManager.tsx   # カテゴリの作成・削除
    FilterBar.tsx         # カテゴリ・優先度・完了状態フィルタ
  hooks/
    useTodos.ts           # Todo CRUD + localStorage同期
    useCategories.ts      # Category CRUD + localStorage同期
  types/
    todo.ts               # Todo / Category / Priority の型定義
  lib/
    storage.ts            # localStorage 読み書きユーティリティ
```

すべてClient Component（`'use client'`）。状態管理はReact useState + カスタムフックのみ（外部ライブラリ不要）。

## 機能仕様

### Todo CRUD
- **作成**: TodoFormにタイトルを入力してEnter or ボタン送信。優先度はデフォルト `medium`、カテゴリ・期限はなしで作成。
- **完了切替**: TodoItemのチェックボックスで `completed` をトグル。
- **編集**: TodoEditModalでタイトル・優先度・期限・カテゴリをまとめて編集。
- **削除**: TodoItemの削除ボタンで即時削除（確認ダイアログなし）。

### カテゴリ管理
- CategoryManagerでカテゴリ名と色を指定して作成・削除。
- カテゴリ削除時、そのカテゴリに紐づくTodoの `categoryId` は `null` にリセット。

### フィルタリング
- FilterBarでカテゴリ・優先度・完了状態をAND条件でフィルタ。
- ソートは作成日降順（固定）。

### TodoItem の表示
| 要素 | 詳細 |
|---|---|
| チェックボックス | 完了切替 |
| タイトル | 完了時は打ち消し線 |
| 優先度バッジ | high=赤 / medium=黄 / low=緑 |
| カテゴリラベル | カテゴリの色で表示 |
| 期限日 | 期限切れは赤文字 |
| 編集・削除ボタン | ホバー時に表示 |

## UIレイアウト

```
┌─────────────────────────────────────┐
│ Header: アプリ名 + カテゴリ管理ボタン   │
├─────────────────────────────────────┤
│ FilterBar: カテゴリ / 優先度 / 完了状態 │
├─────────────────────────────────────┤
│ TodoForm: タイトル入力 + 追加ボタン     │
├─────────────────────────────────────┤
│ TodoList                            │
│  └ TodoItem × n                     │
└─────────────────────────────────────┘
```

スタイリングはTailwind CSS。デザインはシンプルなホワイト基調。

## テスト

今回はテストなし（Claude Code試運転が目的のため）。
