# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev          # Development server with hot reload
bun run serve        # Production server (no migration)
bun run serve_prod   # Run migrations then start production server
bun run format       # Prettier format all files

# Database scripts
bun run src/scripts/migrate.ts    # Run pending migrations
bun run src/scripts/rollback.ts   # Rollback last migration
bun run src/scripts/reset-db.ts   # Reset database

# Tests (no test runner script defined - run directly)
bun test                          # Run all tests
bun test src/api/auth.test.ts     # Run a single test file
```

## Architecture

Even Weaver is a cross-stitch pattern tracking app. It's a **full-stack TypeScript monorepo** run entirely with Bun — no separate build step. Bun serves both the API and the React SPA from `src/index.ts`.

### Request Flow

```
Browser → Bun HTTP server (src/index.ts)
         ├── Static assets / HTML shell (src/index.html, src/frontend.tsx)
         └── API routes → src/api/*.ts → Sequelize models → SQLite
```

The frontend is a React SPA bundled at request time by Bun. The HTML shell at `src/index.html` loads `src/frontend.tsx` as the React entry point.

### Key Directories

- `src/api/` — Backend route handlers (auth, weaves, colors). Each file exports handler functions called from the router in `src/index.ts`.
- `src/client/` — React frontend. `App.tsx` wraps everything in `QueryClientProvider` and `AuthProvider`. `Routes.tsx` defines the route tree. `AuthedApp.tsx` guards protected routes.
- `src/models/` — Sequelize ORM models (User, Weave, Color, AuthToken). Associations are defined in `models/index.ts`.
- `src/util/` — Shared utilities used by both frontend and backend (pattern, color, coord, draw, math).
- `src/logic/` — Business logic for pattern generation algorithms.
- `src/migrations/` — Umzug migration files.

### Core Data Model

The `Pattern` class (`src/util/pattern.ts`) is the central data structure. It stores a cross-stitch grid as an array of `[colorId, Status]` tuples where `Status` is `TODO=0 | DONE=1`. Patterns are serialized to BLOBs in the `weave` table.

### Auth

Cookie-based sessions. Login creates an `AuthToken` row; the cookie holds the token value. The `requireAuth` wrapper in `src/api/util.ts` validates the token on protected routes.

### Frontend State

- **React Query** manages server state (weaves, colors, auth status).
- `src/client/lib/api.ts` is the HTTP client — all API calls go through here.
- `src/client/auth.tsx` provides auth context (current user, login/logout).

### Canvas Rendering (In Progress)

`src/client/pages/Weave.tsx` is being ported from a DOM-component-per-stitch approach to canvas rendering for performance. `src/util/draw.ts` contains canvas drawing utilities. This is the active area of development on the `canvas` branch.

### Database

SQLite via Sequelize. Config in `sequelize-config.ts`:
- Dev: `./tmp/dev_db.sqlite`
- Test: in-memory
- Production: `./tmp/db.sqlite` (or `DB_PATH` env var)

Path alias `@/*` maps to `src/*` (configured in `tsconfig.json`).
