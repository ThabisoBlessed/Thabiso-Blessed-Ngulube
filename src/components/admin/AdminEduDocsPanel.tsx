"use client";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  addEducation, updateEducation, removeEducation, toggleEducationVisibility,
  addDocument, updateDocument, removeDocument, toggleDocumentVisibility,
} from "@/store/slices/portfolioSlice";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea, SwitchField } from "@/components/ui/form-field";
import { FileUpload } from "@/components/ui/file-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Education, Document } from "@/types";

// ─── Education ───────────────────────────────────────────────────────────────
const emptyEdu = (): Education => ({
  id: `edu-${Date.now()}`, institution: "", degree: "", field: "",
  startYear: "", endYear: "", description: "",
  logo: `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`,
  isVisible: true,
});

function EduForm({ initial, onSave, onCancel }: { initial: Education; onSave: (e: Education) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof Education, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-4">
      <FormInput label="Institution" value={form.institution} onChange={(e) => set("institution", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Degree" value={form.degree} onChange={(e) => set("degree", e.target.value)} />
        <FormInput label="Field of Study" value={form.field} onChange={(e) => set("field", e.target.value)} />
        <FormInput label="Start Year" value={form.startYear} onChange={(e) => set("startYear", e.target.value)} placeholder="2018" />
        <FormInput label="End Year" value={form.endYear} onChange={(e) => set("endYear", e.target.value)} placeholder="2022" />
      </div>
      <FileUpload
        type="image"
        label="Institution Logo"
        currentUrl={form.logo}
        onUploaded={(url) => set("logo", url)}
      />
      <FormTextarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
      <SwitchField checked={form.isVisible} onCheckedChange={(v) => set("isVisible", v)} label="Visible" />
      <div className="flex gap-3 pt-2">
        <Button className="flex-1 bg-brand text-brand-fg hover:bg-brand/90" onClick={() => form.institution && onSave(form)}>Save</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export function AdminEducationPanel() {
  const dispatch = useAppDispatch();
  const education = useAppSelector((s) => s.portfolio.education);
  const [editTarget, setEditTarget] = useState<Education | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{education.length} entries</p>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-brand text-brand-fg hover:bg-brand/90"><Plus size={14} /> Add Education</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Education</DialogTitle></DialogHeader>
            <EduForm initial={emptyEdu()} onSave={(e) => { dispatch(addEducation(e)); setIsAdding(false); }} onCancel={() => setIsAdding(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {education.map((edu) => (
          <div key={edu.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${edu.isVisible ? "border-border bg-secondary/30" : "border-border/50 opacity-50"}`}>
            <img src={edu.logo} alt={edu.institution} className="w-10 h-10 rounded-xl border border-border shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{edu.degree} in {edu.field}</p>
              <p className="text-xs text-brand">{edu.institution} · {edu.startYear}–{edu.endYear}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => dispatch(toggleEducationVisibility(edu.id))}>
                {edu.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </Button>
              <Dialog open={editTarget?.id === edu.id} onOpenChange={(o) => !o && setEditTarget(null)}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setEditTarget(edu)}><Pencil size={14} /></Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Edit Education</DialogTitle></DialogHeader>
                  {editTarget && <EduForm initial={editTarget} onSave={(e) => { dispatch(updateEducation(e)); setEditTarget(null); }} onCancel={() => setEditTarget(null)} />}
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => dispatch(removeEducation(edu.id))}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Documents ───────────────────────────────────────────────────────────────
const emptyDoc = (): Document => ({
  id: `doc-${Date.now()}`, title: "", description: "", fileUrl: "",
  fileType: "pdf", category: "CV", isVisible: true,
});

const DOC_CATEGORIES: Document["category"][] = ["CV", "Cover Letter", "Certification", "Reference", "Other"];

const UPLOAD_TYPE_MAP: Record<Document["category"], "cv" | "cover-letter" | "certificate"> = {
  "CV": "cv",
  "Cover Letter": "cover-letter",
  "Certification": "certificate",
  "Reference": "cv",
  "Other": "cv",
};

function DocForm({ initial, onSave, onCancel }: { initial: Document; onSave: (d: Document) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof Document, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <FormInput label="Document Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
      <FormTextarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Category</p>
        <select className="w-full h-9 px-3 rounded-md border border-border bg-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring"
          value={form.category} onChange={(e) => set("category", e.target.value as Document["category"])}>
          {DOC_CATEGORIES.map((c) => <option key={c} value={c} className="bg-card">{c}</option>)}
        </select>
      </div>

      {/* Upload */}
      <FileUpload
        type={UPLOAD_TYPE_MAP[form.category]}
        label="Upload File"
        currentUrl={form.fileUrl}
        onUploaded={(url) => set("fileUrl", url)}
      />


      <SwitchField checked={form.isVisible} onCheckedChange={(v) => set("isVisible", v)} label="Visible on portfolio" />
      <div className="flex gap-3 pt-2">
        <Button className="flex-1 bg-brand text-brand-fg hover:bg-brand/90" onClick={() => form.title && onSave(form)}>Save</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export function AdminDocumentsPanel() {
  const dispatch = useAppDispatch();
  const documents = useAppSelector((s) => s.portfolio.documents);
  const [editTarget, setEditTarget] = useState<Document | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const cats = [...new Set(documents.map((d) => d.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{documents.length} documents · {documents.filter((d) => d.isVisible).length} visible</p>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-brand text-brand-fg hover:bg-brand/90"><Plus size={14} /> Add Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
            <DocForm initial={emptyDoc()} onSave={(d) => { dispatch(addDocument(d)); setIsAdding(false); }} onCancel={() => setIsAdding(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {cats.map((cat) => (
        <div key={cat}>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">{cat}</p>
          <div className="space-y-2">
            {documents.filter((d) => d.category === cat).map((doc) => (
              <div key={doc.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${doc.isVisible ? "border-border bg-secondary/30" : "border-border/50 opacity-50"}`}>
                <div className="w-8 h-8 rounded-lg bg-accent border border-brand/20 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.category} · {doc.fileType.toUpperCase()}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => dispatch(toggleDocumentVisibility(doc.id))}>
                    {doc.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </Button>
                  <Dialog open={editTarget?.id === doc.id} onOpenChange={(o) => !o && setEditTarget(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(doc)}><Pencil size={14} /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Edit Document</DialogTitle></DialogHeader>
                      {editTarget && <DocForm initial={editTarget} onSave={(d) => { dispatch(updateDocument(d)); setEditTarget(null); }} onCancel={() => setEditTarget(null)} />}
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => dispatch(removeDocument(doc.id))}><Trash2 size={14} /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}