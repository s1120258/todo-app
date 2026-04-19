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
