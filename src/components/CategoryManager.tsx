// src/components/CategoryManager.tsx
"use client";

import { useState } from "react";
import { Category } from "@/types/todo";

const PALETTE = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (name: string, color: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function CategoryManager({
  categories,
  onAdd,
  onDelete,
  onClose,
}: CategoryManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  function handleAdd(e?: React.FormEvent) {
    if (e) {
      e.preventDefault();
    }
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, color);
    setName("");
    setColor(PALETTE[0]);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">カテゴリ管理</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="カテゴリ名"
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 flex-wrap">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${color === c ? "border-gray-700" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            追加
          </button>
        </form>

        <ul className="flex flex-col gap-2 overflow-y-auto">
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              カテゴリがありません
            </p>
          )}
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="flex-1 text-sm">{c.name}</span>
              <button
                onClick={() => onDelete(c.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
