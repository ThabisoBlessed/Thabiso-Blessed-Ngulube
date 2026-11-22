"use client";
import { useAppSelector, selectVisibleEmployment, selectSiteSettings } from "@/hooks/redux";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "./SectionHeader";
import { Calendar, MapPin } from "lucide-react";

function fmt(d: string | null) {
  if (!d) return "Present";
  const [y, m] = d.split("-");
  return new Date(+y, +m - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function EmploymentSection() {
  const employment = useAppSelector(selectVisibleEmployment);
  const settings   = useAppSelector(selectSiteSettings);
  if (!settings.showSections.employment || !employment.length) return null;

  return (
    <section id="experience" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeader label="Career" title="Work Experience" />

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-linear-to-b from-brand via-border to-transparent hidden md:block" />

          <div className="space-y-8">
            {employment.map((emp, i) => (
              <div key={emp.id} className="relative md:pl-20">
                {/* Timeline dot */}
                <div className={`absolute left-0 top-6 w-12 h-12 rounded-xl hidden md:flex items-center justify-center shadow-md border-2 z-10
                  ${i === 0 ? "border-brand bg-brand-muted" : "border-border bg-card"}`}>
                  <img src={emp.logo} alt={emp.company} className="w-10 h-10 rounded-lg object-cover" />
                </div>

                <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${i === 0 ? "border-brand/30" : ""}`}>
                  {i === 0 && (
                    <div className="h-0.5 w-full bg-linear-to-r from-brand to-transparent" />
                  )}
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3">
                        {/* Mobile only logo */}
                        <img src={emp.logo} alt={emp.company}
                          className="w-10 h-10 rounded-xl border border-border object-cover md:hidden shrink-0" />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h3 className="font-heading font-bold text-foreground text-lg">{emp.role}</h3>
                            {!emp.endDate && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand text-brand-fg">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-brand text-sm">{emp.company}</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-2.5 py-1.5 rounded-lg">
                        <Calendar size={11} />
                        {fmt(emp.startDate)} — {fmt(emp.endDate)}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{emp.description}</p>

                    <ul className="space-y-2 mb-5">
                      {emp.achievements.map((a, idx) => (
                        <li key={idx} className="flex gap-2.5 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                          <span className="text-muted-foreground">{a}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-1.5">
                      {emp.techStack.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs font-medium">{t}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
