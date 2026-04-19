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
