"use client";
import { useState } from "react";
import { useAppSelector, selectVisibleProjects, selectSiteSettings } from "@/hooks/redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SectionHeader } from "./SectionHeader";
import { CodeBlock } from "@/components/ui/code-block";
import { ExternalLink, GitBranch, Play, ImageIcon, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/types";

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const cur = project.media[idx];
  return (
    <DialogContent className="max-w-3xl" onInteractOutside={onClose}>
      <DialogHeader>
        <DialogTitle>{project.title}</DialogTitle>
        <DialogDescription>{project.description}</DialogDescription>
      </DialogHeader>
      {project.media.length > 0 && (
        <div className="relative rounded-xl overflow-hidden bg-secondary aspect-video mb-4">
          {cur.type === "image"
            ? <img src={cur.url} alt={cur.caption} className="w-full h-full object-cover" />
            : <video src={cur.url} controls className="w-full h-full" />}
          {project.media.length > 1 && <>
            <button onClick={() => setIdx((i) => (i - 1 + project.media.length) % project.media.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center hover:bg-background transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setIdx((i) => (i + 1) % project.media.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center hover:bg-background transition-colors">
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {project.media.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-brand" : "w-1.5 bg-foreground/30"}`} />
              ))}
            </div>
          </>}
        </div>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{project.longDescription}</p>
      {(project.snippets || []).length > 0 && (
        <div className="space-y-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Code Snippets</p>
          {project.snippets.map((s) => (
            <CodeBlock key={s.id} code={s.code} language={s.language} title={s.title} />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {project.techStack.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
      </div>
      <div className="flex gap-3">
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            <Button size="sm"><ExternalLink size={14} /> Live Demo</Button>
          </a>
        )}
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm"><GitBranch size={14} /> Source</Button>
          </a>
        )}
      </div>
    </DialogContent>
  );
}

function ProjectCard({ project, onClick, featured }: { project: Project; onClick: () => void; featured?: boolean }) {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg hover:border-brand/30 transition-all duration-300"
      onClick={onClick}>
      <div className={`relative overflow-hidden ${featured ? "h-52" : "h-40"}`}>
        <img src={project.thumbnail} alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge className="bg-brand/90 text-white border-0 text-xs">{project.category}</Badge>
          {project.featured && <Badge className="bg-background/80 border border-border text-xs"><Star size={9} className="mr-1" />Featured</Badge>}
        </div>
        {project.media.length > 0 && (
          <div className="absolute top-3 right-3 flex gap-1">
            {project.media.some((m) => m.type === "video") && (
              <span className="h-6 w-6 rounded-full bg-background/70 flex items-center justify-center">
                <Play size={10} className="text-foreground" />
              </span>
            )}
            <span className="h-6 px-2 rounded-full bg-background/70 flex items-center gap-1 text-xs text-foreground">
              <ImageIcon size={9} /> {project.media.length}
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-heading font-bold text-foreground group-hover:text-brand transition-colors mb-1">{project.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
          {project.techStack.length > 3 && <Badge variant="secondary" className="text-xs">+{project.techStack.length - 3}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectsSection() {
  const projects = useAppSelector(selectVisibleProjects);
  const settings = useAppSelector(selectSiteSettings);
  const [selected, setSelected] = useState<Project | null>(null);
  if (!settings.showSections.projects || !projects.length) return null;

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="py-24 px-6 md:px-12 lg:px-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <SectionHeader label="Work" title="Projects" subtitle="Selected work I've shipped from concept to production." />
        {featured.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {featured.map((p) => <ProjectCard key={p.id} project={p} onClick={() => setSelected(p)} featured />)}
          </div>
        )}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((p) => <ProjectCard key={p.id} project={p} onClick={() => setSelected(p)} />)}
          </div>
        )}
      </div>
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </Dialog>
    </section>
  );
}

// Add snippet display inside ProjectModal — injected above the tech stack badges
// The CodeBlock is already imported via the component file
