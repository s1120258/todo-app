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
