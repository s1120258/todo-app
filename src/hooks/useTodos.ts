"use client";

import { useState, useEffect } from "react";
import { Todo } from "@/types/todo";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const KEY = "todos";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    setTodos(loadFromStorage<Todo[]>(KEY, []));
  }, []);

  function persist(updated: Todo[]) {
    setTodos(updated);
    saveToStorage(KEY, updated);
  }

  function addTodo(title: string) {
    persist([
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
        priority: "medium",
        categoryId: null,
        dueDate: null,
        createdAt: new Date().toISOString(),
      },
      ...todos,
    ]);
  }

  function toggleTodo(id: string) {
    persist(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  function updateTodo(
    id: string,
    updates: Partial<
      Pick<Todo, "title" | "priority" | "dueDate" | "categoryId">
    >,
  ) {
    persist(todos.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }

  function deleteTodo(id: string) {
    persist(todos.filter((t) => t.id !== id));
  }

  function resetCategory(categoryId: string) {
    persist(
      todos.map((t) =>
        t.categoryId === categoryId ? { ...t, categoryId: null } : t,
      ),
    );
  }

  return { todos, addTodo, toggleTodo, updateTodo, deleteTodo, resetCategory };
}
