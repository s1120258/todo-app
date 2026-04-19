# Playwright E2E Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Playwright E2E tests covering todo CRUD and category management flows, with GitHub Actions CI running on main branch push/PR.

**Architecture:** Page Object Model — `e2e/pages/TodoPage.ts` wraps all selectors and actions; two spec files cover 7 scenarios; Playwright `webServer` config auto-starts the app; CI runs Vitest and Playwright as parallel jobs.

**Tech Stack:** @playwright/test, Chromium, GitHub Actions

---

## File Map

| Action | Path                         | Purpose                                                 |
| ------ | ---------------------------- | ------------------------------------------------------- |
| Create | `playwright.config.ts`       | Playwright configuration (Chromium, webServer, baseURL) |
| Create | `e2e/pages/TodoPage.ts`      | POM: all selectors and user-action methods              |
| Create | `e2e/specs/todo.spec.ts`     | 4 todo CRUD scenarios                                   |
| Create | `e2e/specs/category.spec.ts` | 3 category management scenarios                         |
| Create | `.github/workflows/ci.yml`   | Parallel CI: unit-test + e2e jobs                       |
| Modify | `package.json`               | Add `test:e2e` and `test:e2e:ui` scripts                |

---

### Task 1: Install Playwright and create config

**Files:**

- Create: `playwright.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install @playwright/test**

```bash
npm install -D @playwright/test
```

- [ ] **Step 2: Install Chromium browser**

```bash
npx playwright install chromium --with-deps
```

Expected: Chromium binary downloaded to `~/.cache/ms-playwright/`.

- [ ] **Step 3: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/specs",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
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
    timeout: 120000,
  },
});
```

Note: In CI, `process.env.CI` is `"true"`, so `npm start` (= `next start`) is used with the pre-built app. Locally, `npm run dev` is used and reused if already running.

- [ ] **Step 4: Add scripts to `package.json`**

Add to the `"scripts"` section (after `"test:coverage"`):

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

- [ ] **Step 5: Verify Playwright can find its config**

```bash
npx playwright test --list
```

Expected: `No tests found` or test list (no config errors).

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts package.json package-lock.json
git commit -m "test: add playwright with chromium config"
```

---

### Task 2: Create the Page Object (`e2e/pages/TodoPage.ts`)

**Files:**

- Create: `e2e/pages/TodoPage.ts`

**Key DOM facts from the source components:**

- Todo input placeholder: `"新しいタスクを入力..."`
- Todo add button: `type="submit"`, text `"追加"` — inside `<form>` in the main page
- Todo titles: `<p class="text-sm ...">` inside `<li>`
- Edit/Delete buttons: inside `div.opacity-0.group-hover:opacity-100` — hover the `<li>` first to reveal them
- Category manager button: text `"カテゴリ管理"` in the header
- Category modal outer div: class `fixed inset-0` (used to scope modal buttons)
- Category name input: placeholder `"カテゴリ名"`
- Category modal "追加" button: `type="submit"` inside the modal form
- Category modal close button: text `"✕"`
- Category modal delete buttons: text `"削除"`
- Edit modal header: text `"タスクを編集"`
- Edit modal priority select: first combobox (`nth(0)`)
- Edit modal category select: second combobox (`nth(1)`)
- Edit modal save button: text `"保存"`
- Filter bar: 3 `<select>` elements — `nth(0)` = category, `nth(1)` = priority, `nth(2)` = completed

- [ ] **Step 1: Create `e2e/pages/TodoPage.ts`**

```ts
import { Page } from "@playwright/test";

export class TodoPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/");
  }

  async clearStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  // --- Todo operations ---

  async addTodo(title: string) {
    await this.page.getByPlaceholder("新しいタスクを入力...").fill(title);
    await this.page.getByPlaceholder("新しいタスクを入力...").press("Enter");
  }

  async toggleTodo(title: string) {
    const item = this.page.locator("li").filter({ hasText: title });
    await item.getByRole("checkbox").click();
  }

  async deleteTodo(title: string) {
    const item = this.page.locator("li").filter({ hasText: title });
    await item.hover();
    await item.getByRole("button", { name: "削除" }).click();
  }

  async getTodoTitles(): Promise<string[]> {
    return this.page.locator("ul li p.text-sm").allTextContents();
  }

  // Opens edit modal, assigns categoryName, saves.
  async setTodoCategory(todoTitle: string, categoryName: string) {
    const item = this.page.locator("li").filter({ hasText: todoTitle });
    await item.hover();
    await item.getByRole("button", { name: "編集" }).click();
    await this.page.getByText("タスクを編集").waitFor();
    // combobox[0] = priority, combobox[1] = category
    await this.page
      .getByRole("combobox")
      .nth(1)
      .selectOption({ label: categoryName });
    await this.page.getByRole("button", { name: "保存" }).click();
    await this.page.getByText("タスクを編集").waitFor({ state: "hidden" });
  }

  // --- Category operations ---

  async openCategoryManager() {
    await this.page.getByRole("button", { name: "カテゴリ管理" }).click();
  }

  async addCategory(name: string) {
    await this.page.getByPlaceholder("カテゴリ名").fill(name);
    // Scope to modal to avoid the main form's 追加 button
    await this.page
      .locator(".fixed.inset-0")
      .getByRole("button", { name: "追加" })
      .click();
  }

  async closeCategoryManager() {
    await this.page.getByRole("button", { name: "✕" }).click();
    await this.page.locator(".fixed.inset-0").waitFor({ state: "hidden" });
  }

  async filterByCategory(nameOrAll: string) {
    const select = this.page.locator("select").nth(0);
    if (nameOrAll === "all") {
      await select.selectOption({ value: "" });
    } else {
      await select.selectOption({ label: nameOrAll });
    }
  }

  async getCategoryFilterOptions(): Promise<string[]> {
    return this.page
      .locator("select")
      .nth(0)
      .locator("option")
      .allTextContents();
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors. (Playwright types are included from `@playwright/test`.)

- [ ] **Step 3: Commit**

```bash
git add e2e/pages/TodoPage.ts
git commit -m "test: add TodoPage page object model"
```

---

### Task 3: Write `e2e/specs/todo.spec.ts`

**Files:**

- Create: `e2e/specs/todo.spec.ts`

The app must be running locally before this task. Start it: `npm run dev`

- [ ] **Step 1: Create `e2e/specs/todo.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { TodoPage } from "../pages/TodoPage";

test.describe("Todo CRUD", () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("空状態では「タスクがありません」を表示する", async ({ page }) => {
    await expect(page.getByText("タスクがありません")).toBeVisible();
  });

  test("タスクを追加するとリストに表示される", async ({ page }) => {
    await todoPage.addTodo("買い物に行く");
    await expect(page.getByText("買い物に行く")).toBeVisible();
  });

  test("チェックボックスをクリックすると打ち消し線がつく", async ({ page }) => {
    await todoPage.addTodo("運動する");
    await todoPage.toggleTodo("運動する");
    const title = page
      .locator("li")
      .filter({ hasText: "運動する" })
      .locator("p.text-sm");
    await expect(title).toHaveClass(/line-through/);
  });

  test("削除ボタンをクリックするとリストから消える", async ({ page }) => {
    await todoPage.addTodo("消えるタスク");
    await todoPage.deleteTodo("消えるタスク");
    await expect(page.getByText("消えるタスク")).not.toBeVisible();
    await expect(page.getByText("タスクがありません")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the tests (dev server must be running)**

```bash
npm run test:e2e
```

Expected output:

```
Running 4 tests using 1 worker
  ✓  todo.spec.ts:10 › Todo CRUD › 空状態では「タスクがありません」を表示する
  ✓  todo.spec.ts:14 › Todo CRUD › タスクを追加するとリストに表示される
  ✓  todo.spec.ts:20 › Todo CRUD › チェックボックスをクリックすると打ち消し線がつく
  ✓  todo.spec.ts:28 › Todo CRUD › 削除ボタンをクリックするとリストから消える
4 passed
```

If a test fails due to `opacity-0` buttons not being clickable, add `{ force: true }` to the click in `TodoPage.deleteTodo`:

```ts
await item.getByRole("button", { name: "削除" }).click({ force: true });
```

- [ ] **Step 3: Commit**

```bash
git add e2e/specs/todo.spec.ts
git commit -m "test: add todo CRUD e2e tests"
```

---

### Task 4: Write `e2e/specs/category.spec.ts`

**Files:**

- Create: `e2e/specs/category.spec.ts`

- [ ] **Step 1: Create `e2e/specs/category.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { TodoPage } from "../pages/TodoPage";

test.describe("カテゴリ管理", () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("カテゴリを追加するとフィルター選択肢に表示される", async () => {
    await todoPage.openCategoryManager();
    await todoPage.addCategory("仕事");
    await todoPage.closeCategoryManager();

    const options = await todoPage.getCategoryFilterOptions();
    expect(options).toContain("仕事");
  });

  test("カテゴリでフィルタリングすると該当タスクのみ表示される", async ({
    page,
  }) => {
    // カテゴリを作成
    await todoPage.openCategoryManager();
    await todoPage.addCategory("仕事");
    await todoPage.closeCategoryManager();

    // タスクを2件追加（新しいものが先頭に来るのでBが上）
    await todoPage.addTodo("個人のタスク");
    await todoPage.addTodo("仕事のタスク");

    // 仕事のタスクにカテゴリを割り当て
    await todoPage.setTodoCategory("仕事のタスク", "仕事");

    // カテゴリでフィルター → 仕事のタスクのみ表示
    await todoPage.filterByCategory("仕事");
    await expect(page.getByText("仕事のタスク")).toBeVisible();
    await expect(page.getByText("個人のタスク")).not.toBeVisible();

    // フィルター解除 → 両方表示
    await todoPage.filterByCategory("all");
    await expect(page.getByText("個人のタスク")).toBeVisible();
  });

  test("カテゴリを削除するとフィルター選択肢から消える", async ({ page }) => {
    await todoPage.openCategoryManager();
    await todoPage.addCategory("消えるカテゴリ");

    // モーダル内の削除ボタン（カテゴリが1件なので1個だけ）
    await this.page
      .locator(".fixed.inset-0")
      .getByRole("button", { name: "削除" })
      .click();

    await todoPage.closeCategoryManager();

    const options = await todoPage.getCategoryFilterOptions();
    expect(options).not.toContain("消えるカテゴリ");
  });
});
```

- [ ] **Step 2: Fix the `this.page` typo in the delete test**

The third test has a `this.page` reference that should be `page`. Replace that test with:

```ts
test("カテゴリを削除するとフィルター選択肢から消える", async ({ page }) => {
  await todoPage.openCategoryManager();
  await todoPage.addCategory("消えるカテゴリ");

  // モーダル内の削除ボタン（カテゴリが1件なので1個だけ）
  await page
    .locator(".fixed.inset-0")
    .getByRole("button", { name: "削除" })
    .click();

  await todoPage.closeCategoryManager();

  const options = await todoPage.getCategoryFilterOptions();
  expect(options).not.toContain("消えるカテゴリ");
});
```

The final `e2e/specs/category.spec.ts` should be:

```ts
import { test, expect } from "@playwright/test";
import { TodoPage } from "../pages/TodoPage";

test.describe("カテゴリ管理", () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("カテゴリを追加するとフィルター選択肢に表示される", async () => {
    await todoPage.openCategoryManager();
    await todoPage.addCategory("仕事");
    await todoPage.closeCategoryManager();

    const options = await todoPage.getCategoryFilterOptions();
    expect(options).toContain("仕事");
  });

  test("カテゴリでフィルタリングすると該当タスクのみ表示される", async ({
    page,
  }) => {
    await todoPage.openCategoryManager();
    await todoPage.addCategory("仕事");
    await todoPage.closeCategoryManager();

    await todoPage.addTodo("個人のタスク");
    await todoPage.addTodo("仕事のタスク");

    await todoPage.setTodoCategory("仕事のタスク", "仕事");

    await todoPage.filterByCategory("仕事");
    await expect(page.getByText("仕事のタスク")).toBeVisible();
    await expect(page.getByText("個人のタスク")).not.toBeVisible();

    await todoPage.filterByCategory("all");
    await expect(page.getByText("個人のタスク")).toBeVisible();
  });

  test("カテゴリを削除するとフィルター選択肢から消える", async ({ page }) => {
    await todoPage.openCategoryManager();
    await todoPage.addCategory("消えるカテゴリ");

    await page
      .locator(".fixed.inset-0")
      .getByRole("button", { name: "削除" })
      .click();

    await todoPage.closeCategoryManager();

    const options = await todoPage.getCategoryFilterOptions();
    expect(options).not.toContain("消えるカテゴリ");
  });
});
```

- [ ] **Step 3: Run all E2E tests**

```bash
npm run test:e2e
```

Expected: 7 tests passing (4 from todo.spec.ts + 3 from category.spec.ts).

If `not.toBeVisible()` fails for hidden elements (they exist in DOM but filtered), use `not.toBeAttached()` or `count()`:

```ts
await expect(page.getByText("個人のタスク")).toHaveCount(0);
```

- [ ] **Step 4: Commit**

```bash
git add e2e/specs/category.spec.ts
git commit -m "test: add category management e2e tests"
```

---

### Task 5: Create GitHub Actions CI workflow

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

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
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:run

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-chromium-${{ hashFiles('package-lock.json') }}
      - run: npx playwright install chromium --with-deps
      - run: npm run build
        env:
          CI: "true"
      - run: npm run test:e2e
        env:
          CI: "true"
```

Note: `CI: "true"` causes `playwright.config.ts` to use `npm start` (= `next start`) as the webServer command, serving the pre-built app from the `npm run build` step.

- [ ] **Step 2: Verify the YAML is valid**

```bash
cat .github/workflows/ci.yml
```

Expected: File contents display without error.

- [ ] **Step 3: Run all tests locally one final time**

```bash
npm run test:run && npm run test:e2e
```

Expected: Vitest 60 tests pass, Playwright 7 tests pass.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add github actions workflow for vitest and playwright"
```
