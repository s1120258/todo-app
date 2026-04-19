// src/types/todo.ts
export type Priority = "high" | "medium" | "low";

export interface Category {
  id: string;
  name: string;
  color: string; // hex値 e.g. "#ef4444"
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  categoryId: string | null;
  dueDate: string | null; // "YYYY-MM-DD"
  createdAt: string; // ISO 8601
}

export interface FilterState {
  categoryId: string | null;
  priority: Priority | null;
  completed: boolean | null;
}
