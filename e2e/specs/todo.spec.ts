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
