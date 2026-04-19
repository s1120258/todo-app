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
    const user = userEvent.setup();
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
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(onSave).toHaveBeenCalledWith(
      "todo-1",
      expect.objectContaining({ dueDate: "2025-12-31" }),
    );
  });

  it("calls onSave with dueDate=null when date is cleared", async () => {
    const user = userEvent.setup();
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
    await user.click(screen.getByRole("button", { name: "保存" }));
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
