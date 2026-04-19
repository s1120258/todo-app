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
    const input = this.page.getByPlaceholder("新しいタスクを入力...");
    await input.fill(title);
    await input.press("Enter");
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

  getTodoTitleLocator(title: string) {
    return this.page
      .locator("li")
      .filter({ hasText: title })
      .locator("p.text-sm");
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
    await this.page
      .locator(".fixed.inset-0")
      .getByRole("button", { name: "✕" })
      .click();
    await this.page.locator(".fixed.inset-0").waitFor({ state: "hidden" });
  }

  async deleteCategory(name: string) {
    const modal = this.page.locator(".fixed.inset-0");
    const row = modal.locator("li").filter({ hasText: name });
    await row.getByRole("button", { name: "削除" }).click();
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
