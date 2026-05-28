"use client";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addProject, updateProject, removeProject, toggleProjectVisibility, toggleProjectFeatured } from "@/store/slices/portfolioSlice";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea, SwitchField } from "@/components/ui/form-field";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, X, Code2 } from "lucide-react";
import type { Project, MediaItem, CodeSnippet } from "@/types";

const LANGUAGES = ["TypeScript","JavaScript","Python","Go","Rust","Java","C#","SQL","Bash","HTML","CSS","Other"];

const emptyProject = (): Project => ({
  id: `proj-${Date.now()}`, title: "", description: "", longDescription: "",
  thumbnail: "", media: [], snippets: [], techStack: [],
  liveUrl: "", repoUrl: "", category: "Web App", featured: false, isVisible: true,
});

function ProjectForm({ initial, onSave, onCancel }: { initial: Project; onSave: (p: Project) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const [techInput, setTechInput] = useState("");
  const [snippetForm, setSnippetForm] = useState<Partial<CodeSnippet> | null>(null);

  const set = (k: keyof Project, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const addTech = () => {
    if (techInput.trim() && !form.techStack.includes(techInput.trim())) {
      set("techStack", [...form.techStack, techInput.trim()]);
      setTechInput("");
    }
  };

  const addMedia = (url: string, type: "image" | "video") => {
    const item: MediaItem = { id: `m-${Date.now()}`, type, url };
    set("media", [...form.media, item]);
  };

  const addSnippet = () => {
    if (snippetForm?.title && snippetForm?.code) {
      const s: CodeSnippet = {
        id: `snip-${Date.now()}`,
        title: snippetForm.title,
        language: snippetForm.language || "TypeScript",
        code: snippetForm.code,
        description: snippetForm.description || "",
      };
      set("snippets", [...(form.snippets || []), s]);
      setSnippetForm(null);
    }
  };

  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
        <FormInput label="Category" value={form.category} onChange={(e) => set("category", e.target.value)} />
      </div>
      <FormInput label="Short Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
      <FormTextarea label="Long Description" value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} rows={3} />
      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Live URL" value={form.liveUrl || ""} onChange={(e) => set("liveUrl", e.target.value)} placeholder="https://..." />
        <FormInput label="Repo URL" value={form.repoUrl || ""} onChange={(e) => set("repoUrl", e.target.value)} placeholder="https://github.com/..." />
      </div>

      {/* Thumbnail upload */}
      <FileUpload type="image" label="Thumbnail" currentUrl={form.thumbnail} onUploaded={(url) => set("thumbnail", url)} />

      {/* Media — screenshots + videos */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Screenshots & Videos ({form.media.length})
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {form.media.map((m) => (
            <div key={m.id} className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-secondary">
              {m.type === "image"
                ? <img src={m.url} alt="" className="w-full h-full object-cover" />
                : <video src={m.url} className="w-full h-full object-cover" />}
              <button onClick={() => set("media", form.media.filter((x) => x.id !== m.id))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FileUpload type="image" label="Add Screenshot" onUploaded={(url) => addMedia(url, "image")} />
          <FileUpload type="video" label="Add Video (max 1 min)" onUploaded={(url) => addMedia(url, "video")} />
        </div>
      </div>

      {/* Code snippets */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Code Snippets ({(form.snippets || []).length})
        </p>
        <div className="space-y-2 mb-3">
          {(form.snippets || []).map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-secondary/50">
              <Code2 size={14} className="text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.language}</p>
              </div>
              <button onClick={() => set("snippets", (form.snippets || []).filter((x) => x.id !== s.id))}
                className="text-muted-foreground hover:text-destructive transition-colors">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        {snippetForm ? (
          <div className="space-y-3 p-4 rounded-xl border border-brand/20 bg-accent/30">
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Snippet Title" value={snippetForm.title || ""} onChange={(e) => setSnippetForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Auth middleware" />
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Language</p>
                <select className="w-full h-9 px-3 rounded-md border border-border bg-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring"
                  value={snippetForm.language || "TypeScript"}
                  onChange={(e) => setSnippetForm((f) => ({ ...f, language: e.target.value }))}>
                  {LANGUAGES.map((l) => <option key={l} value={l} className="bg-card">{l}</option>)}
                </select>
              </div>
            </div>
            <FormInput label="Description (optional)" value={snippetForm.description || ""} onChange={(e) => setSnippetForm((f) => ({ ...f, description: e.target.value }))} />
            <FormTextarea label="Code" value={snippetForm.code || ""} onChange={(e) => setSnippetForm((f) => ({ ...f, code: e.target.value }))} rows={6} className="font-mono text-sm" placeholder="Paste your code here..." />
            <div className="flex gap-2">
              <Button size="sm" className="bg-brand text-brand-fg hover:bg-brand/90" onClick={addSnippet}>Add Snippet</Button>
              <Button size="sm" variant="ghost" onClick={() => setSnippetForm(null)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setSnippetForm({ language: "TypeScript" })}>
            <Code2 size={14} /> Add Code Snippet
          </Button>
        )}
      </div>

      {/* Tech stack */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tech Stack</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.techStack.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs rounded-full px-2.5 py-1">
              {t}
              <button onClick={() => set("techStack", form.techStack.filter((x) => x !== t))} className="hover:text-destructive"><X size={10} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 h-9 px-3 rounded-md border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
            placeholder="Add tech..." value={techInput} onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTech()} />
          <Button variant="outline" size="icon" onClick={addTech}><Plus size={14} /></Button>
        </div>
      </div>

      <div className="flex gap-4">
        <SwitchField checked={form.featured} onCheckedChange={(v) => set("featured", v)} label="Featured" />
        <SwitchField checked={form.isVisible} onCheckedChange={(v) => set("isVisible", v)} label="Visible" />
      </div>

      <div className="flex gap-3 pt-2">
        <Button className="flex-1 bg-brand text-brand-fg hover:bg-brand/90" onClick={() => form.title && onSave(form)}>Save Project</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export function AdminProjectsPanel() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector((s) => s.portfolio.projects);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{projects.length} projects · {projects.filter((p) => p.featured).length} featured</p>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-brand text-brand-fg hover:bg-brand/90"><Plus size={14} /> Add Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add Project</DialogTitle></DialogHeader>
            <ProjectForm initial={emptyProject()} onSave={(p) => { dispatch(addProject(p)); setIsAdding(false); }} onCancel={() => setIsAdding(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {projects.map((proj) => (
          <div key={proj.id} className={`rounded-xl border overflow-hidden transition-all ${proj.isVisible ? "border-border" : "border-border/50 opacity-50"}`}>
            {proj.thumbnail && (
              <div className="h-28 overflow-hidden bg-secondary">
                <img src={proj.thumbnail} alt={proj.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-heading font-bold text-foreground text-sm">{proj.title}</p>
                  <p className="text-xs text-muted-foreground">{proj.category}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className={proj.featured ? "text-brand" : "text-muted-foreground"}
                    onClick={() => dispatch(toggleProjectFeatured(proj.id))} title="Toggle featured">
                    <Star size={13} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => dispatch(toggleProjectVisibility(proj.id))}>
                    {proj.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </Button>
                  <Dialog open={editTarget?.id === proj.id} onOpenChange={(o) => !o && setEditTarget(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(proj)}><Pencil size={13} /></Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
                      {editTarget && <ProjectForm initial={editTarget} onSave={(p) => { dispatch(updateProject(p)); setEditTarget(null); }} onCancel={() => setEditTarget(null)} />}
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => dispatch(removeProject(proj.id))}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {proj.techStack.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                {proj.media.length > 0 && <Badge variant="outline" className="text-xs">{proj.media.length} media</Badge>}
                {(proj.snippets || []).length > 0 && <Badge variant="outline" className="text-xs"><Code2 size={9} className="mr-1" />{proj.snippets.length}</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
