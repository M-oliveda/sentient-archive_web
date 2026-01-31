# 🧠 SentientArchive MASTERPLAN

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Architecture](#3-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Component Structure](#5-component-structure)
6. [API Client Integration](#6-api-client-integration)
7. [State Management](#7-state-management)
8. [Security & Authentication](#8-security--authentication)
9. [Development Environment](#9-development-environment)
10. [Testing Strategy](#10-testing-strategy)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Development Phases](#12-development-phases)

## 1. Executive Summary

**SentientArchive Web** is the frontend application for the Personal Knowledge Base
(PKB) system, built with React 19, TypeScript, and modern web technologies.

### Key Features

- **Modern React Architecture:** React 19 + Vite + TypeScript
- **Type-Safe Routing:** TanStack Router with code-splitting
- **Efficient State Management:** Zustand + TanStack Query
- **Beautiful UI:** ShadCN components + TailwindCSS 4
- **Real-time Sync:** Firebase SDK integration
- **Responsive Design:** Mobile-first approach

### Repository Information

```text
m-oliveda/sentient-archive_web
├── React 19 + Vite + TypeScript
├── Firebase SDK (Auth + Firestore)
├── ShadCN UI + TailwindCSS
└── TanStack Router + Query + Table
```

### Business Value

- **For Users:** Fast, intuitive interface for knowledge management
- **For Developers:** Modern tech stack with excellent DX
- **For Portfolio:** Demonstrates frontend expertise and best practices

## 2. Project Overview

### 2.1 Vision

Create a responsive, performant, and accessible web application that provides an
exceptional user experience for managing personal knowledge and leveraging AI-powered
features.

### 2.2 Target Users

**Primary Users (Clients):**

- Researchers managing academic papers
- Students organizing course materials
- Content creators aggregating research
- Knowledge workers building personal knowledge bases

**Secondary Users (Admins):**

- System administrators managing users and quotas
- Operations teams monitoring system health

### 2.3 Core User Interfaces

#### For Clients

1. **Dashboard Home**
   - Welcome card with recent activity
   - Token balance display
   - Recent notes quick access
   - Quick action buttons

2. **Notes Management**
   - Markdown editor with live preview
   - File content extractor (PDF/TXT/MD) - uploads file, extracts text, creates note
   - Hierarchical folder navigation
   - Tag management and search
   - AI toolbar with feature buttons

3. **AI Features Interface**
   - Summarization display
   - Auto-generated tags
   - Flashcard viewer
   - Knowledge Q&A chat interface

4. **Token Management**
   - Real-time balance display
   - Transaction history table
   - Threshold warnings
   - Request tokens modal

#### For Admins

1. **User Management**
   - User table with filtering/sorting
   - Role assignment interface
   - Account status toggle

2. **Analytics Dashboard**
   - Usage charts (Recharts)
   - Cost tracking visualizations
   - Activity logs

3. **System Configuration**
   - Model selection dropdown
   - Prompt editor
   - Feature flags toggles

### 2.4 Non-Goals (Out of Scope)

- ❌ Native mobile apps (web-responsive only)
- ❌ Real-time collaboration (multi-user editing)
- ❌ Offline-first architecture
- ❌ Server-side rendering (SSR)
- ❌ Progressive Web App (PWA) features
- ❌ File/document storage (files are processed for text extraction only)

## 3. Architecture

### 3.1 High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      USER DEVICES                           │
│           (Web Browsers: Chrome, Firefox, Safari)           │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   GOOGLE CLOUD RUN                          │
│              (Frontend Container - Managed)                 │
│         SSL/TLS Termination + Auto-scaling                  │
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
│  ┌──────────────────┐  │   │ (Backend API - See functions │
│  │ AUTHENTICATION   │  │   │  repository MASTERPLAN)      │
│  │ - Google OAuth   │  │   │                              │
│  │ - Email/Pass     │  │   │                              │
│  └──────────────────┘  │   │ - File content extraction    │
│  ┌──────────────────┐  │   │ - PDF/TXT/MD processing      │
│  │ FIRESTORE        │  │   │ - Text-to-note conversion    │
│  │ - NoSQL DB       │  │   │                              │
│  │ - Real-time      │  │   │                              │
│  └──────────────────┘  │   │                              │
└────────────────────────┘   └──────────────────────────────┘
```

### 3.2 Data Flow: AI Feature Request

```text
┌──────┐      ┌─────────┐      ┌───────────┐      ┌─────────┐
│ User │─────▶│Frontend │─────▶│  Cloud    │─────▶│ Gemini  │
│      │ Click│   UI    │ POST │ Functions │ Call │   API   │
└──────┘      └────┬────┘      └─────┬─────┘      └────┬────┘
                   │                  │                 │
                   │                  │◀─AI Response────┘
                   │                  │
                   │◀─Stream Response─┤
                   │   (progressive)  │
                   ▼                  ▼
              ┌─────────┐      ┌──────────┐
              │ Display │      │ Update   │
              │ Summary │      │ Balance  │
              └─────────┘      └──────────┘
```

### 3.3 Data Flow: File Content Extraction

```text
┌──────┐      ┌─────────┐      ┌───────────┐      ┌──────────┐
│ User │─────▶│Frontend │─────▶│  Cloud    │─────▶│ Extract  │
│      │Upload│   UI    │ POST │ Functions │ Call │ Service  │
│      │ File │         │      │           │      │(PDF/TXT) │
└──────┘      └────┬────┘      └─────┬─────┘      └────┬─────┘
                   │                  │                 │
                   │                  │◀─Extracted Text─┘
                   │                  │
                   │                  │ Create Note
                   │                  │ in Firestore
                   │                  ▼
                   │            ┌──────────┐
                   │◀───────────│New Note  │
                   │  Response  │ Created  │
                   │            └──────────┘
                   ▼
              ┌─────────┐
              │ Display │
              │New Note │
              │ Editor  │
              └─────────┘

Note: Files are NOT stored. Only extracted text is saved as note content.
```

### 3.4 Folder Structure

```text
sentient-archive_web/
├── public/
│   ├── favicon.ico
│   ├── icon.svg
│   └── robots.txt
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── ui/                      # ShadCN components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   ├── notes/
│   │   │   ├── NoteCard.tsx
│   │   │   ├── NotesList.tsx
│   │   │   ├── NoteEditor.tsx
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── FileExtractor.tsx
│   │   │   ├── FolderTree.tsx
│   │   │   └── AIToolbar.tsx
│   │   │
│   │   ├── ai/
│   │   │   ├── SummarizeButton.tsx
│   │   │   ├── AutoTagButton.tsx
│   │   │   ├── FlashcardsButton.tsx
│   │   │   ├── AskQuestionButton.tsx
│   │   │   └── FlashcardViewer.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── UserManagementTable.tsx
│   │   │   ├── AnalyticsChart.tsx
│   │   │   ├── ActivityLogs.tsx
│   │   │   └── SystemConfigForm.tsx
│   │   │
│   │   └── tokens/
│   │       ├── TokenBalance.tsx
│   │       ├── TransactionHistory.tsx
│   │       └── RequestTokensModal.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── NotesPage.tsx
│   │   │   └── AdminPage.tsx
│   │   │
│   │   └── 404.tsx
│   │
│   ├── lib/
│   │   ├── firebase.ts              # Firebase initialization
│   │   ├── api-client.ts            # HTTP client for Cloud Functions
│   │   └── utils.ts                 # Utility functions
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useNotes.ts
│   │   ├── useTokens.ts
│   │   └── useAI.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts             # Zustand store
│   │   └── uiStore.ts
│   │
│   ├── types/
│   │   ├── note.ts
│   │   ├── user.ts
│   │   ├── transaction.ts
│   │   └── api.ts
│   │
│   ├── locales/
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── es/
│   │       └── translation.json
│   │
│   ├── routes/
│   │   └── __root.tsx               # TanStack Router root
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── tests/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   └── setup.ts
│
├── .husky/
│   ├── commit-msg                   # Gitmoji validation
│   └── pre-commit                   # Lint and format check
│
├── .dockerignore
├── .env
├── .env.example
├── .eslintrc.cjs
├── .prettierrc.json
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── nginx.conf                       # Public (production)
├── nginx.protected.conf             # Protected (dev/staging/preview)
├── tsconfig.json
├── vite.config.ts
├── package.json
├── README.md
├── LICENSE
├── MASTERPLAN.md
└── AGENTS.md
```

## 4. Technology Stack

### 4.1 Core Technologies

| Category            | Technology | Version | Purpose               |
| ------------------- | ---------- | ------- | --------------------- |
| **Core**            | React      | 19.x    | UI library            |
| **Build Tool**      | Vite       | 6.x     | Fast HMR and builds   |
| **Language**        | TypeScript | 5.7.x   | Type safety           |
| **Package Manager** | npm        | 10.x    | Dependency management |

### 4.2 Routing & State

| Category         | Technology      | Version | Purpose                      |
| ---------------- | --------------- | ------- | ---------------------------- |
| **Routing**      | TanStack Router | 1.x     | Type-safe routing            |
| **Global State** | Zustand         | 5.x     | Lightweight state management |
| **Server State** | TanStack Query  | 5.x     | Data fetching & caching      |
| **URL State**    | Nuqs            | 2.x     | URL state management         |

### 4.3 UI & Styling

| Category          | Technology    | Version | Purpose                        |
| ----------------- | ------------- | ------- | ------------------------------ |
| **Styling**       | TailwindCSS   | 4.x     | Utility-first CSS              |
| **UI Components** | ShadCN        | Latest  | Radix UI + Tailwind components |
| **Animation**     | Framer Motion | 11.x    | Smooth animations              |
| **Icons**         | Lucide React  | Latest  | Icon library                   |
| **Drag & Drop**   | Dnd-kit       | 6.x     | Drag-and-drop functionality    |

### 4.4 Forms & Data

| Category       | Technology      | Version | Purpose                  |
| -------------- | --------------- | ------- | ------------------------ |
| **Forms**      | React Hook Form | 7.x     | Form state management    |
| **Validation** | Zod             | 3.x     | Schema validation        |
| **Tables**     | TanStack Table  | 8.x     | Headless table component |
| **Charts**     | Recharts        | 2.x     | Data visualization       |
| **Date Utils** | date-fns        | 4.x     | Date manipulation        |

### 4.5 Firebase & Backend

| Category        | Technology      | Version | Purpose                      |
| --------------- | --------------- | ------- | ---------------------------- |
| **Firebase**    | Firebase JS SDK | 10.x    | Auth + Firestore client      |
| **HTTP Client** | Fetch API       | Native  | API calls to Cloud Functions |

### 4.6 Developer Experience

| Category            | Technology            | Version | Purpose              |
| ------------------- | --------------------- | ------- | -------------------- |
| **i18n**            | i18next               | 15.x    | Internationalization |
| **Linting**         | ESLint                | 9.x     | Code quality         |
| **Formatting**      | Prettier              | 3.x     | Code formatting      |
| **Testing**         | Jest                  | 29.x    | Unit testing         |
| **Testing Library** | React Testing Library | 16.x    | Component testing    |

## 5. Component Structure

### 5.1 Component Hierarchy

```text
App.tsx
├── Router (TanStack Router)
│   ├── AuthLayout
│   │   ├── LoginPage
│   │   └── SignupPage
│   │
│   ├── DashboardLayout
│   │   ├── Navbar
│   │   │   ├── Logo
│   │   │   ├── TokenBalance
│   │   │   └── UserMenu
│   │   │
│   │   ├── Sidebar
│   │   │   ├── NavigationLinks
│   │   │   └── FolderTree
│   │   │
│   │   └── Outlet
│   │       ├── DashboardHome
│   │       │   ├── WelcomeCard
│   │       │   ├── TokenBalanceCard
│   │       │   ├── RecentNotesCard
│   │       │   └── QuickActionsCard
│   │       │
│   │       ├── NotesPage
│   │       │   ├── NotesList
│   │       │   │   ├── NoteCard[]
│   │       │   │   ├── FilterBar
│   │       │   │   ├── SortDropdown
│   │       │   │   └── FileExtractor
│   │       │   │
│   │       │   └── NoteEditor
│   │       │       ├── EditorToolbar
│   │       │       ├── MarkdownEditor
│   │       │       ├── LivePreview
│   │       │       └── AIToolbar
│   │       │           ├── SummarizeButton
│   │       │           ├── AutoTagButton
│   │       │           ├── FlashcardsButton
│   │       │           └── AskQuestionButton
│   │       │
│   │       └── AdminPage (RBAC Protected)
│   │           ├── Tabs
│   │           │   ├── UserManagementTab
│   │           │   │   ├── UserTable
│   │           │   │   ├── UserFilters
│   │           │   │   └── EditUserModal
│   │           │   │
│   │           │   ├── AnalyticsTab
│   │           │   │   ├── UsageChart
│   │           │   │   ├── CostChart
│   │           │   │   └── StatsCards
│   │           │   │
│   │           │   └── SystemConfigTab
│   │           │       ├── ModelSelector
│   │           │       ├── PromptEditor
│   │           │       └── FeatureFlagsForm
│   │
│   └── 404NotFound
│
└── GlobalProviders
    ├── QueryProvider (TanStack Query)
    ├── I18nProvider (i18next)
    └── ThemeProvider
```

### 5.2 Key Components

#### NoteEditor Component

```typescript
// src/components/notes/NoteEditor.tsx
type NoteEditorProps = {
  noteId?: string;
  initialContent?: string;
  onSave: (content: string) => Promise<void>;
};

export default function NoteEditor({
  noteId,
  initialContent,
  onSave,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent || "");
  const [preview, setPreview] = useState(false);

  return (
    <div className="note-editor">
      <EditorToolbar
        onSave={() => onSave(content)}
        onTogglePreview={() => setPreview(!preview)}
      />

      <div className="editor-content">
        {preview ? (
          <LivePreview content={content} />
        ) : (
          <MarkdownEditor value={content} onChange={setContent} />
        )}
      </div>

      <AIToolbar noteId={noteId} content={content} />
    </div>
  );
}
```

#### AIToolbar Component

```typescript
// src/components/notes/AIToolbar.tsx
type AIToolbarProps = {
  noteId?: string;
  content: string;
};

export default function AIToolbar({ noteId, content }: AIToolbarProps) {
  const { balance } = useTokenBalance();
  const summarizeMutation = useSummarize();

  const handleSummarize = async () => {
    if (balance < 2) {
      toast.error("Insufficient tokens");
      return;
    }

    await summarizeMutation.mutateAsync({ noteId });
  };

  return (
    <div className="ai-toolbar">
      <SummarizeButton
        onClick={handleSummarize}
        cost={2}
        disabled={balance < 2}
      />
      <AutoTagButton cost={1} />
      <FlashcardsButton cost={3} />
      <AskQuestionButton cost={4} />
    </div>
  );
}
```

#### FileExtractor Component

```typescript
// src/components/notes/FileExtractor.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { toast } from "sonner";

type FileExtractorProps = {
  onNoteCreated: (noteId: string) => void;
};

type ExtractResponse = {
  success: boolean;
  data: {
    noteId: string;
    title: string;
    content: string;
  };
};

export default function FileExtractor({ onNoteCreated }: FileExtractorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const extractMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      return apiRequest<ExtractResponse>("/v1/notes/extract", {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type, browser will set it with boundary for FormData
        },
      });
    },
    onSuccess: (response) => {
      toast.success("File content extracted successfully!");
      onNoteCreated(response.data.noteId);
    },
    onError: (error: Error) => {
      toast.error(`Extraction failed: ${error.message}`);
    },
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "text/plain", "text/markdown"];
    const allowedExtensions = [".pdf", ".txt", ".md"];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      toast.error("Only PDF, TXT, and MD files are supported");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    await extractMutation.mutateAsync(file);
    setIsUploading(false);

    // Reset input
    event.target.value = "";
  };

  return (
    <div className="file-extractor">
      <input
        type="file"
        id="file-upload"
        accept=".pdf,.txt,.md"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />
      <label
        htmlFor="file-upload"
        className={`btn btn-secondary ${
          isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {isUploading ? (
          <>
            <Spinner className="mr-2" />
            Extracting...
          </>
        ) : (
          <>
            <Upload className="mr-2" />
            Extract from File (PDF/TXT/MD)
          </>
        )}
      </label>
      <p className="text-sm text-muted-foreground mt-2">
        Upload a file to extract its content as a new note. Files are not
        stored.
      </p>
    </div>
  );
}
```

## 6. API Client Integration

### 6.1 API Client Setup

```typescript
// src/lib/api-client.ts
import { getAuth } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_USE_EMULATOR
  ? "http://localhost:5001/demo-sentient-archive/us-central1"
  : `https://us-central1-${
      import.meta.env.VITE_FIREBASE_PROJECT_ID
    }.cloudfunctions.net`;

async function getAuthToken(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Not authenticated");
  }

  return await user.getIdToken();
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "API request failed");
  }

  return await response.json();
}
```

### 6.2 API Hooks

```typescript
// src/hooks/useAI.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";

export function useSummarize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      maxLength,
    }: {
      noteId: string;
      maxLength?: number;
    }) => {
      return apiRequest("/v1/ai/summarize", {
        method: "POST",
        body: JSON.stringify({ noteId, maxLength }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useAutoTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, maxTags }: { noteId: string; maxTags?: number }) => {
      return apiRequest("/v1/ai/autoTag", {
        method: "POST",
        body: JSON.stringify({ noteId, maxTags }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

// ... similar hooks for flashcards and ragQuery
```

### 6.3 File Extraction Hook

```typescript
// src/hooks/useFileExtraction.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";

type ExtractFileResponse = {
  success: boolean;
  data: {
    noteId: string;
    title: string;
    content: string;
    extractedText: string;
  };
};

export function useExtractFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      return apiRequest<ExtractFileResponse>("/v1/notes/extract", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
```

**Note:** The file extraction endpoint processes the uploaded file (PDF/TXT/MD),
extracts its text content, and creates a new note in Firestore. The original file is
_NOT stored_ - only the extracted text is saved as note content.

## 7. State Management

### 7.1 Zustand Stores

```typescript
// src/stores/authStore.ts
import { create } from "zustand";
import { User } from "@/types/user";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}));
```

```typescript
// src/stores/uiStore.ts
import { create } from "zustand";

type UIState = {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  language: "en" | "es";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (language: "en" | "es") => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "light",
  language: "en",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
}));
```

### 7.2 TanStack Query Configuration

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## 8. Security & Authentication

### 8.1 Firebase Authentication Setup

```typescript
// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Connect to emulators in development (enabled by default for local development)
if (import.meta.env.VITE_USE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8081);
  connectStorageEmulator(storage, "localhost", 9199);
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export { app, auth, db, storage, functions };
```

### 8.2 Protected Routes

```typescript
// src/components/ProtectedRoute.tsx
import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "@tanstack/react-router";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}
```

### 8.3 Auth Context Hook

```typescript
// src/hooks/useAuth.ts
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: userData?.role || "client",
          isActive: userData?.isActive ?? true,
          tokenBalance: userData?.tokenBalance || 0,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);
}
```

## 9. Development Environment

### 9.1 Prerequisites

- Node.js 24 (LTS)
- npm 10.x
- Git
- Docker 27.x
- Docker Compose 2.x
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud SDK (`gcloud` CLI)

### 9.2 Local Setup

**1. Clone repository:**

```bash
git clone https://github.com/m-oliveda/sentient-archive_web.git
cd sentient-archive_web
```

**2. Configure environment:**

```bash
cp .env.example .env
# Edit .env with your Firebase config
```

**3. Start development environment with Docker:**

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up -d

# View logs
docker compose logs -f app
```

**4. Install dependencies (if developing without Docker):**

```bash
npm install
```

**Access:**

- Frontend: `http://localhost:5173` (Docker) or `http://localhost:5173` (native)
- Container uses Vite dev server with HMR support

### 9.3 Available Scripts

```bash
# Development (Docker)
docker compose up              # Start dev environment
docker compose down            # Stop dev environment
docker compose logs -f app     # View logs
docker compose exec app sh     # Access container shell

# Development (Native - without Docker)
npm run dev                    # Start Vite dev server

# Build
npm run build                  # Production build
npm run preview                # Preview production build

# Testing
npm run test                   # Run tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report

# Linting & Formatting
npm run lint                   # Run ESLint
npm run lint:fix               # Fix linting issues
npm run format                 # Format with Prettier
npm run format:check           # Check formatting

# Type Checking
npm run type-check             # TypeScript type checking

# Docker
docker build -t sentient-archive-web .              # Build image
docker run -p 8080:8080 sentient-archive-web        # Run production container
```

### 9.4 Vite Configuration for Docker

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // Important for Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Important for Docker on some systems
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
        },
      },
    },
  },
});
```

### 9.5 Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/tests/__mocks__/fileMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
  },
};
```

### 9.6 Husky Configuration (Git Hooks)

#### Installation

```bash
npm install --save-dev husky
npx husky init
```

#### Commit Message Hook (.husky/commit-msg)

```bash
#!/usr/bin/env sh

# Validate commit message format (Gitmoji)
# Expected format: :<shortcode>: <Message starting with capital letter>
# No period at the end
commit_msg=$(cat "$1")
first_line=$(echo "$commit_msg" | head -n 1)

# Check 1: Message must start with a gitmoji shortcode (e.g., :sparkles:, :memo:, :bug:)
# Pattern: :word_with_underscores: followed by space and message
if ! echo "$first_line" | grep -qE '^:[a-z][a-z0-9_]*: '; then
  echo "❌ Error: Commit message must start with a gitmoji shortcode"
  echo ""
  echo "Format: :<shortcode>: <Message>"
  echo "Example: :sparkles: Add carousel component"
  echo "Example: :memo: Update README and MASTERPLAN doc files"
  echo "Example: :bug: Fix navigation routing issue"
  echo ""
  echo "See https://gitmoji.dev/ for emoji reference"
  exit 1
fi

# Extract the message part (after shortcode and space)
# Remove emoji shortcode (e.g., :memo:) from the beginning
message=$(echo "$first_line" | sed -E 's/^:[a-z][a-z0-9_]*: //')

# Check 2: First letter after shortcode must be capitalized
if ! echo "$message" | grep -qE '^[A-Z]'; then
  echo "❌ Error: First letter after shortcode must be capitalized"
  echo ""
  echo "Current: $first_line"
  echo "Format: :<shortcode>: <Capitalized message>"
  echo "Example: :sparkles: Add carousel component"
  echo "Example: :memo: Update README and MASTERPLAN doc files"
  exit 1
fi

# Check 3: Message should not end with a period
if echo "$message" | grep -qE '\.$'; then
  echo "❌ Error: Commit message should not end with a period"
  echo ""
  echo "Current: $first_line"
  echo "Format: :<shortcode>: <Message without period>"
  echo "Example: :sparkles: Add carousel component"
  echo "Example: :memo: Update README and MASTERPLAN doc files"
  exit 1
fi

# Check message length (first line should be <= 72 characters, recommend 50)
if [ ${#first_line} -gt 72 ]; then
  echo "⚠️  Warning: First line is longer than 72 characters (${#first_line} chars)"
  echo "Consider keeping it under 50 characters for better readability"
fi

echo "✅ Commit message format is valid"
```

#### Pre-commit Hook (.husky/pre-commit)

```bash
#!/usr/bin/env sh

echo "🔍 Running pre-commit checks..."

# Run linting
echo "📋 Checking code quality with ESLint..."
npm run lint

if [ $? -ne 0 ]; then
  echo "❌ Linting failed. Please fix the errors before committing."
  exit 1
fi

# Run format check
echo "🎨 Checking code formatting with Prettier..."
npm run format:check

if [ $? -ne 0 ]; then
  echo "❌ Code formatting check failed."
  echo "💡 Run 'npm run format' to fix formatting issues."
  exit 1
fi

echo "✅ All pre-commit checks passed!"
```

#### Gitmoji Examples

**Common Gitmojis:**

| Shortcode            | Emoji | Use Case          |
| -------------------- | ----- | ----------------- |
| `:sparkles:`         | ✨    | New feature       |
| `:bug:`              | 🐛    | Bug fix           |
| `:memo:`             | 📝    | Documentation     |
| `:lipstick:`         | 💄    | UI/styling        |
| `:rocket:`           | 🚀    | Deployment        |
| `:white_check_mark:` | ✅    | Tests             |
| `:recycle:`          | ♻️    | Refactor          |
| `:wrench:`           | 🔧    | Configuration     |
| `:construction:`     | 🚧    | Work in progress  |
| `:fire:`             | 🔥    | Remove code/files |
| `:art:`              | 🎨    | Code structure    |
| `:zap:`              | ⚡    | Performance       |
| `:lock:`             | 🔒    | Security          |

**Valid Commit Examples:**

```bash
:sparkles: Add user authentication flow
:bug: Fix token refresh infinite loop
:memo: Update API documentation
:lipstick: Improve dashboard responsiveness
:recycle: Refactor note editor component
:white_check_mark: Add tests for AI hooks
:wrench: Configure Docker compose for dev
```

**Invalid Commits:**

```bash
❌ "Add feature"                    # Missing gitmoji
❌ ":sparkles: add feature"         # Not capitalized
❌ ":sparkles: Add feature."        # Period at end
❌ "sparkles: Add feature"          # Missing colons
```

## 10. Testing Strategy

### 10.1 Test Coverage Requirements

**Minimum 100% coverage** for critical components.

### 10.2 Testing Tools

- **Jest:** Unit test runner with React support
- **React Testing Library:** Component testing
- **MSW (Mock Service Worker):** API mocking
- **@firebase/rules-unit-testing:** Firebase mocking

### 10.3 Test Structure

```text
tests/
├── components/
│   ├── notes/
│   │   ├── NoteCard.test.tsx
│   │   ├── NoteEditor.test.tsx
│   │   └── AIToolbar.test.tsx
│   │
│   └── admin/
│       └── UserManagementTable.test.tsx
│
├── hooks/
│   ├── useAuth.test.ts
│   ├── useNotes.test.ts
│   └── useAI.test.ts
│
├── pages/
│   ├── DashboardHome.test.tsx
│   └── NotesPage.test.tsx
│
├── lib/
│   └── api-client.test.ts
│
└── setup.ts
```

### 10.4 Example Tests

```typescript
// tests/components/notes/NoteCard.test.tsx
import { render, screen } from "@testing-library/react";
import { NoteCard } from "@/components/notes/NoteCard";

describe("NoteCard", () => {
  const mockNote = {
    id: "1",
    title: "Test Note",
    excerpt: "This is a test excerpt",
    tags: ["test", "example"],
    updatedAt: new Date(),
  };

  test("renders note title and excerpt", () => {
    render(<NoteCard note={mockNote} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("This is a test excerpt")).toBeInTheDocument();
  });

  test("renders tags", () => {
    render(<NoteCard note={mockNote} />);

    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("example")).toBeInTheDocument();
  });
});
```

```typescript
// tests/hooks/useAI.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSummarize } from "@/hooks/useAI";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const server = setupServer(
  http.post("/v1/ai/summarize", () => {
    return HttpResponse.json({
      success: true,
      data: {
        summary: "Test summary",
        tokensUsed: 100,
        balanceAfter: 18,
      },
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useSummarize", () => {
  test("successfully summarizes note", async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useSummarize(), { wrapper });

    result.current.mutate({ noteId: "123" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.data.summary).toBe("Test summary");
  });
});
```

## 11. CI/CD Pipeline

### 11.1 GitHub Actions Workflows

```text
.github/workflows/
├── ci.yml                    # Run on all PRs
├── deploy-dev.yml            # Auto-deploy on develop
├── deploy-stg.yml        # Auto-deploy on release/*
├── deploy-prod.yml           # Manual deploy on main
├── deploy-preview.yml        # Deploy PR preview environments
└── cleanup-preview.yml       # Cleanup PR preview on close
```

### 11.2 Environment Authentication Strategy

**GCP Projects per Environment:**

| Environment | GCP Project ID                 | Project Number  | Service Account                                                           |
| ----------- | ------------------------------ | --------------- | ------------------------------------------------------------------------- |
| Development | `moliveda-gcloudprojects-dev`  | `142167472193`  | `cicd-deployer-dev@moliveda-gcloudprojects-dev.iam.gserviceaccount.com`   |
| Staging     | `moliveda-gcloudprojects-stg`  | `454460555724`  | `cicd-deployer-stg@moliveda-gcloudprojects-stg.iam.gserviceaccount.com`   |
| Production  | `moliveda-gcloudprojects-prod` | `1034574533717` | `cicd-deployer-prod@moliveda-gcloudprojects-prod.iam.gserviceaccount.com` |
| Preview     | `moliveda-gcloudprojects-prev` | `1026007305208` | `cicd-deployer-prev@moliveda-gcloudprojects-prev.iam.gserviceaccount.com` |

**Authentication Method:** Workload Identity Federation (keyless authentication via
OIDC)

Each project has a Workload Identity Pool (`github-pool`) with a GitHub OIDC provider
(`github-provider`) that allows GitHub Actions to authenticate without service account
keys.

**Protected Environments** (HTTP Basic Auth):

- **Development** (`develop` branch) - Password protected
- **Staging** (`release/**` branches) - Password protected
- **Preview** (Pull Requests) - Password protected

**Public Environment**:

- **Production** (`main` branch) - Publicly accessible (no password)

### 11.3 CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [develop, main, "release/**"]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Test (with coverage)
        run: npm run test:coverage

      - name: Check coverage is 100%
        run: |
          if npx --yes nyc@latest report --reporter=text-summary | grep -q '100%'; then
            echo "100% coverage detected!"
          else
            echo "::error::Test coverage is not 100%. Please increase test coverage to 100%."
            npx nyc report --reporter=text-summary
            exit 1
          fi

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

### 11.4 Deployment Workflow (Production)

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy to Production

on:
  workflow_dispatch:
    branches: [main]

env:
  SERVICE_NAME: sentient-archive-web
  REGION: us-central1
  DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
  IMAGE_NAME: sentient-archive-web

permissions:
  contents: read
  id-token: write # Required for Workload Identity Federation

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    environment:
      name: production
      url: ${{ steps.deploy-url.outputs.url }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Build application
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_MESSAGING_SENDER_ID:
            ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_USE_EMULATOR: false

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push Docker image (Public - No Auth)
        uses: docker/build-push-action@v5
        with:
          context: .
          target: production
          push: true
          tags: |
            ${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:latest
            ${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from:
            type=registry,ref=${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME
            }}:buildcache
          cache-to:
            type=registry,ref=${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME
            }}:buildcache,mode=max

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=docker.io/${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --project=${{ secrets.GCP_PROJECT_ID }} \
            --allow-unauthenticated \
            --memory=512Mi \
            --cpu=1 \
            --min-instances=0 \
            --max-instances=10 \
            --port=80 \
            --timeout=60

      - name: Get Cloud Run URL
        id: deploy-url
        run: |
          URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region=${{ env.REGION }} \
            --project=${{ secrets.GCP_PROJECT_ID }} \
            --format='value(status.url)')
          echo "url=$URL" >> $GITHUB_OUTPUT

      - name: Deployment Summary
        run: |
          echo "### 🚀 Production Deployment Successful!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Service URL:** ${{ steps.deploy-url.outputs.url }}" >> $GITHUB_STEP_SUMMARY
          echo "**Image:** docker.io/${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "**Project:** ${{ secrets.GCP_PROJECT_ID }}" >> $GITHUB_STEP_SUMMARY
          echo "**Region:** ${{ env.REGION }}" >> $GITHUB_STEP_SUMMARY
          echo "**Access:** Public (No authentication)" >> $GITHUB_STEP_SUMMARY
```

### 11.5 Deployment Workflow (Development)

```yaml
# .github/workflows/deploy-dev.yml
name: Deploy to Development

on:
  push:
    branches: [develop]

env:
  SERVICE_NAME: sentient-archive-web-dev
  REGION: us-central1
  DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
  IMAGE_NAME: sentient-archive-web

permissions:
  contents: read
  id-token: write # Required for Workload Identity Federation

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    environment:
      name: development
      url: ${{ steps.deploy-url.outputs.url }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_MESSAGING_SENDER_ID:
            ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_USE_EMULATOR: false

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push Docker image (Protected with Auth)
        uses: docker/build-push-action@v5
        with:
          context: .
          target: protected
          build-args: |
            AUTH_USERNAME=${{ secrets.AUTH_USERNAME }}
            AUTH_PASSWORD=${{ secrets.AUTH_PASSWORD }}
          push: true
          tags: |
            ${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:dev
            ${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:dev-${{ github.sha }}
          cache-from:
            type=registry,ref=${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME
            }}:buildcache
          cache-to:
            type=registry,ref=${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME
            }}:buildcache,mode=max

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=docker.io/${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:dev-${{ github.sha }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --project=${{ secrets.GCP_PROJECT_ID }} \
            --allow-unauthenticated \
            --memory=512Mi \
            --cpu=1 \
            --min-instances=0 \
            --max-instances=5 \
            --port=80 \
            --timeout=60

      - name: Get Cloud Run URL
        id: deploy-url
        run: |
          URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region=${{ env.REGION }} \
            --project=${{ secrets.GCP_PROJECT_ID }} \
            --format='value(status.url)')
          echo "url=$URL" >> $GITHUB_OUTPUT

      - name: Deployment Summary
        run: |
          echo "### 🚀 Development Deployment Successful!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Service URL:** ${{ steps.deploy-url.outputs.url }}" >> $GITHUB_STEP_SUMMARY
          echo "**Image:** docker.io/${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:dev-${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "**Project:** ${{ secrets.GCP_PROJECT_ID }}" >> $GITHUB_STEP_SUMMARY
          echo "**Region:** ${{ env.REGION }}" >> $GITHUB_STEP_SUMMARY
          echo "**Access:** Protected (HTTP Basic Auth)" >> $GITHUB_STEP_SUMMARY
          echo "**Username:** \`${{ secrets.AUTH_USERNAME }}\`" >> $GITHUB_STEP_SUMMARY
          echo "**Password:** \`${{ secrets.AUTH_PASSWORD }}\`" >> $GITHUB_STEP_SUMMARY
```

### 11.6 Deployment Workflow (Staging)

```yaml
# .github/workflows/deploy-stg.yml
name: Deploy to Staging

on:
  push:
    branches: ["release/**"]

env:
  SERVICE_NAME: sentient-archive-web-staging
  REGION: us-central1
  DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
  IMAGE_NAME: sentient-archive-web

permissions:
  contents: read
  id-token: write # Required for Workload Identity Federation

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    environment:
      name: staging
      url: ${{ steps.deploy-url.outputs.url }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Build application
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_MESSAGING_SENDER_ID:
            ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_USE_EMULATOR: false

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push Docker image (Protected with Auth)
        uses: docker/build-push-action@v5
        with:
          context: .
          target: protected
          build-args: |
            AUTH_USERNAME=${{ secrets.AUTH_USERNAME }}
            AUTH_PASSWORD=${{ secrets.AUTH_PASSWORD }}
          push: true
          tags: |
            ${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:staging
            ${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:staging-${{ github.sha }}
          cache-from:
            type=registry,ref=${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME
            }}:buildcache
          cache-to:
            type=registry,ref=${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME
            }}:buildcache,mode=max

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image=docker.io/${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:staging-${{ github.sha }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --project=${{ secrets.GCP_PROJECT_ID }} \
            --allow-unauthenticated \
            --memory=512Mi \
            --cpu=1 \
            --min-instances=0 \
            --max-instances=8 \
            --port=80 \
            --timeout=60

      - name: Get Cloud Run URL
        id: deploy-url
        run: |
          URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region=${{ env.REGION }} \
            --project=${{ secrets.GCP_PROJECT_ID }} \
            --format='value(status.url)')
          echo "url=$URL" >> $GITHUB_OUTPUT

      - name: Deployment Summary
        run: |
          echo "### 🚀 Staging Deployment Successful!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Service URL:** ${{ steps.deploy-url.outputs.url }}" >> $GITHUB_STEP_SUMMARY
          echo "**Image:** docker.io/${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:staging-${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "**Project:** ${{ secrets.GCP_PROJECT_ID }}" >> $GITHUB_STEP_SUMMARY
          echo "**Region:** ${{ env.REGION }}" >> $GITHUB_STEP_SUMMARY
          echo "**Access:** Protected (HTTP Basic Auth)" >> $GITHUB_STEP_SUMMARY
          echo "**Username:** \`${{ secrets.AUTH_USERNAME }}\`" >> $GITHUB_STEP_SUMMARY
          echo "**Password:** \`${{ secrets.AUTH_PASSWORD }}\`" >> $GITHUB_STEP_SUMMARY
```

### 11.7 Deployment Workflow (Preview - PR Environments)

```yaml
# .github/workflows/deploy-preview.yml
name: Deploy to Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [develop, main]

env:
  REGION: us-central1
  DOCKERHUB_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
  IMAGE_NAME: sentient-archive-web

permissions:
  contents: read
  id-token: write # Required for Workload Identity Federation
  pull-requests: write

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment:
      name: preview
      url: ${{ steps.preview-url.outputs.url }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Generate preview service name
        id: preview-name
        run: |
          PR_NUMBER=${{ github.event.pull_request.number }}
          SERVICE_NAME="sentient-archive-pr-${PR_NUMBER}"
          echo "service_name=${SERVICE_NAME}" >> $GITHUB_OUTPUT
          echo "Preview service: ${SERVICE_NAME}"

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build Docker image
        run: |
          docker build --target protected \
            --build-arg AUTH_USERNAME=${{ secrets.AUTH_USERNAME }} \
            --build-arg AUTH_PASSWORD=${{ secrets.AUTH_PASSWORD }} \
            -t ${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:pr-${{ github.event.pull_request.number }} \
            .

      - name: Push Docker image to Docker Hub
        run: |
          docker push ${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:pr-${{ github.event.pull_request.number }}

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to Cloud Run (Preview)
        run: |
          gcloud run deploy ${{ steps.preview-name.outputs.service_name }} \
            --image=docker.io/${{ env.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:pr-${{ github.event.pull_request.number }} \
            --platform=managed \
            --region=${{ env.REGION }} \
            --project=${{ secrets.GCP_PROJECT_ID }} \
            --allow-unauthenticated \
            --memory=256Mi \
            --cpu=1 \
            --min-instances=0 \
            --max-instances=1 \
            --port=80 \
            --timeout=60 \
            --concurrency=80 \
            --cpu-throttling \
            --tag=pr-${{ github.event.pull_request.number }}

      - name: Get Preview URL
        id: preview-url
        run: |
          SERVICE_URL=$(gcloud run services describe ${{ steps.preview-name.outputs.service_name }} \
            --region=${{ env.REGION }} \
            --project=${{ secrets.GCP_PROJECT_ID }} \
            --format='value(status.url)')
          echo "url=${SERVICE_URL}" >> $GITHUB_OUTPUT
          echo "Preview URL: ${SERVICE_URL}"

      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            const prNumber = context.payload.pull_request.number;
            const previewUrl = '${{ steps.preview-url.outputs.url }}';
            const serviceName = '${{ steps.preview-name.outputs.service_name }}';

            const comment = `## 🚀 Preview Deployment Ready!

            ### 🔗 [**View Preview Deployment →**](${previewUrl})

            <table>
              <tr>
                <td><strong>Environment</strong></td>
                <td>Preview (Ephemeral)</td>
              </tr>
              <tr>
                <td><strong>Service</strong></td>
                <td><code>${serviceName}</code></td>
              </tr>
              <tr>
                <td><strong>URL</strong></td>
                <td><a href="${previewUrl}">${previewUrl}</a></td>
              </tr>
              <tr>
                <td><strong>Commit</strong></td>
                <td><code>${context.sha.substring(0, 7)}</code></td>
              </tr>
              <tr>
                <td><strong>🔒 Username</strong></td>
                <td><code>${{ secrets.AUTH_USERNAME }}</code></td>
              </tr>
              <tr>
                <td><strong>🔒 Password</strong></td>
                <td><code>${{ secrets.AUTH_PASSWORD }}</code></td>
              </tr>
            </table>

            ---

            **📋 Environment Details:**
            - **Purpose:** Test individual PRs in isolated environments
            - **Data Type:** Synthetic / Fake data
            - **Security Level:** Medium (HTTP Basic Auth)
            - **Who Uses It:** Devs, QA, Product

            > 💡 **Note:** This preview environment will be automatically cleaned up when the PR is closed or merged.
            `;

            github.rest.issues.createComment({
              issue_number: prNumber,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### 11.8 Cleanup Workflow (Preview Environments)

```yaml
# .github/workflows/cleanup-preview.yml
name: Cleanup Preview Environment

on:
  pull_request:
    types: [closed]
    branches: [develop, main]

env:
  REGION: us-central1

permissions:
  contents: read
  id-token: write # Required for Workload Identity Federation
  pull-requests: write

jobs:
  cleanup:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    environment: preview

    steps:
      - name: Generate preview service name
        id: preview-name
        run: |
          PR_NUMBER=${{ github.event.pull_request.number }}
          SERVICE_NAME="sentient-archive-pr-${PR_NUMBER}"
          echo "service_name=${SERVICE_NAME}" >> $GITHUB_OUTPUT

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Delete Cloud Run service
        continue-on-error: true
        run: |
          gcloud run services delete ${{ steps.preview-name.outputs.service_name }} \
            --region=${{ env.REGION }} \
            --project=${{ secrets.GCP_PROJECT_ID }} \
            --quiet || echo "Service not found or already deleted"

      - name: Comment PR with cleanup status
        uses: actions/github-script@v7
        with:
          script: |
            const prNumber = context.payload.pull_request.number;
            const serviceName = '${{ steps.preview-name.outputs.service_name }}';

            const comment = `## 🧹 Preview Environment Cleaned Up

            **Service:** \`${serviceName}\`
            **Status:** Deleted

            The ephemeral preview environment has been removed.
            `;

            github.rest.issues.createComment({
              issue_number: prNumber,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### 11.9 Dockerfile (Multi-Stage Build with Auth Support)

```dockerfile
# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production (Public - No Authentication)
FROM nginx:alpine AS production

# Copy public nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Protected (With HTTP Basic Authentication)
FROM nginx:alpine AS protected

# Install Apache utils for htpasswd
RUN apk add --no-cache apache2-utils

# Accept username and password as build arguments
ARG AUTH_USERNAME
ARG AUTH_PASSWORD

# Copy protected nginx config
COPY nginx.protected.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Generate htpasswd file with provided credentials
RUN htpasswd -cb /etc/nginx/.htpasswd ${AUTH_USERNAME} ${AUTH_PASSWORD}

# Expose port
EXPOSE 80

# Health check (health endpoint is excluded from auth)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 11.10 Nginx Configuration (nginx.conf - Public)

```nginx
# nginx.conf (for production - public access)
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:;" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - return index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 11.11 Nginx Protected Configuration (nginx.protected.conf)

```nginx
# nginx.protected.conf (for dev/staging/preview - with authentication)
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # HTTP Basic Authentication (applied globally except /health)
    auth_basic "Protected Environment";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:;" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - return index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint (NO AUTHENTICATION for Cloud Run health checks)
    location /health {
        auth_basic off;
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 11.12 Docker Compose (Local Development)

```yaml
# docker-compose.yml
name: sentient-archive-web_local

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    container_name: frontend
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./index.html:/app/index.html
      - ./vite.config.ts:/app/vite.config.ts
      - ./tsconfig.json:/app/tsconfig.json
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
      - VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
      - VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
      - VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
      - VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
      - VITE_USE_EMULATOR=true
    command: npm run dev -- --host 0.0.0.0
    networks:
      - sentient-network

networks:
  sentient-network:
    driver: bridge
```

### 11.13 .dockerignore

```text
node_modules
npm-debug.log
dist
.git
.gitignore
.env
.env.*
README.md
MASTERPLAN.md
AGENTS.md
tests
.github
.vscode
.DS_Store
coverage
*.md
docker-compose.yml
Dockerfile
.husky
```

### 11.14 Environments & Authentication Summary

| Environment | GCP Project ID                 | Branch     | Deployment | Docker Tag | App Authentication |
| ----------- | ------------------------------ | ---------- | ---------- | ---------- | ------------------ |
| Local       | Docker Compose                 | feature/\* | Manual     | -          | None               |
| Development | `moliveda-gcloudprojects-dev`  | develop    | Auto       | dev        | HTTP Basic Auth    |
| Staging     | `moliveda-gcloudprojects-stg`  | release/\* | Auto       | staging    | HTTP Basic Auth    |
| Preview     | `moliveda-gcloudprojects-prev` | PR         | Auto       | pr-{num}   | HTTP Basic Auth    |
| Production  | `moliveda-gcloudprojects-prod` | main       | Manual     | latest     | None (Public)      |

**GCP Authentication:** All environments use **Workload Identity Federation** for
keyless authentication from GitHub Actions. No service account keys are stored as
secrets.

## 12. Development Phases

### Phase 1: Project Initialization (Week 1)

- [x] Create GitHub repository
- [x] Set up GitFlow branching
- [x] Configure Vite + React 19 + TypeScript
- [x] Install and configure TailwindCSS + ShadCN
- [x] Set up ESLint + Prettier
- [x] Install and configure Husky (pre-commit + commit-msg hooks)
- [x] Set up Gitmoji commit message validation
- [x] Create Dockerfile with multi-stage build (production + protected targets)
- [x] Create docker-compose.yml for local development
- [x] Create nginx.conf for production (public)
- [x] Create nginx.protected.conf for dev/staging/preview (with auth)
- [x] Create .dockerignore
- [x] Configure GitHub Actions workflows (CI, deploy-dev, deploy-staging, deploy-prod,
      deploy-preview, cleanup-preview)
- [x] Create initial folder structure (.husky directory)
- [x] Set up Firebase SDK
- [x] Configure Jest for testing

### Phase 2: Authentication UI (Week 2)

- [ ] Create LoginPage component
- [ ] Create SignupPage component
- [ ] Implement Google OAuth button
- [ ] Implement Email/Password forms
- [ ] Set up Firebase Auth integration
- [ ] Create auth hooks (useAuth)
- [ ] Set up auth store (Zustand)
- [ ] Implement protected routes
- [ ] Test authentication flows

### Phase 3: Dashboard Layout (Week 2)

- [ ] Create DashboardLayout component
- [ ] Build Navbar with user menu
- [ ] Build Sidebar with navigation
- [ ] Implement responsive design
- [ ] Create DashboardHome page
- [ ] Build WelcomeCard
- [ ] Build TokenBalanceCard
- [ ] Build RecentNotesCard
- [ ] Test layout on mobile/tablet/desktop

### Phase 4: Note Management UI (Week 3)

- [ ] Create NotesPage layout
- [ ] Build NotesList component
- [ ] Build NoteCard component
- [ ] Implement FolderTree component
- [ ] Build MarkdownEditor
- [ ] Implement live preview
- [ ] Build FileExtractor component (PDF/TXT/MD content extraction)
- [ ] Implement file upload with validation (type, size)
- [ ] Integrate file extraction API endpoint
- [ ] Create tag management UI
- [ ] Implement search functionality
- [ ] Test note CRUD operations
- [ ] Test file content extraction flow

### Phase 5: AI Features UI (Week 4)

- [ ] Create AIToolbar component
- [ ] Build SummarizeButton with modal
- [ ] Build AutoTagButton
- [ ] Build FlashcardsButton
- [ ] Build AskQuestionButton with chat UI
- [ ] Implement FlashcardViewer
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test AI feature flows

### Phase 6: Token Management UI (Week 5)

- [ ] Create TokenBalance component
- [ ] Build TransactionHistory table
- [ ] Implement RequestTokensModal
- [ ] Add threshold warnings
- [ ] Create token-related hooks
- [ ] Test token displays and updates

### Phase 7: Admin Dashboard (Week 6)

- [ ] Create AdminPage layout
- [ ] Build UserManagementTable
- [ ] Implement user filters and search
- [ ] Create EditUserModal
- [ ] Build AnalyticsChart components
- [ ] Create ActivityLogs viewer
- [ ] Build SystemConfigForm
- [ ] Implement RBAC protection
- [ ] Test admin features

### Phase 8: Internationalization (Week 7)

- [ ] Set up i18next
- [ ] Create translation files (en, es)
- [ ] Implement LanguageSwitcher component
- [ ] Translate all UI strings
- [ ] Test language switching
- [ ] Verify RTL support (if needed)

### Phase 9: Testing & Polish (Week 8)

- [ ] Write unit tests (100% coverage)
- [ ] Write integration tests
- [ ] Add E2E tests (optional)
- [ ] Fix all linting errors
- [ ] Optimize bundle size
- [ ] Add loading skeletons
- [ ] Improve accessibility (a11y)
- [ ] Test on multiple browsers

### Phase 10: Documentation & Deployment (Week 9)

- [ ] Complete README.md
- [ ] Document component API
- [ ] Create user guide
- [ ] Set up Docker Hub repository
- [ ] Configure GCP service accounts
- [ ] Deploy to development (Cloud Run)
- [ ] Deploy to staging (Cloud Run)
- [ ] Final QA testing
- [ ] Deploy to production (Cloud Run)
- [ ] Configure custom domain (if applicable)
- [ ] Set up monitoring and logging
- [ ] Monitor production

## Appendix A: Environment Variables

### `.env.example`

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-sentient-archive
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Development Settings (only for local Docker)
VITE_USE_EMULATOR=true
VITE_FUNCTIONS_EMULATOR_URL=http://localhost:5001
```

### Local `.env` File

For local development with Docker Compose, create a `.env` file:

```bash
# Use your development Firebase project or emulators
VITE_FIREBASE_PROJECT_ID=sentient-archive-dev
VITE_FIREBASE_API_KEY=your-dev-api-key
VITE_FIREBASE_AUTH_DOMAIN=sentient-archive-dev.firebaseapp.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Enable emulator for local development
VITE_USE_EMULATOR=true
VITE_FUNCTIONS_EMULATOR_URL=http://localhost:5001
```

### GitHub Environments & Secrets (for CI/CD)

This project uses **GitHub Environments** to organize secrets professionally. Create 4
environments in your repository settings: `development`, `staging`, `preview`, and
`production`.

**Repository-Level Secrets (shared across all environments):**

- `DOCKERHUB_USERNAME` - Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub access token

**Environment-Scoped Secrets (same names, different values per environment):**

Each GitHub Environment contains the following secrets:

| Secret Name                         | Description                                    |
| ----------------------------------- | ---------------------------------------------- |
| `GCP_PROJECT_ID`                    | GCP project ID for this environment            |
| `GCP_WORKLOAD_IDENTITY_PROVIDER`    | Workload Identity Provider full path           |
| `GCP_SERVICE_ACCOUNT`               | Service account email for deployments          |
| `VITE_FIREBASE_API_KEY`             | Firebase API key                               |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain                           |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID                            |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID                   |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID                                |
| `AUTH_USERNAME`                     | HTTP Basic Auth username (dev/staging/preview) |
| `AUTH_PASSWORD`                     | HTTP Basic Auth password (dev/staging/preview) |

**Environment-Specific Values:**

| Environment   | GCP Project ID                 | Project Number  | Workload Identity Provider Path                                                                       |
| ------------- | ------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------- |
| `development` | `moliveda-gcloudprojects-dev`  | `142167472193`  | `projects/142167472193/locations/global/workloadIdentityPools/github-pool/providers/github-provider`  |
| `staging`     | `moliveda-gcloudprojects-stg`  | `454460555724`  | `projects/454460555724/locations/global/workloadIdentityPools/github-pool/providers/github-provider`  |
| `preview`     | `moliveda-gcloudprojects-prev` | `1026007305208` | `projects/1026007305208/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `production`  | `moliveda-gcloudprojects-prod` | `1034574533717` | `projects/1034574533717/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |

| Environment   | Service Account Email                                                     |
| ------------- | ------------------------------------------------------------------------- |
| `development` | `cicd-deployer-dev@moliveda-gcloudprojects-dev.iam.gserviceaccount.com`   |
| `staging`     | `cicd-deployer-stg@moliveda-gcloudprojects-stg.iam.gserviceaccount.com`   |
| `preview`     | `cicd-deployer-prev@moliveda-gcloudprojects-prev.iam.gserviceaccount.com` |
| `production`  | `cicd-deployer-prod@moliveda-gcloudprojects-prod.iam.gserviceaccount.com` |

**Notes:**

- **Workload Identity Federation:** All GCP authentication uses OIDC tokens from GitHub
  Actions (keyless). No service account JSON keys are required.
- **Environment-scoped secrets:** The `environment:` declaration in workflows
  automatically scopes secret access to the correct environment.
- **Preview environment:** Uses a static `preview` environment for secrets, while each
  PR gets its own Cloud Run service (`sentient-archive-pr-{number}`).
- Production does NOT use HTTP Basic Auth (publicly accessible).
- Development, Staging, and Preview environments are protected with HTTP Basic
  Authentication.

## Appendix B: Useful Commands

```bash
# Development (Docker)
docker compose up                      # Start dev environment
docker compose up --build              # Rebuild and start
docker compose down                    # Stop all services
docker compose down -v                 # Stop and remove volumes
docker compose logs -f app             # View live logs
docker compose exec app sh             # Access container shell
docker compose exec app npm install    # Install new packages

# Development (Native - without Docker)
npm run dev                            # Start dev server
npm run build                          # Production build
npm run preview                        # Preview build

# Testing
npm run test                           # Run tests
npm run test:watch                     # Watch mode
npm run test:coverage                  # Coverage report

# Linting
npm run lint                           # Run ESLint
npm run lint:fix                       # Fix issues
npm run format                         # Format code
npm run format:check                   # Check formatting

# Docker (Manual)
docker build -t sentient-archive-web . # Build image
docker run -p 8080:8080 \
  -e VITE_FIREBASE_API_KEY=xxx \
  sentient-archive-web                 # Run container
docker push m-oliveda/sentient-archive-web:latest  # Push to Docker Hub

# Google Cloud Run
gcloud auth login                      # Authenticate
gcloud config set project moliveda-gcloudprojects-prod
gcloud run deploy sentient-archive-web \
  --image docker.io/m-oliveda/sentient-archive-web:latest \
  --platform managed \
  --region us-central1 \
  --project moliveda-gcloudprojects-prod \
  --allow-unauthenticated

# List service accounts per environment
gcloud iam service-accounts list --project=moliveda-gcloudprojects-dev
gcloud iam service-accounts list --project=moliveda-gcloudprojects-stg
gcloud iam service-accounts list --project=moliveda-gcloudprojects-prod
gcloud iam service-accounts list --project=moliveda-gcloudprojects-prev

# Verify Workload Identity Federation setup
gcloud iam workload-identity-pools list --location=global --project=moliveda-gcloudprojects-prod

# Firebase (for Auth/Firestore emulators)
firebase login
firebase init emulators
firebase emulators:start
firebase use dev

# Git Flow
git flow init
git flow feature start auth-ui
git flow feature finish auth-ui
git flow release start 1.0.0
git flow release finish 1.0.0
```

## END OF FRONTEND MASTERPLAN

_This document serves as the single source of truth for the SentientArchive web
frontend. All implementation decisions should reference and follow this plan._
