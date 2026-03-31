# ARCHI-LEGAL Project Structure (AI-Powered CRM)

## Current Monorepo Layout

- `apps/web` (@archi-legal/web): Next.js Dashboard.
  - `features/`: Business modules (Dashboard, Expediente).
  - `app/`: Routing and layouts.
- `packages/db` (@archi-legal/db): Prisma schema and database client.
- `packages/core` (@archi-legal/core): Shared backend logic, server actions, and utilities.
- `packages/domain` (@archi-legal/domain): Shared TypeScript contracts, Zod schemas, and types.
- `packages/ai` (@archi-legal/ai): AI logic, LLM integrations, and RAG handlers.

## Architecture Principles

- **Scoped Packages**: All internal packages use the `@archi-legal/` scope.
- **Turborepo**: Orquestrates builds and dev cycles efficiently.
- **Single Source of Truth**: Domain logic and validation live in `packages/domain`.
- **Database Centralization**: All DB access is managed via `@archi-legal/db`.

## Tech Stack
- **Framework**: Next.js 16 (Turbopack)
- **Monorepo**: Turborepo + pnpm Workspaces
- **ORM**: Prisma
- **Styling**: Tailwind CSS + Shadcn UI
- **IA**: Vercel AI SDK / Custom LLM Handlers
