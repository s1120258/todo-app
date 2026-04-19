// src/hooks/useCategories.ts
"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types/todo";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const KEY = "categories";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(loadFromStorage<Category[]>(KEY, []));
  }, []);

  function persist(updater: (prev: Category[]) => Category[]) {
    setCategories((prev) => {
      const updated = updater(prev);
      saveToStorage(KEY, updated);
      return updated;
    });
  }

  function addCategory(name: string, color: string) {
    persist((prev) => [...prev, { id: crypto.randomUUID(), name, color }]);
  }

  function deleteCategory(id: string) {
    persist((prev) => prev.filter((c) => c.id !== id));
  }

  return { categories, addCategory, deleteCategory };
}
