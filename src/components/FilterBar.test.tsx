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
