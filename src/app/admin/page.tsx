"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch, selectUser, selectSiteSettings, selectIsAdmin } from "@/hooks/redux";
import { useTheme } from "@/components/ThemeProvider";
import { loadMyPortfolio, persistPortfolio } from "@/store/slices/portfolioSlice";
import { fetchCurrentUser, clearUser } from "@/store/slices/authSlice";
import { signOut } from "@/lib/portfolio-api";
import { supabase } from "@/lib/supabase";
import { AdminHeroPanel } from "@/components/admin/AdminHeroPanel";
import { AdminSkillsPanel } from "@/components/admin/AdminSkillsPanel";
import { AdminEmploymentPanel } from "@/components/admin/AdminEmploymentPanel";
import { AdminProjectsPanel } from "@/components/admin/AdminProjectsPanel";
import { AdminEducationPanel, AdminDocumentsPanel } from "@/components/admin/AdminEduDocsPanel";
import { AdminCVBuilderPanel } from "@/components/admin/AdminCVBuilderPanel";
import { AdminSettingsPanel } from "@/components/admin/AdminSettingsPanel";
import {
  User, Code2, Briefcase, FolderOpen, GraduationCap,
  FileText, Settings, Eye, Sun, Moon, ChevronRight,
  LogOut, Save, Loader2, ExternalLink, CheckCircle, Shield, Menu, X,
} from "lucide-react";

const TABS = [
  { id: "hero",       label: "About Me",   icon: User,          panel: AdminHeroPanel,       desc: "Name, bio & contact" },
  { id: "employment", label: "Experience", icon: Briefcase,     panel: AdminEmploymentPanel, desc: "Jobs & achievements" },
  { id: "projects",   label: "Projects",   icon: FolderOpen,    panel: AdminProjectsPanel,   desc: "Portfolio work" },
  { id: "skills",     label: "Skills",     icon: Code2,         panel: AdminSkillsPanel,     desc: "Tech & proficiency" },
  { id: "education",  label: "Education",  icon: GraduationCap, panel: AdminEducationPanel,  desc: "Degrees & certs" },
  { id: "documents",  label: "Documents",  icon: FileText,      panel: AdminDocumentsPanel,  desc: "CV & files" },
  { id: "settings",   label: "Settings",   icon: Settings,      panel: AdminSettingsPanel,   desc: "Visibility & SEO" },
  { id: "cv-builder", label: "CV Builder", icon: FileText, panel: AdminCVBuilderPanel, desc: "Edit & download your CV/cover letter" }
] as const;
type TabId = typeof TABS[number]["id"];

function useCompleteness(portfolio: { hero: { name: string; bio: string; avatar: string }; employment: unknown[]; projects: unknown[]; skills: unknown[]; education: unknown[]; documents: unknown[]; impactMetrics?: unknown[] }) {
  const checks = [
    { label: "Name & title",    done: !!portfolio.hero?.name },
    { label: "Bio",             done: !!portfolio.hero?.bio },
    { label: "Photo",           done: !!portfolio.hero?.avatar && !portfolio.hero.avatar.includes("dicebear") },
    { label: "Experience",      done: portfolio.employment?.length > 0 },
    { label: "Projects",        done: portfolio.projects?.length > 0 },
    { label: "Skills",          done: portfolio.skills?.length > 0 },
    { label: "Education",       done: portfolio.education?.length > 0 },
    { label: "CV uploaded",     done: (portfolio.documents as { category: string }[])?.some?.((d) => d.category === "CV") ?? false },
    { label: "Impact metrics",  done: (portfolio.impactMetrics?.length ?? 0) > 0 },
  ];
  const done = checks.filter((c) => c.done).length;
  return { score: Math.round((done / checks.length) * 100), done, total: checks.length, checks };
}

export default function AdminPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme, toggle, mounted } = useTheme();
  const portfolio = useAppSelector((s) => s.portfolio);
  const siteSettings = useAppSelector(selectSiteSettings);
  const isAdmin = useAppSelector(selectIsAdmin);
  const user = useAppSelector(selectUser);
  const authLoading = useAppSelector((s) => s.auth.loading);

  const [active, setActive] = useState<TabId>("hero");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [appReady, setAppReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Step 1: check auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/auth/login");
        return;
      }
      Promise.all([
        dispatch(fetchCurrentUser()),
        dispatch(loadMyPortfolio()),
      ]).finally(() => setAppReady(true));
    });
  }, [dispatch, router]);

  // Auto-save debounce
  const handleSave = useCallback(async () => {
    setSaving(true);
    await dispatch(persistPortfolio());
    setSaving(false);
    setSaveMsg("Saved!");
    setTimeout(() => setSaveMsg(""), 2000);
  }, [dispatch]);

  const handleSignOut = async () => {
    await signOut();
    dispatch(clearUser());
    router.push("/auth/login");
  };

  // Close sidebar when a tab is selected (mobile)
  const handleTabClick = (id: TabId) => {
    setActive(id);
    setSidebarOpen(false);
  };

  if (!mounted || !appReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto">
            <Loader2 size={22} className="animate-spin text-brand" />
          </div>
          <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const tab = TABS.find((t) => t.id === active)!;
  const Panel = tab.panel;

  // Sidebar content (same for desktop and mobile drawer)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User card */}
      {user && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50 border border-border mb-4">
          <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-lg border border-border shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-brand truncate">/{user.username}</p>
          </div>
        </div>
      )}

      {/* Completeness bar */}
      {(() => {
        const { score, done, total } = useCompleteness(portfolio);
        const color = score === 100 ? "bg-green-500" : score >= 70 ? "bg-brand" : "bg-orange-400";
        return (
          <div className="px-1 mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">Profile complete</span>
              <span className={`text-xs font-bold ${score === 100 ? "text-green-500" : "text-brand"}`}>{score}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
            </div>
            {score < 100 && (
              <p className="text-xs text-muted-foreground mt-1">{done}/{total} sections filled</p>
            )}
            {score === 100 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                <CheckCircle size={11} /> Portfolio complete!
              </div>
            )}
          </div>
        );
      })()}

      {/* Nav items */}
      <div className="flex-1 space-y-1">
        {TABS.map(({ id, label, icon: Icon, desc }) => (
          <button key={id} onClick={() => handleTabClick(id)}
            className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
              active === id
                ? "bg-accent border border-brand/20 text-accent-foreground"
                : "hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
            }`}>
            <Icon size={15} className={`mt-0.5 shrink-0 ${active === id ? "text-brand" : ""}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{label}</p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Live section dots */}
      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Live Sections
        </p>
        {Object.entries(siteSettings.showSections).map(([key, on]) => (
          <div key={key} className="flex items-center justify-between px-1 py-0.5">
            <span className="text-xs text-muted-foreground capitalize">{key}</span>
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${on ? "bg-brand" : "bg-border"}`} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar - responsive */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border h-14 flex items-center">
        <div className="w-full px-3 sm:px-6 flex items-center justify-between gap-2">
          {/* Left side: hamburger (mobile) + breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:text-brand hover:border-brand/40 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="font-heading font-extrabold text-brand">folio.</span>
              <ChevronRight size={13} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground hidden sm:inline truncate max-w-24">
                {user?.username || "admin"}
              </span>
              <ChevronRight size={13} className="text-muted-foreground shrink-0 hidden sm:inline" />
              <span className="text-foreground font-medium truncate">{tab.label}</span>
            </div>
          </div>

          {/* Right actions - compact on mobile */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Save button - icon only on small screens */}
            <button onClick={handleSave} disabled={saving}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2 sm:px-3 h-8 rounded-lg transition-all cursor-pointer
                ${saveMsg
                  ? "bg-green-500/10 border border-green-500/30 text-green-600"
                  : "bg-brand/10 border border-brand/20 text-brand hover:bg-brand/20"
                }`}>
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              <span className="hidden sm:inline">{saveMsg || "Save"}</span>
            </button>

            {/* Super admin link - icon only on small screens */}
            {isAdmin && (
              <Link href="/super-admin"
                className="flex items-center gap-1.5 text-xs font-semibold text-brand border border-brand/30 hover:border-brand/60 bg-brand/5 hover:bg-brand/10 rounded-lg px-2 sm:px-3 h-8 transition-all">
                <Shield size={12} />
                <span className="hidden sm:inline">Super Admin</span>
              </Link>
            )}

            {/* Preview - icon only on small screens */}
            {user?.username && (
              <Link href={`/${user.username}`} target="_blank"
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-brand border border-border hover:border-brand/40 rounded-lg px-2 sm:px-3 h-8 transition-all">
                <Eye size={12} />
                <span className="hidden sm:inline">Preview</span>
                <ExternalLink size={10} className="hidden sm:inline" />
              </Link>
            )}

            {/* Theme toggle - always icon */}
            <button onClick={toggle}
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-brand hover:border-brand/40 transition-all cursor-pointer">
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* User + signout - only avatar and signout icon on mobile */}
            {user && (
              <div className="flex items-center gap-1 pl-1 border-l border-border ml-1">
                <img src={user.avatarUrl} alt={user.name}
                  className="w-7 h-7 rounded-full border border-border hidden sm:block" />
                <button onClick={handleSignOut}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                  title="Sign out">
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r border-border shadow-xl flex flex-col p-4 overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button onClick={() => setSidebarOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary">
                <X size={16} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar + main content */}
      <div className="flex flex-1">
        {/* Sidebar - hidden on mobile, visible on md and up */}
        <aside className="hidden md:block w-56 shrink-0 border-r border-border p-3 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main content - full width on mobile */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent border border-brand/20 flex items-center justify-center shrink-0">
              <tab.icon size={18} className="text-brand" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">{tab.label}</h1>
              <p className="text-sm text-muted-foreground">{tab.desc}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <Panel />
          </div>
        </main>
      </div>
    </div>
  );
}