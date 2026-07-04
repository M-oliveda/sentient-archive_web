# 🧠 SentientArchive Web - AI-Powered Knowledge Interface

> **A modern, responsive frontend for the SentientArchive Personal Knowledge Base, built
> with React 19, TypeScript, and cutting-edge web technologies.**

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [License](#license)

---

## Overview

**SentientArchive Web** is the frontend application for the SentientArchive ecosystem.
It provides an intuitive, responsive interface for managing personal knowledge,
leveraging AI-powered features, and administering the system.

This project is built with **React 19**, **Vite**, and **TypeScript**, designed to be
deployed as a containerized application on **Google Cloud Run**.

### Repository Information

- **Frontend:** React 19 SPA + TanStack Router + Zustand
- **Backend:** Firebase Cloud Functions (connected via HTTP/REST)
- **Infrastructure:** Docker containers on Cloud Run

### Related Repository

This frontend works in conjunction with the backend API:

- **Backend Repository:**
  [`m-oliveda/sentient-archive_functions`](https://github.com/m-oliveda/sentient-archive_functions)

---

## Key Features

### 1. Authentication & Security

- **Email/Password Authentication:** Secure user registration and login
- **Google OAuth:** Single sign-on with Google accounts
- **Password Reset:** Complete forgot password flow with email verification
- **Protected Routes:** Role-based access control (RBAC) for admin features

### 2. Rich Note Management

- **Markdown Editor:** Full-featured editor with live preview
- **File Content Extraction:** Upload PDF/TXT/MD files to extract text into notes
- **Folder Organization:** Hierarchical folder tree navigation
- **Smart Search:** Real-time search with filtering and sorting
- **Tag Management:** Visual tag interface with auto-suggestions

### 3. AI-Powered Tools

| Feature           | Description                                      |
| ----------------- | ------------------------------------------------ |
| **Auto-Tagging**  | Automatically generate relevant tags for notes   |
| **Summarization** | Generate concise summaries of long notes         |
| **Flashcards**    | Create study flashcards from note content        |
| **Knowledge Q&A** | Chat interface to ask questions about your notes |

### 4. Token Economy

- **Balance Widget:** Real-time token balance display
- **Transaction History:** Track token usage and costs
- **Usage Visualization:** Charts showing spending patterns

### 5. Admin Dashboard (RBAC Protected)

- **User Management:** Manage users, roles, and account status
- **Analytics:** Usage charts and cost tracking
- **Activity Logs:** Monitor system activity
- **System Configuration:** Manage AI models and feature flags

---

## Architecture

The application is designed as a Single Page Application (SPA) served via Nginx in a
Docker container.

```text
┌─────────────────────────────────────────────────────────────┐
│                   GOOGLE CLOUD RUN                          │
│              (Frontend Container - Managed)                 │
│                                                             │
│   - React 19 SPA                                            │
│   - TanStack Router                                         │
│   - Zustand + TanStack Query                                │
│   - ShadCN + Tailwind                                       │
│   - Docker Container (Nginx)                                │
└───────────┬──────────────────────┬──────────────────────────┘
            │                      │
            │ Firebase SDK         │ HTTP/REST
            │ (Auth, Firestore)    │
            ▼                      ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│  FIREBASE SERVICES     │   │ FIREBASE CLOUD FUNCTIONS     │
│  (Auth, Firestore)     │   │ (Backend API)                │
└────────────────────────┘   └──────────────────────────────┘
```

---

## Technology Stack

### Core Technologies

| Category       | Technology | Version  | Purpose                 |
| -------------- | ---------- | -------- | ----------------------- |
| **Framework**  | React      | 19.x     | UI library              |
| **Build Tool** | Vite       | 6.x      | Fast HMR and builds     |
| **Language**   | TypeScript | 5.7.x    | Type safety             |
| **Runtime**    | Node.js    | 24 (LTS) | Development environment |

### Routing & State

| Category         | Technology      | Version | Purpose                      |
| ---------------- | --------------- | ------- | ---------------------------- |
| **Routing**      | TanStack Router | 1.x     | Type-safe routing            |
| **Global State** | Zustand         | 5.x     | Lightweight state management |
| **Server State** | TanStack Query  | 5.x     | Data fetching & caching      |
| **URL State**    | Nuqs            | 2.x     | URL state management         |

### UI & Styling

| Category       | Technology   | Version | Purpose             |
| -------------- | ------------ | ------- | ------------------- |
| **Styling**    | TailwindCSS  | 4.x     | Utility-first CSS   |
| **Components** | ShadCN       | Latest  | Radix UI + Tailwind |
| **Icons**      | Lucide React | Latest  | Icon library        |
| **Charts**     | Recharts     | 2.x     | Data visualization  |

---

## Getting Started

### Prerequisites

- **Node.js 24 (LTS)**
- **Docker 27.x** & **Docker Compose 2.x**
- **Git**

### Local Setup (Docker - Recommended)

**1. Clone the repository:**

```bash
git clone https://github.com/m-oliveda/sentient-archive_web.git
cd sentient-archive_web
```

**2. Configure environment:**

```bash
cp .env.example .env
# Edit .env with your Firebase config
```

**3. Start development environment:**

```bash
# Build and start all services
docker compose up --build

# Access at http://localhost:5173
```

### Local Setup (Native)

If you prefer running without Docker:

```bash
npm install
npm run dev
```

⚠️ **Note:** For full functionality, the backend API must be running locally or
accessible remotely.

---

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server
docker compose up        # Start Docker dev environment

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking
```

### Git Hooks (Husky)

This project uses Husky to enforce quality standards:

- **Commit Message:** Validated against Gitmoji format (e.g., `:sparkles: Add feature`)
- **Pre-commit:** Runs Linting and Formatting checks automatically

---

## Testing

We aim for **100% test coverage** on critical components.

### Tools

- **Jest:** Unit test runner
- **React Testing Library:** Component testing
- **MSW:** API mocking

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Deployment

The application is deployed to **Google Cloud Run** using GitHub Actions with **Workload
Identity Federation** for keyless authentication.

### GCP Infrastructure

Each environment has a dedicated GCP project with its own service account:

| Environment     | GCP Project ID                 | Service Account          |
| --------------- | ------------------------------ | ------------------------ |
| **Development** | `moliveda-gcloudprojects-dev`  | `cicd-deployer-dev@...`  |
| **Staging**     | `moliveda-gcloudprojects-stg`  | `cicd-deployer-stg@...`  |
| **Preview**     | `moliveda-gcloudprojects-prev` | `cicd-deployer-prev@...` |
| **Production**  | `moliveda-gcloudprojects-prod` | `cicd-deployer-prod@...` |

### Deployment Strategy

| Environment     | Branch      | Access    | App Authentication |
| --------------- | ----------- | --------- | ------------------ |
| **Development** | `develop`   | Protected | HTTP Basic Auth    |
| **Staging**     | `release/*` | Protected | HTTP Basic Auth    |
| **Preview**     | PRs         | Protected | HTTP Basic Auth    |
| **Production**  | `main`      | Public    | None               |

### CI/CD Pipelines

- **CI:** Runs tests, linting, and type-checking on every PR.
- **Deploy Dev/Staging:** Automatically builds and deploys to Cloud Run.
- **Preview:** Deploys ephemeral environments for Pull Requests.
- **Production:** Manual trigger from `main` branch.

**Note:** All deployments use **Workload Identity Federation** (OIDC) for secure,
keyless authentication to GCP. Secrets are organized using **GitHub Environments**
(`development`, `staging`, `preview`, `production`) for professional secret management.

---

## Project Structure

```text
src/
├── components/          # React components
│   ├── ui/              # ShadCN primitives
│   ├── layout/          # Layout components
│   ├── notes/           # Note management
│   ├── ai/              # AI features
│   └── admin/           # Admin dashboard
├── hooks/               # Custom hooks (useAuth, useAI, etc.)
├── lib/                 # Utilities and API clients
├── pages/               # Route components
├── routes/              # TanStack Router definitions
├── stores/              # Zustand state stores
├── types/               # TypeScript definitions
└── locales/             # i18n translation files
```

---

## License

SentientArchive Web is licensed under the **GNU General Public License v2.0 (GPL-2.0)**.

See [LICENSE](./LICENSE) for details.

---

## Additional Resources

- **[MASTERPLAN.md](./MASTERPLAN.md)** - Complete frontend architecture guide
- **[Backend Repository](https://github.com/m-oliveda/sentient-archive_functions)**
