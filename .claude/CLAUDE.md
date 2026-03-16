# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WolfMed** is a Polish-language medical education mobile application built with React Native and Expo. It helps medical students prepare for exams through interactive tests, learning materials, and medical procedures.

## Tech Stack

- **Framework**: React Native 0.81.4 + Expo SDK 54
- **Language**: TypeScript 5.9.2
- **Navigation**: Expo Router 6.0.8 (file-based routing)
- **Styling**: NativeWind 4.1.23 (Tailwind for React Native)
- **Authentication**: Clerk Expo 2.14.12 with Polish localization
- **Database**: Neon PostgreSQL with Drizzle ORM 0.44.3
- **State Management**: Zustand 5.0.6 + TanStack React Query 5.83.0
- **Animations**: React Native Reanimated 4.1.2
- **Lists**: Shopify FlashList 2.0.2 (optimized performance)

### Backend (In Progress)

- **API**: C# .NET 10 Web API (CQRS — Vertical Slice with MediatR)
- **Validation**: FluentValidation
- **ORM (C#)**: Entity Framework Core 10 + Npgsql (read/write only — no EF migrations)
- **Containerization**: Docker + docker-compose
- **Auth**: Clerk JWT validated by C# API
- **Rule**: Drizzle is sole schema owner — EF Core never runs migrations

## Package Manager

Always use **pnpm** — never npm or yarn.

## Essential Commands

### Development
```bash
pnpm start             # Start Expo development server
pnpm android           # Run on Android emulator
pnpm ios               # Run on iOS simulator
pnpm web               # Run web version
```

### Code Quality
```bash
pnpm lint              # Run ESLint
pnpm test              # Run Jest tests in watch mode
```

### Database Operations
```bash
pnpm db:push           # Push schema changes to Neon database
pnpm db:studio         # Open Drizzle Studio (database GUI)
pnpm db:seed           # Seed all tables from data/ JSON files
pnpm db:setup          # db:push + db:seed (fresh DB setup)
```

## High-Level Architecture

### File-Based Routing Structure

The app uses Expo Router's group-based organization:

```
app/
├── (auth)/                    # Authentication screens (sign-in, sign-up)
└── (tabs)/                    # Main tab navigation
    ├── index.tsx              # Welcome/landing screen
    ├── blog.tsx, forum.tsx    # Community features
    └── (dashboard)/           # Dashboard tab
        └── (drawer)/          # Drawer navigation wrapping dashboard
            ├── index.tsx      # Main dashboard
            ├── tests.tsx, tests-procedures.tsx
            └── (learn)/       # Learning materials section
                ├── procedures.tsx, questions.tsx, quizes.tsx
                └── procedury/ # Detailed procedure screens
```

**Navigation Flow**: Tabs → Dashboard → Drawer → Learn (nested 4 levels deep)

### Provider Composition Pattern

Root layout (`app/_layout.tsx`) wraps the app in layered providers:
1. `GestureHandlerRootView` - Enables gestures
2. `ClerkProvider` - Authentication with Polish localization
3. `QueryClientProvider` - Server state management
4. `ThemeProvider` - Dark/light mode support
5. Custom `SplashScreen` - Loading state

### Component Organization

- `components/` - Reusable UI components (StatCard, ProcedureCard, AuthForm, etc.)
- `components/ui/` - UI-specific components (CustomDrawerContent)
- Custom hooks in `hooks/` for animation, authentication, gestures, data fetching
- `store/` - Zustand stores for dashboard, test generation, search

### State Management Strategy

- **Global State**: Zustand stores (`useDashboardStore`, `useGenerateTestStore`, `useSearchTermStore`)
- **Server State**: React Query hooks for data fetching and caching
- **Local State**: React hooks for component-level state
- All forms use Zod schemas for type-safe validation

### Database Layer

- Schema definitions: `server/db/schema.ts`
- Drizzle ORM for queries: `server/db.ts` and `server/queries.ts`
- Zod validation schemas: `server/schema.ts` and `lib/validations/`
- Tables: `users`, `completedTestes`, `tests`, `procedures`, `blogPosts`, `customersMessages`, `categories`, `tags`, `comments`, `procedureTags`
- Static data in JSON files: `data/tests.json`, `data/procedures.json`
- `categories` normalizes `tests.category` (new `categoryId` FK added, old `category` varchar kept as fallback)
- `tags` + `procedureTags` (join): many-to-many for procedures
- `comments`: blog post comments (FK → blogPosts, users)

### Styling Architecture

- **Primary**: NativeWind utility classes (Tailwind)
- **Custom theme**: `tailwind.config.js` defines custom colors, spacing (`spacer0-6`), border radius (`borderRadius0-5`)
- **Theme system**: `constants/Colors.ts` and `theme.ts`
- **Dark/light mode**: Managed via `ThemeProvider` with `useColorScheme` hook
- Use `StyleSheet.create()` for static styles when needed

### Animation Patterns

Heavy use of React Native Reanimated throughout:
- Custom hooks: `useDashboardAnimation`, `useAuthAnimations`, `useDashboardGesture`
- Shared values and animated styles for smooth 60fps animations
- Spring-based transitions with `withSpring` and `withTiming`
- Gesture-driven interactions (draggable cards, swipe gestures)

## Key Configuration Files

### babel.config.js
```javascript
presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel']
plugins: ['react-native-reanimated/plugin'] // MUST be last plugin
```

### tsconfig.json
- Path alias: `@/*` maps to project root
- Strict mode enabled
- Extends `expo/tsconfig.base`

### drizzle.config.ts
- PostgreSQL dialect (Neon)
- Schema: `./server/db/schema.ts`
- Table prefix filter: `wolfmed_mobile_*`
- Environment variable: `NEON_DATABASE_URL`

## Development Guidelines

### Code Style (from .cursorrules)

- **Components**: Use functional components with hooks; avoid class components
- **Naming**: camelCase for variables/functions, PascalCase for components, lowercase for directories
- **Modularity**: Break components into small, single-responsibility pieces
- **Organization**: Group by feature in directories (e.g., `user-profile/`, `chat-screen/`)

### Performance Optimization

- Use `React.memo()` to prevent unnecessary re-renders
- Optimize FlatList/FlashList with `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`
- Avoid anonymous functions in `renderItem` or event handlers
- Minimize global variables and unnecessary state updates
- Use memoization for expensive calculations

### Responsive Design

- Ensure designs adapt to various screen sizes and orientations
- Use safe area handling (`react-native-safe-area-context`)
- Leverage responsive units and libraries like `react-native-responsive-screen`
- Header visibility dynamically adjusted based on pathname

### TypeScript & Validation

- Type definitions organized in `types/` directory
- Zod schemas for runtime validation (`server/schema.ts`, `lib/validations/`)
- Polish error messages in validation schemas
- Use PropTypes if not using TypeScript (though this project uses TS)

## Important Patterns

### Authentication Flow
1. Clerk handles authentication with Polish `plPL` localization
2. Tokens cached in Expo Secure Store via `TokenCache` interface
3. User data synced to Neon PostgreSQL database
4. Session state managed with `useAuth` hook

### Data Flow
1. Static JSON data in `data/` directory (tests, procedures, blog posts)
2. Dynamic data via React Query hooks (`useTests`, `useGeneratedTest`)
3. Database operations through Drizzle ORM
4. Zustand stores for global UI state

### Path Aliases
All imports can use `@/` prefix (maps to project root):
```typescript
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/theme';
```

## Environment Variables

Required in `.env` file:
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication key
- `NEON_DATABASE_URL` - PostgreSQL connection string

## Language & Localization

- **UI Language**: Polish (maintain consistency)
- Clerk localization set to `plPL`
- Error messages and validation in Polish
- Comments and code in English

## Recent Changes

- Schema extended: added `categories`, `tags`, `procedure_tags`, `comments` tables; `tests` got `categoryId` FK (Part 1.1 of integration plan)
- Migration to Expo SDK 54
- Refactored DrawerLayout (removed unused header styles/components)
- Separated CustomDrawerContent to standalone file

## Testing

- Jest configured with `jest-expo` preset
- Run tests: `pnpm test`
- Test framework is set up but test files need to be written

## Git Workflow

- Main branch: `main`
- Ignored: `android/`, `ios/`, `.env`, node_modules
- Clean working directory maintained
