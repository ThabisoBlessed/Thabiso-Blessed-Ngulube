"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Supabase keeps your session (including the refresh token) in the
// browser's localStorage and quietly tries to refresh it in the
// background. If that stored token is stale — left over from testing,
// an old deploy, a different Supabase project, or just expired — the
// SDK logs a scary-looking but harmless error every page load:
//   AuthApiError: Invalid Refresh Token: Refresh Token Not Found
//
// This component runs once, on first render of every page, and checks
// whether the stored session is actually still valid. If it isn't, it
// clears it locally (no network call, no redirect, nothing visible) so
// there's nothing stale left for the background refresh to choke on
// next time. Pages that require a logged-in user (like /admin) still do
// their own separate check and redirect to /auth/login as before.
export function AuthTokenGuard() {
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          await supabase.auth.signOut({ scope: "local" }).catch(() => {});
        }
      } catch {
        await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      }
    })();
  }, []);

  return null;
}
