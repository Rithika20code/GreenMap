# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── waste-map/          # Digital Waste Mapping Platform (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Digital Waste Mapping Platform

### Product
A civic environmental platform for residents, students, and local authorities to report, track, and resolve waste issues. Features an interactive GIS map, community reports, clean-up drive announcements, and recycling tips.

### Pages
- **/** — Home: hero, platform stats, recent activity, report CTA
- **/map** — Interactive Leaflet.js map with waste report pins (color-coded by category), recycling center markers, hotspot overlays, sidebar filters, floating "Report Waste" button
- **/report** — Multi-step waste reporting form
- **/community** — Community reports feed and clean-up drive announcements
- **/stats** — Impact dashboard with charts (Recharts), resolution rate, category breakdown
- **/tips** — Recycling tips organized by material category

### API Routes (all under /api)
- `GET/POST /reports` — List / create waste reports
- `GET/PATCH /reports/:id` — Get / update report status
- `GET /reports/hotspots` — Hotspot cluster data for map
- `GET /recycling-centers` — All recycling centers
- `GET/POST /announcements` — Clean-up drive announcements
- `GET /tips` — Recycling tips
- `GET /stats/summary` — Platform statistics
- `GET /stats/by-category` — Reports grouped by category
- `GET /stats/recent-activity` — Community activity feed

### Database Tables
- `waste_reports` — Waste issue reports with location, category, status
- `recycling_centers` — Recycling facility locations and details
- `announcements` — Clean-up drive events
- `recycling_tips` — Educational recycling content

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/waste-map` (`@workspace/waste-map`)

React + Vite frontend. Dependencies include: react-leaflet, leaflet, recharts, wouter, @tanstack/react-query, shadcn/ui components.

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes in `src/routes/`. Depends on `@workspace/db`, `@workspace/api-zod`.

### `lib/db` (`@workspace/db`)

Drizzle ORM with PostgreSQL. Schema tables: waste_reports, recycling_centers, announcements, recycling_tips.

Production migrations handled by Replit when publishing. Development: `pnpm --filter @workspace/db run push`.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval config. Run codegen: `pnpm --filter @workspace/api-spec run codegen`
