"use client";

import { useState } from "react";
import { Todo, FilterState } from "@/types/todo";
import { useTodos } from "@/hooks/useTodos";
import { useCategories } from "@/hooks/useCategories";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import FilterBar from "@/components/FilterBar";
import CategoryManager from "@/components/CategoryManager";
import TodoEditModal from "@/components/TodoEditModal";

export default function Page() {
  const { categories, addCategory, deleteCategory } = useCategories();
  const { todos, addTodo, toggleTodo, updateTodo, deleteTodo, resetCategory } =
    useTodos();
  const [filter, setFilter] = useState<FilterState>({
    categoryId: null,
    priority: null,
    completed: null,
  });
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  function handleDeleteCategory(id: string) {
    resetCategory(id);
    deleteCategory(id);
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter.categoryId && todo.categoryId !== filter.categoryId)
      return false;
    if (filter.priority && todo.priority !== filter.priority) return false;
    if (filter.completed !== null && todo.completed !== filter.completed)
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto shadow-sm">
        <header className="flex justify-between items-center px-4 py-3 bg-white border-b">
          <h1 className="text-xl font-bold text-gray-800">Todo</h1>
          <button
            onClick={() => setShowCategoryManager(true)}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            カテゴリ管理
          </button>
        </header>

        <FilterBar
          categories={categories}
          filter={filter}
          onChange={setFilter}
        />

        <div className="bg-white">
          <TodoForm onAdd={addTodo} />
          <TodoList
            todos={filteredTodos}
            categories={categories}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={setEditingTodo}
          />
        </div>
      </div>

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onAdd={addCategory}
          onDelete={handleDeleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {editingTodo && (
        <TodoEditModal
          todo={editingTodo}
          categories={categories}
          onSave={updateTodo}
          onClose={() => setEditingTodo(null)}
        />
      )}
    </div>
  );
}
