import { supabase } from "./supabase";
import { OWNER_EMAIL } from "./site-config";
import type { PortfolioState, Project } from "@/types";

// Projects are not a table of their own: each user's projects live inside
// their `portfolios.data` JSON (data.projects). Portfolios are publicly
// readable under RLS, so any signed-in user can read them; writing is limited
// to your OWN portfolio row, which is all "linking" needs.

export interface ProjectWithOwner {
  project: Project;
  ownerId: string;
  ownerUsername: string;
  ownerName: string;
  /** Project belongs to the signed-in user's own portfolio. */
  isMine: boolean;
  /** A copy of this project has already been linked into the signed-in user's portfolio. */
  alreadyLinked: boolean;
}

const linkKey = (userId: string, projectId: string) => `${userId}:${projectId}`;

export const isOwnerEmail = (email?: string | null) =>
  !!email && email.toLowerCase() === OWNER_EMAIL;

// ── Media: copy linked projects' files into MY storage folder ────────────────
// Linked copies would otherwise point at the original owner's files, which are
// deleted if that user is deleted. We download from the (public) URL and
// re-upload under `<my id>/linked/...`, which only needs the upload permission
// you already have. External URLs are left as they are.
const BUCKET = "portfolio-files";
const MARKER = `/storage/v1/object/public/${BUCKET}/`;

type MediaResult = { url: string; status: "copied" | "kept" | "failed" };

async function copyIntoMyFolder(url: string, myId: string): Promise<MediaResult> {
  const i = url.indexOf(MARKER);
  if (i === -1) return { url, status: "kept" };              // external / not ours to copy
  const srcPath = decodeURIComponent(url.slice(i + MARKER.length).split("?")[0]);
  if (srcPath.startsWith(`${myId}/`)) return { url, status: "kept" }; // already in my folder
  try {
    const res = await fetch(url);
    if (!res.ok) return { url, status: "failed" };
    const blob = await res.blob();
    const name = (srcPath.split("/").pop() || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
    const dest = `${myId}/linked/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(dest, blob, { cacheControl: "3600", contentType: blob.type || undefined, upsert: false });
    if (error) return { url, status: "failed" };
    return { url: supabase.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl, status: "copied" };
  } catch {
    return { url, status: "failed" };
  }
}

// ── Every project in the database, across all portfolios ─────────────────────
export async function getAllProjects(): Promise<{ items: ProjectWithOwner[]; canLink: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { items: [], canLink: false, error: "Not signed in" };
  const canLink = isOwnerEmail(user.email);

  const [portfoliosRes, profilesRes] = await Promise.all([
    supabase.from("portfolios").select("user_id, username, data"),
    supabase.from("profiles").select("id, name, username"),
  ]);

  if (portfoliosRes.error || !portfoliosRes.data) {
    return { items: [], canLink, error: portfoliosRes.error?.message ?? "Could not load portfolios" };
  }

  const names = new Map(
    (profilesRes.data ?? []).map((p) => [p.id as string, (p.name as string) || (p.username as string)]),
  );

  const projectsOf = (data: unknown): Project[] =>
    ((data as Partial<PortfolioState> | null)?.projects ?? []) as Project[];

  const mine = portfoliosRes.data.find((r) => r.user_id === user.id);
  const linked = new Set(
    projectsOf(mine?.data)
      .filter((p) => p.linkedFrom)
      .map((p) => linkKey(p.linkedFrom!.userId, p.linkedFrom!.projectId)),
  );

  const items: ProjectWithOwner[] = [];
  for (const row of portfoliosRes.data) {
    const isMine = row.user_id === user.id;
    for (const project of projectsOf(row.data)) {
      // Linked copies in my own portfolio would just duplicate the originals here.
      if (isMine && project.linkedFrom) continue;
      items.push({
        project,
        ownerId: row.user_id,
        ownerUsername: row.username,
        ownerName: names.get(row.user_id) ?? row.username,
        isMine,
        alreadyLinked: linked.has(linkKey(row.user_id, project.id)),
      });
    }
  }
  return { items, canLink };
}

// ── Link projects into the signed-in user's portfolio ────────────────────────
// Copies each project into my portfolio with a `linkedFrom` marker so it is
// never added twice. Copies start HIDDEN (isVisible: false) so linking dozens
// of old projects can't suddenly publish them on your homepage. Media URLs
// are copied into your own storage folder (see copyIntoMyFolder).
export async function linkProjectsToMyAccount(
  items: ProjectWithOwner[],
): Promise<{ linked: number; skipped: number; mediaCopied: number; mediaFailed: number; error?: string }> {
  const none = { linked: 0, skipped: 0, mediaCopied: 0, mediaFailed: 0 };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ...none, error: "Not signed in" };
  if (!isOwnerEmail(user.email)) {
    return { ...none, error: "Only the site owner's account can link projects." };
  }

  // Read my raw row. If the read fails we must NOT write: saving defaults over
  // a portfolio we simply failed to load would wipe it.
  const { data: row, error: readError } = await supabase
    .from("portfolios")
    .select("id, data")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) return { ...none, error: readError.message };

  const data = (row?.data ?? {}) as Partial<PortfolioState>;
  const existing: Project[] = data.projects ?? [];
  const seen = new Set(
    existing.filter((p) => p.linkedFrom).map((p) => linkKey(p.linkedFrom!.userId, p.linkedFrom!.projectId)),
  );

  const now = new Date().toISOString();
  const fresh: Project[] = [];
  let skipped = 0;
  let mediaCopied = 0;
  let mediaFailed = 0;
  const copies = new Map<string, MediaResult>(); // same file used twice is copied once
  const mine = async (url: string): Promise<string> => {
    if (!url) return url;
    let r = copies.get(url);
    if (!r) { r = await copyIntoMyFolder(url, user.id); copies.set(url, r); }
    if (r.status === "copied") mediaCopied++;
    if (r.status === "failed") mediaFailed++;
    return r.url;
  };

  for (const it of items) {
    const key = linkKey(it.ownerId, it.project.id);
    if (it.isMine || seen.has(key)) { skipped++; continue; }
    seen.add(key);
    const thumbnail = await mine(it.project.thumbnail);
    const media = [];
    for (const m of it.project.media ?? []) media.push({ ...m, url: await mine(m.url) });
    fresh.push({
      ...it.project,
      thumbnail,
      media,
      id: `linked-${it.ownerId.slice(0, 8)}-${it.project.id}`,
      featured: false,
      isVisible: false,
      linkedFrom: {
        userId: it.ownerId,
        username: it.ownerUsername,
        projectId: it.project.id,
        linkedAt: now,
      },
    });
  }
  if (fresh.length === 0) return { ...none, skipped };

  const nextData = { ...data, projects: [...fresh, ...existing] };

  if (row) {
    const { data: updated, error } = await supabase
      .from("portfolios")
      .update({ data: nextData })
      .eq("id", row.id)
      .select("id");
    if (error) return { ...none, skipped, mediaCopied, mediaFailed, error: error.message };
    // RLS can reject an update without raising an error; it just matches 0 rows.
    if (!updated || updated.length === 0) {
      return { ...none, skipped, mediaCopied, mediaFailed, error: "Save was blocked. Check your portfolio row-level-security policies." };
    }
  } else {
    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
    if (!profile?.username) return { ...none, skipped, error: "No profile found for your account" };
    const { error } = await supabase
      .from("portfolios")
      .insert({ user_id: user.id, username: profile.username, data: nextData });
    if (error) return { ...none, skipped, mediaCopied, mediaFailed, error: error.message };
  }

  return { linked: fresh.length, skipped, mediaCopied, mediaFailed };
}