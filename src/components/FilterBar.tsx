// src/components/FilterBar.tsx
"use client";

import { Category, FilterState, Priority } from "@/types/todo";

interface FilterBarProps {
  categories: Category[];
  filter: FilterState;
  onChange: (filter: FilterState) => void;
}

export default function FilterBar({
  categories,
  filter,
  onChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b">
      <select
        value={filter.categoryId ?? ""}
        onChange={(e) =>
          onChange({ ...filter, categoryId: e.target.value || null })
        }
        className="border rounded px-2 py-1 text-sm bg-white"
      >
        <option value="">すべてのカテゴリ</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={filter.priority ?? ""}
        onChange={(e) =>
          onChange({
            ...filter,
            priority: (e.target.value as Priority) || null,
          })
        }
        className="border rounded px-2 py-1 text-sm bg-white"
      >
        <option value="">すべての優先度</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>

      <select
        value={filter.completed === null ? "" : String(filter.completed)}
        onChange={(e) =>
          onChange({
            ...filter,
            completed: e.target.value === "" ? null : e.target.value === "true",
          })
        }
        className="border rounded px-2 py-1 text-sm bg-white"
      >
        <option value="">すべて</option>
        <option value="false">未完了</option>
        <option value="true">完了済み</option>
      </select>
    </div>
  );
}
