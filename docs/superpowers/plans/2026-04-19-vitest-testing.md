# Vitest Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vitest + React Testing Library unit tests for all utility, hook, and component files to prevent regressions.

**Architecture:** Co-located test files alongside source files; jsdom environment with in-memory localStorage; `renderHook` + `act` for hooks, `render` for components; `vi.stubGlobal` for crypto.randomUUID mocking.

**Tech Stack:** Vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom

---

## File Map

| Action | Path                                      | Purpose                                           |
| ------ | ----------------------------------------- | ------------------------------------------------- |
| Create | `vitest.config.ts`                        | Vitest configuration (jsdom, globals, path alias) |
| Create | `src/test/setup.ts`                       | Import @testing-library/jest-dom matchers         |
| Modify | `package.json`                            | Add `test` and `test:run` scripts                 |
| Modify | `tsconfig.json`                           | Add `"types": ["vitest/globals"]`                 |
| Create | `src/lib/storage.test.ts`                 | Tests for loadFromStorage / saveToStorage         |
| Create | `src/hooks/useTodos.test.ts`              | Tests for useTodos hook                           |
| Create | `src/hooks/useCategories.test.ts`         | Tests for useCategories hook                      |
| Create | `src/components/TodoForm.test.tsx`        | Tests for TodoForm component                      |
| Create | `src/components/TodoItem.test.tsx`        | Tests for TodoItem component                      |
| Create | `src/components/FilterBar.test.tsx`       | Tests for FilterBar component                     |
| Create | `src/components/CategoryManager.test.tsx` | Tests for CategoryManager component               |
| Create | `src/components/TodoEditModal.test.tsx`   | Tests for TodoEditModal component                 |
| Create | `src/components/TodoList.test.tsx`        | Tests for TodoList component                      |

---

### Task 1: Setup — install packages, config files, scripts

**Files:**

- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Expected: packages listed in `package.json` devDependencies.

- [ ] **Step 2: Create `vitest.config.ts`**

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

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Add `"types": ["vitest/globals"]` to `tsconfig.json` compilerOptions**

Before:

```json
"compilerOptions": {
  "target": "ES2017",
```

After:

```json
"compilerOptions": {
  "target": "ES2017",
  "types": ["vitest/globals"],
```

- [ ] **Step 5: Add test scripts to `package.json`**

Add inside the `"scripts"` object:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 6: Verify config works**

```bash
npm run test:run
```

Expected: "No test files found" or similar — no errors about missing config.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json package-lock.json tsconfig.json
git commit -m "test: add vitest setup with jsdom and React Testing Library"
```

---

### Task 2: `src/lib/storage.test.ts`

**Files:**

- Create: `src/lib/storage.test.ts`

- [ ] **Step 1: Write the tests**

```ts
import { loadFromStorage, saveToStorage } from "@/lib/storage";

beforeEach(() => {
  localStorage.clear();
});

describe("loadFromStorage", () => {
  it("returns fallback for missing key", () => {
    expect(loadFromStorage("nonexistent", "default")).toBe("default");
  });

  it("returns fallback for invalid JSON", () => {
    localStorage.setItem("bad", "not-json{{{");
    expect(loadFromStorage("bad", [])).toEqual([]);
  });

  it("returns parsed value for valid JSON", () => {
    localStorage.setItem("key", JSON.stringify({ a: 1 }));
    expect(loadFromStorage("key", {})).toEqual({ a: 1 });
  });

  it("returns fallback when window is undefined", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error
    delete globalThis.window;
    const result = loadFromStorage("key", "fallback");
    globalThis.window = originalWindow;
    expect(result).toBe("fallback");
  });
});

describe("saveToStorage", () => {
  it("writes JSON to localStorage", () => {
    saveToStorage("myKey", { x: 42 });
    expect(localStorage.getItem("myKey")).toBe(JSON.stringify({ x: 42 }));
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/lib/storage.test.ts
```

Expected: 5 passing tests.

- [ ] **Step 3: Commit**

```bash
git add src/lib/storage.test.ts
git commit -m "test: add storage utility tests"
```

---

### Task 3: `src/hooks/useTodos.test.ts`

**Files:**

- Create: `src/hooks/useTodos.test.ts`

- [ ] **Step 1: Write the tests**

```ts
import { renderHook, act } from "@testing-library/react";
import { useTodos } from "@/hooks/useTodos";

let uuidCounter = 0;

beforeEach(() => {
  localStorage.clear();
  uuidCounter = 0;
  vi.stubGlobal("crypto", { randomUUID: () => `uuid-${++uuidCounter}` });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useTodos", () => {
  it("addTodo: sets priority=medium and completed=false by default", () => {
    const { result } = renderHook(() => useTodos());
    act(() => {
      result.current.addTodo("Buy milk");
    });
    expect(result.current.todos[0]).toMatchObject({
      title: "Buy milk",
      priority: "medium",
      completed: false,
      categoryId: null,
      dueDate: null,
    });
  });

  it("addTodo: prepends new todo to the list", () => {
    const { result } = renderHook(() => useTodos());
    act(() => {
      result.current.addTodo("First");
    });
    act(() => {
      result.current.addTodo("Second");
    });
    expect(result.current.todos[0].title).toBe("Second");
    expect(result.current.todos[1].title).toBe("First");
  });

  it("toggleTodo: flips completed flag", () => {
    const { result } = renderHook(() => useTodos());
    act(() => {
      result.current.addTodo("Task");
    });
    const id = result.current.todos[0].id;
    act(() => {
      result.current.toggleTodo(id);
    });
    expect(result.current.todos[0].completed).toBe(true);
    act(() => {
      result.current.toggleTodo(id);
    });
    expect(result.current.todos[0].completed).toBe(false);
  });

  it("updateTodo: updates only specified fields", () => {
    const { result } = renderHook(() => useTodos());
    act(() => {
      result.current.addTodo("Task");
    });
    const id = result.current.todos[0].id;
    act(() => {
      result.current.updateTodo(id, { title: "Updated", priority: "high" });
    });
    expect(result.current.todos[0].title).toBe("Updated");
    expect(result.current.todos[0].priority).toBe("high");
    expect(result.current.todos[0].completed).toBe(false);
  });

  it("deleteTodo: removes todo by id", () => {
    const { result } = renderHook(() => useTodos());
    act(() => {
      result.current.addTodo("Task");
    });
    const id = result.current.todos[0].id;
    act(() => {
      result.current.deleteTodo(id);
    });
    expect(result.current.todos).toHaveLength(0);
  });

  it("resetCategory: sets categoryId to null for matching todos only", () => {
    const { result } = renderHook(() => useTodos());
    act(() => {
      result.current.addTodo("Todo A");
      result.current.addTodo("Todo B");
    });
    const [idB, idA] = result.current.todos.map((t) => t.id);
    act(() => {
      result.current.updateTodo(idA, { categoryId: "cat-1" });
      result.current.updateTodo(idB, { categoryId: "cat-2" });
    });
    act(() => {
      result.current.resetCategory("cat-1");
    });
    const todoA = result.current.todos.find((t) => t.id === idA)!;
    const todoB = result.current.todos.find((t) => t.id === idB)!;
    expect(todoA.categoryId).toBeNull();
    expect(todoB.categoryId).toBe("cat-2");
  });

  it("persists todos to localStorage after each mutation", () => {
    const { result } = renderHook(() => useTodos());
    act(() => {
      result.current.addTodo("Persisted");
    });
    const stored = JSON.parse(localStorage.getItem("todos")!);
    expect(stored[0].title).toBe("Persisted");
  });

  it("restores todos from localStorage on mount", () => {
    localStorage.setItem(
      "todos",
      JSON.stringify([
        {
          id: "x",
          title: "Saved",
          completed: false,
          priority: "low",
          categoryId: null,
          dueDate: null,
          createdAt: new Date().toISOString(),
        },
      ]),
    );
    const { result } = renderHook(() => useTodos());
    act(() => {});
    expect(result.current.todos[0].title).toBe("Saved");
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/hooks/useTodos.test.ts
```

Expected: 8 passing tests.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTodos.test.ts
git commit -m "test: add useTodos hook tests"
```

---

### Task 4: `src/hooks/useCategories.test.ts`

**Files:**

- Create: `src/hooks/useCategories.test.ts`

- [ ] **Step 1: Write the tests**

```ts
import { renderHook, act } from "@testing-library/react";
import { useCategories } from "@/hooks/useCategories";

let uuidCounter = 0;

beforeEach(() => {
  localStorage.clear();
  uuidCounter = 0;
  vi.stubGlobal("crypto", { randomUUID: () => `uuid-${++uuidCounter}` });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCategories", () => {
  it("addCategory: appends category with name and color", () => {
    const { result } = renderHook(() => useCategories());
    act(() => {
      result.current.addCategory("Work", "#3b82f6");
    });
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0]).toMatchObject({
      name: "Work",
      color: "#3b82f6",
    });
  });

  it("deleteCategory: removes category by id", () => {
    const { result } = renderHook(() => useCategories());
    act(() => {
      result.current.addCategory("Work", "#3b82f6");
    });
    const id = result.current.categories[0].id;
    act(() => {
      result.current.deleteCategory(id);
    });
    expect(result.current.categories).toHaveLength(0);
  });

  it("persists categories to localStorage after each mutation", () => {
    const { result } = renderHook(() => useCategories());
    act(() => {
      result.current.addCategory("Hobby", "#22c55e");
    });
    const stored = JSON.parse(localStorage.getItem("categories")!);
    expect(stored[0].name).toBe("Hobby");
  });

  it("restores categories from localStorage on mount", () => {
    localStorage.setItem(
      "categories",
      JSON.stringify([{ id: "c1", name: "Saved", color: "#ef4444" }]),
    );
    const { result } = renderHook(() => useCategories());
    act(() => {});
    expect(result.current.categories[0].name).toBe("Saved");
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/hooks/useCategories.test.ts
```

Expected: 4 passing tests.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCategories.test.ts
git commit -m "test: add useCategories hook tests"
```

---

### Task 5: `src/components/TodoForm.test.tsx`

**Files:**

- Create: `src/components/TodoForm.test.tsx`

- [ ] **Step 1: Write the tests**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoForm from "@/components/TodoForm";

describe("TodoForm", () => {
  it("calls onAdd with trimmed title on Enter", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoForm onAdd={onAdd} />);
    await user.type(
      screen.getByPlaceholderText("新しいタスクを入力..."),
      "  My Task  {Enter}",
    );
    expect(onAdd).toHaveBeenCalledWith("My Task");
  });

  it("calls onAdd with trimmed title on button click", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoForm onAdd={onAdd} />);
    await user.type(
      screen.getByPlaceholderText("新しいタスクを入力..."),
      "Buy milk",
    );
    await user.click(screen.getByRole("button", { name: "追加" }));
    expect(onAdd).toHaveBeenCalledWith("Buy milk");
  });

  it("does not call onAdd when input is empty", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoForm onAdd={onAdd} />);
    await user.click(screen.getByRole("button", { name: "追加" }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when input is whitespace only", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoForm onAdd={onAdd} />);
    await user.type(
      screen.getByPlaceholderText("新しいタスクを入力..."),
      "   {Enter}",
    );
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("resets input field after submission", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoForm onAdd={onAdd} />);
    const input = screen.getByPlaceholderText("新しいタスクを入力...");
    await user.type(input, "Task{Enter}");
    expect(input).toHaveValue("");
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/components/TodoForm.test.tsx
```

Expected: 5 passing tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/TodoForm.test.tsx
git commit -m "test: add TodoForm component tests"
```

---

### Task 6: `src/components/TodoItem.test.tsx`

**Files:**

- Create: `src/components/TodoItem.test.tsx`

- [ ] **Step 1: Write the tests**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoItem from "@/components/TodoItem";
import { Todo, Category } from "@/types/todo";

const mockCategory: Category = { id: "cat-1", name: "Work", color: "#3b82f6" };

const baseTodo: Todo = {
  id: "todo-1",
  title: "Test Task",
  completed: false,
  priority: "medium",
  categoryId: null,
  dueDate: null,
  createdAt: new Date().toISOString(),
};

describe("TodoItem", () => {
  it("displays the todo title", () => {
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("displays correct priority badge for high", () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, priority: "high" }}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("高")).toBeInTheDocument();
  });

  it("displays correct priority badge for medium", () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, priority: "medium" }}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("中")).toBeInTheDocument();
  });

  it("displays correct priority badge for low", () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, priority: "low" }}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("低")).toBeInTheDocument();
  });

  it("displays category name when categoryId matches", () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, categoryId: "cat-1" }}
        categories={[mockCategory]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("displays dueDate when set", () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, dueDate: "2025-12-31" }}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("2025-12-31")).toBeInTheDocument();
  });

  it("shows overdue date in red for past dueDate on incomplete todo", () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, dueDate: "2020-01-01" }}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("2020-01-01")).toHaveClass("text-red-500");
  });

  it("does not show overdue style for completed todo with past dueDate", () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, dueDate: "2020-01-01", completed: true }}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("2020-01-01")).not.toHaveClass("text-red-500");
  });

  it("applies line-through style to title when completed", () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, completed: true }}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("Test Task")).toHaveClass("line-through");
  });

  it("calls onToggle with todo.id when checkbox is changed", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={onToggle}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("todo-1");
  });

  it("calls onDelete with todo.id when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={onDelete}
        onEdit={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(onDelete).toHaveBeenCalledWith("todo-1");
  });

  it("calls onEdit with todo object when edit button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    expect(onEdit).toHaveBeenCalledWith(baseTodo);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/components/TodoItem.test.tsx
```

Expected: 12 passing tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/TodoItem.test.tsx
git commit -m "test: add TodoItem component tests"
```

---

### Task 7: `src/components/FilterBar.test.tsx`

**Files:**

- Create: `src/components/FilterBar.test.tsx`

Note: FilterBar has 3 `<select>` elements with no labels. Use `getAllByRole('combobox')`:

- index `[0]` = category select
- index `[1]` = priority select
- index `[2]` = completed select

- [ ] **Step 1: Write the tests**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterBar from "@/components/FilterBar";
import { Category, FilterState } from "@/types/todo";

const mockCategory: Category = { id: "cat-1", name: "Work", color: "#3b82f6" };
const baseFilter: FilterState = {
  categoryId: null,
  priority: null,
  completed: null,
};

describe("FilterBar", () => {
  it("calls onChange with categoryId when category is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterBar
        categories={[mockCategory]}
        filter={baseFilter}
        onChange={onChange}
      />,
    );
    const [categorySelect] = screen.getAllByRole("combobox");
    await user.selectOptions(categorySelect, "cat-1");
    expect(onChange).toHaveBeenCalledWith({
      ...baseFilter,
      categoryId: "cat-1",
    });
  });

  it("calls onChange with categoryId=null when 'all categories' is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterBar
        categories={[mockCategory]}
        filter={{ ...baseFilter, categoryId: "cat-1" }}
        onChange={onChange}
      />,
    );
    const [categorySelect] = screen.getAllByRole("combobox");
    await user.selectOptions(categorySelect, "");
    expect(onChange).toHaveBeenCalledWith({ ...baseFilter, categoryId: null });
  });

  it("calls onChange with priority when priority is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterBar categories={[]} filter={baseFilter} onChange={onChange} />,
    );
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[1], "high");
    expect(onChange).toHaveBeenCalledWith({ ...baseFilter, priority: "high" });
  });

  it("calls onChange with completed=true when '完了済み' is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterBar categories={[]} filter={baseFilter} onChange={onChange} />,
    );
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[2], "true");
    expect(onChange).toHaveBeenCalledWith({ ...baseFilter, completed: true });
  });

  it("calls onChange with completed=null when 'すべて' is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterBar
        categories={[]}
        filter={{ ...baseFilter, completed: true }}
        onChange={onChange}
      />,
    );
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[2], "");
    expect(onChange).toHaveBeenCalledWith({ ...baseFilter, completed: null });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/components/FilterBar.test.tsx
```

Expected: 5 passing tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/FilterBar.test.tsx
git commit -m "test: add FilterBar component tests"
```

---

### Task 8: `src/components/CategoryManager.test.tsx`

**Files:**

- Create: `src/components/CategoryManager.test.tsx`

- [ ] **Step 1: Write the tests**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryManager from "@/components/CategoryManager";
import { Category } from "@/types/todo";

const mockCategories: Category[] = [
  { id: "c1", name: "Work", color: "#3b82f6" },
  { id: "c2", name: "Personal", color: "#22c55e" },
];

describe("CategoryManager", () => {
  it("displays all category names", () => {
    render(
      <CategoryManager
        categories={mockCategories}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("shows empty state message when no categories", () => {
    render(
      <CategoryManager
        categories={[]}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("カテゴリがありません")).toBeInTheDocument();
  });

  it("calls onAdd with name and default color on button click", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <CategoryManager
        categories={[]}
        onAdd={onAdd}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    await user.type(screen.getByPlaceholderText("カテゴリ名"), "Hobby");
    await user.click(screen.getByRole("button", { name: "追加" }));
    expect(onAdd).toHaveBeenCalledWith("Hobby", "#ef4444");
  });

  it("does not call onAdd when name is empty", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <CategoryManager
        categories={[]}
        onAdd={onAdd}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "追加" }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("calls onAdd when Enter is pressed in the name input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <CategoryManager
        categories={[]}
        onAdd={onAdd}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    await user.type(screen.getByPlaceholderText("カテゴリ名"), "Study{Enter}");
    expect(onAdd).toHaveBeenCalledWith("Study", "#ef4444");
  });

  it("calls onDelete with category id when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <CategoryManager
        categories={mockCategories}
        onAdd={vi.fn()}
        onDelete={onDelete}
        onClose={vi.fn()}
      />,
    );
    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await user.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith("c1");
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CategoryManager
        categories={[]}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onClose={onClose}
      />,
    );
    await user.click(screen.getByRole("button", { name: "✕" }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/components/CategoryManager.test.tsx
```

Expected: 7 passing tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/CategoryManager.test.tsx
git commit -m "test: add CategoryManager component tests"
```

---

### Task 9: `src/components/TodoEditModal.test.tsx`

**Files:**

- Create: `src/components/TodoEditModal.test.tsx`

Note on selectors: `TodoEditModal` labels are NOT linked via `htmlFor`. Use:

- Title input: `getByDisplayValue(todo.title)` (has an initial value)
- Priority select: `getAllByRole('combobox')[0]`
- Date input: `container.querySelector('input[type="date"]')`
- Category select: `getAllByRole('combobox')[1]`

- [ ] **Step 1: Write the tests**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoEditModal from "@/components/TodoEditModal";
import { Todo, Category } from "@/types/todo";

const mockCategory: Category = { id: "cat-1", name: "Work", color: "#3b82f6" };

const baseTodo: Todo = {
  id: "todo-1",
  title: "Original Title",
  completed: false,
  priority: "medium",
  categoryId: null,
  dueDate: null,
  createdAt: new Date().toISOString(),
};

describe("TodoEditModal", () => {
  it("displays initial todo values in the form", () => {
    render(
      <TodoEditModal
        todo={{
          ...baseTodo,
          priority: "high",
          dueDate: "2025-06-01",
          categoryId: "cat-1",
        }}
        categories={[mockCategory]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("Original Title")).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")[0]).toHaveValue("high");
    expect(screen.getAllByRole("combobox")[1]).toHaveValue("cat-1");
  });

  it("calls onSave with updated title when saved", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <TodoEditModal
        todo={baseTodo}
        categories={[]}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );
    const titleInput = screen.getByDisplayValue("Original Title");
    await user.clear(titleInput);
    await user.type(titleInput, "New Title");
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).toHaveBeenCalledWith(
      "todo-1",
      expect.objectContaining({ title: "New Title" }),
    );
  });

  it("does not call onSave when title is empty", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <TodoEditModal
        todo={baseTodo}
        categories={[]}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );
    const titleInput = screen.getByDisplayValue("Original Title");
    await user.clear(titleInput);
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("calls onSave with updated priority", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <TodoEditModal
        todo={baseTodo}
        categories={[]}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );
    await user.selectOptions(screen.getAllByRole("combobox")[0], "high");
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).toHaveBeenCalledWith(
      "todo-1",
      expect.objectContaining({ priority: "high" }),
    );
  });

  it("calls onSave with dueDate when date is set", async () => {
    const onSave = vi.fn();
    const { container } = render(
      <TodoEditModal
        todo={baseTodo}
        categories={[]}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );
    const dateInput = container.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: "2025-12-31" } });
    await userEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).toHaveBeenCalledWith(
      "todo-1",
      expect.objectContaining({ dueDate: "2025-12-31" }),
    );
  });

  it("calls onSave with dueDate=null when date is cleared", async () => {
    const onSave = vi.fn();
    const { container } = render(
      <TodoEditModal
        todo={{ ...baseTodo, dueDate: "2025-12-31" }}
        categories={[]}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );
    const dateInput = container.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: "" } });
    await userEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).toHaveBeenCalledWith(
      "todo-1",
      expect.objectContaining({ dueDate: null }),
    );
  });

  it("calls onSave with updated categoryId", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <TodoEditModal
        todo={baseTodo}
        categories={[mockCategory]}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );
    await user.selectOptions(screen.getAllByRole("combobox")[1], "cat-1");
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).toHaveBeenCalledWith(
      "todo-1",
      expect.objectContaining({ categoryId: "cat-1" }),
    );
  });

  it("calls onClose and not onSave when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <TodoEditModal
        todo={baseTodo}
        categories={[]}
        onSave={onSave}
        onClose={onClose}
      />,
    );
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("calls onClose after saving", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <TodoEditModal
        todo={baseTodo}
        categories={[]}
        onSave={vi.fn()}
        onClose={onClose}
      />,
    );
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/components/TodoEditModal.test.tsx
```

Expected: 9 passing tests.

- [ ] **Step 3: Commit**

```bash
git add src/components/TodoEditModal.test.tsx
git commit -m "test: add TodoEditModal component tests"
```

---

### Task 10: `src/components/TodoList.test.tsx`

**Files:**

- Create: `src/components/TodoList.test.tsx`

- [ ] **Step 1: Write the tests**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoList from "@/components/TodoList";
import { Todo } from "@/types/todo";

const makeTodo = (id: string, title: string): Todo => ({
  id,
  title,
  completed: false,
  priority: "medium",
  categoryId: null,
  dueDate: null,
  createdAt: new Date().toISOString(),
});

describe("TodoList", () => {
  it("shows empty state message when todos is empty", () => {
    render(
      <TodoList
        todos={[]}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("タスクがありません")).toBeInTheDocument();
  });

  it("renders all todo titles", () => {
    render(
      <TodoList
        todos={[makeTodo("1", "Alpha"), makeTodo("2", "Beta")]}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("delegates onToggle callback from TodoItem", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoList
        todos={[makeTodo("1", "Task")]}
        categories={[]}
        onToggle={onToggle}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("delegates onDelete callback from TodoItem", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoList
        todos={[makeTodo("1", "Task")]}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={onDelete}
        onEdit={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "削除" }));
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("delegates onEdit callback from TodoItem", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const todo = makeTodo("1", "Task");
    render(
      <TodoList
        todos={[todo]}
        categories={[]}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "編集" }));
    expect(onEdit).toHaveBeenCalledWith(todo);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test:run -- src/components/TodoList.test.tsx
```

Expected: 5 passing tests.

- [ ] **Step 3: Run the full test suite**

```bash
npm run test:run
```

Expected: All 60 tests passing across all 9 test files.

- [ ] **Step 4: Commit**

```bash
git add src/components/TodoList.test.tsx
git commit -m "test: add TodoList component tests"
```
