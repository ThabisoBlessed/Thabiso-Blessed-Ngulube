"use client";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, ArrowRight, Zap, Globe, Shield, Layers } from "lucide-react";

const FEATURES = [
  { icon: Zap,    title: "5-minute setup",     desc: "Sign up, fill your info, go live. No code needed." },
  { icon: Globe,  title: "yourname.folio.app",  desc: "Your own public URL, shareable with any recruiter." },
  { icon: Layers, title: "Full admin control",  desc: "Toggle sections, hide items, update anything live." },
  { icon: Shield, title: "Private by default",  desc: "You choose what recruiters see. Everything else stays hidden." },
];

export default function LandingPage() {
  const { theme, toggle, mounted } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-heading font-extrabold text-xl">folio<span className="text-brand">.</span></span>
          <div className="flex items-center gap-2">
            {mounted && (
              <button onClick={toggle}
                className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-brand hover:border-brand/40 transition-all">
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-brand text-brand-fg hover:bg-brand/90 font-semibold">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 blur-[120px] opacity-15 rounded-full"
          style={{ background: "var(--brand)" }} />

        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/30 bg-brand-muted text-sm font-medium text-accent-foreground">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Free for everyone
          </div>

          <h1 className="font-heading font-extrabold text-5xl md:text-7xl leading-none tracking-tight">
            Your portfolio.<br />
            <span style={{
              background: "linear-gradient(135deg, var(--brand) 0%, color-mix(in oklch, var(--brand) 50%, var(--foreground)) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Your rules.
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Build a beautiful professional portfolio with a live admin dashboard.
            Share one link with recruiters. Update anything in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/auth/register">
              <Button size="lg" className="bg-brand text-brand-fg hover:bg-brand/90 font-semibold shadow-lg shadow-brand/20">
                Create your portfolio <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/alexmokoena">
              <Button variant="outline" size="lg">See example portfolio</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground">Everything you need</h2>
            <p className="text-muted-foreground mt-2">Manage your entire professional presence from one dashboard.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-border bg-card hover:border-brand/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent border border-brand/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-brand" />
                </div>
                <div>
                  <p className="font-heading font-bold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-lg mx-auto space-y-6">
          <h2 className="font-heading font-extrabold text-4xl text-foreground">
            Ready to stand out?
          </h2>
          <p className="text-muted-foreground">
            Join developers, designers, and engineers who use folio to land their next opportunity.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-brand text-brand-fg hover:bg-brand/90 font-semibold shadow-lg shadow-brand/20">
              Build your portfolio — it's free <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="font-heading font-bold text-foreground">folio<span className="text-brand">.</span></span>
          <span>© {new Date().getFullYear()} · Built with Next.js + Supabase</span>
        </div>
      </footer>
    </div>
  );
}
