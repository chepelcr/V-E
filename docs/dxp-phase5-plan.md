# DXP Phase-5 Plan — V&E Construction Site Retrofit

**Target:** `E:/dev/V-E/artifacts/construction-site` (`@workspace/construction-site`) — React 19 + Vite 7 + TS + Tailwind v4 + wouter, bilingual es/en, GH Pages at `https://v-e.jcampos.dev`.
**Governing skill:** `landing-dxp-builder`, mode **RETROFIT EXISTING**.
**Inputs:** the completed audit `E:/dev/V-E/docs/dxp-audit.md`; skill refs `scaffold.md`, `admin-shell.md`, `local-cms.md`, `seo-deploy.md`, `retrofit-audit.md`, `architect.md`.
**This document is the plan only** — no feature code is produced here. The builder/adapter/migrator agents execute it phase by phase.

---

## 0. Context & goal

The repo is a **working pre-DXP landing site, not a DXP**. Strong foundations already exist and are preserved; none of the DXP machinery exists yet (no admin gate, no content/repository/service layer, no Zustand store, no admin shell, no local-CMS, no media library, no SEO prerender, no inventory). The current `/admin` is a PIN-gated page that ships in production — an invariant violation to be discarded.

**Goal:** retrofit the site into a landing DXP — every user-visible string/asset editable via a dev-only, tree-shaken admin CMS backed by bundled per-page JSON, deploying 100% static — **without ever breaking the public site**, and honoring the user deviations below.

### User deviations (override skill defaults)

1. **Per-page content model.** Each public page's editable text lives in its OWN content JSON (`home.json`, `catalog.json`, `lots.json`, `providers.json`, `contact.json`, `financiamiento.json`, `notFound.json`), edited by that page's OWN admin page. `src/translations/{es,en}.json` stays SMALL (shared fixed chrome only). All content fields are localized `{es,en}`.
2. **Discard `src/pages/Admin.tsx`** and rebuild admin with the skill's full patterns.
3. **Preserve:** the procedural Three.js marble background (`MarbleBackground.tsx` + `marble/marbleScene.ts`); the `.glass-panel`/`.glass-section`/`.glass-scrim` utilities + `--panel-alpha`/`--section-alpha`; theme-aware nav logos; the existing HSL `@theme inline` token system; flag/theme toggles.
4. **Add start / reboot / logs scripts** so the user can run the site and TEST the admin — including a **Windows dev workaround** (see Phase 1 §1.7) because `vite dev`/`build` currently FAIL on this Windows host.

### Two structural facts that shape every phase

- **`vite.config.ts` throws unless `PORT` and `BASE_PATH` are set** (dev *and* build). Every script and the workflow must pass them.
- **`pnpm-workspace.yaml` `overrides` set every non-linux rollup / esbuild / lightningcss / @tailwindcss/oxide native binary to `"-"`** (CI is linux-x64-only). So on this **Windows** host, `vite dev` and `vite build` fail with a missing-native-binary error. The local-run scripts MUST ship a Windows dev workaround (Phase 1 §1.7) or the admin can't be tested locally.

### Mode & references per layer

Retrofit, entity-by-entity behind a tolerant resolver. Builders follow: data chain/store/identity/media/rich-text → `scaffold.md`; admin shell/7 patterns/tooling → `admin-shell.md`; write-back → `local-cms.md`; prerender/scripts/deploy → `seo-deploy.md`; sequencing discipline → `retrofit-audit.md`.

---

## 1. Content-entity list (the completeness manifest)

Every content entity needs all FOUR pieces (skill completeness rule): **① admin page** that edits it · **② sidebar entry** · **③ admin route** (keep redirects for renamed paths) · **④ content-versions download row**. A single shared manifest `src/lib/admin-manifest.ts` (`ContentPage[] = { file, label: BiLabel, route, icon, group, pattern }`) is the ONE source the sidebar, `AdminRouter`, and `ContentVersionsPage` generate from, so the four pieces can never drift.

Legend — **Pattern** = which of the 7 admin page patterns (1 singleton-draft · 2 list-editor · 3 multi-file identity · 4 media · 5 translations key-table · 6 contact triage · 7 status/tooling).

### 1.1 Per-page content entities (deviation #1)

| Entity / file | ① Admin page | ② Sidebar | ③ Route | ④ Versions row | Repository | Service | Public component that swaps to read it | Pattern |
|---|---|---|---|---|---|---|---|---|
| `home.json` | `HomePage` (admin) | Content › Home | `/admin/home` | yes | `home.repository.ts` | — (singleton) | `pages/Home.tsx` | 1 |
| `catalog.json` | `CatalogPage` (admin) | Content › Catalog | `/admin/catalog` | yes | `catalog.repository.ts` | `catalog.service.ts` (gallery filter/sort) | `pages/Catalog.tsx` | 2 (+singleton title/subtitle) |
| `lots.json` | `LotsPage` (admin) | Content › Lots | `/admin/lots` | yes | `lots.repository.ts` | `lots.service.ts` (province/canton/district/min-size filter) | `pages/Lots.tsx` | 2 (+singleton) |
| `providers.json` | `ProvidersPage` (admin) | Content › Providers | `/admin/providers` | yes | `providers.repository.ts` | — | `pages/Providers.tsx` | 2 (+singleton) |
| `contact.json` | `ContactContentPage` (admin) | Content › Contact (copy) | `/admin/contact-content` | yes | `contact-content.repository.ts` | — | `pages/Contact.tsx` (intro only) | 1 |
| `financiamiento.json` | `FinanciamientoPage` (admin) | Content › Financing | `/admin/financiamiento` | yes | `financiamiento.repository.ts` | — | `pages/Financiamiento.tsx` | 1 (arrays via BilingualSection) |
| `notFound.json` | `NotFoundPage` (admin) | Content › 404 | `/admin/not-found` | yes | `notfound.repository.ts` | — | `pages/not-found.tsx` | 1 |

### 1.2 Shared content entities (referenced by pages, NOT duplicated)

| Entity / file | ① Admin page | ② Sidebar | ③ Route | ④ Versions row | Repository | Service | Public consumer(s) | Pattern |
|---|---|---|---|---|---|---|---|---|
| `branding.json` | **Site Identity** (`BrandingPage`) — edits branding+themes | CMS › Site Identity | `/admin/identity` (+ `/admin/branding`→redirect) | yes | `branding.repository.ts` | `brand-theme.ts` applier | `Navbar` logo, `Footer` logo, favicon, `initBrand()` in `main.tsx` | 3 |
| `themes.json` | **Site Identity** (same page) | (under Site Identity) | `/admin/identity` (+ `/admin/themes`→redirect) | yes | `themes.repository.ts` | `brand-theme.ts` (`applyBrandTheme`/`initBrand`) | `index.css` token overrides (light-mode only; `.dark` keeps precedence) | 3 |
| `contact.json` **(company/contact info)** | `ContactInfoPage` | CMS › Contact Info | `/admin/contact-info` | yes | `company.repository.ts` | — | `Footer`, `Home` CTA/WhatsApp, `Financiamiento` (kills the hardcoded phones/email drift) | 1 |
| `company.json` (about/mission/vision `{es,en}`) | folded into `HomePage` *or* `ContactInfoPage` (architect §7 decision: keep in `home.json`) | — | — | — | (part of `home.json`) | — | `Home` about section | 1 |
| `media.json` | `MediaPage` | CMS › Media | `/admin/media` | yes | `media.repository.ts` + `lib/media.ts` resolvers | `lib/media-upload.ts` | every image field via `<MediaPicker>` / `resolveAssetUrl` | 4 |
| `seo.json` | `SeoPage` | CMS › SEO | `/admin/seo` | yes | `seo.repository.ts` | `lib/seo.ts` (`resolveSeo`/`useHeadTags`) | head tags + `scripts/prerender.mjs` | 1 |
| `navigation.json` | `NavigationPage` | CMS › Navigation | `/admin/navigation` | yes | `navigation.repository.ts` | — | `Navbar` (order + dropdown grouping; labels via chrome `nav.*`) | 1 |
| `es.json` / `en.json` (translations) | `TranslationsPage` | CMS › Translations | `/admin/translations` | yes (two rows, ES/EN) | i18n bundle | `lib/i18n.ts` | all `t("…")` chrome | 5 |
| `inventory.json` | `InventoryPage` | Platform › Inventory | `/admin/inventory` | yes | `inventory.repository.ts` | `scripts/build-inventory.mjs` | (admin-only graph) | 7 |

### 1.3 Non-file / platform admin surfaces (no content JSON, but routed + sidebar)

| Surface | Sidebar | Route | Notes |
|---|---|---|---|
| Dashboard | (top, above groups) | `/admin/dashboard` (`/admin`→redirect) | read-only store overview — Pattern 7 |
| Diagnostics | Platform › Diagnostics | `/admin/diagnostics` | health checks + git-log — Pattern 7 |
| Content Explorer | Platform › Content Explorer | `/admin/content-explorer` | two-column master-detail JSON viewer — Pattern 7 |
| Content Versions | CMS › Content Versions | `/admin/content-versions` | the ④ piece for ALL entities — Pattern 7 |
| Contact triage | Content › Messages | `/admin/messages` | `localStorage` inbox, not a content file — Pattern 6 |

> **Completeness invariant:** adding any new `src/content/<entity>.json` later = add a `ContentPage` row to `admin-manifest.ts` (gives ②③④ for free) + build its ① page + **regenerate `inventory.json`** (`pnpm --filter @workspace/construction-site run inventory`). `inventory.json` is itself an entity, so it too has page+sidebar+route+versions row.

---

## 2. Admin rebuild spec

All admin code is dev-only and tree-shaken from prod by the gate. Discard `src/pages/Admin.tsx`, its `App.tsx` import+route (lines 17, 41), the `Footer.tsx` admin link, and the `admin.*` keys in `i18n/translations.ts`.

### 2.1 The gate (build everything on this first)

- `src/lib/admin-enabled.ts` → `export const ADMIN_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === "true";`
- **No authentication** — the gate is the only protection. Do not weaken it.
- Wired in three places (defense in depth): `App.tsx` registers `<Route path="/admin/:rest*" component={AdminRouter}/>` only `{ADMIN_ENABLED && …}`; `Navbar`/`Footer` show the admin entry only under the gate; `AdminRouter.tsx` returns `<Redirect to="/"/>` if `!ADMIN_ENABLED`. Because it folds to literal `false` in a normal build, Rollup tree-shakes the whole panel.

### 2.2 Stores (two, deliberately separate)

- **`src/lib/admin-store.ts` — content (Zustand).** Imports every content JSON, exposes each as a slice + setter, tracks dirty via JSON-string snapshots. Exports `ENTITY_BY_FILE` map, `markSaved`, `discardEntity`, `useEntityDirty(filename, value)`, and `downloadJson(filename, data)` (single save entry: calls `saveContentFile` write-back → falls back to browser download → `markSaved` → dispatches `ve:content-saved` DOM event). Slices: home, catalog, lots, providers, contactContent, financiamiento, notFound, branding, themes, company/contact, media, seo, navigation, inventory, plus contact-messages. **Must NOT import the admin-ui store** (this module is pulled into the public bundle by the contact form).
- **`src/lib/admin-ui.ts` — transient shell state (Zustand).** Editor registration (`{dirty, save, filename}`), unsaved-changes nav guard (`navTarget`/`requestNav`/`closeNav` + `guardNavigation(href)`), publish-pending (`pendingPublish`/`refreshPublish` → `fetchGitStatus`). Admin-only → never in public bundle.

### 2.3 Shell

- `src/components/admin/AdminLayout.tsx` — `flex h-screen` shell: desktop sidebar + animated mobile drawer (render/open split: `mobileRender` keeps it mounted through exit, `mobileOpen` drives transform) + `AdminTopbar` + scrollable `<main id="page-content" className="flex-1 overflow-y-auto">` (constant className — animation classes set imperatively) + the single `UnsavedChangesModal`. Owns `collapsed` state and **scroll-to-top on route change** (`mainRef.scrollTo({top:0})` on `[location]`).
- `src/components/admin/AdminSidebar.tsx` — grouped, collapsible (`w-16`↔`w-64` transition), floating edge toggle, grid-rows accordion, single-open group, `--sidebar*` tokens. **Button-based nav** (not `<Link>`) so it runs `guardNavigation` AND lets Radix tooltips fire. ONE shared solid-accent + fixed-dark-text selected treatment for the Dashboard link / active sub-item / open-or-active group header; `ensureGroupOpen(activeGroup)` effect. Generated from `admin-manifest.ts`.
- `src/components/admin/AdminTopbar.tsx` — sticky header: mobile menu button, Logo + "Admin" label, spacer, **language toggle** (admin-safe in-place), **theme toggle** (shared `useDarkMode`, layered Sun/Moon), **view-site** link (guarded), **Publish** state machine button.
- `src/components/admin/AdminRouter.tsx` — gate redirect, then `<Switch>` of `/admin/*` from the manifest, `/admin`→`/admin/dashboard`, plus `/admin/branding`+`/admin/themes`→`/admin/identity` redirects.

### 2.4 Page building blocks (`src/components/admin/AdminUI.tsx` + siblings)

- `PageHeader` — registers `{dirty, save, filename}` with admin-ui on mount, computes dirty via `useEntityDirty`, installs `beforeunload`, renders `FloatingSaveButton` only when dirty/saving/saved.
- `FloatingSaveButton` — fixed round FAB; brand-blue → emerald + Check on "saved".
- `AdminCard` — `bg-card rounded-2xl border` panel, uppercase muted title, Eye/EyeOff collapse via grid-rows trick.
- Form primitives: `TextField`/`TextAreaField`/`Toggle`/`ColorField`/`SelectField` (shared `inputCls`/`labelCls`). **Every token/enum field is a `SelectField`** (currency USD/CRC, gallery category interior/exterior, room enum, contact subject, lot status); booleans (`available`, theme `isActive`) are `Toggle`.
- Bilingual primitives: `BilingualField`/`BilingualTextArea`/`BilingualSection` (edit es+en side-by-side always; rich-text fields pass `RICH_TEXT_HINT`).
- `src/components/admin/Hint.tsx` — shadcn/Radix `Tooltip` over native `title`; one root `TooltipProvider` (already mounted in `App.tsx`). Wraps collapsed sidebar items (`disabled={!collapsed}`) + icon-only topbar buttons. **`asChild` trigger MUST wrap a native `<button>`/`<a>`** (never wouter `<Link>`) and **`TooltipContent` MUST be portaled** — verify `src/components/ui/tooltip.tsx` portals (audit flagged this as a build-time check).
- Modals: hand-rolled fixed overlay convention (backdrop closes, panel stops bubbling) — NOT shadcn `Dialog`. Used by `UnsavedChangesModal`, list-editor item modals, MediaPicker library.

### 2.5 Unsaved-changes nav guard

`guardNavigation(href)` parks target → `UnsavedChangesModal` (rendered once by `AdminLayout`) offers Keep / Discard (`discardEntity(filename)`+`clearEditor`+nav) / Save (`await save()`+nav). Every sidebar/topbar nav runs it.

### 2.6 Publish-flow state machine (`AdminTopbar`)

`type PublishState = idle | publishing | success(hash) | nothing | error(msg)`. `refreshPublish()` (→ `GET /__local/git-status`) on mount, on window `focus`, and on `ve:content-saved`. Click → `publishChanges()` (→ `POST /__local/publish`): `nothingToPublish`→nothing, `ok`→success(+short hash), else error (git stderr in `title`); auto-reset to idle. `disabled = publishing || (idle && !pendingPublish)`. Per-state colors/labels from two small maps; all labels via i18n (`admin.publish*`).

### 2.7 Bilingual admin chrome + in-place language toggle

- All admin chrome (sidebar, group headers, page titles, field labels, buttons, empty states, `confirm`/alert/toast) is **bilingual** — i18n keys under `admin.*` (primary) or a per-page `const T = {es:{…},en:{…}}[language]`. **No single-language literal anywhere in admin chrome.** Manifest labels are `BiLabel`.
- **Admin-safe language toggle:** add a guard at the top of the shared `setLanguage` — when `location.startsWith("/admin")`, set+persist language **in place and return** (no navigate, no page animation). Bilingual content editors always show both es+en regardless; only chrome+preview language flips. (Audit note: current `setLanguage` is already in-place, so this is trivially satisfied — just keep it that way after adding the public language-switch animation in Phase 1.)

### 2.8 Media library + MediaPicker

- `src/content/media.json` registry; `src/lib/media.ts` resolvers (`resolveAssetUrl`/`resolveMediaUrl`/`mediaRef` empty-string-aware/`absoluteAssetUrl`); `src/lib/media-upload.ts` (`uploadToLibrary` via data URL → `/__local/asset`, `addExternalToLibrary`, `removeFromLibrary`).
- `MediaPage` (grid + upload/URL). `MediaPicker` field (preview thumb + Select/Change button + Clear + raw-ref input; modal with Add card (dropzone + URL) + gallery grid, current ref ring-highlighted). Wired into EVERY image field: catalog gallery refs, branding `logoUrl`/`logoUrlDark`/`logoMark`/`faviconUrl`, `seo.ogImage`.
- **Seed** existing images as `media.json` items: nav logos + `/logo.jpg` + favicon + `opengraph.jpg` (`source:"local"`), picsum gallery URLs (`source:"external"`).

### 2.9 Site Identity (multi-file page, Pattern 3)

`BrandingPage` at `/admin/identity` edits `branding.json` + `themes.json` together: two drafts, `dirty=bDirty||tDirty`, ONE editor registration whose `save` writes both files; live preview (`applyBrandTheme` on each theme edit, re-apply saved on unmount). Theme cards rename/activate/duplicate/delete with exactly one `isActive`. Asset fields = `MediaPicker`; colors = `ColorField`. `src/lib/brand-theme.ts` (`hexToHsl`, `applyBrandTheme` writes a managed `<style id="brand-theme">` scoping semantic light-mode tokens to `:root:not(.dark)`, `applyFavicon`, `initBrand()` from `main.tsx`). **Move the gold-rgba tokens** (`--button-outline`/`--badge-outline`/`--elevate-1/2`) onto `hsl(var(--primary)/α)` so a palette swap doesn't visibly break (audit HIGH-risk item).

### 2.10 Platform pages

- `DashboardPage` (`/admin/dashboard`) — stat cards per collection + new-messages preview + content overview.
- `DiagnosticsPage` (`/admin/diagnostics`) — health banner + content checks + system info + paginated commits via `fetchGitLog`.
- `ContentExplorerPage` (`/admin/content-explorer`) — two-column master-detail; LEFT = file list (entity icon + **localized dashboard name** via manifest `label[lang]` + raw filename muted monospace subtitle, default-select first); RIGHT = recursive collapsible `JsonNode` tree of the live slice.
- `InventoryPage` (`/admin/inventory`) — interactive pan/zoom SVG dependency graph (columns data→logic→UI, category chips toggle visibility, search, click-node neighborhood highlight, detail panel, **non-passive wheel-zoom**, **Fullscreen API** toggle). Backed by `src/content/inventory.json` produced by `scripts/build-inventory.mjs` (`pnpm --filter @workspace/construction-site run inventory`).

### 2.11 Pattern-per-entity (the 7 patterns mapped)

- **Pattern 1 (singleton draft):** home, contactContent, financiamiento, notFound, seo, navigation. (catalog/lots/providers title+subtitle are singleton fields embedded in those pages.)
- **Pattern 2 (list-editor table-or-cards):** catalog (models), lots (items), providers (items) — array + row list + bilingual modal form; catalog/lots use cards, providers a table (builder choice).
- **Pattern 3 (multi-file identity):** Site Identity (branding+themes).
- **Pattern 4 (media):** MediaPage.
- **Pattern 5 (translations key-table):** TranslationsPage (es.json/en.json).
- **Pattern 6 (contact triage):** Messages page (localStorage inbox; replaces the fake-`setTimeout` submit with `addContactMessage`).
- **Pattern 7 (status & tooling):** Dashboard, Diagnostics, Content Explorer, Content Versions, Inventory.

---

## 3. plain → `Localized{es,en}` migration (tolerant resolver first)

Lots/Providers/Contact are currently **English-only hardcoded** (ignore `translations.ts` entirely); Home/Catalog/Financiamiento use **bilingual ternaries / `{es,en}` module arrays**; `siteData.ts` stores `houseModels[].{name,description}`, `lots[].{name,description,location}`, `corporate.{mission,vision,about}`, provider `description`/`materials` as **single-language plain strings**. Convert behind a tolerant resolver so partially-migrated content keeps rendering at every step:

1. **Introduce the resolver FIRST** — `src/lib/localized.ts`: `type Localized = { es: string; en: string }`; `resolveLocalized(v: string | Localized | undefined, lang): string` that accepts BOTH shapes (`typeof v === "string" ? v : v?.[lang] ?? v?.es ?? "")`. Public components call this everywhere a field may be plain-or-localized. Nothing breaks while data is mid-migration.
2. **Migrate the data** — seed each `src/content/<page>.json` with the exact current copy as `{es,en}`. For English-only pages (Lots/Providers/Contact), seed `en` from current text and supply `es` (faithful translation, preserve proper names, URLs, rich-text tokens, placeholders). For bilingual-ternary pages, lift both sides directly. **Idempotent seed scripts** (migrator agent) so re-runs don't double-translate.
3. **Flip the types** — change repository element types from `string` to `Localized`; let `tsc` enumerate every missed consumer (the typecheck gate at each phase end surfaces them).
4. **Flip the consumers** — replace ternaries / plain reads with `resolveLocalized(field, lang)` (or `field[lang] ?? field.es`). Land migration + types + consumers for ONE page as a coherent step, per phase.

**Architect decisions adopted (audit §6):** lot/model `name` + lot `location` stay **plain proper-noun strings** (not localized); provider `materials` are **per-item `{es,en}`**; mission/vision **labels** are chrome, **values** are content; the shared tagline (Home hero subtitle ≡ Financiamiento tagline) is one `{es,en}` field referenced by both (keep in `company`/`contact.json`). Subject-enum bridge: resolver maps schema `house_model` → i18n key `model`.

---

## 4. Dev-only local-CMS Vite plugin

- `artifacts/construction-site/vite-plugin-local-cms.ts`, registered in `vite.config.ts` with **`apply: "serve"`** so it exists ONLY on the dev server and is **never in the GH Pages prod build**. Localhost-only (reject non-local `host`), JSON/asset name whitelists, `ASSET_DIRS` allowlist, `safe()` path guard (no traversal), 25 MB cap.
- Endpoints (exact contract): `POST /__local/content {filename,data}` (routes `es.json`/`en.json` → `src/translations/`, else → `src/content/`); `POST /__local/asset {filename,dataUrl,dir?}` → `public/` or `public/media/`; `POST /__local/publish` (git add 3 dirs → commit → push current branch; `nothingToPublish` when nothing staged); `GET /__local/git-status`; `GET /__local/git-log?skip=&limit=`.
- Browser client `src/lib/local-cms.ts` — `LOCAL_CMS_ENABLED = import.meta.env.DEV`; thin fetch wrappers `saveContentFile`/`uploadAsset`/`publishChanges`/`fetchGitStatus`/`fetchGitLog`, all returning falsy in non-dev so callers fall back to browser download.
- **Git cwd is the repo root**, not the package dir — the plugin's `root` is the package, but git discovers the monorepo repo from there; publish stages `src/content`, `src/translations`, `public` (relative to the package). Confirm Publish commits land on `main` (the deploy branch).

---

## 5. Local-run scripts (deviation #4) — WITH Windows workaround

Repo-root scripts so the user can run the site and TEST the admin. Dev server must run with `VITE_ENABLE_ADMIN=true` (or just `DEV`, which already enables admin) + the required `PORT`/`BASE_PATH`.

- `scripts/dxp/reboot-server.sh` — free the dev port, clear `node_modules/.vite`, launch detached to `logs/dxp.log` with `PORT=8080 BASE_PATH=/ VITE_ENABLE_ADMIN=true pnpm --filter @workspace/construction-site dev`. Export `MSYS_NO_PATHCONV=1` on Git-Bash so `BASE_PATH=/` isn't path-mangled.
- `scripts/dxp/view-logs.sh` — `tail -f logs/dxp.log`.
- `scripts/dxp/stop-server.sh` — kill whatever listens on `PORT`.

### 5.1 Windows dev workaround (REQUIRED — otherwise admin can't be tested)

`pnpm-workspace.yaml` `overrides` set every win32/darwin rollup, esbuild, lightningcss, and `@tailwindcss/oxide` native binary to `"-"`, so `vite dev`/`build` fail on this Windows host with a missing-native-binary error. The scripts MUST document and provide ONE of these (recommend **A** for lowest blast radius; both keep CI linux-only intact):

- **A — dev-only local override file (recommended).** Ship `pnpm-workspace.dev-win.yaml` (or a documented `.npmrc`/local `overrides` patch) that re-enables ONLY the host's binaries — `@rollup/rollup-win32-x64-msvc`, `@esbuild/win32-x64` (note `esbuild` is pinned to `0.27.3`), `lightningcss-win32-x64-msvc`, `@tailwindcss/oxide-win32-x64-msvc` — then `pnpm install`. **Never commit this to the lockfile that CI uses**; the script restores the canonical workspace file after. Document as "Windows local dev only".
- **B — run via WSL.** Run the scripts inside WSL (linux-x64), where the existing linux binaries already resolve — no override change. Document the `wsl pnpm …` invocation.
- **C — temporary `minimumReleaseAgeExclude` is NOT the issue** (release age isn't the blocker) — call this out so nobody disables the supply-chain guard by mistake.

Each script's header comments must state the constraint and the chosen workaround, so the user can actually reach `http://localhost:8080/admin`.

---

## 6. SEO

- `src/content/seo.json` (`siteUrl`, `defaultTitle/Description {es,en}`, `ogImage`, optional `googleAnalyticsId`, `pages` per route `{es,en}{title,description}`) + `SeoPage` (Pattern 1, the four pieces).
- `src/lib/seo.ts` — `resolveSeo(route, lang)` + `useHeadTags(...)` runtime head tags (title/description/canonical/hreflang) updating on SPA navigation; applied in pages + 404 (404 → noindex).
- `scripts/prerender.mjs` (run after `vite build`, wired into the `build` script) — per **language × route** writes `dist/public/<lang>/<slug>/index.html` (title/desc/canonical/hreflang+x-default/OG/Twitter/`<html lang>`/JSON-LD) + `sitemap.xml` (hreflang alternates) + root `index.html` canonical to default lang + **noindex `404.html`**. `ROUTES` list kept in sync with the router. **Note:** prerender runs in CI (linux), so the Windows native-binary constraint does not block it — but local prerender testing needs the §5.1 workaround.
- `public/robots.txt` — add a `Sitemap: https://v-e.jcampos.dev/sitemap.xml` line (currently only `User-agent: * / Allow: /`).
- Wouter currently has flat routes (no `/es`/`/en` prefix); since `setLanguage` is in-place, language-prefixed public URLs are a SEO-layer addition (architect note: prerender per-lang dirs even if the SPA stays flat — runtime head tags handle the live language).

---

## 7. Admin tree-shake gate verification

After the admin exists and before "done": run a **prod build with `VITE_ENABLE_ADMIN` unset**, then verify `dist/public` ships **ZERO** `/admin` code:
- `ADMIN_ENABLED` folds to literal `false` → `AdminRouter`, all admin pages/components/`admin-ui.ts` are tree-shaken.
- Grep `dist/public/assets/*.js` for `AdminLayout`/`AdminSidebar`/`/admin/dashboard`/`admin-ui` — must be **no hits**.
- The `/admin` route is not registered (404 on hard refresh) and the Navbar/Footer admin entry is absent.
- The local-CMS plugin (`apply:"serve"`) is absent from the build by construction.
- Dev build (or `VITE_ENABLE_ADMIN=true`) shows the full panel.

(The deploy workflow already leaves `VITE_ENABLE_ADMIN` unset — keep it that way; do not add it to the workflow env.)

---

## 8. Phased, ordered build sequence

Each phase lists files to create/modify and **ENDS** with the gate `pnpm --filter @workspace/construction-site typecheck` passing. Public render stays identical through the content phases (source of text/assets moves; no redesign). Because typecheck doesn't need native binaries, the gate runs on Windows even while `vite dev` needs the §5.1 workaround.

### Phase 1 — Shared foundation + Home end-to-end (proves the four-pieces rule)

**Goal:** stand up all DXP machinery with zero public visual change, plus ONE full example page (Home) proving JSON → repository → service/singleton → component + the four admin pieces.

Create:
- `src/lib/admin-enabled.ts` (gate); `src/lib/localized.ts` (tolerant resolver); `src/lib/icons.ts` (`ICONS`/`resolveIcon`/`ICON_NAMES`); `src/lib/rich-text.tsx` (`parseRichText`/`RichText`/`RICH_TEXT_HINT`, theme-token highlights); `src/lib/motion.ts` (shared `fadeUp`/`staggerContainer`).
- `src/lib/admin-store.ts` (Zustand content store, slices for home + branding + themes + company/contact + media + seo + navigation + inventory seeded; `downloadJson`, snapshots, `discardEntity`, `useEntityDirty`).
- `src/lib/admin-ui.ts` (transient store + `guardNavigation`).
- `src/lib/admin-manifest.ts` (the `{file,label:BiLabel,route,icon,group,pattern}[]` completeness manifest).
- `src/lib/local-cms.ts` (browser client); `vite-plugin-local-cms.ts` + register in `vite.config.ts` (`apply:"serve"`).
- `src/lib/brand-theme.ts` (`hexToHsl`/`applyBrandTheme`/`applyFavicon`/`initBrand`); `src/lib/media.ts` (resolvers).
- Admin shell: `src/components/admin/{AdminLayout,AdminSidebar,AdminTopbar,AdminRouter,AdminUI,Hint,UnsavedChangesModal,MediaPicker}.tsx`; `PageHeader`/`FloatingSaveButton`/`AdminCard` (in AdminUI).
- Content: `src/content/home.json`, `branding.json`, `themes.json`, `contact.json` (company/contact info), `media.json`, `seo.json`, `navigation.json`, `inventory.json`; translations `src/translations/{es,en}.json` (small chrome set, ~75 keys × 2).
- Repositories: `home.repository.ts`, `branding.repository.ts`, `themes.repository.ts`, `company.repository.ts`, `media.repository.ts`, `seo.repository.ts`, `navigation.repository.ts`, `inventory.repository.ts`.
- Admin pages (Home + the platform/identity scaffolds needed for a coherent shell): `HomePage`, `BrandingPage` (identity), `MediaPage`, `SeoPage`, `NavigationPage`, `ContactInfoPage`, `DashboardPage`, `ContentVersionsPage` (Home + shared rows), plus stub routes for Diagnostics/ContentExplorer/Inventory.
- Scripts: `scripts/build-inventory.mjs`; `scripts/prerender.mjs` (skeleton); `scripts/dxp/{reboot-server,view-logs,stop-server}.sh` + **Windows workaround file/doc (§5.1)**.
- `src/lib/i18n.ts` (init from translations) — or keep `LanguageContext` and back it with the small JSON; add the admin-safe `setLanguage` guard + `.theme-transition`/`.lang-anim-*`/theme-aware-scrollbar CSS in `index.css`; give `<main>`/Layout `id="page-content"`.

Modify:
- `App.tsx` — remove `Admin` import+route; register `{ADMIN_ENABLED && <Route path="/admin/:rest*" component={AdminRouter}/>}`; keep one root `TooltipProvider`.
- `main.tsx` — call `initBrand()`.
- `Navbar.tsx`/`Footer.tsx` — gate the admin entry; read logos from `branding` via `resolveAssetUrl`; nav from `navigation.json`.
- `Home.tsx` — read `home.json` via repository + `resolveLocalized`/`resolveIcon`/`parseRichText`; WhatsApp/phones from `contact.json`.
- Standardize storage keys to `ve-*` (from `aurea_*`/`vye_*`).
- **Delete** `src/pages/Admin.tsx` and `src/contexts/SiteDataContext.tsx` once Home no longer needs it (or keep SiteDataContext until later pages migrate — architect choice: keep until Phase 7, public pages still read it through a shim).

**Gate:** `pnpm --filter @workspace/construction-site typecheck` passes; (locally, via §5.1) dev server shows `/admin/dashboard` + `/admin/home`, editing Home → Save writes `src/content/home.json`.

### Phase 2 — Catalog page

**Goal:** Catalog content-driven + list-editor admin (Pattern 2).
Create: `src/content/catalog.json`; `catalog.repository.ts`; `catalog.service.ts` (gallery filter/sort, room/category enums); admin `CatalogPage`. Add manifest row (gives sidebar+route+versions). Modify `Catalog.tsx` to read repository/service + resolver + MediaPicker-backed gallery refs; migrate `houseModels` plain→`Localized`. Regenerate `inventory.json`.
**Gate:** typecheck passes.

### Phase 3 — Lots page

**Goal:** Lots content-driven (English-only → bilingual) + list-editor.
Create: `src/content/lots.json` (seed es + supply en); `lots.repository.ts`; `lots.service.ts` (province/canton/district/min-size filters — fix the "max size" mislabel); admin `LotsPage` (`available` Toggle, currency Select). Manifest row. Modify `Lots.tsx` to read repo/service + chrome filters (wire the unused `translations.lots.*`). Regenerate inventory.
**Gate:** typecheck passes.

### Phase 4 — Providers page

**Goal:** Providers content-driven (English-only → bilingual) + list-editor.
Create: `src/content/providers.json`; `providers.repository.ts`; admin `ProvidersPage` (per-item `materials` as `{es,en}`). Manifest row. Modify `Providers.tsx`. Regenerate inventory.
**Gate:** typecheck passes.

### Phase 5 — Contact page + triage

**Goal:** Contact intro content-driven; form chrome → i18n; real message inbox.
Create: `src/content/contact.json` (intro only — page content); admin `ContactContentPage` (Pattern 1) + `MessagesPage` (Pattern 6, localStorage inbox). Manifest rows. Modify `Contact.tsx`: intro from content; labels/placeholders/validation/toast → chrome; subject-enum bridge (`house_model`→`model`); replace fake `setTimeout` with `addContactMessage`. Model/lot dropdowns derived from `catalog.json`+`lots.json`. Regenerate inventory.
**Gate:** typecheck passes.

### Phase 6 — Financiamiento page

**Goal:** Financiamiento content-driven; kill hardcoded phones/email drift.
Create: `src/content/financiamiento.json` (options/projectTypes/turnkey/cta arrays as `{es,en}` + iconName tokens); `financiamiento.repository.ts`; admin `FinanciamientoPage` (Pattern 1, arrays via BilingualSection). Manifest row. Modify `Financiamiento.tsx`: read content + `resolveIcon`; phones/email/whatsapp from `contact.json`. Regenerate inventory.
**Gate:** typecheck passes.

### Phase 7 — Not-Found page + retire siteData

**Goal:** 404 content-driven + token colors; remove the legacy data blob.
Create: `src/content/notFound.json`; `notfound.repository.ts`; admin `NotFoundPage`. Manifest row. Modify `not-found.tsx`: content + `resolveIcon`; replace `gray-*`/`red-500` with `bg-background`/`text-foreground`/`text-muted-foreground`/`text-destructive`. **Delete `src/data/siteData.ts` + `SiteDataContext.tsx`** once no page reads them. Regenerate inventory.
**Gate:** typecheck passes.

### Phase 8 — Platform tooling + translations + media completion

**Goal:** finish the self-describing panel + chrome editor.
Create/finish: `TranslationsPage` (Pattern 5, ES|EN key-table, live-preview, export both sides); `DiagnosticsPage` (git-log); `ContentExplorerPage` (master-detail JSON tree); `InventoryPage` (pan/zoom graph). Complete `MediaPage`/`MediaPicker` wiring across all image fields; seed all existing images into `media.json`. Finalize `ContentVersionsPage` (all rows). Regenerate inventory.
**Gate:** typecheck passes.

### Phase 9 — SEO + deploy + verification

**Goal:** SEO prerender, runtime head tags, robots, tree-shake proof.
Finish `scripts/prerender.mjs` (per-lang×route + sitemap + noindex 404), wire into `build` script; `src/lib/seo.ts` head tags in all pages; add `Sitemap:` to `robots.txt`. Confirm deploy workflow leaves `VITE_ENABLE_ADMIN` unset; copy `index.html`→`404.html` without clobbering noindex. **Run the tree-shake verification (§7).** Rewrite root/site `CLAUDE.md` for the DXP shape. Regenerate inventory.
**Gate:** typecheck passes + tree-shake grep clean + (CI) prod build emits prerendered HTML.

---

## 9. Coverage checklist — every skill-feature-matrix row → phase

| Feature (audit §4) | Phase |
|---|---|
| Admin gate folds to constant (`ADMIN_ENABLED`) | 1 |
| Prod build tree-shakes `/admin` | 9 (verify) |
| Admin has NO auth (drop PIN) | 1 |
| `BASE_PATH` env required | present (1, keep) |
| pnpm workspace + only-allow + minimumReleaseAge | present |
| 100% static / no runtime backend | 1→7 (move siteData→JSON) |
| Per-entity content JSON | 1 (home) → 2–7 (rest) |
| Localized `{es,en}` per field | 1–7 (resolver) |
| Fixed chrome → small i18n file | 1 (set) + 8 (TranslationsPage) |
| Repository layer | 1 (home) → 2–7 |
| Service layer (filter/sort) | 2 (catalog), 3 (lots) |
| Public components read-only consumers | 1–7 |
| Icon registry | 1 |
| Rich-text module | 1 |
| No bilingual ternaries | 1–7 |
| Localized routing `/<lang>/<slug>` | 9 (SEO prerender per-lang) |
| Zustand content store + setters | 1 |
| Dirty snapshots / `useEntityDirty` / `markSaved` / `discardEntity` | 1 |
| `downloadJson` single save entry | 1 |
| Separate `admin-ui` store | 1 |
| Bilingual editing primitives | 1 |
| Shared primitives (TextField/Toggle/ColorField/SelectField) | 1 |
| Token/enum fields render as SelectField | 1 (kit) + per page 2–6 |
| On-device auto-translate | 1 (optional, in AdminUI) |
| AdminLayout / collapsible grouped sidebar / topbar | 1 |
| Publish flow state machine | 1 |
| Topbar Sun/Moon via shared `useDarkMode` | 1 |
| Admin-safe in-place language toggle | 1 |
| Bilingual admin chrome | 1 (and every admin page) |
| PageHeader / FloatingSaveButton / AdminCard | 1 |
| Hand-rolled modal convention | 1 |
| Styled `Hint` tooltips (verify portal) | 1 |
| Unsaved-changes nav guard | 1 |
| 7 admin page patterns | 1 (1,3,4,7), 2–6 (2), 5 (6), 8 (5) |
| Site Identity page (branding+themes, live preview) | 1 |
| `themes.json` + `brand-theme.ts` + `initBrand()` | 1 |
| HSL tokens under `@theme inline` | present |
| `--sidebar*` family both modes | present |
| Flag language indicator | present (reuse in topbar, 1) |
| Theme dark/light control | present |
| `.theme-transition` / `.lang-anim-*` / theme-aware scrollbars | 1 |
| Media library (`media.json` + resolvers + MediaPicker + media-upload) | 1 (core) + 8 (full wiring/seed) |
| Local-CMS Vite plugin + 5 endpoints + client | 1 |
| Editable `seo.json` + SeoPage | 1 (page) + 9 (prerender) |
| Prerender script (per-lang×route + sitemap + noindex 404) | 9 |
| Runtime head tags (`useHeadTags`) | 9 |
| robots.txt references sitemap | 9 |
| Deploy workflow leaves `VITE_ENABLE_ADMIN` unset | present (keep, 9 verify) |
| Four-pieces completeness manifest | 1 |
| ContentVersionsPage | 1 (seed) + 8 (all rows) |
| Dashboard / Diagnostics / Content Explorer | 1 (Dashboard) + 8 (rest) |
| `inventory.json` + build script + InventoryPage | 1 (script+json) + 8 (page) |
| AdminRouter (redirect if `!ADMIN_ENABLED`) | 1 |
| Project `CLAUDE.md` documents DXP rules | 9 |
| Hardcoded colors (NotFound, scrims, gold-rgba) | 1 (gold-rgba), 7 (NotFound) |
| Local-run start/reboot/logs scripts + Windows workaround | 1 |

Every matrix row maps to a phase — nothing is dropped.

---

## 10. Risks / decisions to confirm with the user

1. **Windows native-binary blocker (highest).** `vite dev`/`build` cannot run on this host until the §5.1 workaround is applied. **Confirm:** approach A (uncommitted local override re-enabling win32 binaries) vs B (run via WSL). Whichever — the canonical lockfile/workspace that CI consumes must stay linux-only, and the supply-chain `minimumReleaseAge` guard must NOT be disabled.
2. **plain→`Localized` Spanish copy quality.** Lots/Providers/Contact are English-only; seeding requires writing real Spanish. Confirm whether the user supplies the ES copy or accepts machine-translated seeds (flagged for review). Proper nouns (lot/model names, provider brands, geo) stay plain per audit §6 — confirm.
3. **Language-prefixed URLs vs in-place toggle.** SEO wants `/<lang>/<slug>` prerendered routes, but the SPA currently toggles language in place (no URL prefix) — which is what makes the admin-safe toggle trivial. Recommendation: prerender per-language dirs for crawlers while keeping the SPA flat + runtime head tags. Confirm this split is acceptable, or commit to full URL-prefixed routing (larger wouter change).
4. **`siteData.ts` retirement timing.** Plan keeps it as a shim until Phase 7. Confirm public pages may read content JSON directly (dropping `SiteDataContext`/localStorage hydration) rather than preserving the old runtime-editable-localStorage behavior.
5. **Shared tagline & company entity placement.** Audit §6 recommends one shared `{es,en}` tagline + company about/mission/vision in `contact.json`/`company` referenced by Home + Financiamiento + Footer. Confirm the home page owns about/mission/vision (vs a separate company entity).
