# CLAUDE.md — construction-site (Landing DXP)

Guidance for working in the **construction-site** package: the deployed public
marketing SPA, driven entirely by bundled per-page JSON. **No runtime backend —
deploys 100% static to GitHub Pages.**

> **The admin CMS lives in a SEPARATE repo/app — `chepelcr/V-E-admin`** (runs at
> `http://localhost:5174`). It is intentionally NOT part of this repo: this
> public bundle ships **zero** admin code. The admin app reads/writes THIS
> package's content (`src/content/*.json`, `src/translations/*.json`) as the
> single source of truth, via `@site` path aliases + its own dev-only local-CMS
> plugin (which writes back here and runs git `publish` from the repo root). To
> edit content, clone `V-E-admin` as a sibling of this monorepo and run it. The
> shared libs it imports from here (`resolveLocalized`, `icons`, `rich-text`,
> `media`, `brand-theme`, `seo`, `admin-i18n`/`useT`, `admin-store`) stay in this
> package because the public site uses them too.

React 19 · Vite 7 · TypeScript · Tailwind v4 · wouter · bilingual **es/en**.
Live at https://v-e.jcampos.dev.

## The DXP shape

Every user-visible string/asset is editable through the admin and stored in
bundled JSON. The public site is a read-only consumer of that content.

### Content layout

```
src/content/<entity>.json     one JSON per public page + shared entities
  home, catalog, lots, providers, contact (company/contact info),
  contactContent, financiamiento, notFound        ← per-page copy
  branding, themes, media, seo, navigation, inventory  ← shared
src/translations/{es,en}.json  SMALL fixed chrome only (chrome.* + admin.*)
src/repositories/<x>.repository.ts   typed read accessor over one content JSON
src/services/<x>.service.ts          filter/sort/derive over a repository (where needed)
src/pages/<X>.tsx                    public page — reads via repo/service only
src/pages/admin/<X>Page.tsx          admin editor for that entity
```

The data chain (Home example):
`content/home.json → repositories/home.repository.ts → services/home.service.ts
→ pages/Home.tsx` (read through `resolveLocalized` + `resolveIcon`).

### Localized fields — the tolerant resolver

Content fields are localized `{ es, en }`. Read them through
`src/lib/resolveLocalized.ts` (`resolveLocalized(v, lang)`) which accepts BOTH a
plain string and `{es,en}`, so partially-migrated data always renders.
**Proper nouns stay plain strings** (lot/model names, geo locations, provider
brand names); provider `materials` are per-item `{es,en}`. mission/vision/about
live in `home.json`. No bilingual ternaries in components.

## No-hardcoded-text rule

No hardcoded user-visible text in public OR admin chrome.
- Public copy → the page's content JSON (localized).
- Fixed chrome (buttons, labels, filter chips) → `t("chrome.*")` via
  `src/lib/admin-i18n.ts` (`useT()`), backed by `src/translations/{es,en}.json`.
- Admin chrome → `admin.*` i18n keys OR a per-page `const T = {es,en}[lang]`
  dict. Manifest labels are `BiLabel`. **No single-language literal in admin
  chrome.**

## Bilingual admin

Admin is fully bilingual. The language toggle in the topbar is **in-place** when
`location.startsWith("/admin")` (no navigate/animation). Bilingual editors
always show both es+en side-by-side regardless of the chrome language.

## The four-pieces rule (completeness)

Every content entity needs all four, and they are generated from ONE source so
they can't drift: `src/lib/admin-manifest.ts` (a `ContentPage[]` of
`{file,label,route,icon,group,pattern}`) feeds the sidebar, `AdminRouter`, and
`ContentVersionsPage`.

1. **Admin page** that edits it (`src/pages/admin/<X>Page.tsx`).
2. **Sidebar entry** — from the manifest row.
3. **Admin route** — from the manifest row (keep redirects for renamed paths).
4. **Content-versions download row** — from the manifest row.

## How to add a new content entity

1. `src/content/<entity>.json` — localized `{es,en}` fields seeded from copy.
2. `src/repositories/<entity>.repository.ts` — typed accessor.
3. (Optional) `src/services/<entity>.service.ts` for filter/sort/derive.
4. `src/lib/admin-store.ts` — add a slice + setter + snapshot (the "store slice"
   piece). This module is pulled into the PUBLIC bundle by the contact form, so
   it must NOT import `admin-ui.ts`.
5. `src/pages/admin/<X>Page.tsx` — the editor (use `AdminUI` building blocks:
   `PageHeader`/`FloatingSaveButton`/`AdminCard`, `TextField`/`TextAreaField`/
   `Toggle`/`ColorField`/`SelectField`, `Bilingual*`). Every token/enum field is
   a `SelectField`; booleans are `Toggle`.
6. `src/lib/admin-manifest.ts` — add the row (gives sidebar + route + versions).
7. `src/pages/admin/AdminRouter.tsx` — replace the StubPage route with the real
   page (confirm it shows in `ContentVersionsPage`).
8. Swap the public component to read the content (NO visual change).
9. If it's a new public ROUTE, also add it to `seo.json.pages`, the `ROUTES`
   list in `scripts/prerender.mjs`, and wire `useHeadTags("/<route>", lang)`.
10. Regenerate inventory: `pnpm --filter @workspace/construction-site run inventory`.

## Save / publish

- A single save entry: `downloadJson(filename, data)` in `admin-store.ts` →
  POSTs to the dev-only local-CMS Vite plugin (`/__local/content`) writing
  `src/content/<x>.json` (or `src/translations/`), falls back to a browser
  download, then `markSaved` + dispatches `ve:content-saved`.
- **Publish** (topbar state machine) → `/__local/publish`: git add 3 dirs →
  commit → push the current branch. `nothingToPublish` when nothing staged.
- The local-CMS plugin uses `apply:"serve"` → it exists ONLY on the dev server,
  never in the prod build.

## No admin code in this repo (it's a separate app)

The admin was extracted into `chepelcr/V-E-admin` (its own Vite app on
`:5174`). This package contains **no** admin pages/shell/gate/local-CMS plugin.
The public bundle therefore ships zero admin code by construction (nothing to
tree-shake). Keep it that way — do not re-add admin routes/pages here.

**Verification (must stay clean):** a prod build ships no admin code:

```bash
BASE_PATH=/ PORT=5000 NODE_ENV=production pnpm --filter @workspace/construction-site build
grep -lE 'AdminLayout|AdminRouter|/admin/dashboard|admin-ui|publishChanges|__local' dist/public/assets/*.js
# → no matches
```

To add/edit admin pages, work in the `V-E-admin` repo (it imports this
package's content + shared libs via `@site` aliases).

## SEO (two layers)

- **Runtime** (`src/lib/seo.ts`): `useHeadTags(route, lang, {index?})` updates
  title/description/canonical/hreflang/OG/Twitter/robots on SPA navigation, from
  `seo.json`. Wired in every public page; the 404 passes `{index:false}`.
- **Static prerender** (`scripts/prerender.mjs`, runs after `vite build` via the
  `build` script): per language × route → `dist/public/<lang>/<slug>/index.html`
  with full head + JSON-LD, plus `sitemap.xml` (hreflang alternates), a
  re-stamped root `index.html`, and a **noindex `404.html`**. The SPA stays FLAT
  (no `/es//en` URL prefix); the prerender emits per-language dirs for crawlers.
- `public/robots.txt` references the sitemap.

## Commands

```bash
# Typecheck gate (no native binaries needed — runs on Windows)
pnpm --filter @workspace/construction-site typecheck

# Prod build (= vite build + prerender). Requires PORT + BASE_PATH.
BASE_PATH=/ PORT=5000 NODE_ENV=production pnpm --filter @workspace/construction-site build

# Regenerate the dependency-graph inventory after adding/removing src files
pnpm --filter @workspace/construction-site run inventory

# Local dev WITH admin (see repo-root scripts/dxp/* for the Windows workaround)
BASE_PATH=/ PORT=8080 VITE_ENABLE_ADMIN=true pnpm --filter @workspace/construction-site dev
# → http://localhost:8080/admin/dashboard
```

> **Windows note:** `pnpm-workspace.yaml` overrides null out non-linux native
> binaries (CI is linux-only), so `vite dev`/`build` fail on Windows until the
> §5.1 workaround in `scripts/dxp/` is applied. `typecheck` and `prerender` need
> no native binaries and run anywhere.

## Deploy

`.github/workflows/deploy-gh-pages.yml` builds on push to `main` with
`BASE_PATH=/ PORT=8080 NODE_ENV=production` and **`VITE_ENABLE_ADMIN` left
unset** (keep it that way — admin stays tree-shaken), publishing
`dist/public`. The prerender's noindex `404.html` is the SPA deep-link
fallback — do not overwrite it with an indexable copy of `index.html`.
