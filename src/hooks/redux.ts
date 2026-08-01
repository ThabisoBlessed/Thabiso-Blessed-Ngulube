// FILE PATH: src/hooks/redux.ts

import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "@/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

// Memoized selectors — prevent unnecessary rerenders
export const selectHero        = (s: RootState) => s.portfolio.hero;
export const selectSiteSettings= (s: RootState) => s.portfolio.siteSettings;
export const selectUser        = (s: RootState) => s.auth.user;

export const selectVisibleSkills = createSelector(
  (s: RootState) => s.portfolio.skills,
  (skills) => skills.filter((sk) => sk.isVisible)
);

export const selectVisibleEmployment = createSelector(
  (s: RootState) => s.portfolio.employment,
  (emp) => emp.filter((e) => e.isVisible)
);

export const selectVisibleProjects = createSelector(
  (s: RootState) => s.portfolio.projects,
  (projects) => projects.filter((p) => p.isVisible)
);

export const selectVisibleEducation = createSelector(
  (s: RootState) => s.portfolio.education,
  (education) => education.filter((e) => e.isVisible)
);

export const selectVisibleDocuments = createSelector(
  (s: RootState) => s.portfolio.documents,
  (documents) => documents.filter((d) => d.isVisible)
);

export const selectVisibleTestimonials = createSelector(
  (s: RootState) => s.portfolio.testimonials,
  (testimonials) => testimonials.filter((t) => t.isVisible)
);

export const selectVisibleImpactMetrics = createSelector(
  (s: RootState) => s.portfolio.impactMetrics,
  (metrics) => (metrics || []).filter((m) => m.isVisible)
);

export const selectAllImpactMetrics = (s: RootState) => s.portfolio.impactMetrics || [];

// Raw (for admin panels that need all items)
export const selectAllSkills       = (s: RootState) => s.portfolio.skills;
export const selectAllEmployment   = (s: RootState) => s.portfolio.employment;
export const selectAllProjects     = (s: RootState) => s.portfolio.projects;
export const selectAllEducation    = (s: RootState) => s.portfolio.education;
export const selectAllDocuments    = (s: RootState) => s.portfolio.documents;
export const selectAllTestimonials = (s: RootState) => s.portfolio.testimonials;

// The CV/resume link buttons ("Hire Me", "Download CV") should point at
// whatever CV was actually uploaded via /admin -> Documents, not a
// separate, easy-to-forget "resumeUrl" field. This prefers the visible
// Documents entry with category "CV" (the one people actually upload
// through the file picker, stored in Supabase Storage); it only falls
// back to hero.resumeUrl if no such document exists yet.
export const selectResumeUrl = createSelector(
  (s: RootState) => s.portfolio.documents,
  (s: RootState) => s.portfolio.hero.resumeUrl,
  (documents, heroResumeUrl) => {
    const cvDoc = documents.find(
      (d) => d.category === "CV" && d.isVisible && d.fileUrl
    );
    return cvDoc?.fileUrl || heroResumeUrl || "";
  }
);

export const selectIsAdmin = (s: RootState) => s.auth.user?.role === "admin";