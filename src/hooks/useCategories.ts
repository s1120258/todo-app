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

  function persist(updated: Category[]) {
    setCategories(updated);
    saveToStorage(KEY, updated);
  }

  function addCategory(name: string, color: string) {
    persist([...categories, { id: crypto.randomUUID(), name, color }]);
  }

  function deleteCategory(id: string) {
    persist(categories.filter((c) => c.id !== id));
  }

  return { categories, addCategory, deleteCategory };
}
