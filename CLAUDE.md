# SentientArchive Web — CLAUDE.md

## Project Overview

React 19 SPA frontend for a Personal Knowledge Base system. Deployed as a Docker
container (Nginx) on Google Cloud Run. Firebase handles auth and Firestore; Firebase
Cloud Functions serve as the backend API.

For project status, roadmap, and development phases read `MASTERPLAN.md`. For a
high-level feature overview read `README.md`.

## Commands

```bash
npm run dev           # Start Vite dev server (port 5173)
npm run build         # tsc + vite build
npm run type-check    # tsc --noEmit
npm run lint          # ESLint
npm run lint:fix      # ESLint --fix
npm run format        # Prettier --write
npm run format:check  # Prettier --check
npm run test          # Jest
npm run test:watch    # Jest --watch
npm run test:coverage # Jest --coverage (must hit 100% on all metrics)
docker compose up     # Start local dev environment
```

## Tech Stack

| Concern      | Library                                                       |
| ------------ | ------------------------------------------------------------- |
| UI           | React 19 + TypeScript 5.7                                     |
| Build        | Vite 6                                                        |
| Routing      | TanStack Router 1.x (file-based, code-generated)              |
| Server state | TanStack Query 5.x                                            |
| Global state | Zustand 5.x                                                   |
| Styling      | TailwindCSS 4 (configured in CSS, not tailwind.config)        |
| Components   | ShadCN (Radix UI primitives + Tailwind)                       |
| Icons        | Lucide React                                                  |
| Forms        | React Hook Form + Zod                                         |
| Firebase     | Firebase JS SDK 10.x (Auth + Firestore + Storage + Functions) |
| Testing      | Jest 29 + React Testing Library 16 + MSW 2                    |
| Linting      | ESLint 9 + typescript-eslint                                  |
| Formatting   | Prettier 3 + prettier-plugin-tailwindcss                      |
| Git hooks    | Husky 9 (pre-commit: lint+format; commit-msg: gitmoji)        |
| Font         | Space Grotesk (variable, via @fontsource-variable)            |

## Project Structure

```text
src/
├── components/
│   ├── ui/              # ShadCN primitives (button, card, input, label, …)
│   ├── branding/        # Custom branded inputs (SentientInput, SentientInputPassword)
│   ├── auth/            # ProtectedRoute.tsx
│   ├── layout/          # Navbar, Sidebar, DashboardLayout
│   ├── notes/           # Note management components
│   ├── ai/              # AI feature components
│   ├── admin/           # Admin dashboard components
│   └── tokens/          # Token management components
├── pages/
│   └── auth/            # LoginPage.tsx, SignupPage.tsx
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx       # Root layout (ThemeProvider + useAuth)
│   ├── index.tsx        # / redirect
│   ├── login.tsx        # /login
│   ├── signup.tsx       # /signup
│   └── dashboard.tsx    # /dashboard
├── routeTree.gen.ts     # AUTO-GENERATED — never edit manually
├── hooks/
│   └── useAuth.ts       # onAuthStateChanged → Zustand sync
├── stores/
│   └── authStore.ts     # Zustand auth store
├── lib/
│   ├── firebase.ts      # Firebase app init + emulator connections
│   ├── env.ts           # import.meta.env abstraction (mockable in tests)
│   ├── api-client.ts    # apiRequest() — attaches Firebase ID token
│   ├── auth-service.ts  # authService object (Google + email/password)
│   ├── auth-errors.ts   # Firebase error code → user message map
│   ├── button-variants.ts
│   └── utils.ts         # cn() and general utilities
├── types/
│   └── user.ts          # IUser interface, User type
├── locales/
│   ├── en/translation.json
│   └── es/translation.json
└── index.css            # TailwindCSS 4 imports + CSS custom properties

tests/
├── __mocks__/
│   ├── env.ts                # Mocks src/lib/env.ts for Jest
│   ├── firebase-functions.ts # Mocks firebase/functions
│   ├── lucide-react.ts       # Mocks lucide-react icons
│   └── fileMock.js           # Static asset mock
├── setup.ts                  # jest-dom setup + browser API mocks
├── App.test.tsx
├── components/auth/
├── hooks/
├── lib/
├── pages/auth/
└── stores/
```

## Key Patterns

### TypeScript naming

- Interfaces: `I` prefix → `IAuthState`, `IProtectedRouteProps`, `IUser`
- Component props type: `Props` suffix → `ButtonProps`
- Type aliases used for unions / re-exports → `export type User = IUser`
- Avoid `any`; use `unknown` + type guards
- Named exports throughout — no default exports on shared components

### Path alias

`@/` resolves to `src/`. Always use it for cross-folder imports.

### Component structure

- Functional components with named functions (not arrow function assignments)
- Props type defined inline above the component

```typescript
interface IMyComponentProps {
    label: string;
}

export function MyComponent({ label }: IMyComponentProps) { … }
```

### Routing

File-based routing via TanStack Router. Add a file to `src/routes/` and the router
plugin regenerates `routeTree.gen.ts` automatically on `npm run dev` or `npm run build`.
Use `createFileRoute` for leaf routes and `createRootRoute` only in `__root.tsx`.

### Auth flow

`useAuth()` is called once in `__root.tsx`. It subscribes to `onAuthStateChanged`,
fetches the Firestore user document, and syncs the result into `useAuthStore`. All
components read auth state from the store — they do not call `useAuth()` themselves.

`ProtectedRoute` reads `isLoading` and `isAuthenticated` from the store and redirects to
`/login` if unauthenticated, or to `/dashboard` if `requireAdmin` is set and user is not
admin.

### Firebase env abstraction

`src/lib/env.ts` wraps `import.meta.env` with getters so it can be mocked in Jest. The
file is excluded from coverage collection. **Always import from `@/lib/env` rather than
accessing `import.meta.env` directly in application code.**

### Styling

- TailwindCSS v4: configured via `@import "tailwindcss"` in `index.css` — no
  `tailwind.config.ts` file.
- Color tokens are CSS custom properties defined in `index.css` under `:root` and
  `.dark`. Use semantic names (`--primary`, `--muted-foreground`, `--success`,
  `--error`) rather than raw values.
- Use the `cn()` helper from `@/lib/utils` for conditional class merging.
- Dark mode uses the `dark` class on the root element (managed by `next-themes`
  `ThemeProvider`).

### ShadCN components

- All ShadCN primitives live in `src/components/ui/`.
- Do not modify them directly; wrap them in `src/components/branding/` or feature
  folders.
- Add new primitives via `npx shadcn@latest add <component>`.

### Branding components

`src/components/branding/` contains project-specific input components:

- `SentientInput` — labeled input with validation state (`idle` | `success` | `error`)
- `SentientInputPassword` — password input with live rule feedback (configurable
  `IPasswordRule[]`)

Export from the barrel `src/components/branding/index.ts`.

### API calls

Use `apiRequest<T>(endpoint, options)` from `@/lib/api-client`. It automatically
retrieves the current user's Firebase ID token and sets `Authorization: Bearer <token>`.
Base URL switches between local emulator and Cloud Functions based on
`VITE_USE_EMULATOR`.

## Testing

### Rules

- **100% branch/function/line/statement coverage** is enforced in CI.
- `src/lib/env.ts`, `src/main.tsx`, and `src/vite-env.d.ts` are excluded from coverage.
- Tests live in `tests/` mirroring `src/` paths.

### Mocks

Jest `moduleNameMapper` automatically redirects these imports in tests:

| Import                 | Mock file                               |
| ---------------------- | --------------------------------------- |
| `@/lib/env` or `./env` | `tests/__mocks__/env.ts`                |
| `lucide-react`         | `tests/__mocks__/lucide-react.ts`       |
| `firebase/functions`   | `tests/__mocks__/firebase-functions.ts` |
| Static assets          | `tests/__mocks__/fileMock.js`           |

When writing tests that depend on Firebase modules not already mocked, add a manual
`jest.mock('firebase/...')` at the top of the test file.

### Transform

Babel (not ts-jest) handles transforms — `babel-jest` with
`babel-plugin-transform-import-meta` to rewrite `import.meta.env` for the Jest
environment. The config is in `babel.config.*` or referenced from `package.json`.

### Global setup (`tests/setup.ts`)

Provides mocks for `window.matchMedia`, `ResizeObserver`, and `IntersectionObserver`.
Import `@testing-library/jest-dom` for extended matchers.

## Commit Format

Enforced by Husky commit-msg hook. Pattern: `:<emoji_code>: <Capitalized message>`

```text
:sparkles: Add user authentication flow   ✅
:bug: Fix token refresh infinite loop     ✅
:sparkles: add feature                    ❌ (not capitalized)
:bug: Fix bug.                            ❌ (period at end)
Add new feature                           ❌ (missing gitmoji)
```

Common codes: `:sparkles:` new feature, `:bug:` fix, `:memo:` docs, `:recycle:`
refactor, `:white_check_mark:` tests, `:lipstick:` UI/style, `:wrench:` config, `:fire:`
remove code, `:construction:` WIP, `:art:` code structure, `:zap:` performance, `:lock:`
security.

Pre-commit hook runs ESLint and Prettier; fix issues before committing. Never use
`--no-verify`.

## Environment Variables

All `VITE_*` variables must be set before `vite build`. For local development copy
`.env.example` to `.env`. Set `VITE_USE_EMULATOR=true` to connect to Firebase emulators.

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_USE_EMULATOR         # "true" → connect emulators on localhost
```

Emulator ports: Auth 9099, Firestore 8081, Storage 9199, Functions 5001.

## What NOT to Do

- Do not edit `src/routeTree.gen.ts` — it is auto-generated.
- Do not access `import.meta.env` directly outside of `src/lib/env.ts`.
- Do not add default exports to shared components or utilities.
- Do not use `any`; prefer `unknown` with type guards.
- Do not skip Husky hooks (`--no-verify`).
- Do not use `var`; use `const`/`let`.
- Do not modify ShadCN primitive files in `src/components/ui/` for feature-specific
  behavior — wrap them instead.
- Do not commit `.env` files.
