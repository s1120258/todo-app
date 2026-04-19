# Playwright E2E Testing — Design Spec

Date: 2026-04-19  
Status: Approved

## Overview

Playwright + Chromium によるE2Eテスト。ユーザーフロー全体のリグレッション防止を目的として、タスクCRUDとカテゴリ管理を対象にする。GitHub Actions で mainブランチへの push / PR 時に Vitest ユニットテストと並列実行する。

## アーキテクチャ

Page Object Model（POM）を採用。`e2e/pages/TodoPage.ts` にセレクターと操作メソッドをまとめ、テストファイルはシナリオ記述のみに集中する。これによりUIセレクターの変更を1箇所で管理できる。

## セットアップ

### インストール

```bash
npm init playwright@latest -- --quiet --no-browsers
npx playwright install chromium
```

### ディレクトリ構成

```
e2e/
  pages/
    TodoPage.ts       ← POM：セレクター + 操作メソッド
  specs/
    todo.spec.ts      ← タスクCRUDシナリオ（4件）
    category.spec.ts  ← カテゴリ管理シナリオ（3件）
playwright.config.ts  ← Playwright設定
.github/
  workflows/
    ci.yml            ← Vitest + Playwright の統合CI
```

### `playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/specs",
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI ? "npm start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

CIでは `next build && next start` の安定性を優先するため、`npm start` を使用する（`CI=true` 環境変数で切り替え）。

### `package.json` に追加

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

## Page Object（`e2e/pages/TodoPage.ts`）

```ts
import { Page } from "@playwright/test";

export class TodoPage {
  constructor(private page: Page) {}

  async goto() { await this.page.goto("/"); }

  // タスク操作
  async addTodo(title: string) { ... }
  async toggleTodo(title: string) { ... }
  async deleteTodo(title: string) { ... }
  async getTodoTitles(): Promise<string[]> { ... }

  // カテゴリ操作
  async openCategoryManager() { ... }
  async addCategory(name: string) { ... }
  async closeCategoryManager() { ... }
  async filterByCategory(nameOrAll: string) { ... }

  // テスト分離
  async clearStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }
}
```

各テストの `beforeEach` で `clearStorage()` を呼び出し、テスト間の状態干渉を防ぐ。

## テストシナリオ

### `todo.spec.ts`（4シナリオ）

| シナリオ   | 検証内容                                                |
| ---------- | ------------------------------------------------------- |
| タスク追加 | タイトル入力→追加 → リストにタイトルが表示される        |
| タスク完了 | チェックボックスをクリック → タイトルに打ち消し線がつく |
| タスク削除 | 削除ボタンをクリック → リストから消える                 |
| 空状態表示 | タスクが0件 → 「タスクがありません」が表示される        |

### `category.spec.ts`（3シナリオ）

| シナリオ           | 検証内容                                                             |
| ------------------ | -------------------------------------------------------------------- |
| カテゴリ作成       | モーダルで名前入力→追加 → フィルター選択肢に表示される               |
| カテゴリフィルター | タスク2件作成・カテゴリ割当後にフィルター → 該当タスクのみ表示される |
| カテゴリ削除       | カテゴリを削除 → フィルター選択肢から消える                          |

カテゴリフィルターのシナリオは TodoEditModal でカテゴリを割り当てる操作を含む。

## GitHub Actions CI（`.github/workflows/ci.yml`）

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run test:run

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-chromium-${{ hashFiles('package-lock.json') }}
      - run: npx playwright install chromium --with-deps
      - run: npm run build
        env: { CI: true }
      - run: npm run test:e2e
        env: { CI: true }
```

2ジョブを並列実行し、ユニットテストとE2Eが独立して結果を返す。
