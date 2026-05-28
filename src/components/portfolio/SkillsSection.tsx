"use client";
import { useAppSelector, selectVisibleSkills, selectSiteSettings } from "@/hooks/redux";
import { SectionHeader } from "./SectionHeader";

export function SkillsSection() {
  const skills   = useAppSelector(selectVisibleSkills);
  const settings = useAppSelector(selectSiteSettings);
  if (!settings.showSections.skills || !skills.length) return null;

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <section id="skills" className="py-24 px-6 md:px-12 lg:px-24 bg-secondary/40">
      <div className="max-w-6xl mx-auto">
        <SectionHeader label="Expertise" title="Skills & Technologies" />
        <div className="space-y-10">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-xs font-bold uppercase tracking-widest text-brand mb-4">{cat}</p>
              <div className="flex flex-wrap gap-2.5">
                {skills.filter((s) => s.category === cat).map((skill) => (
                  <span key={skill.id}
                    className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-brand/40 hover:bg-accent hover:text-brand transition-all duration-200 cursor-default">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
