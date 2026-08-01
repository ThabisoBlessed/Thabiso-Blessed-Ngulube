// FILE PATH: src/components/portfolio/OtherSections.tsx

"use client";
import { useAppSelector, selectVisibleEducation, selectVisibleDocuments, selectVisibleTestimonials, selectSiteSettings, selectHero, selectVisibleImpactMetrics } from "@/hooks/redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "./SectionHeader";
import { FileText, Download, Quote, Star } from "lucide-react";

export function EducationSection() {
  const education = useAppSelector(selectVisibleEducation);
  const settings  = useAppSelector(selectSiteSettings);
  if (!settings.showSections.education || !education.length) return null;
  return (
    <section id="education" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader label="Background" title="Education" />
        <div className="grid md:grid-cols-2 gap-5">
          {education.map((edu) => (
            <Card key={edu.id} className="hover:shadow-md hover:border-brand/20 transition-all duration-300">
              <CardContent className="p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl border border-border overflow-hidden shrink-0">
                  <img src={edu.logo} alt={edu.institution} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-foreground wrap-break-word">{edu.degree} in {edu.field}</h3>
                      <p className="text-brand text-sm font-medium mt-0.5 wrap-break-word">{edu.institution}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">{edu.startYear}–{edu.endYear}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2 wrap-break-word">{edu.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DocumentsSection() {
  const documents = useAppSelector(selectVisibleDocuments);
  const settings  = useAppSelector(selectSiteSettings);
  if (!settings.showSections.documents || !documents.length) return null;
  const cats = [...new Set(documents.map((d) => d.category))];
  return (
    <section id="documents" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 bg-secondary/40 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader label="Files" title="Documents" subtitle="Certificates, references, and CV available to download." />
        <div className="space-y-8">
          {cats.map((cat) => (
            <div key={cat}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">{cat}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {documents.filter((d) => d.category === cat).map((doc) => (
                  <Card key={doc.id} className="group hover:border-brand/30 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4 flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-lg bg-accent border border-brand/20 flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground wrap-break-word">
                          {doc.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 wrap-break-word">
                          {doc.description}
                        </p>
                      </div>
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-brand">
                            <Download size={13} />
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const testimonials = useAppSelector(selectVisibleTestimonials);
  const settings     = useAppSelector(selectSiteSettings);
  if (!settings.showSections.testimonials || !testimonials.length) return null;
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <SectionHeader label="Social Proof" title="What People Say" />
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id} className="hover:shadow-md hover:border-brand/20 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand to-transparent" />
              <CardContent className="p-6 pl-7">
                <Quote size={28} className="text-brand/20 mb-4" />
                <p className="text-muted-foreground leading-relaxed italic mb-6 break-words">"{t.text}"</p>
                <div className="flex flex-wrap items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full border-2 border-brand/20" />
                  <div>
                    <p className="text-sm font-semibold text-foreground break-words">{t.name}</p>
                    <p className="text-xs text-muted-foreground break-words">{t.role} · {t.company}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={12} className="text-brand fill-brand" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ImpactSection() {
  const metrics  = useAppSelector(selectVisibleImpactMetrics);
  const settings = useAppSelector(selectSiteSettings);
  if (!settings.showSections.impact || !metrics.length) return null;

  return (
    <section id="impact" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-px w-6 bg-brand" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">By The Numbers</span>
            <span className="h-px w-6 bg-brand" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight">Impact & Results</h2>
          <p className="text-muted-foreground mt-3 max-w-xl">Real numbers from real work.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.id}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-brand/30 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <p className="font-heading font-extrabold text-4xl md:text-5xl text-brand leading-none mb-2 break-words">
                  {m.value}
                </p>
                <p className="font-semibold text-foreground text-sm break-words">{m.label}</p>
                {m.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed break-words">{m.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  const hero     = useAppSelector(selectHero);
  const settings = useAppSelector(selectSiteSettings);
  if (settings.showSections.contact === false) return null;

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 md:px-12 lg:px-24 bg-secondary/40 scroll-mt-20">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-brand" />
            <span className="text-xs font-semibold uppercase tracking-widest text-brand">Get In Touch</span>
            <span className="h-px w-8 bg-brand" />
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Let's work together</h2>
          <p className="text-muted-foreground mt-3">
            Open to new opportunities. Send a message and I'll get back to you.
          </p>
        </div>

        <a href={`mailto:${hero.email}`}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand text-brand-fg font-semibold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">
          Send Email
        </a>

        <p className="text-muted-foreground text-sm pt-2 break-words">{hero.email}</p>
      </div>
    </section>
  );
}