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
