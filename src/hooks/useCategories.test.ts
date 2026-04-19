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
    expect(result.current.categories[0].name).toBe("Saved");
  });
});
