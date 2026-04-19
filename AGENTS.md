# Agent Instructions for Todo App

## Project Overview

**todo-app** is a modern todo application built with Next.js and TypeScript. This is a skeleton project ready for implementation.

**Repository**: [github.com/s1120258/todo-app](https://github.com/s1120258/todo-app)
**Branch**: `main`

---

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **UI**: React
- **Styling**: TBD (consider Tailwind CSS, CSS modules, or styled-components)
- **Testing**: Jest + React Testing Library
- **Package Manager**: npm or yarn
- **Deployment**: Vercel-ready
- **Git**: GitHub with conventional commits

---

## Project Structure

Once initialized, follow this directory structure:

```
todo-app/
├── app/                      # Next.js App Router (main entry point)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── api/                 # API routes
├── src/
│   ├── components/          # React components (reusable)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and helpers
│   ├── types/               # TypeScript types and interfaces
│   └── styles/              # Global styles
├── public/                  # Static assets
├── tests/                   # Test files
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

---

## Getting Started

### Initial Setup

```bash
# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# Server runs on http://localhost:3000
```

### Common Commands

```bash
npm run dev       # Development server with hot reload
npm run build     # Production build
npm start         # Production server
npm run lint      # Run ESLint
npm test          # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

---

## Development Conventions

### Code Style

1. **TypeScript**: Use strict mode, avoid `any` types
2. **Components**:
   - Functional components with hooks
   - Place in `src/components/` with `.tsx` extension
   - One component per file (unless tightly coupled)
3. **Naming**:
   - Components: PascalCase (`TodoList.tsx`)
   - Functions/variables: camelCase (`getTodos()`)
   - Constants: UPPER_SNAKE_CASE (`MAX_TODOS`)
4. **Imports**: Group imports by: React → External → Internal (use absolute imports via `@/*` aliases)

### File Organization

- **UI Components**: `src/components/`
- **Custom Hooks**: `src/hooks/` (e.g., `useTodos.ts`)
- **Type Definitions**: `src/types/` (e.g., `todo.ts`)
- **Utilities**: `src/lib/` (e.g., `api.ts`, `utils.ts`)
- **Tests**: Colocated with source files (`*.test.tsx`) or in `tests/` directory

### Git Conventions

- **Commits**: Use conventional commits format:
  - `feat: add todo creation feature`
  - `fix: resolve todo deletion bug`
  - `docs: update README`
  - `test: add test for TodoList component`
- **Branches**: Use feature branches (`feature/todo-api`, `fix/delete-bug`)

---

## API Structure

If implementing a backend API:

- **Route format**: `app/api/todos/route.ts`
- **Methods**: Use standard REST verbs (GET, POST, PUT, DELETE)
- **Response format**: Consistent JSON structure with `data` and `error` fields
- **Error handling**: Proper HTTP status codes and error messages

Example:

```typescript
// app/api/todos/route.ts
export async function GET(req: Request) {
  // Implementation
}

export async function POST(req: Request) {
  // Implementation
}
```

---

## Testing Strategy

- **Unit Tests**: Test individual components and utilities
- **Component Tests**: Use React Testing Library
- **Test Location**: Colocate tests with source files (`.test.tsx`) or organize in `tests/` directory
- **Coverage Target**: Aim for >80% coverage on critical paths

Example test structure:

```typescript
// src/components/TodoList.test.tsx
import { render, screen } from "@testing-library/react";
import TodoList from "./TodoList";

describe("TodoList", () => {
  it("renders todo items", () => {
    // Test implementation
  });
});
```

---

## Performance & Best Practices

1. **Next.js**: Leverage Server Components, Static Generation, Incremental Static Regeneration
2. **Code Splitting**: Use dynamic imports for large components
3. **Image Optimization**: Use Next.js `<Image>` component
4. **Bundling**: Monitor with `next/bundle-analyzer`
5. **Accessibility**: Follow WCAG guidelines, use semantic HTML
6. **Error Handling**: Implement proper error boundaries and user feedback

---

## Environment Setup

Create environment files in the project root:

```bash
# .env.local (local development, not committed)
NEXT_PUBLIC_API_URL=http://localhost:3000

# .env.production (production variables)
NEXT_PUBLIC_API_URL=https://todo-app.vercel.app
```

---

## Common Development Tasks

### Adding a New Feature

1. Create feature branch: `git checkout -b feature/todo-feature`
2. Implement feature in appropriate directories
3. Write tests for new functionality
4. Run `npm run lint` and `npm test`
5. Commit with conventional commit format
6. Push and create Pull Request

### Debugging

- Use Next.js debug mode: `NODE_OPTIONS='--inspect' npm run dev`
- Browser DevTools for React component inspection
- Check `console.log()` output in terminal and browser

### Production Deployment

- Deployed to Vercel automatically on main branch push
- Verify build succeeds locally: `npm run build`
- Test production build: `npm start`

---

## Troubleshooting

| Issue                           | Solution                                                  |
| ------------------------------- | --------------------------------------------------------- |
| Port 3000 already in use        | Use `npm run dev -- -p 3001` or kill process on port 3000 |
| TypeScript errors after changes | Run `npm run build` to check full compilation             |
| Module not found errors         | Verify paths in `tsconfig.json` and import statements     |
| Tests failing                   | Check test setup in `jest.config.js` and dependencies     |

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

## Questions?

Review this file before starting development. Coordinate with team members on architectural decisions and naming conventions to maintain consistency across the codebase.
