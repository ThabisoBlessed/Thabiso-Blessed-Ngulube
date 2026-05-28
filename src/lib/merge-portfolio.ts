import { initialPortfolioData } from "@/data/portfolio";
import type { PortfolioState } from "@/types";

// Deep merge incoming data with defaults so missing fields never cause crashes
export function mergeWithDefaults(incoming: Partial<PortfolioState>): PortfolioState {
  return {
    hero:         { ...initialPortfolioData.hero,         ...(incoming.hero         || {}) },
    skills:       incoming.skills        ?? initialPortfolioData.skills,
    employment:   incoming.employment    ?? initialPortfolioData.employment,
    projects:     incoming.projects      ?? initialPortfolioData.projects,
    education:    incoming.education     ?? initialPortfolioData.education,
    documents:    incoming.documents     ?? initialPortfolioData.documents,
    testimonials:  incoming.testimonials  ?? initialPortfolioData.testimonials,
    impactMetrics: incoming.impactMetrics  ?? initialPortfolioData.impactMetrics,
    siteSettings: {
      ...initialPortfolioData.siteSettings,
      ...(incoming.siteSettings || {}),
      showSections: {
        ...initialPortfolioData.siteSettings.showSections,
        ...(incoming.siteSettings?.showSections || {}),
      },
    },
  };
}
