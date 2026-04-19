// src/components/TodoItem.tsx
"use client";

import { Todo, Category } from "@/types/todo";

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

interface TodoItemProps {
  todo: Todo;
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export default function TodoItem({
  todo,
  categories,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const category = categories.find((c) => c.id === todo.categoryId);
  const today = new Date().toISOString().split("T")[0];
  const isOverdue =
    todo.dueDate !== null && !todo.completed && todo.dueDate < today;

  return (
    <div className="group flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="mt-1 h-4 w-4 cursor-pointer accent-blue-500"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}
        >
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[todo.priority]}`}
          >
            {PRIORITY_LABELS[todo.priority]}
          </span>
          {category && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}
          {todo.dueDate && (
            <span
              className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}
            >
              {todo.dueDate}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(todo)}
          className="text-gray-400 hover:text-blue-500 text-sm px-1"
        >
          編集
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-gray-400 hover:text-red-500 text-sm px-1"
        >
          削除
        </button>
      </div>
    </div>
  );
}
