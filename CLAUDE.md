# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 13+ (App Router) todo application in TypeScript. Currently a skeleton project — no source files exist yet.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
npm test             # Run tests
npm run test:watch   # Tests in watch mode
npm run test:coverage # Coverage report
```

Run `npm run lint && npm test` before committing. Fix TypeScript errors with `npm run build`.

## Architecture

```
app/              # Next.js App Router
  layout.tsx      # Root layout
  page.tsx        # Home page
  api/todos/      # REST API routes (route.ts)
src/
  components/     # React components (.tsx)
  hooks/          # Custom hooks (e.g. useTodos.ts)
  lib/            # Utilities (api.ts, utils.ts)
  types/          # TypeScript interfaces (todo.ts)
  styles/         # Global styles
tests/            # Test files (also colocated as *.test.tsx)
```

Use `@/*` absolute import alias for internal imports.

## API Routes

Routes live in `app/api/todos/route.ts`. Use standard REST verbs. Response shape:

```typescript
{ data: T } | { error: string }
```

## Conventions

- Components: PascalCase (`TodoList.tsx`), one per file, functional with hooks
- Functions/variables: camelCase; constants: UPPER_SNAKE_CASE
- TypeScript strict mode — no `any`
- Imports: React → external → internal (`@/*`)
- Commits: conventional format (`feat:`, `fix:`, `docs:`, `test:`)
- Branches: `feature/todo-api`, `fix/delete-bug`

## Testing

React Testing Library + Jest. Colocate tests as `ComponentName.test.tsx` or place in `tests/`. Target >80% coverage on critical paths.

### Test Rules

- Always verify real behavior — never write meaningless assertions like `expect(true).toBe(true)`.
- Each test must cover a specific input and expected output, including edge cases and error paths.
- Keep mocks minimal; prefer testing actual behavior over mocked internals.
- Never hardcode values in production code just to make tests pass. No `if (testMode)` branches or magic numbers.
- Start from a failing test (Red → Green → Refactor).
- Test names must clearly describe what is being tested.
- Prioritize actual quality over coverage numbers.
- If requirements are unclear, ask rather than guessing.

## Environment

```bash
# .env.local (not committed)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Git Guidelines

- Follow Conventional Commits format for all commit messages.
- Line 1 (summary): `type: description` — all lowercase.
- Line 2: blank line.
- Line 3+: bullet points (`-`) with details in English.
- Do not add `Co-Authored-By` trailers.

### Example

```text
docs: initialize project documentation and agent instructions

- Add AGENTS.md with comprehensive project overview and development conventions
- Add CLAUDE.md for Claude Code guidance and architecture details
- Initialize .claude/settings.local.json with git command permissions
```

## Troubleshooting

| Issue             | Solution                                |
| ----------------- | --------------------------------------- |
| Port 3000 in use  | `npm run dev -- -p 3001`                |
| TypeScript errors | `npm run build` for full check          |
| Module not found  | Check `tsconfig.json` paths and imports |
| Tests failing     | Check `jest.config.js` and dependencies |
