# Frontend Developer Coding Style and Best Practices

## UX/UI Design Principles

### UX/UI Design Principles: General Principles

- Understand and apply User-Centered Design
- Design for usability and intuitive interactions
- Ensure accessibility (WCAG compliance where appropriate)
- Structure content using solid Information Architecture
- Focus on Interaction Design for fluid user flows

### UX/UI Design Principles: Visual Design

- Apply principles of Visual Design consistently
- Use typography hierarchies effectively
- Follow colour theory for contrast and harmony
- Build clear and balanced layouts
- Design for responsiveness across devices

### UX/UI Design Principles: Design Systems

- Create and maintain a scalable Design System
- Use reusable components and patterns
- Follow atomic design principles where applicable

### UX/UI Design Principles: Design Thinking

- Apply Design Thinking methodology: _Empathize_, _Define_, _Ideate_, _Prototype_,
  _Test_
- Keep the user at the center of all design decisions

## HTML Best Practices

### HTML Best Practices: Structure & Semantics

- Use semantic HTML elements (`<header>`, `<main>`, `<footer>`, `<section>`,
  `<article>`, etc.)
- Avoid using `<div>` or `<span>` when a semantic element fits better
- Always use the correct DOCTYPE declaration (`<!DOCTYPE html>`)
- Use `<h1>`-`<h6>` tags in order to reflect content hierarchy. Use only one `<h1>` tag
  inside the entire application.
- Include a single `<main>` tag per page

### HTML Best Practices: Accessibility (a11y)

- Use `alt` attributes on all `<img>` tags with descriptive text
- Use **ARIA roles** only when native HTML elements don't suffice
- Use `<label>` with `for` attribute linked to input ids
- Ensure interactive elements are keyboard accessible
- Avoid auto-playing audio or video without user interaction

### HTML Best Practices: Performance

- Minimize use of inline styles; use **CSS files** instead
- Defer or async JavaScript when possible (`<script defer>` or `<script async>`)
- Use the `loading="lazy"` attribute for images when appropriate
- Place scripts at the end of the body unless necessary in the head

### HTML Best Practices: Forms

- Always include `name` attributes in form controls
- Group related inputs using `<fieldset>` and `<legend>`
- Use appropriate `type` attributes on inputs (`email`, `tel`, `url`, etc.)
- Provide **placeholders** and **aria attributes** to enhance accessibility
- Use `required`, `min`, `max`, `pattern`, and `autocomplete` attributes properly

### HTML Best Practices: Links & Navigation

- Use `<nav>` for site or page navigation
- Ensure links are descriptive (avoid common terms like _click here_)
- Use relative paths for internal links and absolute paths for external ones
- Always provide a visible focus indicator for links and buttons

### HTML Best Practices: Media

- Use `<picture>` and `<source>` for responsive images
- Use `width` and `height` attributes to prevent layout shifts
- Provide captions or transcripts for multimedia content
- Use `<figure>` and `<figcaption>` to wrap self-contained media content

### HTML Best Practices: SEO

- Include a meaningful `<title>` for each page
- Add relevant `<meta>` tags (description, viewport, charset, etc.)
- Use canonical URLs when necessary
- Structure content with headings and semantic tags for crawler clarity

### HTML Best Practices: Maintainability

- Use consistent indentation (4 spaces)
- Use lowercase for tag names and attributes
- Quote all attribute values
- Close all tags properly, including self-closing tags (`<img />`)
- Avoid inline JavaScript and CSS when possible

### HTML Best Practices: Comments & Readability

- Use HTML comments (`<!-- comment -->`) to explain non-obvious sections
- Do not leave commented-out code in production
- Keep markup concise and avoid unnecessary nesting

## CSS Best Practices

### CSS Best Practices: Structure & Organization

- Group related styles in **type-based** folders (e.g.,
  `components/ui/Button/button.css`)
- Use consistent ordering: layout > box model > typography > visual > animation
- Use comments to separate sections and explain non-obvious rules
- Avoid long files; split styles by component or responsibility
- Keep global styles minimal; prefer scoped/component styles

### CSS Best Practices: Naming Conventions

- Use **BEM** (Block\_\_Element--Modifier) naming for class names
- Use lowercase letters and hyphens (`.button-primary`, not `.buttonPrimary`)
- Avoid generic class names (`.box`, `.content`, `.main`)
- Name classes based on purpose, not appearance (`.card-error`, not `.red-box`)

### CSS Best Practices: Specificity & Selectors

- Keep specificity low and flat
- Avoid IDs in selectors unless necessary
- Use class selectors over element selectors for reusability
- Avoid overly long selectors (`.header .nav .item`); keep them short and maintainable

### CSS Best Practices: Reusability

- Use CSS custom properties (`--primary-color`) for theme variables
- Extract common values (colors, spacing, fonts) into variables or utility classes
- Avoid repeating the same values across multiple rules
- Prefer utility-first or atomic classes for layout and spacing when possible

### CSS Best Practices: Responsive Design

- Use relative units (`rem`, `%`, `em`) instead of fixed units (`px`)
- Use **mobile-first** media queries (`min-width`)
- Avoid fixed widths and heights where possible
- Use **Flexbox** or **Grid** for layout over floats or absolute positioning

### CSS Best Practices: Performance

- Avoid unnecessary use of `!important`
- Minimize deeply nested rules
- Use shorthand properties where appropriate
- Avoid large unused CSS blocks; clean up unused styles

### CSS Best Practices: Accessibility

- Ensure high contrast between text and background
- Avoid using color alone to convey meaning
- Use `:focus` styles for interactive elements
- Ensure hover styles are also accessible via keyboard

### CSS Best Practices: Maintainability

- Stick to a design system or style guide
- Use mixins and functions if using SCSS
- Avoid inline styles and `style` attributes in HTML
- Consistently format CSS using a linter or formatter (use **Prettier** tool)
- Prefer one class per responsibility to promote reusability and testability

### CSS Best Practices: Animations & Transitions

- Use `transition` and `animation` with care; keep them performant
- Keep animation durations and delays consistent
- Use keyframes only when needed and name them clearly

## JavaScript Best Practices

### JavaScript Best Practices: Syntax & Language Features

- Use `const` for values that never change and `let` for those that do; avoid using
  `var`
- Prefer **arrow functions** for callbacks and short functions, but use named functions
  when they improve readability or debugging
- Use **template literals** for string construction instead of concatenation
- Destructure objects and arrays for clarity and immutability
- Use **spread/rest operators** instead of `Object.assign()` or manual copying
- Favor **optional chaining (`?.`)** and **nullish coalescing (`??`)** for safe access
  and defaults
- Prefer **shorthand properties** and methods in object literals
- Always return early in functions to reduce nesting and improve readability

### JavaScript Best Practices: Code Style & Formatting

- Follow consistent indentation (4 spaces, project-dependent — use **Prettier** tool
  configuration)
- Use `camelCase` for variables, functions, and object properties
- End statements with semicolons
- Prefer **double quotes** for strings (enforce via **Prettier tool**)
- Avoid inline comments in complex logic; use block comments above logic blocks
- Use **ESLint** and **Prettier** with CI integration to enforce style consistently

### JavaScript Best Practices: Structure & Organization

- Group related constants, types, and utility functions into modules
- Keep functions pure and focused on a single responsibility (_SRP_)
- Organize files by feature or domain instead of file type in large applications
- Use named exports consistently to avoid ambiguity in import names
- Split large files into smaller modules when they exceed **~500 lines of code**
- Prefer colocating files (`index.js`, `styles.js`, `types.js`) in a folder per
  component or feature

### JavaScript Best Practices: Error Handling

- Always handle rejections in `async/await` and `Promise` chains
- Avoid empty `catch` blocks; log or throw a meaningful error
- Use `try/catch` where failure is expected, not as control flow
- Create custom error types for domain-specific cases

### JavaScript Best Practices: Naming Conventions

- Use meaningful, descriptive names for variables and functions
- Avoid abbreviations unless they're widely understood (`id`, `URL`, `API`)
- Use verbs for functions (`fetchData`, `calculateTotal`)
- Name booleans with prefixes like `is`, `has`, or `can` (e.g., `isActive`,
  `hasPermission`)
- Use plural names for arrays and collections (`users`, `items`)
- Constants should be in `UPPER_SNAKE_CASE` when they are exported or shared

### JavaScript Best Practices: Performance & Optimization

- Avoid unnecessary loops and recalculations; memoize expensive operations
- Use debounce/throttle on high-frequency DOM events (e.g., scroll, input)
- Minimize DOM manipulations and reflows
- Use `requestIdleCallback`, `requestAnimationFrame` for UI performance tuning

### JavaScript Best Practices: Maintainability

- Avoid magic numbers and hardcoded strings — use constants or enums
- Write reusable, **pure functions** and isolate side effects
- Favor declarative code over imperative code when possible
- Document complex logic using **JSDoc**
- Avoid mutable shared state — use factory functions or closures to encapsulate

### JavaScript Best Practices: Testing & Debugging

- Use a robust testing framework (e.g., **Jest**, **Vitest**, or **Mocha**) for unit and
  integration tests
- Write tests for edge cases and error paths, not just the _happy path_
- Use mocks and spies carefully — overuse can reduce test clarity
- Avoid `console.log()` in production; use structured logging and levels
- Validate function arguments and return values in tests

### JavaScript Best Practices: Tooling & Ecosystem

- Use **npm** as a default package manager.
- Keep dependencies up-to-date using tools like `npm audit`.
- Use **Vite** with production optimization enabled
- Add `build`, `lint`, `test`, and `format` scripts to `package.json`

### JavaScript Best Practices: Modern Features (ES6+)

- Use ES Modules (`import/export`) instead of `require`
- Prefer `Array.prototype.map`, `filter`, `reduce` for data transformation
- Use `Map`/`Set` over objects for collections with dynamic keys or guaranteed
  uniqueness
- Leverage `async/await` for clearer async flow
- Use `Promise.all` or `Promise.allSettled` for parallelism when tasks are independent
- Avoid deeply nested `.then()` chains — use `await` or flatten logic

### JavaScript Best Practices:: Anti-Patterns to Avoid

- Avoid deeply nested callbacks or Promises — use functions or early returns
- Don't mutate function parameters; always treat them as immutable
- Avoid using `this` in non-class functions
- Never extend native prototypes like `Array.prototype` or `Object.prototype`
- Don't rely on side effects to control function output
- Avoid global state

### JavaScript Best Practices: Security

- Sanitize and validate **all user inputs** before processing or storing
- Never use `eval()`, `Function()`, or dynamic `import()` with user input
- Avoid exposing sensitive keys or secrets in client-side code
- Configure **Content Security Policy (CSP)** headers to prevent XSS attacks
- Use HTTPS and modern authentication libraries
- Verify third-party dependencies and audit licenses

## TypeScript Best Practices

### TypeScript Best Practices: Type System

- Prefer interfaces over types for object definitions
- Use `type` for unions, intersections, and mapped types
- Avoid using `any`, prefer `unknown` for unknown types
- Use strict TypeScript configuration (`strict: true` in tsconfig.json)
- Leverage TypeScript's built-in utility types (`Partial`, `Pick`, `Omit`, `Record`,
  etc.)
- Use generics for reusable type patterns
- Use `readonly` for immutable properties
- Use discriminated unions for better type safety
- Use type guards and `in` checks for runtime type checking
- Prefer literal types and enums for limited sets of values

### TypeScript Best Practices: Naming Conventions

- Use PascalCase for type names and for interfaces place the `I` before the name
  (`IPersonInterface`)
- Use `camelCase` for variables, functions, and parameters
- Use `UPPER_CASE` for constants and enum members
- Use descriptive names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Prefix types for React props with 'Props' (e.g., `ButtonProps`)
- Name custom error types with the `Error` suffix (e.g., `NotFoundError`)

### TypeScript Best Practices: Code Organization

- Keep type definitions close to where they're used
- Export shared types and interfaces from dedicated type files
- Use barrel exports (`index.ts`) to simplify import paths
- Group related types in a `types/` directory
- Co-locate component props/types with the components
- Avoid circular imports by structuring modules clearly

### TypeScript Best Practices: Functions

- Use explicit return types for all public functions and methods
- Prefer arrow functions for callbacks and inline handlers
- Use function overloads to handle multiple type scenarios
- Prefer `async/await` over raw Promises for readability
- Implement custom error types and return them instead of strings
- Avoid deeply nested functions; extract logic to named helpers

### TypeScript Best Practices: Imports & Dependencies

- Use absolute imports for shared modules and aliases (`@/components`, `@/utils`, etc.)
- Group imports: external → internal → relative
- Avoid default exports in shared codebases, prefer named exports
- Prefer tree-shakable libraries and modern ESM-compatible packages
- Keep import statements ordered and clean

### TypeScript Best Practices: Linting & Formatting

- Use ESLint with `@typescript-eslint` plugin
- Enforce `no-explicit-any`, `no-non-null-assertion`, and `no-unused-vars`
- Use Prettier for automatic code formatting
- Add **Husky** and **lint-staged** to run linters/formatters before commits
- Format and lint code automatically in CI

### TypeScript Best Practices: Error Handling

- Create custom error types for domain-specific errors
- Use `Result` or `Either` types for recoverable errors
- Implement proper error boundaries in React
- Use typed `try/catch` with `instanceof` checks
- Handle Promise rejections using `.catch` or `try/catch`

### TypeScript Best Practices: Testing

- Use `ts-jest`, `vitest`, or `jest` with proper TS support
- Avoid using `any` in test files; type mock data and props
- Prefer integration tests that simulate real usage
- Use libraries like `tsd` or `typescript-eslint` rules to check type usage
- Keep type safety when mocking with tools like `jest.Mocked<T>`

### TypeScript Best Practices: Documentation & Comments

- Use TSDoc to document public APIs and complex types
- Add comments to explain complex type transformations
- Avoid unnecessary inline comments for obvious types
- Keep documentation in sync with type updates

### TypeScript Best Practices: Tooling & Automation

- Use `tsc --noEmit` in CI to ensure type safety
- Automate linting and formatting with Git hooks and CI checks
- Use `ts-prune` or `typescript-unused-exports` to remove unused types

### TypeScript Best Practices: Patterns

- Use the Builder pattern for complex object construction
- Use the Factory pattern for controlled object creation
- Use the Repository pattern for abstracting data access
- Use the Module pattern for encapsulated logic
- Leverage dependency injection in services or utilities
- Prefer composition over inheritance in business logic and components

### TypeScript Best Practices: Performance Considerations

- Avoid deeply nested types or overly complex generics
- Simplify unions when possible
- Use indexed access types cautiously
- Avoid unnecessary runtime type checking for fully trusted inputs

## React Best Practices

### React Best Practices: Component Structure

- Use functional components over class components
- Always use named functions when creating function components
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use composition over inheritance
- When the project uses Typescript, implement prop types with a name following by the
  `Props` term.
- Split large components into smaller, focused ones

### React Best Practices: Hooks

- Follow the Rules of Hooks
- Use custom hooks for reusable logic
- Keep hooks focused and simple
- Use appropriate dependency arrays in `useEffect`
- Implement cleanup in `useEffect` when needed
- Avoid nested hooks

### React Best Practices: State Management

- Use `useState` for local component state
- Implement `useReducer` for complex state logic
- Use Context API for shared state
- Keep state as close to where it's used as possible
- Avoid prop drilling through proper state management
- Use **Zustand** for global state management and store every related file in a folder
  called `stores`

### React Best Practices: Performance

- Implement proper memoization (`useMemo`, `useCallback`)
- Use **React memo** for expensive components
- Avoid unnecessary re-renders
- Implement proper lazy loading
- Use proper key props in lists
- Profile and optimize render performance

### React Best Practices: Forms

- Use controlled components for form inputs
- Implement proper form validation
- Handle form submission states properly
- Show appropriate loading and error states
- Use form libraries for complex forms
- Implement proper accessibility for forms
- When working with forms, create a new file called `zod` and use **Zod** for validation
  and schemas
- Use the `useForm` hook (e.g. from **React Hook Form**) with Zod for better integration

### React Best Practices: Error Handling

- Implement Error Boundaries
- Handle async errors properly
- Show user-friendly error messages
- Implement proper fallback UI
- Log errors appropriately
- Handle edge cases gracefully

### React Best Practices: Testing

- Write unit tests for components
- Implement integration tests for complex flows
- Use **React Testing Library**
- Test user interactions
- Test error scenarios
- Implement proper mock data

### React Best Practices: Accessibility

- Use semantic HTML elements
- Implement proper **ARIA attributes**
- Ensure keyboard navigation
- Test with screen readers
- Handle focus management
- Provide proper alt text for images

### React Best Practices: Code Organization

- Group related components together
- Use proper file naming conventions
- Implement proper directory structure
- Keep styles close to components
- Use proper imports/exports
- Document complex component logic

### React Best Practices: Data Fetching & Tables

- Use **Tanstack Query** for all async data fetching
- Use **Tanstack Tables** for consistent and powerful table rendering
- Co-locate query hooks close to the consuming components when possible
- Handle loading, error, and empty states for data queries explicitly

### React Best Practices: Additional Code Quality

- Use **ESLint** and **Prettier** with a shared configuration for consistent code style
- Use absolute imports with module aliases (e.g. `@/components/Button`)
- Avoid magic values and define constants for configuration and enums
- Prefer explicit types over implicit inference in exported functions
- Avoid side effects inside components.
- Keep components pure
- Use environment variables via `.env` files with proper validation
- Review and prune unused dependencies regularly

## Tailwind CSS Best Practices

### Tailwind CSS Best Practices: Project Setup

- Configure TailwindCSS inside CSS using its new configuration from **V4** (only if the
  project uses Vite).
- Skip configuration process if the project uses **Next.js**
- Search for more information on the official TailwindCSS website for installation
  instructions.

### Tailwind CSS Best Practices: Component Styling

- Use utility classes over custom CSS
- Use proper responsive design utilities
- Implement dark mode properly
- Use proper state variants
- Keep component styles consistent

### Tailwind CSS Best Practices: Layout

- Use Flexbox and Grid utilities
- Use container queries when needed
- Implement responsive breakpoints

### Tailwind CSS Best Practices: Colours

- Use semantic color naming and avoid define custom colours.
- Use colours from `globals.css` stylesheet file.

### Tailwind CSS Best Practices:: Responsive Design

- Use mobile-first approach

### Tailwind CSS Best Practices: Performance

- Minimize custom CSS
- Optimize for production

### Tailwind CSS Best Practices:: Best Practices

- Follow naming conventions
- Keep styles organized
- Use proper documentation
- Implement proper testing
- Follow accessibility guidelines

## TanStack Router Best Practices

### TanStack Router Best Practices: Project Structure

- Place all route definitions in `src/routes/` directory
- Use the file-based routing convention with `__root.tsx` as the root layout
- Organize routes hierarchically to match URL structure
- Co-locate route-specific components with their route files when appropriate
- Use `index.tsx` for index routes within directories

### TanStack Router Best Practices: Route Configuration

- Define routes using `createFileRoute` for file-based routing
- Use `createRootRoute` for the root layout component
- Implement proper TypeScript types for route params and search params
- Use `validateSearch` with Zod schemas for type-safe search params
- Define `loader` functions for data fetching at the route level

### TanStack Router Best Practices: Navigation

- Use `<Link>` component for declarative navigation
- Use `useNavigate` hook for programmatic navigation
- Implement `activeProps` for active link styling
- Use `preload` prop on links for better perceived performance
- Handle navigation state with `useRouter` hook

### TanStack Router Best Practices: Data Loading

- Use route loaders for data fetching before render
- Implement `pendingComponent` for loading states
- Use `errorComponent` for error handling at route level
- Leverage `staleTime` and caching options for performance
- Integrate with TanStack Query for complex data requirements

### TanStack Router Best Practices: Type Safety

- Export route types for use in components
- Use `RouteApi` for accessing typed route context
- Define strict types for all route params and search params
- Use `Link` component's type inference for route validation
- Leverage TypeScript's inference for loader data types

### TanStack Router Best Practices: Code Splitting

- Use lazy route loading for large route components
- Implement route-level code splitting with dynamic imports
- Use `lazyRouteComponent` for deferred component loading
- Balance between bundle size and loading performance

## Firebase Client SDK Best Practices

### Firebase Client SDK Best Practices: Initialization

- Initialize Firebase app once at module level in `src/lib/firebase.ts`
- Use environment variables for all Firebase configuration
- Never expose Firebase config in client-side logs or error messages
- Configure emulator connections for local development:

  ```typescript
  if (import.meta.env.VITE_USE_EMULATOR === "true") {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
  }
  ```

### Firebase Client SDK Best Practices: Authentication

- Use `onAuthStateChanged` listener for auth state management
- Store auth state in Zustand store for global access
- Always verify user is authenticated before protected operations
- Use `getIdToken()` to get fresh tokens for API calls
- Handle auth errors with user-friendly messages
- Implement proper sign-out cleanup (clear stores, redirect)

### Firebase Client SDK Best Practices: Firestore Client Operations

- Use typed document references with TypeScript generics
- Implement real-time listeners with `onSnapshot` for live data
- Clean up listeners in `useEffect` cleanup functions
- Use `where`, `orderBy`, and `limit` for efficient queries
- Handle offline scenarios gracefully
- Never trust client-side data; always validate on backend

### Firebase Client SDK Best Practices: Security

- Never store sensitive data in Firestore from client
- Use Firebase Security Rules as primary access control
- Validate all user input before sending to Firestore
- Don't expose document IDs that could be enumerated
- Use custom claims for role-based access (set via backend)

### Firebase Client SDK Best Practices: Performance

- Use pagination with `startAfter` for large collections
- Implement optimistic updates for better UX
- Cache frequently accessed data with TanStack Query
- Minimize real-time listeners; use them only when necessary
- Bundle Firestore queries to reduce round trips

## ShadCN UI Best Practices

### ShadCN UI Best Practices: Component Organization

- Store all ShadCN components in `src/components/ui/`
- Keep components unmodified when possible for easy updates
- Create wrapper components for customized behavior
- Use the CLI to add new components: `npx shadcn@latest add [component]`

### ShadCN UI Best Practices: Composition Patterns

- Compose complex UIs from primitive ShadCN components
- Use `cn()` utility for conditional class merging
- Follow the compound component pattern used by ShadCN
- Extend components through composition, not modification:

  ```typescript
  // Good: Wrapper component
  function PrimaryButton({ children, ...props }: ButtonProps) {
    return <Button variant="default" size="lg" {...props}>{children}</Button>;
  }
  ```

### ShadCN UI Best Practices: Accessibility

- ShadCN uses Radix UI primitives; leverage their built-in a11y
- Always provide proper labels for form components
- Use `Dialog`, `AlertDialog` for modal interactions
- Implement proper focus management with Radix primitives
- Test keyboard navigation for all interactive components

### ShadCN UI Best Practices: Theming

- Define theme variables in `src/index.css` or `globals.css`
- Use CSS custom properties for colors and spacing
- Implement dark mode using the `dark` class on root element
- Keep theme consistent with design system variables

### ShadCN UI Best Practices: Forms Integration

- Use ShadCN Form components with React Hook Form
- Implement `FormField`, `FormItem`, `FormLabel`, `FormMessage` pattern
- Connect Zod schemas for validation
- Handle form states (loading, error, success) consistently

## Vite Best Practices

### Vite Best Practices: Configuration

- Configure path aliases in `vite.config.ts` for clean imports:

  ```typescript
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
  ```

- Use environment variables with `VITE_` prefix
- Configure proper build output for production
- Enable source maps only in development

### Vite Best Practices: Development

- Use HMR (Hot Module Replacement) for fast development
- Configure `server.host` for Docker compatibility
- Use `server.proxy` for API proxying during development
- Enable `server.watch.usePolling` for Docker on some systems

### Vite Best Practices: Build Optimization

- Configure manual chunks for better caching:

  ```typescript
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
        },
      },
    },
  }
  ```

- Use dynamic imports for code splitting
- Analyze bundle size with `rollup-plugin-visualizer`
- Optimize dependencies with `optimizeDeps` configuration

### Vite Best Practices: Environment Variables

- Define all env vars in `.env.example` for documentation
- Use `.env.local` for local overrides (gitignored)
- Access variables via `import.meta.env.VITE_*`
- Validate required env vars at application startup

## Git Workflow & Commit Conventions

### Git Workflow & Commit Conventions: Gitmoji Commit Format

- Use **Gitmoji** for all commit messages (enforced by Husky)
- Format: `:<emoji_code>: <commit message>`
- Keep commit messages clear, concise, and descriptive
- Use imperative mood ("Add feature" not "Added feature")
- First letter after emoji must be capitalized
- Do not end commit message with a period
- Common Gitmoji patterns for this project:
  - `:sparkles:` - Add new features
  - `:bug:` - Fix bugs
  - `:fire:` - Remove code or files
  - `:memo:` - Add or update documentation
  - `:recycle:` - Refactor code
  - `:zap:` - Improve performance
  - `:lock:` - Fix security issues
  - `:white_check_mark:` - Add or update tests
  - `:construction:` - Work in progress
  - `:wrench:` - Add or update configuration files
  - `:package:` - Add or update dependencies
  - `:rocket:` - Deploy stuff
  - `:art:` - Improve structure/format of code
  - `:lipstick:` - Update UI and style files

### Git Workflow & Commit Conventions: Commit Message Examples

```bash
# Good examples
:sparkles: Add user authentication flow
:bug: Fix token refresh infinite loop
:memo: Update API documentation
:recycle: Refactor note editor component
:white_check_mark: Add integration tests for AI hooks
:wrench: Configure Docker compose for dev
:lipstick: Improve dashboard responsiveness

# Bad examples (avoid these)
:sparkles: add feature          # Not capitalized
:bug: Fix bug.                  # Period at end
sparkles: Add feature           # Missing colons
Add new feature                 # Missing gitmoji
```

### Git Workflow & Commit Conventions: GitFlow Branching Strategy

- Use **GitFlow** for branch management
- Main branches:
  - `main` - Production-ready code
  - `develop` - Integration branch for features
- Supporting branches:
  - `feature/*` - New features
  - `bugfix/*` - Bug fixes
  - `hotfix/*` - Urgent production fixes
  - `release/*` - Release preparation
- Branch naming conventions:
  - `feature/user-authentication` - Feature branches
  - `bugfix/token-validation` - Bug fix branches
  - `hotfix/security-patch` - Hotfix branches
  - `release/v1.0.0` - Release branches

### Git Workflow & Commit Conventions: Husky Pre-commit Hooks

- Husky runs automatically before commits
- Pre-commit hook runs:
  - ESLint for code quality
  - Prettier for code formatting
- Commit-msg hook validates Gitmoji format
- If hooks fail, fix issues before committing
- Never bypass hooks with `--no-verify` unless absolutely necessary

### Git Workflow & Commit Conventions: Pull Request Guidelines

- Create PRs from feature branches to `develop`
- Use descriptive PR titles with Gitmoji
- Include detailed description of changes
- Reference related issues (e.g., "Closes #123")
- Ensure all tests pass before requesting review
- Address review comments promptly

### Git Workflow & Commit Conventions: Best Practices

- Commit frequently with small, focused changes
- Write meaningful commit messages
- Never commit sensitive data (API keys, secrets, `.env` files)
- Keep commits atomic (one logical change per commit)
- Test locally before committing
- Pull latest changes before starting new work
- Resolve merge conflicts carefully
- Use `.gitignore` to exclude build artifacts and dependencies

## Docker Best Practices

### Docker Best Practices: Dockerfile

- **Generate two specialized files** for specific needs:
  - **`Dockerfile.dev`**: Includes development-only tools (like watchers, debuggers, or
    excessive test dependencies) and is optimized for quick rebuilds. It should expose
    the source code via **volumes** to enable live reloading.
  - **`Dockerfile.prod`** (renamed from `Dockerfile`): A **minimal, multi-stage build**
    designed for final deployment. It strips out all development dependencies, optimizes
    the runtime image, and is the source for your final deployment image.

### Docker Best Practices: Docker

- **Use `docker-compose.yml`** as the **base configuration** shared by all environments
  (networks, shared volumes, common service names).
- **Use `docker-compose.override.yml`** for **local development**. This file is
  automatically loaded and includes things like:
  - **Bind mounts** for hot-reloading.
  - **Environment variables** for local settings.
  - **Exposed ports** for easy access.
- **Use `docker-compose.staging.yml`** for the **staging/testing environment**. This
  file:
  - Overrides the `build` context to use `Dockerfile.prod`.
  - Specifies production-like **environment variables** (database URLs, external service
    keys).
  - Exposes only necessary ports and doesn't include bind mounts.
- **Use `docker-compose.prod.yml`** for the **production/live environment**. This file:
  - Overrides the `build` context to use `Dockerfile.prod`.
  - Specifies **live production environment variables** (production database URLs, final
    external service keys).
  - Exposes only essential ports for the running application and **must not** include
    bind mounts or development tooling

### Docker Best Practices: README.md File

Add a section like this to your project's `README.md` file:

````md
## Docker Operations 🐳

### 1. Local Development (Hot Reloading)

This configuration uses `docker-compose.yml` and automatically loads
`docker-compose.override.yml` for local settings.

#### **Commands**

- **Run (Foreground):** `docker compose up --build`
  - _Builds the image (if necessary) and starts all services in the foreground._
- **Run (Detached):** `docker compose up -d`
  - _Starts services in the background._
- **Restart a Service:** `docker compose restart [service_name]`
  - _Restarts a specific service (e.g., `web`)._
- **Stop All:** `docker compose down`
  - _Stops and removes containers, networks, and volumes._

### 2. Executing Commands Inside a Container

To run one-off commands (like migrations, tests, or shell access) inside your running
development container:

#### **Suggestions**

- **Run a specific command (e.g., database migrations):**
  ```bash
  docker compose exec web npm run migrate
  ```
- **Open a shell (Bash/Sh) inside the main service container:**
  ```bash
  docker compose exec web bash
  ```
  _(Use `sh` instead of `bash` if your image is Alpine-based.)_

### 3. Staging/Production Deployment

Use the dedicated staging configuration for a production-like test run.

#### **Command**

- **Build and Run Production Image:**
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.staging.yml up --build -d
  ```
  _This command explicitly uses the base config and the staging override to build and
  run the optimized production image._
````
