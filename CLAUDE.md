# CLAUDE.md

Guidance for working in the **V-E** repository.

## Project overview
V-E is a construction & real estate web platform. The deployed product is a
public marketing/sales SPA built as a **landing DXP**: every user-visible
string/asset is editable via a **dev-only, tree-shaken admin CMS** backed by
bundled per-page JSON, and it deploys **100% static** (no runtime backend) to
GitHub Pages. There is also a small REST API and a component-preview sandbox for
design work. It's a **pnpm monorepo**.

> **The construction-site is a DXP.** See
> `artifacts/construction-site/CLAUDE.md` for the content layout, the
> four-pieces completeness rule, the no-hardcoded-text rule, bilingual admin,
> save/publish, the tree-shake gate, SEO, and how-to-add-an-entity.

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

## Frontend conventions (construction-site) — landing DXP
Full detail in `artifacts/construction-site/CLAUDE.md`. The essentials:
- **Routing:** wouter (client-side, FLAT routes — no `/es//en` URL prefix).
  Public pages in `src/pages/` (Home, Catalog, Lots, Providers, Contact,
  Financiamiento, not-found); admin pages in `src/pages/admin/`.
- **Content:** one localized `{es,en}` JSON per entity in `src/content/`
  (home, catalog, lots, providers, contact, contactContent, financiamiento,
  notFound, branding, themes, media, seo, navigation, inventory), read through
  `src/repositories/*` (+ `src/services/*` for filter/sort). Edit content via
  the admin or the JSON — **never hardcode copy in components**. Read localized
  fields through `src/lib/resolveLocalized.ts`.
- **i18n / chrome:** SMALL fixed chrome only in `src/translations/{es,en}.json`
  (`chrome.*` public, `admin.*` panel), read via `useT()` in
  `src/lib/admin-i18n.ts`. `LanguageContext` holds the active language.
- **Admin:** dev-only, gated by `ADMIN_ENABLED` (`src/lib/admin-enabled.ts`),
  tree-shaken from prod. The four-pieces rule is enforced by
  `src/lib/admin-manifest.ts`. Save → local-CMS Vite plugin (`apply:"serve"`);
  Publish → git commit+push. **Do not weaken the gate; keep
  `VITE_ENABLE_ADMIN` unset in the deploy workflow.**
- **SEO:** `src/lib/seo.ts` runtime head tags + `scripts/prerender.mjs`
  (per-lang × route HTML + sitemap + noindex 404) wired into the `build` script.
- **Theme:** `ThemeContext` + next-themes; dark/light toggle built in.
- **UI primitives:** `src/components/ui/` (shadcn/ui style). The
  `hover-elevate` / `active-elevate-2` classes are custom design tokens.
- **Legacy:** `src/data/siteData.ts` was retired into the content JSON — do not
  reintroduce reads from it.

## Deployment
- The **construction-site** SPA deploys to **GitHub Pages** at **https://v-e.jcampos.dev** via `.github/workflows/deploy-gh-pages.yml` (push to `main`).
- The build publishes `artifacts/construction-site/dist/public` to the `gh-pages` branch. Custom domain is set through the workflow's `cname` input.
- `api-server` is **not** deployed to Pages (it needs a server runtime).

## Do / Don't
- ✅ Use `pnpm`, edit content in `src/data/`, regenerate API code via Orval.
- ❌ Don't use `npm`/`yarn`, don't hand-edit `pnpm-lock.yaml` or `lib/*/src/generated/**`, don't add `@replit/*` packages (this project was de-coupled from Replit).
