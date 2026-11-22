// This site now shows ONE portfolio at the root URL ("/") — yours.
// It's looked up by the "username" column in the `portfolios` table in
// Supabase, same as the old /[username] pages used.
//
// If you ever change your username in Settings, update it here too
// (or set NEXT_PUBLIC_OWNER_USERNAME in your .env / Vercel project env
// so you don't have to touch code).
export const OWNER_USERNAME =
  process.env.NEXT_PUBLIC_OWNER_USERNAME || "blessedngust13";

// Only this account may link other users' projects into its portfolio
// (Super Admin → All Projects). Compared case-insensitively against the
// signed-in user's login email. Override with NEXT_PUBLIC_OWNER_EMAIL.
export const OWNER_EMAIL = (
  process.env.NEXT_PUBLIC_OWNER_EMAIL || "blessedngust13@gmail.com"
).toLowerCase();