"use client";
import { useState } from "react";
import { useAppDispatch, useAppSelector, selectSortedEmployment } from "@/hooks/redux";
import { addEmployment, updateEmployment, removeEmployment, toggleEmploymentVisibility } from "@/store/slices/portfolioSlice";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea, SwitchField } from "@/components/ui/form-field";
import { FileUpload } from "@/components/ui/file-upload";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";
import type { Employment } from "@/types";

const emptyEmployment = (): Employment => ({
  id: `emp-${Date.now()}`,
  company: "",
  role: "",
  startDate: "",
  endDate: null,
  description: "",
  achievements: [],
  logo: `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`,
  techStack: [],
  isVisible: true,
});

function EmploymentForm({ initial, onSave, onCancel }: { initial: Employment; onSave: (e: Employment) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const [achInput, setAchInput] = useState("");
  const [techInput, setTechInput] = useState("");

  const set = (k: keyof Employment, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const addAchievement = () => {
    if (achInput.trim()) {
      set("achievements", [...form.achievements, achInput.trim()]);
      setAchInput("");
    }
  };

  const addTech = () => {
    if (techInput.trim() && !form.techStack.includes(techInput.trim())) {
      set("techStack", [...form.techStack, techInput.trim()]);
      setTechInput("");
    }
  };

  return (
    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Company" value={form.company} onChange={(e) => set("company", e.target.value)} />
        <FormInput label="Role / Title" value={form.role} onChange={(e) => set("role", e.target.value)} />
        <FormInput label="Start Date" type="month" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
        <FormInput label="End Date (blank = current)" type="month" value={form.endDate || ""} onChange={(e) => set("endDate", e.target.value || null)} />
      </div>
      <FileUpload
        type="image"
        label="Company Logo"
        currentUrl={form.logo}
        onUploaded={(url) => set("logo", url)}
      />
      <FormTextarea label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />

      {/* Achievements */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Achievements</label>
        <div className="space-y-1.5 mb-2">
          {form.achievements.map((a, i) => (
            <div key={i} className="flex gap-2 items-start text-sm bg-secondary/50 border border-border rounded-lg px-3 py-2">
              <span className="text-brand mt-0.5">▸</span>
              <span className="flex-1 text-foreground/80">{a}</span>
              <button onClick={() => set("achievements", form.achievements.filter((_, j) => j !== i))} className="text-muted-foreground/60 hover:text-destructive">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 h-9 px-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm placeholder:text-foreground/25 outline-none focus:border-brand/60"
            placeholder="Add an achievement..."
            value={achInput}
            onChange={(e) => setAchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAchievement()}
          />
          <Button variant="outline" size="sm" onClick={addAchievement}><Plus size={14} /></Button>
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Tech Stack</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.techStack.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 bg-secondary text-foreground/80 text-xs rounded-full px-2.5 py-1">
              {t}
              <button onClick={() => set("techStack", form.techStack.filter((x) => x !== t))} className="text-muted-foreground/60 hover:text-destructive">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 h-9 px-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm placeholder:text-foreground/25 outline-none focus:border-brand/60"
            placeholder="Add tech (press Enter)..."
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTech()}
          />
          <Button variant="outline" size="sm" onClick={addTech}><Plus size={14} /></Button>
        </div>
      </div>

      <SwitchField checked={form.isVisible} onCheckedChange={(v) => set("isVisible", v)} label="Visible on portfolio" />

      <div className="flex gap-3 pt-2">
        <Button variant="brand" className="flex-1" onClick={() => form.company && form.role && onSave(form)}>Save</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export function AdminEmploymentPanel() {
  const dispatch = useAppDispatch();
  const employment = useAppSelector(selectSortedEmployment);
  const [editTarget, setEditTarget] = useState<Employment | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{employment.length} positions</p>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button variant="brand" size="sm"><Plus size={14} /> Add Position</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Employment</DialogTitle></DialogHeader>
            <EmploymentForm
              initial={emptyEmployment()}
              onSave={(e) => { dispatch(addEmployment(e)); setIsAdding(false); }}
              onCancel={() => setIsAdding(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {employment.map((emp) => (
          <div key={emp.id} className={`rounded-xl border p-4 ${emp.isVisible ? "border-border bg-card" : "border-border/50 opacity-50"}`}>
            <div className="flex items-start gap-3">
              <img src={emp.logo} alt={emp.company} className="w-10 h-10 rounded-lg border border-border" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{emp.role}</p>
                    <p className="text-brand text-xs">{emp.company}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => dispatch(toggleEmploymentVisibility(emp.id))}>
                      {emp.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </Button>
                    <Dialog open={editTarget?.id === emp.id} onOpenChange={(o) => !o && setEditTarget(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditTarget(emp)}><Pencil size={14} /></Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Edit Employment</DialogTitle></DialogHeader>
                        {editTarget && (
                          <EmploymentForm
                            initial={editTarget}
                            onSave={(e) => { dispatch(updateEmployment(e)); setEditTarget(null); }}
                            onCancel={() => setEditTarget(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => dispatch(removeEmployment(emp.id))}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{emp.startDate} — {emp.endDate || "Present"}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {emp.techStack.slice(0, 5).map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}