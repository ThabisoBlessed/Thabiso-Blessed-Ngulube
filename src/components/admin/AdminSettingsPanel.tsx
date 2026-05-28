"use client";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { toggleSectionVisibility, updateSiteSettings, addImpactMetric, updateImpactMetric, removeImpactMetric, toggleImpactMetricVisibility } from "@/store/slices/portfolioSlice";
import { selectSiteSettings, selectAllImpactMetrics } from "@/hooks/redux";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormInput } from "@/components/ui/form-field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Eye, Sun, Moon, Briefcase, Plus, Pencil, Trash2, EyeOff } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import type { SiteSettings, ImpactMetric } from "@/types";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero / About Me",
  skills: "Skills",
  employment: "Work Experience",
  projects: "Projects",
  education: "Education",
  documents: "Documents",
  impact: "Impact & Results",
  contact: "Contact Section",
  testimonials: "Testimonials",
};

const NOTICE_OPTIONS: { value: SiteSettings["noticePeriod"]; label: string }[] = [
  { value: "immediately", label: "Available immediately" },
  { value: "2 weeks",     label: "2 weeks notice" },
  { value: "1 month",     label: "1 month notice" },
  { value: "3 months",    label: "3 months notice" },
  { value: "not looking", label: "Not looking" },
];

const emptyMetric = (): ImpactMetric => ({
  id: `im-${Date.now()}`, value: "", label: "", description: "", isVisible: true,
});

function MetricForm({ initial, onSave, onCancel }: {
  initial: ImpactMetric; onSave: (m: ImpactMetric) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof ImpactMetric, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Value" value={form.value} onChange={(e) => set("value", e.target.value)} placeholder="e.g. 4M+" />
        <FormInput label="Label" value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Users Served" />
      </div>
      <FormInput label="Description (optional)" value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Brief context..." />
      <div className="flex gap-3 pt-2">
        <Button className="flex-1 bg-brand text-brand-fg hover:bg-brand/90" onClick={() => form.value && form.label && onSave(form)}>Save</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export function AdminSettingsPanel() {
  const dispatch   = useAppDispatch();
  const settings   = useAppSelector(selectSiteSettings);
  const metrics    = useAppSelector(selectAllImpactMetrics);
  const { setTheme } = useTheme();
  const [editMetric, setEditMetric] = useState<ImpactMetric | null>(null);
  const [addingMetric, setAddingMetric] = useState(false);

  const handleDefaultTheme = (t: "dark" | "light") => {
    dispatch(updateSiteSettings({ defaultTheme: t }));
    setTheme(t); // apply immediately in admin
  };

  return (
    <div className="space-y-8">

      {/* ── Availability ── */}
      <div className="rounded-xl border border-border bg-secondary/30 p-5 space-y-5">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">Availability</p>

        {/* Open to work toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Open to Work</p>
            <p className="text-xs text-muted-foreground mt-0.5">Shows green badge and availability status on your portfolio</p>
          </div>
          <Switch
            checked={settings.openToWork ?? true}
            onCheckedChange={(v) => dispatch(updateSiteSettings({ openToWork: v }))}
          />
        </div>

        {/* Notice period */}
        <div className="space-y-2">
          <Label>Notice Period</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {NOTICE_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => dispatch(updateSiteSettings({ noticePeriod: opt.value }))}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  settings.noticePeriod === opt.value
                    ? "bg-brand/10 border-brand/40 text-brand"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-brand/20 hover:text-foreground"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Default Theme ── */}
      <div className="rounded-xl border border-border bg-secondary/30 p-5 space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-1">Default Theme</p>
          <p className="text-xs text-muted-foreground">Visitors see your portfolio in this theme by default</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(["light", "dark"] as const).map((t) => (
            <button key={t} onClick={() => handleDefaultTheme(t)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                (settings.defaultTheme || settings.theme) === t
                  ? "border-brand bg-brand/5"
                  : "border-border bg-secondary/30 hover:border-brand/30"
              }`}>
              {t === "light"
                ? <Sun size={18} className={(settings.defaultTheme || settings.theme) === "light" ? "text-brand" : "text-muted-foreground"} />
                : <Moon size={18} className={(settings.defaultTheme || settings.theme) === "dark" ? "text-brand" : "text-muted-foreground"} />
              }
              <div className="text-left">
                <p className={`text-sm font-semibold capitalize ${(settings.defaultTheme || settings.theme) === t ? "text-brand" : "text-foreground"}`}>{t}</p>
                <p className="text-xs text-muted-foreground">{t === "light" ? "Clean & minimal" : "Elegant & bold"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Impact Metrics ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Impact Metrics</p>
          <Dialog open={addingMetric} onOpenChange={setAddingMetric}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-brand text-brand-fg hover:bg-brand/90"><Plus size={14} /> Add Metric</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Impact Metric</DialogTitle></DialogHeader>
              <MetricForm initial={emptyMetric()} onSave={(m) => { dispatch(addImpactMetric(m)); setAddingMetric(false); }} onCancel={() => setAddingMetric(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <div key={m.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${m.isVisible ? "border-border bg-card" : "border-border/50 opacity-50"}`}>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-extrabold text-2xl text-brand leading-none">{m.value}</p>
                <p className="text-xs font-semibold text-foreground mt-1">{m.label}</p>
                {m.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.description}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => dispatch(toggleImpactMetricVisibility(m.id))}>
                  {m.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                </Button>
                <Dialog open={editMetric?.id === m.id} onOpenChange={(o) => !o && setEditMetric(null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditMetric(m)}><Pencil size={12} /></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Edit Metric</DialogTitle></DialogHeader>
                    {editMetric && <MetricForm initial={editMetric} onSave={(m) => { dispatch(updateImpactMetric(m)); setEditMetric(null); }} onCancel={() => setEditMetric(null)} />}
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => dispatch(removeImpactMetric(m.id))}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section Visibility ── */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-brand mb-4">Section Visibility</p>
        {(Object.keys(settings.showSections) as Array<keyof SiteSettings["showSections"]>).map((key) => (
          <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
            <span className="text-sm text-foreground">{SECTION_LABELS[key] || key}</span>
            <Switch checked={settings.showSections[key]} onCheckedChange={() => dispatch(toggleSectionVisibility(key))} />
          </div>
        ))}
      </div>

      {/* ── SEO ── */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">SEO / Metadata</p>
        <div className="space-y-1.5">
          <Label>Site Title</Label>
          <Input value={settings.seoTitle} onChange={(e) => dispatch(updateSiteSettings({ seoTitle: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Meta Description</Label>
          <Input value={settings.seoDescription} onChange={(e) => dispatch(updateSiteSettings({ seoDescription: e.target.value }))} />
        </div>
      </div>

      {/* ── Preview ── */}
      <div className="rounded-xl border border-brand/20 bg-accent p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Preview Portfolio</p>
          <p className="text-xs text-muted-foreground mt-0.5">See exactly what visitors see</p>
        </div>
        <Link href="/" target="_blank">
          <Button size="sm" className="bg-brand text-brand-fg hover:bg-brand/90">
            <Eye size={14} /> Preview <ExternalLink size={12} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
