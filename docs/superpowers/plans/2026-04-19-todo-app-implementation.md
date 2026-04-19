# Todo App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js 13+ App Router で動作するTODOアプリを実装する（CRUD・カテゴリ・優先度・期限日・フィルタリング・localStorage永続化）

**Architecture:** すべてClient Component構成。`page.tsx` がルート状態を保持し、`useTodos`/`useCategories` カスタムフックがlocalStorageとの同期を担う。コンポーネントはprops経由でデータとコールバックを受け取るシンプルな設計。

**Tech Stack:** Next.js 13+ (App Router), TypeScript (strict), Tailwind CSS, React useState

---

## File Map

| ファイル | 役割 |
|---|---|
| `src/types/todo.ts` | Todo / Category / Priority / FilterState の型定義 |
| `src/lib/storage.ts` | localStorage 読み書きユーティリティ |
| `src/hooks/useCategories.ts` | Category CRUD + localStorage同期 |
| `src/hooks/useTodos.ts` | Todo CRUD + localStorage同期 |
| `src/components/FilterBar.tsx` | カテゴリ・優先度・完了状態フィルタUI |
| `src/components/TodoForm.tsx` | タイトル入力 + 追加フォーム |
| `src/components/CategoryManager.tsx` | カテゴリ作成・削除モーダル |
| `src/components/TodoItem.tsx` | 1件分のTodo表示・操作 |
| `src/components/TodoEditModal.tsx` | Todo編集モーダル |
| `src/components/TodoList.tsx` | フィルタ済みTodoリスト |
| `app/layout.tsx` | ルートレイアウト（metadata・globals.css） |
| `app/page.tsx` | ルートページ：状態管理・コンポーネント合成 |

---

## Task 1: プロジェクトセットアップ

**Files:**
- Create: `app/`, `src/`, その他Next.js標準ファイル群（`create-next-app` が生成）

- [ ] **Step 1: create-next-app を実行**

```bash
cd /Users/mk/Develop/Private/Harness/todo-app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

対話式プロンプトが表示された場合はすべてデフォルト（Enter）で進める。

- [ ] **Step 2: デフォルトファイルをクリーンアップ**

`app/page.tsx` の内容を最小限に置き換える：

```tsx
export default function Page() {
  return <div />
}
```

`src/app/globals.css` の `@layer base` ブロック内のスタイルをすべて削除し、Tailwind のディレクティブだけ残す：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`public/` 内のサンプル画像（`next.svg`, `vercel.svg` 等）を削除する。

- [ ] **Step 3: 動作確認**

```bash
npm run dev
```

`http://localhost:3000` にアクセスして空白ページが表示されることを確認。確認後 `Ctrl+C` で停止。

- [ ] **Step 4: コミット**

```bash
git add -A
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind"
```

---

## Task 2: 型定義

**Files:**
- Create: `src/types/todo.ts`

- [ ] **Step 1: 型定義ファイルを作成**

```typescript
// src/types/todo.ts
export type Priority = 'high' | 'medium' | 'low'

export interface Category {
  id: string
  name: string
  color: string  // hex値 e.g. "#ef4444"
}

export interface Todo {
  id: string
  title: string
  completed: boolean
  priority: Priority
  categoryId: string | null
  dueDate: string | null  // "YYYY-MM-DD"
  createdAt: string       // ISO 8601
}

export interface FilterState {
  categoryId: string | null
  priority: Priority | null
  completed: boolean | null
}
```

- [ ] **Step 2: コミット**

```bash
git add src/types/todo.ts
git commit -m "feat: add type definitions"
```

---

## Task 3: localStorage ユーティリティ

**Files:**
- Create: `src/lib/storage.ts`

- [ ] **Step 1: ユーティリティを作成**

```typescript
// src/lib/storage.ts
export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage unavailable or full
  }
}
```

- [ ] **Step 2: コミット**

```bash
git add src/lib/storage.ts
git commit -m "feat: add localStorage utility"
```

---

## Task 4: useCategories フック

**Files:**
- Create: `src/hooks/useCategories.ts`

- [ ] **Step 1: フックを作成**

```typescript
// src/hooks/useCategories.ts
'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types/todo'
import { loadFromStorage, saveToStorage } from '@/lib/storage'

const KEY = 'categories'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    setCategories(loadFromStorage<Category[]>(KEY, []))
  }, [])

  function persist(updated: Category[]) {
    setCategories(updated)
    saveToStorage(KEY, updated)
  }

  function addCategory(name: string, color: string) {
    persist([...categories, { id: crypto.randomUUID(), name, color }])
  }

  function deleteCategory(id: string) {
    persist(categories.filter(c => c.id !== id))
  }

  return { categories, addCategory, deleteCategory }
}
```

- [ ] **Step 2: コミット**

```bash
git add src/hooks/useCategories.ts
git commit -m "feat: add useCategories hook"
```

---

## Task 5: useTodos フック

**Files:**
- Create: `src/hooks/useTodos.ts`

- [ ] **Step 1: フックを作成**

```typescript
// src/hooks/useTodos.ts
'use client'

import { useState, useEffect } from 'react'
import { Todo } from '@/types/todo'
import { loadFromStorage, saveToStorage } from '@/lib/storage'

const KEY = 'todos'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    setTodos(loadFromStorage<Todo[]>(KEY, []))
  }, [])

  function persist(updated: Todo[]) {
    setTodos(updated)
    saveToStorage(KEY, updated)
  }

  function addTodo(title: string) {
    persist([
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
        priority: 'medium',
        categoryId: null,
        dueDate: null,
        createdAt: new Date().toISOString(),
      },
      ...todos,
    ])
  }

  function toggleTodo(id: string) {
    persist(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  function updateTodo(id: string, updates: Partial<Pick<Todo, 'title' | 'priority' | 'dueDate' | 'categoryId'>>) {
    persist(todos.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  function deleteTodo(id: string) {
    persist(todos.filter(t => t.id !== id))
  }

  function resetCategory(categoryId: string) {
    persist(todos.map(t => t.categoryId === categoryId ? { ...t, categoryId: null } : t))
  }

  return { todos, addTodo, toggleTodo, updateTodo, deleteTodo, resetCategory }
}
```

- [ ] **Step 2: コミット**

```bash
git add src/hooks/useTodos.ts
git commit -m "feat: add useTodos hook"
```

---

## Task 6: FilterBar コンポーネント

**Files:**
- Create: `src/components/FilterBar.tsx`

- [ ] **Step 1: コンポーネントを作成**

```tsx
// src/components/FilterBar.tsx
'use client'

import { Category, FilterState, Priority } from '@/types/todo'

interface FilterBarProps {
  categories: Category[]
  filter: FilterState
  onChange: (filter: FilterState) => void
}

export default function FilterBar({ categories, filter, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b">
      <select
        value={filter.categoryId ?? ''}
        onChange={e => onChange({ ...filter, categoryId: e.target.value || null })}
        className="border rounded px-2 py-1 text-sm bg-white"
      >
        <option value="">すべてのカテゴリ</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        value={filter.priority ?? ''}
        onChange={e => onChange({ ...filter, priority: (e.target.value as Priority) || null })}
        className="border rounded px-2 py-1 text-sm bg-white"
      >
        <option value="">すべての優先度</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>

      <select
        value={filter.completed === null ? '' : String(filter.completed)}
        onChange={e => onChange({
          ...filter,
          completed: e.target.value === '' ? null : e.target.value === 'true',
        })}
        className="border rounded px-2 py-1 text-sm bg-white"
      >
        <option value="">すべて</option>
        <option value="false">未完了</option>
        <option value="true">完了済み</option>
      </select>
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add src/components/FilterBar.tsx
git commit -m "feat: add FilterBar component"
```

---

## Task 7: TodoForm コンポーネント

**Files:**
- Create: `src/components/TodoForm.tsx`

- [ ] **Step 1: コンポーネントを作成**

```tsx
// src/components/TodoForm.tsx
'use client'

import { useState, FormEvent } from 'react'

interface TodoFormProps {
  onAdd: (title: string) => void
}

export default function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-b">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="新しいタスクを入力..."
        className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
      >
        追加
      </button>
    </form>
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add src/components/TodoForm.tsx
git commit -m "feat: add TodoForm component"
```

---

## Task 8: CategoryManager コンポーネント

**Files:**
- Create: `src/components/CategoryManager.tsx`

- [ ] **Step 1: コンポーネントを作成**

```tsx
// src/components/CategoryManager.tsx
'use client'

import { useState } from 'react'
import { Category } from '@/types/todo'

const PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

interface CategoryManagerProps {
  categories: Category[]
  onAdd: (name: string, color: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function CategoryManager({ categories, onAdd, onDelete, onClose }: CategoryManagerProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PALETTE[0])

  function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, color)
    setName('')
    setColor(PALETTE[0])
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">カテゴリ管理</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="カテゴリ名"
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 flex-wrap">
            {PALETTE.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-gray-700' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            追加
          </button>
        </div>

        <ul className="flex flex-col gap-2 overflow-y-auto">
          {categories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">カテゴリがありません</p>
          )}
          {categories.map(c => (
            <li key={c.id} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
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
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add src/components/CategoryManager.tsx
git commit -m "feat: add CategoryManager component"
```

---

## Task 9: TodoItem コンポーネント

**Files:**
- Create: `src/components/TodoItem.tsx`

- [ ] **Step 1: コンポーネントを作成**

```tsx
// src/components/TodoItem.tsx
'use client'

import { Todo, Category } from '@/types/todo'

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

const PRIORITY_LABELS: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

interface TodoItemProps {
  todo: Todo
  categories: Category[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
}

export default function TodoItem({ todo, categories, onToggle, onDelete, onEdit }: TodoItemProps) {
  const category = categories.find(c => c.id === todo.categoryId)
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = todo.dueDate !== null && !todo.completed && todo.dueDate < today

  return (
    <div className="group flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="mt-1 h-4 w-4 cursor-pointer accent-blue-500"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[todo.priority]}`}>
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
            <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
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
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add src/components/TodoItem.tsx
git commit -m "feat: add TodoItem component"
```

---

## Task 10: TodoEditModal コンポーネント

**Files:**
- Create: `src/components/TodoEditModal.tsx`

- [ ] **Step 1: コンポーネントを作成**

```tsx
// src/components/TodoEditModal.tsx
'use client'

import { useState } from 'react'
import { Todo, Priority, Category } from '@/types/todo'

interface TodoEditModalProps {
  todo: Todo
  categories: Category[]
  onSave: (id: string, updates: Partial<Pick<Todo, 'title' | 'priority' | 'dueDate' | 'categoryId'>>) => void
  onClose: () => void
}

export default function TodoEditModal({ todo, categories, onSave, onClose }: TodoEditModalProps) {
  const [title, setTitle] = useState(todo.title)
  const [priority, setPriority] = useState<Priority>(todo.priority)
  const [dueDate, setDueDate] = useState(todo.dueDate ?? '')
  const [categoryId, setCategoryId] = useState(todo.categoryId ?? '')

  function handleSave() {
    const trimmed = title.trim()
    if (!trimmed) return
    onSave(todo.id, {
      title: trimmed,
      priority,
      dueDate: dueDate || null,
      categoryId: categoryId || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">タスクを編集</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">優先度</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">期限日</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">カテゴリ</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">なし</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add src/components/TodoEditModal.tsx
git commit -m "feat: add TodoEditModal component"
```

---

## Task 11: TodoList コンポーネント

**Files:**
- Create: `src/components/TodoList.tsx`

- [ ] **Step 1: コンポーネントを作成**

```tsx
// src/components/TodoList.tsx
'use client'

import { Todo, Category } from '@/types/todo'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  categories: Category[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
}

export default function TodoList({ todos, categories, onToggle, onDelete, onEdit }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-12">タスクがありません</p>
    )
  }

  return (
    <ul className="flex flex-col divide-y">
      {todos.map(todo => (
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
  )
}
```

- [ ] **Step 2: コミット**

```bash
git add src/components/TodoList.tsx
git commit -m "feat: add TodoList component"
```

---

## Task 12: ルートレイアウト & ページ

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: layout.tsx を更新**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'Simple todo application',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: page.tsx を実装**

```tsx
// app/page.tsx
'use client'

import { useState } from 'react'
import { Todo, FilterState } from '@/types/todo'
import { useTodos } from '@/hooks/useTodos'
import { useCategories } from '@/hooks/useCategories'
import TodoForm from '@/components/TodoForm'
import TodoList from '@/components/TodoList'
import FilterBar from '@/components/FilterBar'
import CategoryManager from '@/components/CategoryManager'
import TodoEditModal from '@/components/TodoEditModal'

export default function Page() {
  const { categories, addCategory, deleteCategory } = useCategories()
  const { todos, addTodo, toggleTodo, updateTodo, deleteTodo, resetCategory } = useTodos()
  const [filter, setFilter] = useState<FilterState>({ categoryId: null, priority: null, completed: null })
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  function handleDeleteCategory(id: string) {
    resetCategory(id)
    deleteCategory(id)
  }

  const filteredTodos = todos.filter(todo => {
    if (filter.categoryId && todo.categoryId !== filter.categoryId) return false
    if (filter.priority && todo.priority !== filter.priority) return false
    if (filter.completed !== null && todo.completed !== filter.completed) return false
    return true
  })

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

        <FilterBar categories={categories} filter={filter} onChange={setFilter} />

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
  )
}
```

- [ ] **Step 3: ビルドエラーがないか確認**

```bash
npm run build
```

Expected: `✓ Compiled successfully` （警告は無視してよい）

- [ ] **Step 4: 動作確認**

```bash
npm run dev
```

`http://localhost:3000` で以下を確認：
- タスクの追加・完了・削除ができる
- カテゴリ管理でカテゴリを作成・削除できる
- タスク編集モーダルで優先度・期限・カテゴリを変更できる
- フィルタが正しく機能する（AND条件）
- ページリロード後もデータが保持される（localStorage）
- カテゴリを削除すると、そのカテゴリに紐づくタスクの `categoryId` が解除される

- [ ] **Step 5: コミット**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: implement root layout and page"
```
