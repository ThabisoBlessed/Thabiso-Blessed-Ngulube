"use client";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateHero } from "@/store/slices/portfolioSlice";
import { FormInput, FormTextarea, SwitchField } from "@/components/ui/form-field";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, User, Plus, X } from "lucide-react";
import type { HeroSection } from "@/types";

export function AdminHeroPanel() {
  const dispatch = useAppDispatch();
  const hero = useAppSelector((s) => s.portfolio.hero);
  const [form, setForm] = useState<HeroSection>({
    ...hero,
    roles: hero.roles?.length ? hero.roles : [hero.title || "Professional"],
    yearsExp: hero.yearsExp ?? 1,
    projectsCount: hero.projectsCount ?? 1,
  });
  const [saved, setSaved] = useState(false);
  const [roleInput, setRoleInput] = useState("");

  const set = (key: keyof HeroSection, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setSocial = (key: string, value: string) =>
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }));

  const addRole = () => {
    const trimmed = roleInput.trim();
    if (!trimmed || form.roles.includes(trimmed)) return;
    set("roles", [...form.roles, trimmed]);
    setRoleInput("");
  };

  const removeRole = (role: string) =>
    set("roles", form.roles.filter((r) => r !== role));

  const handleSave = () => {
    dispatch(updateHero(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <User size={15} /> About Me
        </div>
        <div className="flex items-center gap-3">
          <SwitchField checked={form.isVisible} onCheckedChange={(v) => set("isVisible", v)} label="Visible" />
          <Button size="sm" className="bg-brand text-brand-fg hover:bg-brand/90" onClick={handleSave}>
            <Save size={14} /> {saved ? "Saved!" : "Apply"}
          </Button>
        </div>
      </div>

      {/* Avatar + basic info */}
      <div className="grid md:grid-cols-3 gap-6">
        <FileUpload
          type="avatar"
          label="Profile Photo"
          currentUrl={form.avatar}
          onUploaded={(url) => set("avatar", url)}
        />
        <div className="md:col-span-2 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Full Name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" />
            <FormInput label="Primary Title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Chemical Engineer" />
            <FormInput label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" />
            <FormInput label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            <FormInput label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Tagline + Bio */}
      <FormInput label="Tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="One punchy sentence about what you do" />
      <FormTextarea label="Bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} placeholder="Tell recruiters who you are and what makes you valuable..." />

      {/* ── Typing Roles ───────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <Label>Rotating Titles</Label>
          <p className="text-xs text-muted-foreground mt-1">
            These cycle in the hero animation. Add titles relevant to your field — works for any profession.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 min-h-9">
          {form.roles.map((role) => (
            <span key={role}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm text-foreground">
              {role}
              <button onClick={() => removeRole(role)}
                className="text-muted-foreground hover:text-destructive transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 h-9 px-3 rounded-md border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
            placeholder="e.g. Process Engineer, Team Lead, Safety Specialist..."
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRole()}
          />
          <Button variant="outline" size="sm" onClick={addRole}>
            <Plus size={14} /> Add
          </Button>
        </div>

        {form.roles.length === 0 && (
          <p className="text-xs text-destructive">Add at least one title — it shows in the hero animation.</p>
        )}
      </div>

      {/* ── Hero Stats ─────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <Label>Hero Stats</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Shown as numbers in the hero section. Set to your actual experience.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Years of Experience</Label>
            <input
              type="number"
              min={0}
              max={50}
              value={form.yearsExp}
              onChange={(e) => set("yearsExp", Number(e.target.value))}
              className="w-full h-9 px-3 rounded-md border border-border bg-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Projects Completed</Label>
            <input
              type="number"
              min={0}
              max={999}
              value={form.projectsCount}
              onChange={(e) => set("projectsCount", Number(e.target.value))}
              className="w-full h-9 px-3 rounded-md border border-border bg-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* ── Social Links ───────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label>Social Links</Label>
        <div className="grid md:grid-cols-2 gap-3">
          <FormInput label="GitHub" value={form.socialLinks.github || ""} onChange={(e) => setSocial("github", e.target.value)} placeholder="https://github.com/username" />
          <FormInput label="LinkedIn" value={form.socialLinks.linkedin || ""} onChange={(e) => setSocial("linkedin", e.target.value)} placeholder="https://linkedin.com/in/username" />
          <FormInput label="Twitter / X" value={form.socialLinks.twitter || ""} onChange={(e) => setSocial("twitter", e.target.value)} placeholder="https://twitter.com/username" />
          <FormInput label="Website" value={form.socialLinks.website || ""} onChange={(e) => setSocial("website", e.target.value)} placeholder="https://yoursite.com" />
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-xl border border-border bg-secondary/30 p-4 flex items-center gap-4">
        <img src={form.avatar} alt="" className="w-14 h-14 rounded-full border-2 border-brand/20 object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-foreground">{form.name || "Your Name"}</p>
          <p className="text-sm text-brand">{form.title || "Your Title"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{form.location}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">Stats preview</p>
          <p className="text-sm font-bold text-brand">{form.yearsExp}+ yrs · {form.projectsCount}+ projects</p>
        </div>
      </div>
    </div>
  );
}