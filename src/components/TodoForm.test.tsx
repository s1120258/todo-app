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
