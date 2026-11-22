"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllProjects, linkProjectsToMyAccount, type ProjectWithOwner } from "@/lib/projects-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FolderOpen, Link2, Loader2, RefreshCw, Search, Users, XCircle } from "lucide-react";

const itemKey = (it: ProjectWithOwner) => `${it.ownerId}:${it.project.id}`;

export function AllProjectsPanel() {
  const [items, setItems] = useState<ProjectWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [canLink, setCanLink] = useState(false);
  const [search, setSearch] = useState("");
  const [owner, setOwner] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  // Manual refresh (button, and after linking).
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const res = await getAllProjects();
    setItems(res.items);
    setCanLink(res.canLink);
    setLoadError(res.error ?? "");
    setLoading(false);
  }, []);

  // First load: state is only set after the fetch resolves, never synchronously.
  useEffect(() => {
    let cancelled = false;
    getAllProjects().then((res) => {
      if (cancelled) return;
      setItems(res.items);
      setCanLink(res.canLink);
      setLoadError(res.error ?? "");
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const owners = useMemo(() => {
    const m = new Map<string, string>();
    items.forEach((it) => m.set(it.ownerUsername, it.ownerName));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (owner !== "all" && it.ownerUsername !== owner) return false;
      if (!q) return true;
      const p = it.project;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        it.ownerUsername.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, search, owner]);

  const linkable = (it: ProjectWithOwner) => canLink && !it.isMine && !it.alreadyLinked;
  const linkableVisible = filtered.filter(linkable);

  const toggle = (it: ProjectWithOwner) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const k = itemKey(it);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });

  const doLink = async (list: ProjectWithOwner[]) => {
    if (list.length === 0) return;
    setBusy(true);
    setNotice(null);
    const res = await linkProjectsToMyAccount(list);
    setBusy(false);
    if (res.error) {
      setNotice({ ok: false, text: res.error });
      return;
    }
    setSelected(new Set());
    setNotice({
      ok: true,
      text: `Linked ${res.linked} project${res.linked === 1 ? "" : "s"} to your account` +
        (res.skipped ? ` (${res.skipped} skipped, already yours or already linked)` : "") +
        (res.mediaCopied ? `. Copied ${res.mediaCopied} file${res.mediaCopied === 1 ? "" : "s"} into your storage` : "") +
        (res.mediaFailed ? ` (${res.mediaFailed} could not be copied and still point at the original)` : "") +
        ". They start hidden: open Admin → Projects to review and make them visible.",
    });
    await load();
  };

  const selectedItems = items.filter((it) => selected.has(itemKey(it)) && linkable(it));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Projects in DB", value: items.length, icon: FolderOpen },
          { label: "Owners", value: owners.length, icon: Users },
          { label: "Not yet linked", value: items.filter(linkable).length, icon: Link2 },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="hover:border-brand/20 transition-colors">
            <CardContent className="p-4">
              <Icon size={16} className="text-brand mb-2" />
              <p className="font-heading font-extrabold text-2xl leading-none text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title, tech, category or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All owners</option>
          {owners.map(([u, n]) => <option key={u} value={u}>{n} (@{u})</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} title="Refresh">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {!canLink && !loading && !loadError && (
        <div className="p-3 rounded-lg border border-border bg-secondary/40 text-sm text-muted-foreground">
          View only. Linking projects is limited to the site owner&apos;s account.
        </div>
      )}

      {/* Bulk actions */}
      {canLink && (<div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          className="bg-brand text-brand-fg hover:bg-brand/90"
          disabled={busy || selectedItems.length === 0}
          onClick={() => doLink(selectedItems)}
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
          Link selected ({selectedItems.length})
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy || linkableVisible.length === 0}
          onClick={() => doLink(linkableVisible)}
        >
          Link all {owner === "all" && !search ? "" : "shown "}({linkableVisible.length})
        </Button>
      </div>)}

      {notice && (
        <div className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${
          notice.ok
            ? "bg-green-500/10 border-green-500/20 text-green-600"
            : "bg-destructive/10 border-destructive/20 text-destructive"
        }`}>
          {notice.ok ? <CheckCircle size={14} className="mt-0.5 shrink-0" /> : <XCircle size={14} className="mt-0.5 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}
      {loadError && (
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          {loadError}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-brand" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No projects found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((it) => {
            const p = it.project;
            const k = itemKey(it);
            const canLink = linkable(it);
            return (
              <div key={k} className={`rounded-xl border overflow-hidden transition-all ${
                selected.has(k) ? "border-brand/60 bg-brand/5" : "border-border bg-card"
              }`}>
                {p.thumbnail && (
                  <div className="h-24 overflow-hidden bg-secondary">
                    <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    {canLink && (
                      <input
                        type="checkbox"
                        checked={selected.has(k)}
                        onChange={() => toggle(it)}
                        className="mt-1 accent-[var(--brand)] cursor-pointer"
                        aria-label={`Select ${p.title}`}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-bold text-sm text-foreground truncate">{p.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.category} · <span className="text-brand font-mono">@{it.ownerUsername}</span>
                      </p>
                    </div>
                    {it.isMine && <Badge className="text-xs">Yours</Badge>}
                    {it.alreadyLinked && <Badge variant="outline" className="text-xs">Linked</Badge>}
                  </div>
                  {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
                  <div className="flex flex-wrap gap-1">
                    {p.techStack.slice(0, 4).map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                    {!p.isVisible && <Badge variant="outline" className="text-xs">Hidden by owner</Badge>}
                  </div>
                  {canLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={busy}
                      onClick={() => doLink([it])}
                    >
                      <Link2 size={13} /> Link to my account
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Showing {filtered.length} of {items.length} projects
      </p>
    </div>
  );
}