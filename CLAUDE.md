@AGENTS.md
@status.md

# Working in this repo

Personal portfolio site for **Thabiso Blessed Ngulube**, single-owner. Next.js 16 (App Router) + React 19 + Redux Toolkit + Supabase. `status.md` (imported above) is the source of truth for what is done and what is open; keep it current.

## Commands
- `npm run dev` / `npm run build` / `npm run lint`
- Verify changes with `npx tsc --noEmit` and `npx next build` before calling anything done.
- `npm run lint` already reports some errors in files nobody has touched (React Compiler rules, unescaped `'`). Do not treat those as regressions; check that you added none.

## Rules
- **Never print, log or commit `.env.local`.** It holds `SUPABASE_SERVICE_ROLE_KEY`. Refer to variable names only.
- **Admin = `profiles.role = 'admin'`.** The UI gates (`/super-admin`, `selectIsAdmin`, `/api/invite`) are convenience. Real enforcement is Postgres RLS via `public.is_admin()`. Any new admin capability needs a policy, not just a UI check.
- **Schema changes are manual SQL.** Add a numbered file in `src/lib/` (`supabase-migration-00N-*.sql`, idempotent) and tell the owner to run it in the Supabase SQL editor. The app cannot run migrations.
- **Linking is owner-only** (`OWNER_EMAIL` in `src/lib/site-config.ts`) and copies media into the owner's own storage folder.
- **Projects have no table.** They live in `portfolios.data.projects` (JSON, one row per user). Read-modify-write that JSON carefully: never save defaults over a row that failed to load (see `linkProjectsToMyAccount` in `src/lib/projects-api.ts`).
- **State:** portfolio data goes through the Redux slice (`portfolioSlice.ts`) and is saved by `persistPortfolio`. Super Admin screens talk to Supabase directly and do not use the slice, so `/admin` reloads on mount to pick up their changes.

## CV and cover letter content
- Single source of truth: `PLACEHOLDER_CV` and `PLACEHOLDER_COVER` in `src/components/admin/AdminCVBuilderPanel.tsx`.
- **Bump `CONTENT_VERSION` whenever either constant changes**, otherwise browsers keep serving the cached copy from localStorage.
- Writing standard (from the owner's recruiter): every achievement states the task, the goal it achieved, and a measurable result; each employer carries an industry line. Never invent numbers. Use only figures the owner has confirmed (currently: 40+ mine sites, 12+ hours/week of manual reporting removed, sold as a monetised client feature).
- Layout sizes live in `CV_LAYOUT` at the top of that file and feed both the preview and the PDF stylesheet via `--cv-*` variables. Do not hard-code sizes in the CSS.
- Markup the renderer understands: `#` name, `##` title, `>` contact, `###` section, `-` bullet, `**bold**`, `*italic*`, `+++` highlight box, `>>` cover-letter contact lines.

## Skills
Group names and order live in `src/lib/skill-categories.ts`. Add a new group there, not in a component.

## At the end of a session
Update `status.md`: what changed, what is still open, any manual steps the owner must do.