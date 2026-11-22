// FILE PATH: src/components/portfolio/HeroSection.tsx

"use client";
import { useEffect, useRef, useState } from "react";
import { useAppSelector, selectHero, selectSiteSettings, selectResumeUrl } from "@/hooks/redux";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Mail,
  Download,
  ArrowRight,
  Globe,
  Link2,
  Sparkles,
  Briefcase,
  FolderOpen,
  CheckCircle,
} from "lucide-react";

/* ── Typing animation ──────────────────────────────────────── */
function useTypingAnimation(words: string[], speed = 80, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return;
    const current = words[wordIdx % words.length];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setDisplay(current.slice(0, charIdx + 1));
          if (charIdx + 1 === current.length) {
            setTimeout(() => setDeleting(true), pause);
          } else {
            setCharIdx((c) => c + 1);
          }
        } else {
          setDisplay(current.slice(0, charIdx - 1));
          if (charIdx - 1 === 0) {
            setDeleting(false);
            setWordIdx((w) => (w + 1) % words.length);
            setCharIdx(0);
          } else {
            setCharIdx((c) => c - 1);
          }
        }
      },
      deleting ? speed / 2 : speed,
    );
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

/* ── Animated counter ──────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        obs.disconnect();
        let start = 0;
        const step = Math.max(1, Math.ceil(to / 40));
        const t = setInterval(() => {
          start += step;
          if (start >= to) {
            setVal(to);
            clearInterval(t);
          } else setVal(start);
        }, 30);
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

/* ── Professional info card — works for any career ─────────── */
function ProfileCard({
  hero,
  openToWork,
  noticeLabel,
}: {
  hero: {
    name: string;
    title: string;
    avatar: string;
    email: string;
    location: string;
  };
  openToWork: boolean;
  noticeLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary/40">
        <div className="relative shrink-0">
          <img
            src={hero.avatar}
            alt={hero.name}
            className="w-12 h-12 rounded-xl border-2 border-brand/20 object-cover"
          />
          {openToWork && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-brand border-2 border-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-foreground truncate">
            {hero.name}
          </p>
          <p className="text-xs text-brand font-medium truncate">
            {hero.title}
          </p>
        </div>
        {openToWork && (
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-brand/10 border border-brand/20 text-xs font-semibold text-brand shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Open
          </span>
        )}
      </div>

      {/* Info rows */}
      <div className="divide-y divide-border">
        {hero.location && (
          <div className="flex items-center gap-3 px-5 py-3">
            <MapPin size={13} className="text-brand shrink-0" />
            <span className="text-sm text-muted-foreground">
              {hero.location}
            </span>
          </div>
        )}
        {hero.email && (
          <div className="flex items-center gap-3 px-5 py-3">
            <Mail size={13} className="text-brand shrink-0" />
            <span className="text-sm text-muted-foreground truncate">
              {hero.email}
            </span>
          </div>
        )}
        {openToWork && (
          <div className="flex items-center gap-3 px-5 py-3">
            <CheckCircle size={13} className="text-green-500 shrink-0" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {noticeLabel}
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 py-4">
        <a
          href={`mailto:${hero.email}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand text-brand-fg text-sm font-semibold hover:bg-brand/90 transition-colors"
        >
          <Sparkles size={13} /> Get In Touch
        </a>
      </div>
    </div>
  );
}

/* ── Main Hero ─────────────────────────────────────────────── */
export function HeroSection() {
  const hero = useAppSelector(selectHero);
  const settings = useAppSelector(selectSiteSettings);
  const resumeUrl = useAppSelector(selectResumeUrl);
  if (!hero.isVisible) return null;
  
  const openToWork = settings?.openToWork ?? true;
  const noticePeriod = settings?.noticePeriod ?? "immediately";
  const noticeLabels: Record<string, string> = {
    immediately: "Available immediately",
    "2 weeks": "2 weeks notice",
    "1 month": "1 month notice",
    "3 months": "3 months notice",
    "not looking": "Not currently looking",
  };
  const noticeLabel = noticeLabels[noticePeriod] || noticePeriod;

  // Use hero.roles if set, fallback to [hero.title] — never hardcode professions
  const roles = hero.roles?.length
    ? hero.roles
    : hero.title
      ? [hero.title]
      : ["Professional"];

  const typed = useTypingAnimation(roles);

  const yearsExp = hero.yearsExp ?? 1;
  const projectsCount = hero.projectsCount ?? 1;

  const socials = [
    {
      key: "github",
      label: "GitHub",
      icon: Link2,
      url: hero.socialLinks.github,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: Link2,
      url: hero.socialLinks.linkedin,
    },
    {
      key: "twitter",
      label: "Twitter",
      icon: Link2,
      url: hero.socialLinks.twitter,
    },
    {
      key: "website",
      label: "Website",
      icon: Globe,
      url: hero.socialLinks.website,
    },
  ].filter((s) => s.url);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden scroll-mt-20"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Diagonal stripe — top right */}
      <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
          style={{
            background: `repeating-linear-gradient(-45deg, var(--brand) 0px, var(--brand) 1px, transparent 1px, transparent 24px)`,
          }}
        />
      </div>

      {/* Glow */}
      <div
        className="absolute top-20 right-10 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
        style={{ background: "var(--brand)", opacity: 0.07 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ── LEFT ── */}
          <div className="space-y-7">
            {/* Mobile avatar */}
            <div className="flex items-center gap-4 lg:hidden">
              <img
                src={hero.avatar}
                alt={hero.name}
                className="w-16 h-16 rounded-2xl border-2 border-brand/20 object-cover shadow-md shrink-0"
              />
              {openToWork && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand/25 bg-brand/5 text-xs font-semibold text-brand">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  {noticeLabel}
                </div>
              )}
            </div>

            {/* Availability badge */}
            <div className="hidden lg:flex items-center gap-3">
              {openToWork ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand/25 bg-brand/5 text-xs font-semibold text-brand tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  {noticeLabel.toUpperCase()}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 text-xs font-semibold text-muted-foreground tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  NOT CURRENTLY LOOKING
                </div>
              )}
              <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
            </div>

            {/* Name */}
            <div>
              <h1 className="font-heading font-extrabold leading-[0.9] tracking-tight">
                <span
                  className="block text-foreground"
                  style={{ fontSize: "clamp(2rem, 6vw, 2.5rem)" }}
                >
                  {hero.name.split(" ")[0] || "Your"}
                </span>
                <span
                  className="block"
                  style={{
                    fontSize: "clamp(2rem, 6vw, 2.5rem)",
                    background:
                      "linear-gradient(120deg, var(--brand) 20%, color-mix(in oklch, var(--brand) 40%, var(--foreground)) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {hero.name.split(" ").slice(1).join(" ") || "Name"}
                </span>
              </h1>

              {/* Typing animation — uses hero.roles, works for any profession */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-muted-foreground text-base">—</span>

                <span className="text-base md:text-xl font-medium text-foreground min-w-17.5 h-5">
                  {typed}
                  <span className="inline-block w-0.5 h-4 bg-brand ml-0.5 align-middle animate-pulse" />
                </span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-muted-foreground leading-relaxed max-w-md text-[15px]">
              {hero.bio ||
                "Professional with a passion for delivering results. Open to new opportunities."}
            </p>

            {/* Location + email */}
            <div className="flex flex-wrap gap-4 text-sm">
              {hero.location && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin size={13} className="text-brand shrink-0" />{" "}
                  {hero.location}
                </span>
              )}
              {hero.email && (
                <a
                  href={`mailto:${hero.email}`}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-brand transition-colors"
                >
                  <Mail size={13} className="text-brand shrink-0" />{" "}
                  {hero.email}
                </a>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a href="#projects">
                <Button
                  size="lg"
                  className="bg-brand text-brand-fg hover:bg-brand/90 font-semibold"
                  style={{
                    boxShadow:
                      "0 8px 32px -8px color-mix(in oklch, var(--brand) 50%, transparent)",
                  }}
                >
                  View My Work <ArrowRight size={16} />
                </Button>
              </a>
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="lg" className="font-medium">
                    <Download size={15} /> Download CV
                  </Button>
                </a>
              )}
            </div>

            {/* Social icons */}
            {socials.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">
                  Find me on
                </span>
                {socials.map(({ key, label, icon: Icon, url }) => (
                  <a
                    key={key}
                    href={url!}
                    target="_blank"
                    rel="noreferrer"
                    title={label}
                    className="h-8 w-8 rounded-lg border border-border bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-brand hover:border-brand/40 transition-all"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT — Bento ── */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {/* Profile card — full width, works for any profession */}
            <div className="col-span-2">
              <ProfileCard
                hero={hero}
                openToWork={openToWork}
                noticeLabel={noticeLabel}
              />
            </div>

            {/* Stat: Years */}
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-1 hover:border-brand/30 transition-colors group">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase size={14} className="text-brand" />
                <span className="text-xs text-muted-foreground font-medium">
                  Experience
                </span>
              </div>
              <p className="font-heading font-extrabold text-4xl text-brand leading-none">
                <Counter to={yearsExp} suffix="+" />
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Years in the field
              </p>
            </div>

            {/* Stat: Projects */}
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-1 hover:border-brand/30 transition-colors group">
              <div className="flex items-center gap-2 mb-1">
                <FolderOpen size={14} className="text-brand" />
                <span className="text-xs text-muted-foreground font-medium">
                  Projects
                </span>
              </div>
              <p className="font-heading font-extrabold text-4xl text-brand leading-none">
                <Counter to={projectsCount} suffix="+" />
              </p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}