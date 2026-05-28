"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/components/ThemeProvider";
import {
  getAllUsers, inviteUser, suspendUser, blockUser,
  activateUser, deleteUser, setUserRole, checkIsAdmin,
  type ManagedUser,
} from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  Shield, Users, Mail, Search, Sun, Moon, LogOut,
  CheckCircle, XCircle, AlertTriangle, Trash2,
  UserPlus, ExternalLink, RefreshCw, Crown,
  Loader2, Eye, EyeOff, Ban,
} from "lucide-react";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ManagedUser["status"] }) {
  const cfg = {
    active:    { label: "Active",    class: "bg-green-500/10 text-green-500 border-green-500/20" },
    suspended: { label: "Suspended", class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    blocked:   { label: "Blocked",   class: "bg-red-500/10 text-red-500 border-red-500/20" },
  }[status] || { label: status, class: "bg-secondary text-muted-foreground border-border" };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.class}`}>
      {cfg.label}
    </span>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({
  title, description, confirmLabel, confirmClass, onConfirm, children,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Button
            className={`flex-1 ${confirmClass || "bg-brand text-brand-fg hover:bg-brand/90"}`}
            onClick={handle}
            disabled={loading}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : confirmLabel}
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── User row ──────────────────────────────────────────────────────────────────
function UserRow({ user, currentUserId, onRefresh }: {
  user: ManagedUser;
  currentUserId: string;
  onRefresh: () => void;
}) {
  const isSelf = user.id === currentUserId;
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const doAction = async (label: string, fn: () => Promise<boolean | { success: boolean; error?: string }>) => {
    setActionLoading(label);
    await fn();
    setActionLoading(null);
    onRefresh();
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
      user.status === "blocked"   ? "border-red-500/20 bg-red-500/5 opacity-60" :
      user.status === "suspended" ? "border-yellow-500/20 bg-yellow-500/5" :
      "border-border bg-card hover:border-brand/20"
    }`}>
      {/* Avatar + info */}
      <div className="relative flex-shrink-0">
        <img
          src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
          alt={user.name}
          className="w-10 h-10 rounded-xl border border-border object-cover"
        />
        {user.role === "admin" && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand flex items-center justify-center">
            <Crown size={9} className="text-brand-fg" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">{user.name || "—"}</p>
          <StatusBadge status={user.status} />
          {user.portfolioComplete && (
            <span className="text-xs text-green-500 flex items-center gap-0.5">
              <CheckCircle size={10} /> Complete
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-brand font-mono">/{user.username}</span>
          <span className="text-xs text-muted-foreground">
            Joined {new Date(user.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Actions */}
      {!isSelf && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* View portfolio */}
          <Link href={`/${user.username}`} target="_blank">
            <Button variant="ghost" size="icon" title="View portfolio">
              <ExternalLink size={14} />
            </Button>
          </Link>

          {/* Activate / Suspend */}
          {user.status === "active" ? (
            <ConfirmDialog
              title="Suspend user"
              description={`${user.name || user.email} won't be able to sign in and their portfolio will go offline.`}
              confirmLabel="Suspend"
              confirmClass="bg-yellow-500 text-black hover:bg-yellow-400"
              onConfirm={async () => { await suspendUser(user.id); onRefresh(); }}
            >
              <Button variant="ghost" size="icon" title="Suspend user"
                className="text-yellow-500 hover:bg-yellow-500/10">
                {actionLoading === "suspend" ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />}
              </Button>
            </ConfirmDialog>
          ) : user.status === "suspended" ? (
            <Button variant="ghost" size="icon" title="Reactivate user"
              className="text-green-500 hover:bg-green-500/10"
              onClick={() => doAction("activate", () => activateUser(user.id))}>
              {actionLoading === "activate" ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
            </Button>
          ) : null}

          {/* Block */}
          {user.status !== "blocked" ? (
            <ConfirmDialog
              title="Block user"
              description={`Permanently block ${user.name || user.email}. Their portfolio will be hidden and they cannot sign in.`}
              confirmLabel="Block"
              confirmClass="bg-orange-600 text-white hover:bg-orange-500"
              onConfirm={async () => { await blockUser(user.id); onRefresh(); }}
            >
              <Button variant="ghost" size="icon" title="Block user"
                className="text-orange-500 hover:bg-orange-500/10">
                <Ban size={14} />
              </Button>
            </ConfirmDialog>
          ) : (
            <Button variant="ghost" size="icon" title="Unblock"
              className="text-green-500 hover:bg-green-500/10"
              onClick={() => doAction("unblock", () => activateUser(user.id))}>
              <CheckCircle size={14} />
            </Button>
          )}

          {/* Promote / Demote admin */}
          {user.role !== "admin" ? (
            <ConfirmDialog
              title="Make admin"
              description={`Grant ${user.name || user.email} full admin access. They can manage all users.`}
              confirmLabel="Make Admin"
              onConfirm={async () => { await setUserRole(user.id, "admin"); onRefresh(); }}
            >
              <Button variant="ghost" size="icon" title="Promote to admin"
                className="text-brand hover:bg-brand/10">
                <Crown size={14} />
              </Button>
            </ConfirmDialog>
          ) : (
            <ConfirmDialog
              title="Remove admin"
              description={`Remove admin access from ${user.name || user.email}.`}
              confirmLabel="Remove Admin"
              onConfirm={async () => { await setUserRole(user.id, "user"); onRefresh(); }}
            >
              <Button variant="ghost" size="icon" title="Remove admin"
                className="text-muted-foreground hover:bg-secondary">
                <Crown size={14} />
              </Button>
            </ConfirmDialog>
          )}

          {/* Delete */}
          <ConfirmDialog
            title="Delete user permanently"
            description={`This will permanently delete ${user.name || user.email}'s account, portfolio, and all uploaded files. This cannot be undone.`}
            confirmLabel="Delete Forever"
            confirmClass="bg-destructive text-white hover:bg-destructive/90"
            onConfirm={async () => { await deleteUser(user.id); onRefresh(); }}
          >
            <Button variant="ghost" size="icon" title="Delete user"
              className="text-destructive hover:bg-destructive/10">
              <Trash2 size={14} />
            </Button>
          </ConfirmDialog>
        </div>
      )}

      {isSelf && (
        <span className="text-xs text-muted-foreground px-3 flex-shrink-0">You</span>
      )}
    </div>
  );
}

// ── Invite dialog ─────────────────────────────────────────────────────────────
function InviteDialog({ onRefresh }: { onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setResult(null);
    const res = await inviteUser(email);
    setResult(res);
    setLoading(false);
    if (res.success) {
      setEmail("");
      setTimeout(() => { setOpen(false); setResult(null); onRefresh(); }, 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand text-brand-fg hover:bg-brand/90 font-semibold">
          <UserPlus size={15} /> Invite User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite someone to folio.</DialogTitle>
          <DialogDescription>
            They'll receive an email with a magic link to set up their account and portfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {result && (
            <div className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
              result.success
                ? "bg-green-500/10 border-green-500/20 text-green-600"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}>
              {result.success
                ? <><CheckCircle size={14} /> Invite sent! They'll receive an email shortly.</>
                : <><XCircle size={14} /> {result.error}</>
              }
            </div>
          )}

          <Button type="submit" className="w-full bg-brand text-brand-fg hover:bg-brand/90" disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><Mail size={14} /> Send Invite</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const router = useRouter();
  const { theme, toggle, mounted } = useTheme();

  const [users, setUsers]       = useState<ManagedUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<"all" | "active" | "suspended" | "blocked">("all");
  const [currentUserId, setCurrentUserId] = useState("");
  const [authorized, setAuthorized]       = useState(false);

  // Auth + role check
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/auth/login"); return; }
      setCurrentUserId(session.user.id);
      const isAdmin = await checkIsAdmin();
      if (!isAdmin) { router.replace("/admin"); return; }
      setAuthorized(true);
      loadUsers();
    };
    init();
  }, [router]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authorized) loadUsers();
  }, [authorized, loadUsers]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total:     users.length,
    active:    users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    blocked:   users.filter((u) => u.status === "blocked").length,
    complete:  users.filter((u) => u.portfolioComplete).length,
  };

  if (!mounted || !authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto">
            <Loader2 size={22} className="animate-spin text-brand" />
          </div>
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border h-14 flex items-center px-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Shield size={15} className="text-brand" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-heading font-extrabold text-brand">folio.</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-foreground">Super Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              My Portfolio
            </Button>
          </Link>
          <button onClick={toggle}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-brand transition-all">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive">
            <LogOut size={14} />
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total Users",  value: stats.total,     icon: Users,         color: "text-foreground" },
            { label: "Active",       value: stats.active,    icon: CheckCircle,   color: "text-green-500" },
            { label: "Suspended",    value: stats.suspended, icon: AlertTriangle, color: "text-yellow-500" },
            { label: "Blocked",      value: stats.blocked,   icon: Ban,           color: "text-red-500" },
            { label: "Full Profile", value: stats.complete,  icon: CheckCircle,   color: "text-brand" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="hover:border-brand/20 transition-colors">
              <CardContent className="p-4">
                <Icon size={16} className={`${color} mb-2`} />
                <p className={`font-heading font-extrabold text-2xl leading-none ${color}`}>{value}</p>
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
              placeholder="Search by name, email or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-secondary/50 border border-border rounded-lg p-1">
            {(["all", "active", "suspended", "blocked"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  filter === f
                    ? "bg-background border border-border text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                {f}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </Button>
            <InviteDialog onRefresh={loadUsers} />
          </div>
        </div>

        {/* User list */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <Loader2 size={28} className="animate-spin text-brand mx-auto" />
                <p className="text-muted-foreground text-sm">Loading users...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">No users found</p>
              <p className="text-muted-foreground text-sm mt-1">
                {search ? `No results for "${search}"` : "No users in this category"}
              </p>
            </div>
          ) : (
            filtered.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                onRefresh={loadUsers}
              />
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Showing {filtered.length} of {users.length} users
          </p>
        )}
      </div>
    </div>
  );
}
