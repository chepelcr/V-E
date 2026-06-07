# CLAUDE.md

Guidance for working in the **V-E** repository.

## Project overview
V-E is a construction & real estate web platform: a public marketing/sales SPA backed by a small REST API, with a component-preview sandbox for design work. It's a **pnpm monorepo**.

## Monorepo layout
```
artifacts/
  construction-site/   Main public SPA (React 19 + Vite 7 + wouter) — the deployed site
  mockup-sandbox/      Design-time component preview app
  api-server/          Express 5 REST API (esbuild bundle)
lib/
  api-spec/            OpenAPI spec + Orval codegen config (source of truth for the API)
  api-client-react/    GENERATED React Query hooks (do not hand-edit src/generated)
  api-zod/             GENERATED Zod schemas (do not hand-edit src/generated)
  db/                  Drizzle ORM schema (PostgreSQL)
scripts/               Shared build/utility scripts
attached_assets/       Images & PDFs used for site content
```

## Tech stack
- **Frontend:** React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4, wouter (routing), Radix UI + shadcn/ui, Framer Motion, TanStack Query, next-themes
- **Backend:** Express 5, Drizzle ORM, PostgreSQL (`pg`), pino logging, esbuild
- **Codegen:** Orval (OpenAPI → React Query hooks + Zod schemas)

## Package manager — pnpm only
- **Always use `pnpm`. Never `npm` or `yarn`.**
- Dependency versions are centralized in the `catalog:` of `pnpm-workspace.yaml`.
- **Supply-chain defense:** `minimumReleaseAge: 1440` (a package version must be ≥1 day old before install). Do not disable it. Add to `minimumReleaseAgeExclude` only for urgent fixes from trusted publishers.
- **Do not edit `pnpm-lock.yaml` by hand** — regenerate with `pnpm install`.

## Common commands
```bash
# Dev servers (require PORT + BASE_PATH env vars — see below)
BASE_PATH=/ PORT=8080 pnpm --filter construction-site dev
BASE_PATH=/ PORT=8081 pnpm --filter mockup-sandbox dev

# Build everything (typecheck + per-package build)
pnpm build

# Typecheck only
pnpm typecheck

# Build just the public site
BASE_PATH=/ PORT=8080 pnpm --filter construction-site build   # → artifacts/construction-site/dist/public

# Regenerate API client + zod from the OpenAPI spec
pnpm --filter api-spec codegen

# Push DB schema (Drizzle)
pnpm --filter @workspace/db push
```

## Environment variables
- `PORT` — **required** by the Vite apps (`vite.config.ts` throws if missing), at dev *and* build time.
- `BASE_PATH` — **required** by the Vite apps; the site's base path. `/` for the custom-domain deploy.
- `DATABASE_URL` — PostgreSQL connection string for `api-server`.

## Frontend conventions (construction-site)
- **Routing:** wouter (client-side). Pages live in `src/pages/` (Home, Catalog, Lots, Providers, Contact, Admin, Financiamiento).
- **i18n:** `src/i18n/` with a `LanguageContext` (Spanish/English).
- **Theme:** `ThemeContext` + next-themes; dark/light toggle is built in.
- **Content data:** `src/data/` holds JSON-driven site content (landing-DXP pattern) — prefer editing content here over hardcoding copy in components.
- **UI primitives:** `src/components/ui/` (shadcn/ui style). The `hover-elevate` / `active-elevate-2` utility classes are custom design tokens used by Button/Badge.

## Deployment
- The **construction-site** SPA deploys to **GitHub Pages** at **https://v-e.jcampos.dev** via `.github/workflows/deploy-gh-pages.yml` (push to `main`).
- The build publishes `artifacts/construction-site/dist/public` to the `gh-pages` branch. Custom domain is set through the workflow's `cname` input.
- `api-server` is **not** deployed to Pages (it needs a server runtime).

## Do / Don't
- ✅ Use `pnpm`, edit content in `src/data/`, regenerate API code via Orval.
- ❌ Don't use `npm`/`yarn`, don't hand-edit `pnpm-lock.yaml` or `lib/*/src/generated/**`, don't add `@replit/*` packages (this project was de-coupled from Replit).
