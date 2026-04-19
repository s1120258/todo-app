import { test, expect } from "@playwright/test";
import { TodoPage } from "../pages/TodoPage";

test.describe("カテゴリ管理", () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.clearStorage();
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

  test("カテゴリを削除するとフィルター選択肢から消える", async () => {
    await todoPage.openCategoryManager();
    await todoPage.addCategory("消えるカテゴリ");
    await todoPage.deleteCategory("消えるカテゴリ");
    await todoPage.closeCategoryManager();

    const options = await todoPage.getCategoryFilterOptions();
    expect(options).not.toContain("消えるカテゴリ");
  });
});
