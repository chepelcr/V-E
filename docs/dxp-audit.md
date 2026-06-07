# DXP Retrofit Audit — V&E Construction Site

**Target:** `E:/dev/V-E/artifacts/construction-site` (React 19 + Vite 7 + TS + Tailwind v4 + wouter, bilingual es/en).
**Governing skill:** `landing-dxp-builder`. **Mode:** RETROFIT EXISTING.
**Synthesis of 5 audit slices:** pages-a (Home/Catalog/Lots/Financiamiento), pages-b (Providers/Contact/NotFound), chrome (layout/translations/contexts/old-admin), styling (tokens/themes/marble/animations), coverage (skill-feature matrix).

This document is **analysis + planning only** — no code is produced beyond this file. It honors the project-specific deviations: per-page content JSON (#1), bilingual `{es,en}` content fields (#2), discard + rebuild `/admin` (#3), preserve marble bg / glass tokens / theme-aware logos (#4).

---

## 0. Headline findings (cross-slice)

1. **The repo is a working pre-DXP landing site, not a DXP.** Strong foundations exist (Tailwind v4 `@theme inline` HSL tokens incl. full `--sidebar*` family, bilingual i18n data, theme-aware glass surfaces over marble, flag toggle, GH Pages workflow). **None of the DXP machinery exists** (no admin gate, no content/repository/service layer, no Zustand store, no admin shell/7 patterns, no local-CMS, no media library, no SEO prerender, no inventory).
2. **Admin invariant is violated today.** `Admin.tsx` is PIN-gated (`'1234'`) and ships in production — `App.tsx` registers `/admin` unconditionally and `Footer.tsx` links to it unconditionally. Must be discarded (deviation #3) and replaced by a build-time `ADMIN_ENABLED` tree-shake gate.
3. **No-hardcoded-text is broadly unmet.** Home & Financiamiento are ~34 bilingual ternaries + module-level `{es,en}` arrays; **Lots, Providers, Contact are fully English-only hardcoded and ignore the existing `translations.ts` entirely** (dead i18n data). NotFound uses raw `gray-*`/`red-500` palette colors (not dark-aware).
4. **Content is not yet bilingual at the data layer.** `siteData.ts` stores `houseModels[].{name,description}`, `lots[].{name,description,location}`, `corporate.{mission,vision,about}`, provider `description`/`materials` as **single-language plain strings**. This is a plain→`Localized {es,en}` migration that must land behind a tolerant resolver (architect/migrator).
5. **Branding/identity is hardcoded, not content-driven.** Three different logo assets (`nav-light.png`, `nav-dark.png`, `/logo.jpg`), favicon duplication, company name/tagline, and the entire color palette live in components/CSS/`index.html`. No `branding.json` / `themes.json` / media library.
6. **Cross-page data ownership must be ratified.** Several `siteData` fields are multi-page-shared (company identity, contact info) and must NOT be duplicated into each page JSON — they become shared entities (`branding.json`, `contact.json`/company entity) that pages *reference*.

---

## 1. Per-page captured-content inventory + proposed content JSON shapes

All localized fields are `{ "es": "…", "en": "…" }`. Brand names, URLs, emails, geo proper nouns, and enum tokens stay plain strings. Each page's editable copy lives in its OWN content JSON, edited by its OWN admin page (deviation #1). Shared identity/contact data is referenced, not copied.

### 1.1 `home` → `src/content/home.json`

Source: `src/pages/Home.tsx`. ~20 bilingual ternaries + 3 module arrays (`financialServices`, `constructionServices`, `values`). Icons imported directly from lucide. References shared company/branding/contact entities for `companyName`, `about`, `mission`, `vision`, phones, email.

| Captured field | Source (Home.tsx) | Type | Notes |
|---|---|---|---|
| `hero.subtitle` | :80-82 ternary | localized | **Duplicate** of Financiamiento bottom tagline — see §6 shared `company.tagline` decision |
| `hero.primaryCtaHref` / `secondaryCtaHref` | :86, hrefs | plain (route) | labels = chrome (`actions.viewFinancing`, `actions.contactNow`) |
| `hero.primaryCtaIconName` | :88 `arrow-right` | icon token | |
| `about.eyebrow` / `about.heading` | :114-119 | localized | body = shared `company.about` (referenced) |
| `services.eyebrow` / `services.heading` | :168-173 | localized | |
| `services.bulletIconName` | `CheckCircle2` | icon token | `check-circle` |
| `services.financial.{iconName,title,items[]}` | :13-28, :186-198 | icon + localized + localized list | iconName `trending-up`; 5 items |
| `services.construction.{iconName,title,items[]}` | :30-45, :206-218 | icon + localized + localized list | iconName `hard-hat`; 5 items |
| `values[]` `{iconName,label}` | :47-51, :234-251 | icon + localized | `shield-check`/Confianza, `handshake`/Compromiso, `star`/Experiencia |
| `cta.eyebrow` / `cta.heading` / `cta.body` | :264-273 | localized | `cta.body` near-dup of Financiamiento CTA body (keep separate) |
| `cta.whatsappIconName`, `cta.financingCtaHref` | :277, :286 | icon + route | WhatsApp link built from `contact.phones[0]` + `countryCode` |

```jsonc
{
  "hero": { "subtitle": {"es":"…","en":"…"}, "primaryCtaIconName": "arrow-right",
            "primaryCtaHref": "/financiamiento", "secondaryCtaHref": "/contact" },
  "about": { "eyebrow": {"es":"¿Quiénes Somos?","en":"Who We Are"},
             "heading": {"es":"Especialistas en tu hogar propio","en":"Specialists in home ownership"} },
  "services": {
    "eyebrow": {"es":"Nuestros Servicios","en":"Our Services"},
    "heading": {"es":"Asesoramiento integral para tu proyecto","en":"Comprehensive advisory for your project"},
    "bulletIconName": "check-circle",
    "financial":   { "iconName": "trending-up", "title": {"es":"Asesoramiento Financiero","en":"Financial Advisory"},
                     "items": [ {"es":"…","en":"…"} ] },
    "construction":{ "iconName": "hard-hat", "title": {"es":"Asesoramiento Constructivo","en":"Construction Advisory"},
                     "items": [ {"es":"…","en":"…"} ] }
  },
  "values": [ {"iconName":"shield-check","label":{"es":"Confianza","en":"Trust"}},
              {"iconName":"handshake","label":{"es":"Compromiso","en":"Commitment"}},
              {"iconName":"star","label":{"es":"Experiencia","en":"Experience"}} ],
  "cta": { "eyebrow": {"es":"Hacemos posible tu sueño","en":"We make your dream possible"},
           "heading": {"es":"Tener Casa Propia","en":"Home Ownership"},
           "body": {"es":"…","en":"…"}, "whatsappIconName": "phone", "financingCtaHref": "/financiamiento" }
}
```

### 1.2 `catalog` → `src/content/catalog.json`

Source: `src/pages/Catalog.tsx` + `siteData.houseModels[]`. Best-behaved page (uses `t.catalog.*`), but `title`/`subtitle` **reclassified from chrome to page content** (editor-managed marketing copy). `model.name`/`description`/gallery `caption` migrate to `{es,en}`. Gallery images become media refs.

| Captured field | Source | Type | Notes |
|---|---|---|---|
| `title` / `subtitle` | Catalog.tsx :64-67 (was `t.catalog`) | localized | reclassified to content |
| `models[].name` / `description` | houseModels | localized (migrate) | currently plain |
| `models[].price` / `area` / `bedrooms` / `bathrooms` | houseModels | number | |
| `models[].currency` | houseModels | enum token | USD/CRC → SelectField |
| `models[].status` | (optional, mirrors lot availability) | enum token | optional |
| `models[].gallery[].ref` | `gallery[].url` (picsum) | media ref | seed as `source:"external"` in media.json |
| `models[].gallery[].category` | `interior`/`exterior` | enum token | SelectField; drives badge |
| `models[].gallery[].room` | facade/gate/garden/patio/living_room/kitchen/bedroom/bathroom | enum token | SelectField; labels = chrome `rooms.*` |
| `models[].gallery[].caption` | `img.caption` | localized (migrate) | |

```jsonc
{
  "title": {"es":"Modelos de Casas","en":"House Models"},
  "subtitle": {"es":"…","en":"…"},
  "models": [ {
    "id":"hm-1", "name":{"es":"Villa Dorada","en":"Villa Dorada"}, "description":{"es":"…","en":"…"},
    "price":350000, "currency":"USD", "area":280, "bedrooms":4, "bathrooms":4.5,
    "gallery":[ {"ref":"…","category":"exterior","room":"facade","caption":{"es":"Fachada Frontal","en":"Front Elevation"}} ]
  } ]
}
```

Shared chrome retained: `beds`/`baths`, `all`/`interior`/`exterior`, `noImages`, `rooms.*`. `measurementUnit` referenced from shared config/branding.

### 1.3 `lots` → `src/content/lots.json`

Source: `src/pages/Lots.tsx` (**fully English-only, no i18n imported**) + `siteData.lots[]`. Title/subtitle become localized content. `description` migrates to `{es,en}`. `name`/`location` are proper nouns — **architect to ratify** whether localized or protected single-string (recommendation: single-string proper nouns).

| Captured field | Source | Type | Notes |
|---|---|---|---|
| `title` / `subtitle` | :52-55 | localized | supply ES (currently English-only) |
| `items[].name` | `lot.name` | plain proper noun (ratify) | |
| `items[].location` `{province,canton,district}` | `lot.location.*` | plain geo proper nouns | |
| `items[].size` / `price` | | number | |
| `items[].currency` | | enum token | USD/CRC |
| `items[].description` | `lot.description` | localized (migrate) | |
| `items[].available` | `lot.available` | boolean | **Toggle**, not Select |
| `items[].modelCompatible[]` | ids | id list | |

```jsonc
{
  "title": {"es":"Lotes Premium","en":"Prime Lots"},
  "subtitle": {"es":"…","en":"…"},
  "items": [ {
    "id":"l-1", "name":"Altos del Valle",
    "location":{"province":"San José","canton":"Escazú","district":"San Antonio"},
    "size":850, "price":120000, "currency":"USD",
    "description":{"es":"…","en":"…"}, "available":true, "modelCompatible":["hm-1","hm-2"]
  } ]
}
```

Shared chrome (already in `translations.ts` `lots.*` but **unused by the page** — a live gap): `filterProvince/Canton/District`, `filterSize` (currently mislabeled "Max size" while UI filters **min** — fix), `allProvinces/Cantons/Districts`, `unavailable` ("Sold"), `noResults`, new `sizePlaceholder`.

### 1.4 `providers` → `src/content/providers.json`

Source: `src/pages/Providers.tsx` (**fully English-only**) + `siteData.providers[]`. `name` is a brand proper noun (plain). `description` and `materials[]` migrate to `{es,en}` (today English-only — a bilingual gap).

| Captured field | Source | Type | Notes |
|---|---|---|---|
| `intro.title` / `intro.subtitle` | :15-18 | localized | supersedes the unused `translations.providers.title/subtitle` |
| `items[].name` | `provider.name` | plain brand name | |
| `items[].description` | `provider.description` | localized (migrate) | |
| `items[].materials[]` | `provider.materials` chips | localized array (migrate) | recommend per-item `{es,en}` |
| `items[].website` / `contact` | | plain (optional URL/email) | |

```jsonc
{
  "intro": { "title":{"es":"Nuestros Socios","en":"Our Partners"}, "subtitle":{"es":"…","en":"…"} },
  "items": [ {
    "id":"p-1", "name":"Lumina Glass", "description":{"es":"…","en":"…"},
    "materials":[ {"es":"Vidrio","en":"Glass"} ], "website":"", "contact":"contact@luminaglass.cr"
  } ]
}
```

Shared chrome: `materials`, `website`, `contact` labels (`t("providers.*")`, already present).

### 1.5 `contact` → `src/content/contact.json`

Source: `src/pages/Contact.tsx` (**fully English-only, inline zod messages**). Only the page-specific heading copy lives here; the **entire form (labels, placeholders, validation, toast, buttons, select option labels) is shared chrome**. Model/lot dropdown options are derived cross-entity from `catalog.json` + `lots.json`.

| Captured field | Source | Type | Notes |
|---|---|---|---|
| `intro.title` / `intro.subtitle` | :65-68 | localized | only page content |
| (optional) `success.title` / `success.message` | :50-51 toast | localized | OR keep as chrome (recommended: chrome) |

```jsonc
{ "intro": { "title":{"es":"Contáctenos","en":"Contact Us"},
             "subtitle":{"es":"Inicie la conversación sobre su futuro hogar.","en":"Begin the conversation about your future home."} } }
```

Shared chrome to add/reconcile: `subjectPlaceholder`, `chooseModelPlaceholder`, `chooseLotPlaceholder`, `phoneOptional`, validation `validation.{nameRequired,email,messageMin}`. **Subject enum mapping is fragile:** schema value `house_model` vs i18n key `subjects.model` — the resolver must bridge `house_model → model`.

**Behavioral gap (architect):** submit handler is a fake `setTimeout` toast — does not persist/deliver. The skill's contact pattern expects `addContactMessage(form)` (store → localStorage triage inbox) + optional off-device delivery. Shapes the contact-triage admin page.

### 1.6 `financiamiento` → `src/content/financiamiento.json`

Source: `src/pages/Financiamiento.tsx`. ~14 ternaries + 3 module arrays (`financingOptions` with `titleEs/titleEn/descEs/descEn`, `projectTypes` with `labelEs/labelEn`, `serviceItems` with `{es,en}`). **Hardcodes phones/email inline** (drift bug — must read from shared `contact` entity).

| Captured field | Source | Type | Notes |
|---|---|---|---|
| `title` / `subtitle` | :91-98 | localized | subtitle contains brand name (acceptable inline) |
| `optionsHeading` | :107-110 | localized | hardcoded count "5" couples to array length — keep as copy |
| `options[]` `{iconName,title,description}` | :19-55 | icon + localized + localized | 5 items (credit-card/home/gift/wrench/layers) |
| `projectsDivider` | :146-148 | localized | |
| `projectTypes[]` `{iconName,label}` | :57-66 | icon + localized | 8 items |
| `turnkey.heading` / `body` | :188-195 | localized | |
| `turnkey.bulletIconName` / `items[]` | :68-75, :197-204 | icon + localized list | 6 items |
| `cta.heading` / `body` | :217-224 | localized | |
| `tagline` | :280-282 | localized | **exact dup of Home hero subtitle** — see §6 |

Shared chrome: `contact.phone`, `contact.email`, `contact.whatsapp`. Shared content: phones[], email, countryCode from `contact` entity (currently hardcoded `+50685372016`, `+50686692683`, `empresa@constructoravye.com` — drift).

### 1.7 `not-found` → `src/content/notFound.json`

Source: `src/pages/not-found.tsx` (**least DXP-conformant**: raw `gray-*`/`red-500` palette, dev-leftover body copy). Icon `AlertCircle` → registry. Tiny dedicated content file satisfies the per-page model.

```jsonc
{ "iconName": "alert-circle",
  "title": {"es":"404 — Página No Encontrada","en":"404 — Page Not Found"},
  "message": {"es":"La página que busca no existe o fue movida.","en":"The page you are looking for doesn't exist or has moved."} }
```

Colors to fix: `bg-gray-50→bg-background`, `text-gray-900→text-foreground`, `text-gray-600→text-muted-foreground`, `text-red-500→text-destructive`. **SEO note:** 404 must be `noindex` in prerender.

---

## 2. SMALL shared-chrome translations set

Keep ONLY truly-fixed, cross-page UI chrome (button verbs, nav labels, form words, placeholders, closed-enum label dictionaries, a11y labels). Bilingual `{es,en}`. Recommend the skill's `src/translations/{es,en}.json` layout so local-CMS write-back routing + TranslationsPage work unchanged. **`admin.*` namespace (rebuilt admin chrome) is separate.** Page titles/subtitles/success copy are deliberately EXCLUDED (they are per-page content).

| Namespace | Keys |
|---|---|
| `chrome.nav` | home, catalog, casas, lots, financing, providers, contact |
| `chrome.buttons` / `actions` | learnMore, viewDetails, send, sending, clearFilters, close, cancel, confirm, viewFinancing, contactNow |
| `chrome.a11y` | toggleTheme, toggleLanguage, scrollToTop, openMenu, closeMenu |
| `chrome.lang` | es, en (flag aria-labels + code labels) |
| `chrome.footer` | contactHeading, socialHeading, adminPanel, rights, tagline |
| `chrome.social` | facebook, instagram, whatsapp (a11y labels) |
| `chrome.form` | name, email, phone, phoneOptional, subject, message, namePlaceholder, emailPlaceholder, phonePlaceholder, messagePlaceholder, subjectPlaceholder, selectModel, selectLot, chooseModelPlaceholder, chooseLotPlaceholder |
| `chrome.contact.subjects` | general, model, lot (fixed enum; bridge `house_model→model`) |
| `chrome.validation` | nameRequired, email, messageMin |
| `chrome.filters` | province, canton, district, minSize, allProvinces, allCantons, allDistricts, sizePlaceholder |
| `chrome.fields` / `units` | beds, baths, gallery, materials, website, contact, size, location, compatibleModels, price, area, measurementUnit |
| `chrome.gallery` | all, interior, exterior (category chips) |
| `chrome.rooms` | facade, gate, garden, patio, living_room, kitchen, bedroom, bathroom (room enum dictionary) |
| `chrome.status` | available, unavailable (lot status token labels) |
| `chrome.corporate` | mission, vision (section LABELS only; values are content) |
| `chrome.common` | loading, error |

~75 keys × 2 languages. Rationale: every entry is a control word, a11y label, placeholder, or closed-enum label dictionary. Enum dictionaries (rooms, gallery categories, contact subjects, lot status) belong in chrome — they label fixed token sets edited via `SelectField` and reused wherever the enum renders.

**Disposition of the current `translations.ts` (split MIXED keys):** `nav`, `footer.{rights,tagline}`, `common` → clean chrome. `home/catalog/lots/providers/contact` → page titles/subtitles/success→content JSON; field labels/buttons/filters/enum labels→chrome. `admin.*` → **DISCARD** (old admin rebuilt).

**Shared navigation config** (chrome structure, not editorial): the current `siteData.navigation[]` Spanish `label` field is **dead for display** (Navbar overrides via `t.nav.*`); only the ordered path list + the `/catalog`+`/lots` dropdown grouping are load-bearing. Replace string-equality grouping with a `navigation.json` singleton: `[{path, labelKey, group?, children?}]`, testids derived from `path` (not localized label — fixes fragile coupling). Singleton content entity → needs its four pieces.

---

## 3. Styling / animation / theming inventory

### 3.1 Verdict
Token system is **already** Tailwind v4 `@theme inline` + HSL-on-`:root,.dark`/`.light` (skill-compatible, minimal migration). The flag toggle already matches the skill. **Marble bg + glass-panel tokens are PRESERVED (freeze-and-preserve asset).** The concrete things to move into content: 3 logo assets + favicon, the gold-rgba tokens outside the HSL system, and 4 net-new toggle/scrollbar animations.

### 3.2 Where values go

| Current value (file) | Destination | Notes |
|---|---|---|
| `nav-light.png` / `nav-dark.png` (Navbar :108, theme-aware) | `media.json` (local) + `branding.json` `logoUrl`/`logoUrlDark` | theme-aware swap stays; refs come from branding |
| `/logo.jpg` (Footer :39, third distinct asset) | `media.json` + `branding.json` `logoMark` | do NOT conflate with nav logos |
| `favicon.svg` + `index.html` `/logo.jpg` favicon (duplicate) | `media.json` + `branding.json` `faviconUrl` | reconcile two favicon sources |
| `opengraph.jpg` | `media.json` + `seo.json` `ogImage` | SEO slice |
| company name "V&E Asesores", wordmark "V&E", tagline "Asesores en Construcción" | `branding.json` `companyName` / `tagline {es,en}` | tagline currently single-language gap |
| Inter / Playfair Display (`index.css :1`, `--app-font-*`) | `branding.json` `fonts.{sans,serif}` (optional) or freeze | brand decision |
| All `--background/--foreground/--primary/...` HSL triplets (dark `:root,.dark` + `.light`) | `themes.json` `colors` per theme | active palette; dark is default `isActive` |
| `--sidebar*` family (both modes) | `themes.json` or fixed admin chrome | already complete in both blocks |
| **`--button-outline`/`--badge-outline`/`--elevate-1/2` literal gold `rgba(...)`** | re-express as `hsl(var(--primary)/α)` or explicit theme tokens | **HIGH** — only place a palette swap visibly breaks |
| `--panel-alpha` / `--section-alpha` (glass veil over marble) | `themes.json` per-theme `panelAlpha`/`sectionAlpha` (optional) | preserve marble veil tuning |
| `--radius: 0rem`, `html font-size: 17.5px`, `--shadow-*` | `themes.json` scalars (radius, rootFontSize) | low priority |
| House model gallery `picsum` URLs | `media.json` (`source:"external"`) + `catalog.json` refs | content slice |

**NOT media / NOT theme (frozen, decorative-OK):** marble canvas + GLSL color vectors + CSS-fallback gradients (`MarbleBackground.tsx`, `marble/marbleScene.ts`); national-flag SVG fills; social-glyph SVG paths; image scrim overlays (`black/20`, `black/60`).

### 3.3 Marble background — preservation contract
- Keep `MarbleBackground` mounted in `Layout`, `zIndex:-1`, with WebGL fallback + `prefers-reduced-motion`.
- Keep `ThemeContext → handle.setTheme(dark)` crossfade wiring; do **NOT** route marble colors through `themes.json`.
- Preserve `.glass-panel`/`.glass-section`/`.glass-scrim` + `--panel-alpha`/`--section-alpha` (they read over the marble).
- Scope the new `.theme-transition` to `color/background-color/border-color/fill/stroke` only — never `opacity` on the canvas — so it doesn't fight the marble's own `uLight` crossfade.

### 3.4 Animations
**framer-motion in use** (9 files) — page/section reveals stay framer-motion. Extract duplicated/divergent `fadeUp` (Home `:8-11` vs Financiamiento `:10-17`) + `staggerContainer` into a shared `src/lib/motion.ts`. Reuse patterns: scroll-reveal `<Reveal>`, dropdown/mobile-nav motion, card-list stagger (`delay: i*0.1`), accordion expand.

**Net-new toggle animations to ADD (skill `scaffold.md §10`, all MISSING today):**
1. `.theme-transition` class + `@layer base` rule + `prefers-reduced-motion` guard, wired into `ThemeContext.toggleTheme` (~400ms).
2. Layered Sun/Moon cross-fade replacing `Navbar.tsx:156` conditional render (reused in admin topbar).
3. `#page-content` wrapper + `.lang-anim-out/in` keyframes + a guarded `toggleLang` (give `Layout.tsx` `<main>` `id="page-content"`; constant `className` trap applies). Since wouter has no `/es`/`/en` prefix, `setLanguage` switches in place — admin-safe toggle is trivially satisfied.
4. Theme-aware scrollbars (`*` + `::-webkit-scrollbar*` driven by `--muted-foreground`/`--border`).

---

## 4. Skill-feature coverage matrix (Present / Partial / Missing)

| Feature | Skill § | Status | Evidence / Gap |
|---|---|---|---|
| Admin gate folds to constant (`ADMIN_ENABLED`) | scaffold §2 | **Missing** | no `admin-enabled.ts`; `App.tsx:41` registers `/admin` unconditionally |
| Prod build tree-shakes `/admin` | retrofit Ph5 | **Missing** | admin imported+routed unconditionally → ships in prod |
| Admin has NO auth (gate is only protection) | scaffold §2 | **Partial (wrong model)** | `Admin.tsx:19` hardcoded PIN `'1234'` ships |
| `BASE_PATH`-driven base, required env | scaffold §1 | **Present** | `vite.config.ts` throws if unset |
| pnpm workspace + only-allow guard + `minimumReleaseAge` | scaffold §1 | **Present** | root package.json + pnpm-workspace.yaml (1440) |
| 100% static / no runtime backend | invariants | **Present (incidental)** | renders from bundled `siteData.ts`; must move to JSON |
| Per-entity content JSON (`src/content/*.json`) | hard rule / dev#1 | **Missing** | all content in `siteData.ts` blob |
| Localized `{es,en}` per field | dev#2 | **Partial** | many fields single-language; bilingual copy inlined in components |
| Fixed chrome → small i18n file | hard rule | **Partial** | `translations.ts` exists but monolithic + mostly unused by pages |
| Repository layer | scaffold §4 | **Missing** | components read `useSiteData()` context |
| Service layer (filter/sort) | scaffold §4 | **Missing** | filter logic inlined in Lots/Catalog |
| Public components read-only consumers (direct JSON) | scaffold §4 | **Partial** | consume React context seeded from localStorage |
| Icon registry (`resolveIcon`, `ICON_NAMES`) | scaffold §5 | **Missing** | icons imported direct from lucide, bound in component arrays |
| Rich-text module (`rich-text.tsx`) | scaffold §5b | **Missing** | copy is plain strings |
| No bilingual ternaries | hard rule | **Missing (heavily violated)** | Home/Financiamiento/Footer ternaries throughout |
| Localized routing `/<lang>/<slug>` | scaffold §4 / SEO | **Missing** | flat routes; lang from localStorage only |
| Zustand content store (slices + setters) | scaffold §6 | **Missing** | zustand not a dep; state via `SiteDataContext` |
| Dirty snapshots / `useEntityDirty` / `markSaved` / `discardEntity` | scaffold §6 | **Missing** | none |
| `downloadJson` single save entry | scaffold §6 | **Partial (primitive)** | `SiteDataContext.exportJSON` = crude full-blob download |
| Separate `admin-ui` store | scaffold §8 | **Missing** | none |
| Bilingual editing primitives (`BilingualField` etc.) | scaffold §7 | **Missing** | old admin edits single-language via plain Input |
| Shared primitives (`TextField`/`Toggle`/`ColorField`/`SelectField`) | scaffold §7 | **Missing** | raw shadcn Input |
| Token/enum fields render as `SelectField` | admin-shell | **Missing** | n/a (no admin); enums exist in data |
| On-device auto-translate | scaffold §7 | **Missing** | optional but prescribed |
| `AdminLayout` / collapsible grouped sidebar / topbar | admin-shell | **Missing** | old admin is a plain centered page |
| Publish flow state machine (5 states) | admin-shell | **Missing** | none |
| Topbar Sun/Moon via shared `useDarkMode` | admin-shell | **Partial (mechanism)** | public theme toggle reusable; no topbar |
| Admin-safe in-place language toggle | admin-shell | **Missing** | `setLanguage` is in-place (no nav) → trivially satisfiable |
| Bilingual admin chrome | hard rule | **Missing** | old admin chrome single-language via `t.admin.*` |
| `PageHeader` + `FloatingSaveButton` + `AdminCard` | admin-shell | **Missing** | old uses inline Save button |
| Hand-rolled modal convention | admin-shell | **Missing** | public uses shadcn Dialog |
| Styled `Hint` tooltips | admin-shell | **Partial (deps only)** | `@radix-ui/react-tooltip` + `tooltip.tsx` + root `TooltipProvider` present; no `Hint`, verify portal |
| Unsaved-changes nav guard | admin-shell | **Missing** | none |
| 7 admin page patterns (singleton/list/identity/media/translations/triage/tooling) | admin-shell | **Missing** | old had read-only model/lot/provider lists only |
| Site Identity page (branding+themes, live preview) | admin-shell / scaffold §10 | **Missing** | logos hardcoded |
| `themes.json` array + `brand-theme.ts` + `initBrand()` | scaffold §10 | **Missing** | colors static CSS vars; `main.tsx` no brand init |
| HSL tokens under `@theme inline` | scaffold §10 | **Present** | `index.css` registers all semantic `--color-*` |
| `--sidebar*` family both modes | scaffold §10 | **Present** | complete in `:root,.dark` + `.light` |
| Flag language indicator | scaffold §10 | **Present (public)** | `Navbar.tsx:66-85`, active-lang; reuse in admin topbar |
| Theme dark/light control | scaffold §10 | **Present** | `ThemeContext` `.dark`/`.light` |
| `.theme-transition` / `.lang-anim-*` / theme-aware scrollbars | scaffold §10 | **Missing** | none |
| Media library (`media.json` + resolvers + `MediaPicker` + `media-upload.ts`) | scaffold §11 | **Missing** | inline picsum URLs + hardcoded logo paths |
| Local-CMS Vite plugin + 5 endpoints + client | local-cms | **Missing** | `src/translations/` dir doesn't exist |
| Editable `seo.json` + `SeoPage` | seo-deploy | **Missing** | meta static in `index.html` |
| Prerender script (per-lang×route + sitemap + noindex 404) | seo-deploy | **Missing** | plain `vite build`; no `scripts/` |
| Runtime head tags (`seo.ts` `useHeadTags`) | seo-deploy | **Missing** | static `<title>` |
| robots.txt references sitemap | seo-deploy | **Partial** | exists, only `Allow: /`, no `Sitemap:` line |
| Deploy workflow leaves `VITE_ENABLE_ADMIN` unset | seo-deploy | **Partial** | workflow + CNAME + 404.html present; gate doesn't exist yet |
| Four-pieces completeness manifest | SKILL / scaffold §9 | **Missing** | no entities, no manifest |
| `ContentVersionsPage` | scaffold §9 | **Missing** | only crude full-blob export |
| Dashboard / Diagnostics / Content Explorer | admin-shell | **Missing** | none |
| `inventory.json` + build script + InventoryPage | admin-shell | **Missing** | none |
| `AdminRouter` (redirect if `!ADMIN_ENABLED`) | admin-shell | **Missing** | single static `/admin` route |
| Project `CLAUDE.md` documents DXP rules | SKILL | **Partial** | root CLAUDE.md describes old shape; rewrite post-build |
| Hardcoded colors (NotFound `gray-*`/`red-500`, `black/white-α` scrims/badges, `border-white/5,10`) | hard rule | **Missing/Partial** | several non-token colors to replace |

### Gap list (ordered by risk)
1. Admin ships in prod with fake PIN — discard `Admin.tsx`, stand up `admin-enabled.ts` + gated `AdminRouter` first.
2. No content/repository/service layer + no Zustand store — the foundation everything depends on.
3. Pervasive bilingual ternaries + fully-English Lots/Providers/Contact — bulk of the de-hardcoding; needs plain→`Localized` migration behind a tolerant resolver.
4. No local-CMS plugin — "save" can't write back.
5. No admin shell / 7 patterns / bilingual chrome / nav guard / publish / tooltips.
6. No media library / MediaPicker; images hardcoded (picsum + literal logo paths).
7. No site identity (branding/themes) editor; logo/favicon/OG hardcoded; gold-rgba tokens outside HSL system.
8. No SEO prerender / runtime head tags / sitemap; robots.txt missing `Sitemap:`.
9. No platform tooling (dashboard/diagnostics/explorer/versions/inventory); no completeness manifest.
10. Root CLAUDE.md describes old shape — rewrite after build.

---

## 5. What the OLD /admin edited (DISCARD — don't lose this)

`src/pages/Admin.tsx` (147 lines), its static import + route in `App.tsx:17,41`, the footer link (`Footer.tsx:114`), and the `admin.*` translation keys are **all superseded**. Inventory of what it edited so the rebuild covers it:

| Old admin surface | Reads/writes | Editable today? | Migrate to |
|---|---|---|---|
| PIN gate (`pin==='1234'`) | hardcoded | n/a | DROP — replaced by build-time `ADMIN_ENABLED` tree-shake gate (no auth) |
| Export JSON button | full `siteData` blob → `aurea_site_data.json` | yes | per-file `downloadJson` + `ContentVersionsPage` |
| Global Config → Company Name, Tagline | `config.{companyName,tagline}` | yes (editable) | **Site Identity / branding.json** |
| Corporate → Mission, Vision, About | `corporate.{mission,vision,about}` | yes (editable) | **home.json** (bilingual; currently Spanish-only gap) |
| House Models tab | `houseModels` (name+price) | **read-only display** | **catalog.json** list-editor (full bilingual — strict upgrade) |
| Lots tab | `lots` (name+district+price) | **read-only display** | **lots.json** list-editor |
| Providers tab | `providers` (name) | **read-only display** | **providers.json** list-editor |

Only truly-editable legacy fields: config (companyName/tagline) and corporate (mission/vision/about). House models/lots/providers were export-only (never editable in-UI), so the rebuilt list-editors are a strict upgrade. No legacy tab for Financiamiento or Contact. `config.measurementUnit` is referenced by the type but had no editable field (orphaned `admin.measurementUnit` key) — wire into branding/settings.

Also discard/standardize: storage-key drift (`aurea_lang`, `aurea_theme` vs `vye_site_data_v2` → one `ve-*` prefix); `t.footer.rights` exists but Footer re-types the phrase inline (drift); `t.footer.tagline` orphaned; hardcoded WhatsApp `506` in Footer + Home → `contact.countryCode`.

---

## 6. Cross-page shared entities + open architect decisions

**Shared entities (NOT per-page JSON — pages reference them):**
- `branding.json`: `companyName`, `tagline {es,en}`, `logoUrl`/`logoUrlDark`/`logoMark`/`faviconUrl`, fonts.
- `contact.json` (the deviation-#1 contact entity): `phones[]`, `email`, `countryCode` ("506"), `social.{facebook,instagram}` (+ base URLs currently hardcoded). Consumed by Home + Financiamiento + Footer (Financiamiento hardcodes them today = drift bug).
- Company/about content `{about,mission,vision} {es,en}` (currently single-language in `corporate.*`) — Home references; lives in `home.json` or a small company entity per architect.
- `navigation.json`: nav structure/order/grouping (labels resolve through chrome `nav.*`).

**Open decisions for the architect:**
1. `company.tagline` is duplicated verbatim (Home hero subtitle ≡ Financiamiento bottom tagline) — share via one entity or keep two fields. Recommendation: shared `company.tagline {es,en}` referenced by both.
2. Lot/model `name` + lot `location` proper nouns: localized `{es,en}` vs protected single-string. Recommendation: single-string proper nouns; only `description` localized.
3. Provider `materials`: per-item `{es,en}` array vs shared controlled-vocabulary token set. Recommendation: per-item `{es,en}`.
4. Sequence the plain→`Localized {es,en}` migration behind a tolerant resolver (accepts both shapes) before flipping types/consumers.
5. Mission/Vision: section **labels** → chrome `corporate.*`; **values** → content.

---

## 7. Scope this synthesis did NOT cover
- No production-build grep of `dist` for admin tree-shake (gate doesn't exist yet — Phase-5 verification once built).
- No exhaustive per-line scan of the 61 shadcn `src/components/ui/*` primitives (vendored; inherit token correctness; `tooltip.tsx` portal correctness flagged as build-time verify).
- Marble internals reviewed at preservation level only (no user-visible text; frozen asset).
- No actual `pnpm check` run (analysis phase).
