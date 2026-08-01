"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loadPortfolioByUsername } from "@/store/slices/portfolioSlice";
import { useTheme } from "@/components/ThemeProvider";
import { Navbar } from "@/components/portfolio/Navbar";
import { HeroSection } from "@/components/portfolio/HeroSection";
import { SkillsSection } from "@/components/portfolio/SkillsSection";
import { EmploymentSection } from "@/components/portfolio/EmploymentSection";
import { ProjectsSection } from "@/components/portfolio/ProjectsSection";
import {
  EducationSection, DocumentsSection,
  ContactSection, ImpactSection,
} from "@/components/portfolio/OtherSections";
import { Loader2 } from "lucide-react";

// Renders one person's public portfolio (hero, experience, projects, etc).
// Used by:
//   - app/page.tsx        -> the site owner's portfolio, at "/"
//   - app/[username]/page -> looked up by whatever :username is in the URL
export function PortfolioView({ username }: { username: string }) {
  const dispatch  = useAppDispatch();
  const { setTheme } = useTheme();
  const settings  = useAppSelector((s) => s.portfolio.siteSettings);
  const hero      = useAppSelector((s) => s.portfolio.hero);
  const [status, setStatus] = useState<"loading" | "found" | "notfound">("loading");

  useEffect(() => {
    if (!username) return;
    setStatus("loading");
    dispatch(loadPortfolioByUsername(username)).then((result) => {
      if (result.payload) {
        setStatus("found");
        // Apply owner's default theme only if visitor hasn't set their own preference
        const preferred = (result.payload as { siteSettings?: { defaultTheme?: string } })
          ?.siteSettings?.defaultTheme as "dark" | "light" | undefined;
        const visitorPref = localStorage.getItem("theme");
        if (preferred && !visitorPref) setTheme(preferred);
      } else {
        setStatus("notfound");
      }
    });
  }, [username, dispatch, setTheme]);

  // Dynamic OG meta via document head
  useEffect(() => {
    if (status !== "found") return;
    document.title = settings?.seoTitle || `${hero?.name} — Portfolio`;

    const setMeta = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.content = content;
    };
    const setNameMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
      el.content = content;
    };

    const desc = settings?.seoDescription || `Portfolio of ${hero?.name}, ${hero?.title}`;
    const title = settings?.seoTitle || `${hero?.name} — ${hero?.title}`;
    const avatar = hero?.avatar || "";

    // Open Graph (LinkedIn, WhatsApp, Slack)
    setMeta("og:title",       title);
    setMeta("og:description", desc);
    setMeta("og:image",       avatar);
    setMeta("og:type",        "profile");
    setMeta("og:url",         window.location.href);

    // Twitter card
    setNameMeta("twitter:card",        "summary");
    setNameMeta("twitter:title",       title);
    setNameMeta("twitter:description", desc);
    setNameMeta("twitter:image",       avatar);

    // Standard meta
    setNameMeta("description", desc);
  }, [status, hero, settings]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-brand mx-auto" />
          <p className="text-muted-foreground text-sm">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-6xl font-heading font-black text-foreground">404</p>
          <p className="text-xl font-heading font-bold text-foreground">Portfolio not found</p>
          <p className="text-muted-foreground">
            <strong className="text-brand">/{username}</strong> doesn't exist yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <ImpactSection />
      <EmploymentSection />
      <ProjectsSection />
      <SkillsSection />
      <EducationSection />
      <DocumentsSection />
      <ContactSection />
      <footer className="border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            {hero?.name || "Portfolio"}
          </p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  );
}
