# Project Status — Thabiso's Portfolio

Last updated: **2026-11-22**
Repo: originally a multi-tenant portfolio SaaS ("folio."), being converted into a **single-owner personal site** for Thabiso Blessed Ngulube.

> Read this file first. Only dig into the full chat history if you need the
> reasoning behind a specific decision below — everything actionable is here.

---

## TL;DR

- **Super admin (2026-11-22):** your account is promoted to `role = 'admin'` by a SQL migration. **You must run it once** — see "Manual steps" below. Until then `/super-admin` redirects you back to `/admin`.
- **All projects (2026-11-22):** `/super-admin` → **All Projects** lists every project in the database and can link them into your own portfolio.
- **CV + cover letter (2026-11-22):** both now follow the recruiter's rules (industry line per employer, task → goal → measurable result). `CONTENT_VERSION` is `v7`.
- Root `/` now IS Thabiso's portfolio (not a SaaS landing page). Fixed username, no auth needed to view it.
- `/admin` dashboard still exists, still requires login — go there directly, it's not linked from `/` anymore.
- CV Builder (`/admin` → "CV Builder" tab) renders the **CV** in a two-column resume layout. The **cover letter** keeps its own single-column layout.
- Fixed a noisy `AuthApiError: Invalid Refresh Token` console error on every page load.
- **The original ask — "I don't appear in SEO" — is only partially fixed.** Root now shows real content instead of a SaaS pitch, but it's still 100% client-rendered (fetched after page load). That's the bigger fix, not yet done. See "Not Done Yet" below.

---

## Manual steps (do these once, in order)

1. Open Supabase → SQL editor → run **`src/lib/supabase-migration-001-super-admin.sql`**. It is idempotent. The last statement prints your row; confirm `role = admin`. (It assumes you sign in as `blessedngust13@gmail.com`; edit the email in the file if not.)
2. Sign out and back in at `/auth/login` so the app re-reads your profile.
3. `/admin` now shows the **Super Admin** button. Open it → **All Projects**.
4. Hard-refresh `/admin` → **CV Builder** once so the new `v7` CV and cover letter load (the version bump clears the cached copy).

---

## Done This Session (2026-11-22)

### 1. Super admin by default
- **Root cause of "admin" not really working:** `supabase-schema.sql` never created `profiles.role` / `profiles.status`, though the app reads them, and the only profile `update` policy was `auth.uid() = id`, so one admin could not act on another user.
- `src/lib/supabase-migration-001-super-admin.sql` **(new)** — adds the columns (with CHECK constraints), `public.is_admin()`, admin `update`/`delete` policies on `profiles` and `delete` on `portfolios`, promotes `blessedngust13@gmail.com`, and adds a `before insert` trigger so that email is admin from the first insert if the account is ever recreated (leaves `handle_new_user()` untouched).
- **Security fix in the same file:** `profiles_own_update` let any signed-in user set their own `role` to `admin`. A `before update` trigger now keeps `role`/`status` unchanged unless the caller is an admin (SQL editor / service role are exempt).
- App code needed no change for this: `checkIsAdmin`, `selectIsAdmin`, `/api/invite` already key off `profiles.role`.

### 2. All Projects + link to my account
- `src/lib/projects-api.ts` **(new)** — `getAllProjects()` flattens `data.projects` from every row in `portfolios` (publicly readable under RLS) and attaches owner info; `linkProjectsToMyAccount()` copies chosen projects into **your** portfolio row.
- `src/components/super-admin/AllProjectsPanel.tsx` **(new)** — search, filter by owner, select several, per-project **Link to my account**, **Link selected**, **Link all**.
- `src/app/super-admin/page.tsx` — added a **Users | All Projects** switcher; Users view unchanged.
- `src/types/index.ts` — `Project.linkedFrom?` (owner id/username, original project id, timestamp) so the same project is never linked twice.
- `AdminProjectsPanel.tsx` — linked projects show a **Linked · @username** badge.
- **Behaviour to know:** linking *copies* (see section 4 for owner-only + media copy); the original stays with its owner. Copies are created **hidden** (`isVisible: false`, not featured) so a bulk link cannot publish old/test projects on your homepage. Review them in Admin → Projects.
- Safety: the link function reads your raw row first and aborts if the read fails (it will not save defaults over a portfolio it failed to load), and it reports an RLS-blocked save instead of claiming success.

### 3. CV builder
- `AdminCVBuilderPanel.tsx` in the uploaded zip was still the old v5 CV. Replaced `PLACEHOLDER_CV` with the updated CV (industry line per employer, 12+ hours/week, 40+ sites, reactive → proactive control rooms).
- `PLACEHOLDER_COVER` rewritten for measurability (task → goal → result, industry, same confirmed figures). Removed the stray `)` line and trailing full stop from both headers.
- `inline()` now supports `*italic*` (needed for the `*Industry: …*` lines).
- `CONTENT_VERSION` bumped `v5` → `v7`.

### 4. Follow-up: owner-only linking + media copy (2026-11-22)
- **Only the owner's login email can link.** `OWNER_EMAIL` in `src/lib/site-config.ts` (default `blessedngust13@gmail.com`, override with `NEXT_PUBLIC_OWNER_EMAIL`). `linkProjectsToMyAccount` refuses any other account, and the All Projects tab becomes view-only for other admins. Linked copies always land in the signed-in owner's own portfolio row.
- **Media is copied into your own storage folder** at link time (thumbnail + screenshots/videos): downloaded from the public URL and re-uploaded to `portfolio-files/<your id>/linked/…`, so deleting the original user no longer breaks them. Needs no new storage policy (uses your existing upload permission). External URLs are left alone; failures keep the original URL and are counted in the result message.
- Note: the owner gate is app logic, not RLS. It is not a security boundary (any user can already write their own portfolio row); the real protection is that the copy only ever goes into the caller's own row.

### 5. Recovered old projects (2026-11-22)
- Diagnosis: the old account's storage folder (`eb4ba27c…`, 54 files, 113 MB) survived but its profile and portfolio row were deleted, so the projects' text was gone. There is no `projects` table (only `profiles` and `portfolios`).
- `recover-old-projects.sql` rebuilt four projects from the file names: **OmniNexos**, **Omniscience**, **Learning Management System**, and a **hidden** "Unsorted screenshots (review me)". Run on the live DB and confirmed. Idempotent. Files were not moved; the projects point at the old folder's public URLs.
- **Still to do by hand:** descriptions, categories and tech stacks are drafts inferred from file names. Move the 5 unsorted screenshots into the right project, then delete that entry. If a `.mov` will not play in Chrome/Firefox, convert it to `.mp4`.

### 6. CV fit fix + CV_LAYOUT (2026-11-22)
- **Bug fixed:** the auto-fit measured at full size, shrank, then widened the box, so text reflowed shorter than measured. Result: over-shrunk ("squinted") text and white space under the content. It now searches for the largest scale that fits at its real final width.
- **`CV_LAYOUT`** (top of `AdminCVBuilderPanel.tsx`) holds every size you can tune (margins, font sizes, line height, column ratio, gaps, `minScale`). It feeds both the preview and the PDF stylesheet through `--cv-*` CSS variables. A "Page fit: NN%" line under the toolbar shows how much the page is shrinking and warns when content is clipped.
- Not visually rendered in a browser here (type-check and build only): check the preview after pasting.

### 7. Skills regrouping (2026-11-22)
- New groups, in display order, in `src/lib/skill-categories.ts`: Languages, Frontend, Mobile, Backend & APIs, Databases, Cloud, DevOps, **AI & LLM Engineering**, **Architecture & Real-Time Systems**. The public Skills section and Admin → Skills both follow this order; unknown older categories sort last.
- `skills-regroup.sql` replaces the live skills list with the regrouped set (46 skills). Items beyond the original list were taken from the CV: Tailwind CSS, Django, MongoDB, Redis, EC2, DigitalOcean, CI/CD, Linux, Git, Tool-Calling Agents, OpenAI API, Ollama, MQTT, Real-Time Data Pipelines. Delete any you do not want in Admin → Skills.

### Verification
`npx tsc --noEmit` clean; `npx next build` succeeds; ESLint: no new errors (remaining errors are the same ones present in the original upload).

---

## Done This Session (2026-08-01)

### 1. Root route = the portfolio, not a landing page
- `src/app/page.tsx` — was a "folio." SaaS marketing page with Sign in / Get started buttons. Now renders `<PortfolioView username={OWNER_USERNAME} />`.
- `src/lib/site-config.ts` **(new)** — exports `OWNER_USERNAME`, hardcoded to `"blessedngust13"`, overridable via `NEXT_PUBLIC_OWNER_USERNAME` env var. This is the Supabase `portfolios.username` value the root page looks up.
- `src/components/portfolio/PortfolioView.tsx` **(new)** — extracted the actual portfolio-rendering logic (fetch by username, set OG/Twitter meta tags, render sections) out of `[username]/page.tsx` so both the root route and the legacy username route share one implementation instead of duplicating it.
- `src/app/[username]/page.tsx` — now just a thin wrapper around `PortfolioView`, kept alive for backward compatibility with any old `/blessedngust13`-style links floating around. Canonical URL is `/` now.
- Sign-in is intentionally **not** linked anywhere on `/` — per Thabiso, he'll navigate to `/auth/login` directly himself.

⚠️ **This assumes a row exists in the Supabase `portfolios` table with `username = 'blessedngust13'`.** I don't have DB access to confirm this — if `/` shows a 404 state, that's the first thing to check.

### 2. Fixed `AuthApiError: Invalid Refresh Token: Refresh Token Not Found`
- Root cause: Supabase persists the session (incl. refresh token) in `localStorage`. A stale/expired/leftover token sitting there makes the SDK's background auto-refresh fail and log to console on every load, even for a logged-out visitor.
- `src/components/AuthTokenGuard.tsx` **(new)** — mounted once in `src/app/layout.tsx`. On first load of any page, validates the stored session; if invalid, clears it locally (`signOut({ scope: "local" })`, no network call, nothing visible). This stops the error from recurring on future loads.
- `src/app/admin/page.tsx` — the auth-check `useEffect` was calling `.getSession()` with no error handling at all. Wrapped in try/catch, now checks the `error` field and signs out locally + redirects to `/auth/login` instead of silently failing.
- Note: this can't guarantee the error **never** logs once (Supabase's internal background timer can still fire before our check resolves on a fresh session), but it stops it from repeating on every subsequent load. If it's still showing up constantly, the next step would be checking whether the Supabase project URL/keys in `.env` actually match the project the stale token was issued from (e.g. pointing at a new/different Supabase project than before).

### 3. Static `<head>` metadata updated
- `src/app/layout.tsx` — `export const metadata` title/description changed from generic "folio." branding to Thabiso's real name/title. Small win for crawlers that read raw HTML before JS runs.

### Carried over from previous session (2026-07-31)
- `src/components/admin/AdminCVBuilderPanel.tsx` — CV tab now renders a two-column layout (name/title/contact banner → wide main column for Summary/Experience beside a narrow sidebar for Skills/Education/Certifications/Languages), auto-sorted by section heading keywords. Cover Letter tab logic untouched.

---

## Not Done Yet (known gaps, ranked by importance)

1. **Real SEO fix.** This is the actual reason Thabiso doesn't show up in search — `PortfolioView` is a `"use client"` component that fetches from Supabase in a `useEffect` after mount. Google (and everything else) sees an empty shell on first paint; meta tags are injected via JS after the fact. To fix properly: convert the hero/summary content to a Server Component with real data fetching (or SSG), add `generateMetadata`, add JSON-LD `Person` schema, add `sitemap.xml` + `robots.txt`. **This was flagged in the original conversation and explicitly deferred — not yet started.**
2. **CV/Cover Letter builder only saves to `localStorage`.** Doesn't persist to Supabase, so it won't show up in the public site's Documents section for a visitor, and resets if browser data is cleared. Flagged to Thabiso, not yet actioned — waiting on a decision (wire it into the `documents` table like everything else in the admin dashboard, or leave as a personal local tool).
3. **Multi-tenant leftovers still in the codebase**, unused but not removed: `/auth/register`, Redux multi-user auth plumbing. (`/super-admin` and `/api/invite` are now actively used — keep them.) Decision so far has been to leave these alone rather than rip them out, since nothing's broken by their presence — revisit if Thabiso wants the codebase fully single-tenant.

4. ~~Linked project media pointed at the original owner's files~~ **Fixed 2026-11-22:** linking now copies each file into `portfolio-files/<your id>/linked/`. Any file that cannot be copied keeps its original URL and is reported in the result message.
5. **`profiles_public_read` is `using (true)`** in `supabase-schema.sql`, so anyone with the public anon key can read every user's email. Fine while you are the only real user; tighten (or move emails out of `profiles`) before inviting people.
6. **Live DB may have drifted from the SQL files** (the schema file lacked `role`/`status` while the app used them). Treat the migration as additive, and confirm in the Supabase dashboard if anything behaves oddly.
7. **Lint baseline:** `npm run lint` reports pre-existing errors (React Compiler rules in `super-admin/page.tsx` and `AdminCVBuilderPanel.tsx`, unescaped `'`). Not blocking the build.

---

## Key Decisions & Why

| Decision | Why |
|---|---|
| Keep Supabase (don't go fully static) | Admin dashboard live-editing needs somewhere to persist edits |
| Keep `/admin` dashboard | Thabiso wants to keep editing content live, not redeploy for every change |
| Root page fetches by a hardcoded `OWNER_USERNAME` rather than restructuring the DB to drop `username` entirely | Minimal-diff, reversible, doesn't touch the schema or `savePortfolio`/`getMyPortfolio` logic that admin already depends on |
| Super admin = `profiles.role = 'admin'`, enforced by RLS (`is_admin()`), owner promoted by email in SQL | Real protection lives in the database; a UI-only email check would let the UI show admin tools whose writes then fail |
| "Link" projects = copy with `linkedFrom` marker, created hidden | Works within existing RLS (you only write your own row), prevents duplicates, and stops bulk-linking from publishing old projects |
| CV two-column layout auto-classifies sections by heading keyword (SKILL/EDUCATION/CERTIF/LANGUAGE/etc.) rather than a fixed schema | Keeps the existing free-text markup editor working as-is — no new UI needed to "assign" a section to a column |

---

## Quick Reference

- **Owner username:** `blessedngust13` (in `src/lib/site-config.ts`)
- **Real contact info source of truth:** `src/components/admin/AdminCVBuilderPanel.tsx` (`PLACEHOLDER_CV` / `PLACEHOLDER_COVER` constants) — these already have Thabiso's real CV content, not dummy data
- **Admin login:** `/auth/login` (not linked from `/` — go direct)
- **Super admin:** `src/lib/supabase-migration-001-super-admin.sql` (run once) → `/super-admin`
- **All Projects / linking:** `src/lib/projects-api.ts`, `src/components/super-admin/AllProjectsPanel.tsx`
- **Bump `CONTENT_VERSION`** in `AdminCVBuilderPanel.tsx` whenever `PLACEHOLDER_CV` / `PLACEHOLDER_COVER` change
- **To change the two-column CV sidebar rules:** `SIDEBAR_KEYWORDS` array in `AdminCVBuilderPanel.tsx`

## Open Questions for Thabiso (next time you talk to him)

1. Did the migration run, and does the final `select` show `role = admin` for your row? (If you sign in with an email other than `blessedngust13@gmail.com`, the file needs that email.)
2. Once you have linked your projects, which should be visible on the public site? Hidden-by-default copies need a pass in Admin → Projects.
3. Are the other users in the DB real people or old test accounts? That decides whether to keep or delete them.
4. Is "12+ hours" per week? It is written that way in the CV and cover letter.
5. Ready to tackle the real SSR/SEO fix (known gap 1 in the list above), or still doing incremental changes?
6. Want the CV/Cover Letter builder wired into Supabase so it is not local-browser-only?