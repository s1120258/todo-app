// src/components/TodoList.tsx
"use client";

import { Todo, Category } from "@/types/todo";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export default function TodoList({
  todos,
  categories,
  onToggle,
  onDelete,
  onEdit,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-12">
        タスクがありません
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y">
      {todos.map((todo) => (
        <li key={todo.id}>
          <TodoItem
            todo={todo}
            categories={categories}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </li>
      ))}
    </ul>
  );
}
