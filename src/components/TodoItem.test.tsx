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
