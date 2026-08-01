<!-- FILE PATH: status.md (project root) -->

# Project Status — Thabiso's Portfolio

Last updated: **2026-08-01**
Repo: originally a multi-tenant portfolio SaaS ("folio."), being converted into a **single-owner personal site** for Thabiso Blessed Ngulube.

> Read this file first. Only dig into the full chat history if you need the
> reasoning behind a specific decision below — everything actionable is here.

---

## TL;DR

- Root `/` now IS Thabiso's portfolio (not a SaaS landing page). Fixed username, no auth needed to view it.
- `/admin` dashboard still exists, still requires login — go there directly, it's not linked from `/` anymore.
- CV Builder (`/admin` → "CV Builder" tab) renders the **CV** in a two-column resume layout. **Cover letter is untouched**, still single-column.
- Fixed a noisy `AuthApiError: Invalid Refresh Token` console error on every page load.
- **The original ask — "I don't appear in SEO" — is only partially fixed.** Root now shows real content instead of a SaaS pitch, but it's still 100% client-rendered (fetched after page load). That's the bigger fix, not yet done. See "Not Done Yet" below.

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

## Done — 2026-08-01 (part 2)

### 4. Fixed dead "Hire Me" button + `/documents/cv.pdf` 404
- Root cause: `hero.resumeUrl` and the CV entry in `documents[]` both point to `/documents/cv.pdf` (a static, public-folder path) — but no file existed at `public/documents/cv.pdf` in the project. This value comes from `src/data/portfolio.ts`'s `initialPortfolioData` (the "Alex Mokoena" dummy fallback data), so it was 404ing whether or not Thabiso's real Supabase row overrides other fields.
- Generated a real one-page CV PDF (`public/documents/cv.pdf`) matching the two-column layout built into the CV Builder, using Thabiso's real CV content (same source as `PLACEHOLDER_CV` in `AdminCVBuilderPanel.tsx`). Built with WeasyPrint (HTML/CSS → PDF), not hand-coded in reportlab, so it visually matches the CV Builder's design.
- This fixes the **local dev / fallback default** case. It does NOT touch whatever `resumeUrl` value is actually stored in Thabiso's Supabase `portfolios` row — if that row has a different (also-broken) URL, this file drop won't help until that value is corrected too. Same for the `documents` table entry if Thabiso has since added real documents via `/admin` → Documents tab.
- ⚠️ Longer-term, static `/documents/cv.pdf` is a bit fragile (anyone can overwrite it by redeploying without the file, like just happened). Worth considering: have the CV Builder's "Download PDF" output get uploaded to Supabase Storage and have `resumeUrl` point there instead, so it's not dependent on a file surviving in `public/`.

## Done — 2026-08-01 (part 3)

### 5. Fixed "Hire Me" / Download CV — was reading the wrong field entirely
- **Real root cause found:** `AdminHeroPanel.tsx` (the "About Me" tab in `/admin`) has no field to set `hero.resumeUrl` at all — it never did. Meanwhile, uploading a CV via `/admin` → Documents tab correctly uploads to Supabase Storage and saves a real URL, but into a totally different place: `documents[].fileUrl` where `category === "CV"`. The Hire Me / Download CV buttons were hardcoded to read `hero.resumeUrl` — a field with no UI to ever set it — so no matter what CV you uploaded through Documents, the buttons never saw it.
- **Fix:** added `selectResumeUrl` in `src/hooks/redux.ts` — it looks for the visible Documents entry with `category === "CV"` and uses *that* `fileUrl` first (i.e. whatever you actually uploaded), falling back to `hero.resumeUrl` only if no such document exists.
- `Navbar.tsx` (desktop + mobile Hire Me) and `HeroSection.tsx` (Download CV) now both use `selectResumeUrl` instead of `hero.resumeUrl` directly.
- Both buttons now only render at all if a real URL resolves — no more dead-link buttons when nothing's been uploaded yet.
- Also cleaned up `src/data/portfolio.ts`: the dummy fallback data had a fake `"/documents/cv.pdf"` in both `hero.resumeUrl` and the sample CV document — changed both to `""` so a fresh/unconfigured portfolio just hides the buttons instead of shipping a link that 404s.
- `OtherSections.tsx` Documents grid: download icon now only renders per-document if that document actually has a `fileUrl` (guards against any doc with a stalled/failed upload, not just CV).

**Net effect: whatever CV is uploaded in `/admin` → Documents → category "CV" is now what actually shows up everywhere.** No separate field to remember to fill in.

(Earlier in this same session I'd generated a static `public/documents/cv.pdf` as a stopgap before finding this root cause — that file still works fine as a manual fallback if you ever want one, but it's no longer required; the real fix is uploading through Documents in `/admin` like normal.)

## Not Done Yet (known gaps, ranked by importance)

1. **Real SEO fix.** This is the actual reason Thabiso doesn't show up in search — `PortfolioView` is a `"use client"` component that fetches from Supabase in a `useEffect` after mount. Google (and everything else) sees an empty shell on first paint; meta tags are injected via JS after the fact. To fix properly: convert the hero/summary content to a Server Component with real data fetching (or SSG), add `generateMetadata`, add JSON-LD `Person` schema, add `sitemap.xml` + `robots.txt`. **This was flagged in the original conversation and explicitly deferred — not yet started.**
2. **CV/Cover Letter builder only saves to `localStorage`.** Doesn't persist to Supabase, so it won't show up in the public site's Documents section for a visitor, and resets if browser data is cleared. Flagged to Thabiso, not yet actioned — waiting on a decision (wire it into the `documents` table like everything else in the admin dashboard, or leave as a personal local tool).
3. **Multi-tenant leftovers still in the codebase**, unused but not removed: `/auth/register`, `/super-admin`, `/api/invite`, Redux multi-user auth plumbing. Decision so far has been to leave these alone rather than rip them out, since nothing's broken by their presence — revisit if Thabiso wants the codebase fully single-tenant.

---

## Key Decisions & Why

| Decision | Why |
|---|---|
| Keep Supabase (don't go fully static) | Admin dashboard live-editing needs somewhere to persist edits |
| Keep `/admin` dashboard | Thabiso wants to keep editing content live, not redeploy for every change |
| Root page fetches by a hardcoded `OWNER_USERNAME` rather than restructuring the DB to drop `username` entirely | Minimal-diff, reversible, doesn't touch the schema or `savePortfolio`/`getMyPortfolio` logic that admin already depends on |
| CV two-column layout auto-classifies sections by heading keyword (SKILL/EDUCATION/CERTIF/LANGUAGE/etc.) rather than a fixed schema | Keeps the existing free-text markup editor working as-is — no new UI needed to "assign" a section to a column |

---

## Quick Reference

- **Owner username:** `blessedngust13` (in `src/lib/site-config.ts`)
- **Real contact info source of truth:** `src/components/admin/AdminCVBuilderPanel.tsx` (`PLACEHOLDER_CV` / `PLACEHOLDER_COVER` constants) — these already have Thabiso's real CV content, not dummy data
- **Admin login:** `/auth/login` (not linked from `/` — go direct)
- **To change the two-column CV sidebar rules:** `SIDEBAR_KEYWORDS` array in `AdminCVBuilderPanel.tsx`

## Open Questions for Thabiso (next time you talk to him)

1. Confirmed the Supabase `portfolios` row for `blessedngust13` actually exists / has real data in it?
2. Ready to tackle the real SSR/SEO fix now (item 1 above), or still just doing incremental changes?
3. Want the CV/Cover Letter builder wired into Supabase so it's not just local-browser-only?
4. Any appetite for stripping the unused multi-tenant routes, or leave them be?