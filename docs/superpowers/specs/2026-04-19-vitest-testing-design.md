# Vitest Testing — Design Spec

Date: 2026-04-19  
Status: Approved

## Overview

Vitest + React Testing Library によるユニットテスト。リグレッション防止を目的として、ユーティリティ・フック・コンポーネントを対象にする。`page.tsx` は統合テストの範囲のため対象外。

## セットアップ

### インストール

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### vitest.config.ts（プロジェクトルートに新規作成）

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### src/test/setup.ts（新規作成）

```ts
import "@testing-library/jest-dom";
```

### package.json に追加

```json
"test": "vitest",
"test:run": "vitest run"
```

## モック戦略

- **localStorage**: jsdom が提供するインメモリ実装をそのまま使用。`beforeEach` で `localStorage.clear()` を実行し各テストを分離する。
- **crypto.randomUUID()**: `vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' })` で固定値に差し替え。

## テストファイル構成

ソースと同階層にコロケーション配置：

```
src/
  lib/
    storage.test.ts
  hooks/
    useTodos.test.ts
    useCategories.test.ts
  components/
    TodoForm.test.tsx
    TodoItem.test.tsx
    FilterBar.test.tsx
    CategoryManager.test.tsx
    TodoEditModal.test.tsx
    TodoList.test.tsx
  test/
    setup.ts
```

共有テストデータファイルは作成しない（YAGNI）。各テストファイル内にローカルで `mockTodo`・`mockCategory` を定義する。

## テスト仕様

### storage.test.ts

| テストケース               | 検証内容                            |
| -------------------------- | ----------------------------------- |
| 存在しないキーを読む       | fallback値が返る                    |
| 不正なJSONが保存されている | fallback値が返る（例外なし）        |
| 正常値を保存して読む       | パース結果が返る                    |
| SSR環境（window未定義）    | fallback値が返る                    |
| saveToStorage              | localStorage に JSON が書き込まれる |

### useTodos.test.ts

フックのテストは `renderHook` + `act` を使用。

| テストケース     | 検証内容                                                            |
| ---------------- | ------------------------------------------------------------------- |
| addTodo          | todosに追加される、priority: medium / completed: false がデフォルト |
| addTodo          | 新しいtodoがリストの先頭に追加される                                |
| toggleTodo       | completedが反転する                                                 |
| updateTodo       | 指定フィールドのみ更新される                                        |
| deleteTodo       | 対象IDのtodoが削除される                                            |
| resetCategory    | 対象categoryIdがnullになる、他のtodoは変わらない                    |
| localStorage同期 | 操作後に localStorage に保存される                                  |
| 初期化           | localStorage に保存済みデータがあれば復元される                     |

### useCategories.test.ts

| テストケース     | 検証内容                                        |
| ---------------- | ----------------------------------------------- |
| addCategory      | categoriesに追加される                          |
| deleteCategory   | 対象IDのカテゴリが削除される                    |
| localStorage同期 | 操作後に localStorage に保存される              |
| 初期化           | localStorage に保存済みデータがあれば復元される |

### TodoForm.test.tsx

| テストケース       | 検証内容                             |
| ------------------ | ------------------------------------ |
| 入力してEnter送信  | onAdd がトリム済みタイトルで呼ばれる |
| 入力してボタン送信 | onAdd が呼ばれる                     |
| 空入力で送信       | onAdd が呼ばれない                   |
| 空白のみで送信     | onAdd が呼ばれない                   |
| 送信後             | 入力フィールドがリセットされる       |

### TodoItem.test.tsx

| テストケース         | 検証内容                                     |
| -------------------- | -------------------------------------------- |
| タイトル表示         | todoのタイトルが表示される                   |
| 優先度バッジ         | high/medium/low に対応するラベルが表示される |
| カテゴリラベル       | categoryIdに対応するカテゴリ名が表示される   |
| 期限日表示           | dueDateが表示される                          |
| 期限切れ             | 今日より前のdueDateは赤色で表示される        |
| 完了済み             | タイトルに打ち消し線がつく                   |
| チェックボックス操作 | onToggle が todo.id で呼ばれる               |
| 削除ボタン           | onDelete が todo.id で呼ばれる               |
| 編集ボタン           | onEdit が todo オブジェクトで呼ばれる        |

### FilterBar.test.tsx

| テストケース       | 検証内容                                           |
| ------------------ | -------------------------------------------------- |
| カテゴリ選択       | onChange が `{ categoryId: 'id', ... }` で呼ばれる |
| カテゴリ未選択     | onChange が `{ categoryId: null, ... }` で呼ばれる |
| 優先度選択         | onChange が `{ priority: 'high', ... }` で呼ばれる |
| 完了状態選択       | onChange が `{ completed: true, ... }` で呼ばれる  |
| 完了状態「すべて」 | onChange が `{ completed: null, ... }` で呼ばれる  |

### CategoryManager.test.tsx

| テストケース     | 検証内容                             |
| ---------------- | ------------------------------------ |
| カテゴリ一覧表示 | 渡したカテゴリ名が表示される         |
| 空の状態         | 「カテゴリがありません」が表示される |
| 名前入力→追加    | onAdd が名前と色で呼ばれる           |
| 空入力で追加     | onAdd が呼ばれない                   |
| Enter で追加     | onAdd が呼ばれる                     |
| 削除ボタン       | onDelete がカテゴリIDで呼ばれる      |
| 閉じるボタン     | onClose が呼ばれる                   |

### TodoEditModal.test.tsx

| テストケース      | 検証内容                                 |
| ----------------- | ---------------------------------------- |
| 初期値反映        | todoの各フィールドがフォームに表示される |
| タイトル編集→保存 | onSave が更新済みタイトルで呼ばれる      |
| 空タイトルで保存  | onSave が呼ばれない                      |
| 優先度変更→保存   | onSave が新しい優先度で呼ばれる          |
| 期限日設定→保存   | onSave が dueDate で呼ばれる             |
| 期限日削除→保存   | onSave が `dueDate: null` で呼ばれる     |
| カテゴリ変更→保存 | onSave が新しい categoryId で呼ばれる    |
| キャンセル        | onClose が呼ばれ onSave は呼ばれない     |
| 保存後            | onClose が呼ばれる                       |

### TodoList.test.tsx

| テストケース       | 検証内容                                          |
| ------------------ | ------------------------------------------------- |
| todos が空         | 「タスクがありません」が表示される                |
| todos がある       | 各タイトルが表示される                            |
| コールバックの委譲 | TodoItem から onToggle/onDelete/onEdit が呼ばれる |
