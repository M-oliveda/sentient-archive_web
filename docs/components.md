# Component API (shared)

High-level props for frequently reused SentientArchive components. For full details, see
the TypeScript interfaces colocated with each component.

## Branding

### `SentientInput`

| Prop              | Type                             | Notes                          |
| ----------------- | -------------------------------- | ------------------------------ |
| `id`              | `string`                         | Input id (required for labels) |
| `label`           | `string`                         | Visible label                  |
| `validationState` | `"idle" \| "success" \| "error"` | Visual validation              |
| `errorMessage`    | `string?`                        | Shown when `error`             |

### `SentientInputPassword`

Extends branded input with live password rule feedback (`IPasswordRule[]`).

### `SentientArchiveLogo`

Renders product mark + name; used in public and dashboard chrome.

## Auth

### `ProtectedRoute`

| Prop           | Type        | Notes                               |
| -------------- | ----------- | ----------------------------------- |
| `children`     | `ReactNode` | Protected content                   |
| `requireAdmin` | `boolean?`  | Redirect non-admins to `/dashboard` |

## Layout

### `DashboardLayout`

Wraps authenticated pages with navbar + sidebar navigation.

### `DashboardSidebar`

| Prop              | Type         | Notes                       |
| ----------------- | ------------ | --------------------------- |
| `navItems`        | `INavItem[]` | `{ label, icon, to }`       |
| `showTokenWidget` | `boolean?`   | Client token balance widget |

### `LanguageSwitcher`

No props. Reads `useLanguage` / `useUpdateLanguage` and auth store.

## Activity

### `ActivityStatsCards`

| Prop        | Type              | Notes              |
| ----------- | ----------------- | ------------------ |
| `stats`     | `IActivityStats?` | Stats payload      |
| `isLoading` | `boolean?`        | Skeleton when true |

### `ActivityTimeline`

| Prop        | Type               | Notes             |
| ----------- | ------------------ | ----------------- |
| `entries`   | `IActivityEntry[]` | Timeline items    |
| `isLoading` | `boolean?`         | Skeleton rows     |
| `isError`   | `boolean?`         | Error empty state |

## Settings

### `ProfileSettingsCard`

Profile form (display name + read-only email) with Zod + React Hook Form.

## UI

### `Skeleton`

ShadCN-style pulse placeholder (`data-slot="skeleton"`).
