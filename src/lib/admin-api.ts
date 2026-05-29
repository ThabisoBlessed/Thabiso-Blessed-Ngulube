import { supabase } from "./supabase";

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl: string;
  role: "admin" | "user";
  status: "active" | "suspended" | "blocked";
  createdAt: string;
  portfolioComplete: boolean;
  portfolioPublic: boolean;
}

// ── Check if current user is admin ────────────────────────────────────────────
export async function checkIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role === "admin";
}

// ── Get all users (admin only) ────────────────────────────────────────────────
export async function getAllUsers(): Promise<ManagedUser[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, name, username, avatar_url, role, status, created_at")
    .order("created_at", { ascending: false });

  if (error || !profiles) return [];

  // Get portfolio data for each user
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("user_id, data");

  const portfolioMap = new Map(portfolios?.map((p) => [p.user_id, p.data]) || []);

  return profiles.map((p) => {
    const pData = portfolioMap.get(p.id) as {
      hero?: { name?: string };
      projects?: unknown[];
      employment?: unknown[];
    } | undefined;

    const hasName     = !!(pData?.hero?.name);
    const hasProjects = (pData?.projects?.length ?? 0) > 0;
    const hasWork     = (pData?.employment?.length ?? 0) > 0;

    return {
      id:                p.id,
      email:             p.email,
      name:              p.name || "",
      username:          p.username,
      avatarUrl:         p.avatar_url || "",
      role:              p.role || "user",
      status:            p.status || "active",
      createdAt:         p.created_at,
      portfolioComplete: hasName && hasProjects && hasWork,
      portfolioPublic:   p.status === "active",
    };
  });
}

// ── Invite user by email ──────────────────────────────────────────────────────
export async function inviteUser(email: string): Promise<{ success: boolean; error?: string }> {
  // Get the current user's session token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: "Not authenticated" };

  const res = await fetch("/api/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  return { success: true };
}

// ── Update user status ────────────────────────────────────────────────────────
async function setUserStatus(
  userId: string,
  status: "active" | "suspended" | "blocked"
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId);
  return !error;
}

export const suspendUser = (id: string)  => setUserStatus(id, "suspended");
export const blockUser   = (id: string)  => setUserStatus(id, "blocked");
export const activateUser= (id: string)  => setUserStatus(id, "active");

// ── Delete user ───────────────────────────────────────────────────────────────
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  // 1. Delete their storage files
  const { data: files } = await supabase.storage
    .from("portfolio-files")
    .list(userId);

  if (files && files.length > 0) {
    const paths = files.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from("portfolio-files").remove(paths);
  }

  // 2. Delete portfolio row (cascade will handle profiles)
  await supabase.from("portfolios").delete().eq("user_id", userId);

  // 3. Delete profile (will cascade to portfolios if FK set)
  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  if (error) return { success: false, error: error.message };

  return { success: true };
}

// ── Promote / demote user ─────────────────────────────────────────────────────
export async function setUserRole(
  userId: string,
  role: "admin" | "user"
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  return !error;
}
