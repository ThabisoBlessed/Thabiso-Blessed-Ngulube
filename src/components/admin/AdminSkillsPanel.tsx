"use client";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addSkill, updateSkill, removeSkill, toggleSkillVisibility } from "@/store/slices/portfolioSlice";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea, SwitchField } from "@/components/ui/form-field";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { SKILL_CATEGORIES, categoryRank } from "@/lib/skill-categories";
import type { Skill } from "@/types";

const CATEGORIES: string[] = [...SKILL_CATEGORIES];

const emptySkill = (): Skill => ({
  id: `skill-${Date.now()}`,
  name: "",
  level: 80,
  category: "Frontend",
  isVisible: true,
});

function SkillForm({ initial, onSave, onCancel }: { initial: Skill; onSave: (s: Skill) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof Skill, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <FormInput label="Skill Name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. React" />
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
        <select
          className="w-full h-10 px-3 rounded-lg bg-secondary/50 border border-border text-foreground text-sm outline-none focus:border-brand/60"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
        >
          {(CATEGORIES.includes(form.category) ? CATEGORIES : [form.category, ...CATEGORIES]).map((c) => <option key={c} value={c} className="bg-popover">{c}</option>)}
        </select>
      </div>

      <SwitchField checked={form.isVisible} onCheckedChange={(v) => set("isVisible", v)} label="Visible on portfolio" />
      <div className="flex gap-3 pt-2">
        <Button variant="brand" className="flex-1" onClick={() => form.name && onSave(form)}>Save Skill</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export function AdminSkillsPanel() {
  const dispatch = useAppDispatch();
  const skills = useAppSelector((s) => s.portfolio.skills);
  const [editTarget, setEditTarget] = useState<Skill | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const categories = [...new Set(skills.map((s) => s.category))].sort((a, b) => categoryRank(a) - categoryRank(b));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{skills.length} skills · {skills.filter((s) => s.isVisible).length} visible</p>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button variant="brand" size="sm"><Plus size={14} /> Add Skill</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Skill</DialogTitle></DialogHeader>
            <SkillForm
              initial={emptySkill()}
              onSave={(s) => { dispatch(addSkill(s)); setIsAdding(false); }}
              onCancel={() => setIsAdding(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-xs uppercase tracking-widest text-brand mb-2">{cat}</p>
          <div className="space-y-2">
            {skills.filter((s) => s.category === cat).map((skill) => (
              <div key={skill.id} className={`flex items-center gap-3 p-3 rounded-lg border ${skill.isVisible ? "border-border bg-card" : "border-border/50 bg-white/1 opacity-50"}`}>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground font-medium">{skill.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{skill.category}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => dispatch(toggleSkillVisibility(skill.id))}>
                    {skill.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </Button>
                  <Dialog open={editTarget?.id === skill.id} onOpenChange={(o) => !o && setEditTarget(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(skill)}><Pencil size={14} /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Edit Skill</DialogTitle></DialogHeader>
                      {editTarget && (
                        <SkillForm
                          initial={editTarget}
                          onSave={(s) => { dispatch(updateSkill(s)); setEditTarget(null); }}
                          onCancel={() => setEditTarget(null)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => dispatch(removeSkill(skill.id))}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}