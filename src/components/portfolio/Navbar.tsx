"use client";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/hooks/redux";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Settings, Menu, X } from "lucide-react";

const NAV = [
  { label: "Experience", href: "#experience" },
  { label: "Projects",   href: "#projects"   },
  { label: "Skills",     href: "#skills"     },
  { label: "Education",  href: "#education"  },
];

export function Navbar() {
  const hero = useAppSelector((s) => s.portfolio.hero);
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const navbarHeight = 64;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navbarHeight,
        behavior: 'smooth',
      });
    }
    setOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
        : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-heading font-extrabold text-lg sm:text-xl text-foreground tracking-tight truncate max-w-37.5 sm:max-w-none">
          {hero.name.split(" ")[0]}<span className="text-brand">.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => handleNavClick(e, l.href)}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all">
              {l.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={toggle}
            className="h-9 w-9 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:text-brand hover:border-brand/40 hover:bg-accent transition-all cursor-pointer">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <a href={hero.resumeUrl} target="_blank" className="hidden sm:inline-block">
            <Button size="sm" className="bg-brand text-brand-fg hover:bg-brand/90 font-semibold shadow-sm shadow-brand/20">
              Hire Me
            </Button>
          </a>

          {/* <Link href="/admin" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Settings size={14} /> Admin
            </Button>
          </Link> */}

          <button className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground"
            onClick={() => setOpen(!open)}>
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu - now inside the same container */}
      {open && (
        <div className="md:hidden max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-background/95 backdrop-blur-xl border border-border rounded-xl mt-2 px-4 py-3 space-y-1">
            {NAV.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => handleNavClick(e, l.href)}
                className="block px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all">
                {l.label}
              </a>
            ))}
            <div className="pt-2 border-t border-border">
              <a href={hero.resumeUrl} target="_blank" onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-brand hover:text-brand/80 rounded-lg hover:bg-secondary transition-all">
                Hire Me
              </a>
              <Link href="/admin" onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all">
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}