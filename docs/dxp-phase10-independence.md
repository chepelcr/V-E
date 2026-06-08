# Phase 10 — Admin Independence ✅ DONE

**Status (done):** Admin extracted to its own app at `E:/dev/V-E/admin` (port 5174),
pushed to **private** repo `chepelcr/V-E-admin` (user will flip to public after
adding auth). `admin/` is git-ignored in this repo. All admin-only code removed
from the public site (pages/admin, components/admin, admin-ui, admin-manifest,
vite-plugin-local-cms, admin-enabled, the App route + Footer link + vite plugin).
Public typecheck + prod build pass with ZERO admin code. The admin app reads this
site's content via `@site` aliases and writes back via its own local-CMS plugin.

**Known limitation:** the contact "Messages" inbox uses `localStorage`, which is
origin-bound — the separate-origin admin app (`:5174`) won't see submissions made
on the public site origin. Real message capture needs a backend (out of scope for
the static site).

---

## Original plan (kept for reference)

**Goal:** Extract the dev-only admin CMS into its **own standalone app on its own port**, tracked in a **separate private GitHub repo**, so the admin source is **not present in the public site repo** that hosts `v-e.jcampos.dev`.

## Requirements (from the user)
1. Admin becomes an independent app (its own Vite app + dev port), not bundled into the construction-site SPA.
2. Admin lives in a **separate repo** (private) — create it.
3. In the parent (public) repo: **git-ignore** the admin app dir and **delete the admin code** so it's no longer in the public repo's history going forward.
4. Both apps still read/write the SAME content JSON (`src/content/*.json`, `src/translations/*.json`) via the local-CMS dev middleware, so editing in the admin app updates the site's content.

## Open design decisions to settle when we start
- **Content source of truth:** the content JSON stays in the public site repo. The admin app needs to read/write it. Options: (a) admin app lives in a sibling folder and the local-CMS server (run from the site repo) is what the admin talks to over HTTP; (b) a shared pnpm workspace package for content. Likely (a): the admin app is a thin Vite SPA pointing at the site's local-CMS endpoints (`/__local/*`), so it never needs the content in its own repo.
- **Repo/visibility:** new private repo (e.g. `chepelcr/V-E-admin`). Confirm name + visibility.
- **Removal from public repo:** add the admin dir to `.gitignore`, `git rm -r --cached`, delete the files; keep the public build green (the gate already tree-shakes admin, so removing the source must not break the public build — verify `typecheck` + prod build after).
- **Local run:** admin app gets its own `reboot/stop/logs` scripts + port (e.g. 5174); the site keeps 5000/8080.

## Acceptance
- Public repo builds & deploys with NO admin source present; `grep` for admin in the public repo = none.
- Admin app runs standalone, edits content, and Publish still commits to the site repo.
- Site repo `.gitignore` excludes the admin app dir.
