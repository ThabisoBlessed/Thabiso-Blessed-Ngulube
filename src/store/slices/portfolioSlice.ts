import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
  PortfolioState, HeroSection, Skill, Employment, Project,
  Education, Document, Testimonial, ImpactMetric, SiteSettings,
} from "@/types";
import { initialPortfolioData } from "@/data/portfolio";
import { getMyPortfolio, getPortfolioByUsername, savePortfolio } from "@/lib/portfolio-api";
import { mergeWithDefaults } from "@/lib/merge-portfolio";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loadMyPortfolio = createAsyncThunk("portfolio/loadMine", async () => {
  const data = await getMyPortfolio();
  return data ? mergeWithDefaults(data) : initialPortfolioData;
});

export const loadPortfolioByUsername = createAsyncThunk(
  "portfolio/loadByUsername",
  async (username: string) => {
    const data = await getPortfolioByUsername(username);
    return data ? mergeWithDefaults(data) : null;
  }
);

export const persistPortfolio = createAsyncThunk(
  "portfolio/save",
  async (_, { getState }) => {
    const state = (getState() as { portfolio: PortfolioState }).portfolio;
    await savePortfolio(state);
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: initialPortfolioData,
  reducers: {
    updateHero(state, action: PayloadAction<Partial<HeroSection>>) {
      state.hero = { ...state.hero, ...action.payload };
    },
    addSkill(state, action: PayloadAction<Skill>) { state.skills.push(action.payload); },
    updateSkill(state, action: PayloadAction<Skill>) {
      const i = state.skills.findIndex((s) => s.id === action.payload.id);
      if (i !== -1) state.skills[i] = action.payload;
    },
    removeSkill(state, action: PayloadAction<string>) {
      state.skills = state.skills.filter((s) => s.id !== action.payload);
    },
    toggleSkillVisibility(state, action: PayloadAction<string>) {
      const s = state.skills.find((s) => s.id === action.payload);
      if (s) s.isVisible = !s.isVisible;
    },
    addEmployment(state, action: PayloadAction<Employment>) { state.employment.unshift(action.payload); },
    updateEmployment(state, action: PayloadAction<Employment>) {
      const i = state.employment.findIndex((e) => e.id === action.payload.id);
      if (i !== -1) state.employment[i] = action.payload;
    },
    removeEmployment(state, action: PayloadAction<string>) {
      state.employment = state.employment.filter((e) => e.id !== action.payload);
    },
    toggleEmploymentVisibility(state, action: PayloadAction<string>) {
      const e = state.employment.find((e) => e.id === action.payload);
      if (e) e.isVisible = !e.isVisible;
    },
    addProject(state, action: PayloadAction<Project>) { state.projects.unshift(action.payload); },
    updateProject(state, action: PayloadAction<Project>) {
      const i = state.projects.findIndex((p) => p.id === action.payload.id);
      if (i !== -1) state.projects[i] = action.payload;
    },
    removeProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },
    toggleProjectVisibility(state, action: PayloadAction<string>) {
      const p = state.projects.find((p) => p.id === action.payload);
      if (p) p.isVisible = !p.isVisible;
    },
    toggleProjectFeatured(state, action: PayloadAction<string>) {
      const p = state.projects.find((p) => p.id === action.payload);
      if (p) p.featured = !p.featured;
    },
    addEducation(state, action: PayloadAction<Education>) { state.education.push(action.payload); },
    updateEducation(state, action: PayloadAction<Education>) {
      const i = state.education.findIndex((e) => e.id === action.payload.id);
      if (i !== -1) state.education[i] = action.payload;
    },
    removeEducation(state, action: PayloadAction<string>) {
      state.education = state.education.filter((e) => e.id !== action.payload);
    },
    toggleEducationVisibility(state, action: PayloadAction<string>) {
      const e = state.education.find((e) => e.id === action.payload);
      if (e) e.isVisible = !e.isVisible;
    },
    addDocument(state, action: PayloadAction<Document>) { state.documents.push(action.payload); },
    updateDocument(state, action: PayloadAction<Document>) {
      const i = state.documents.findIndex((d) => d.id === action.payload.id);
      if (i !== -1) state.documents[i] = action.payload;
    },
    removeDocument(state, action: PayloadAction<string>) {
      state.documents = state.documents.filter((d) => d.id !== action.payload);
    },
    toggleDocumentVisibility(state, action: PayloadAction<string>) {
      const d = state.documents.find((d) => d.id === action.payload);
      if (d) d.isVisible = !d.isVisible;
    },
    addTestimonial(state, action: PayloadAction<Testimonial>) { state.testimonials.push(action.payload); },
    updateTestimonial(state, action: PayloadAction<Testimonial>) {
      const i = state.testimonials.findIndex((t) => t.id === action.payload.id);
      if (i !== -1) state.testimonials[i] = action.payload;
    },
    removeTestimonial(state, action: PayloadAction<string>) {
      state.testimonials = state.testimonials.filter((t) => t.id !== action.payload);
    },
    toggleTestimonialVisibility(state, action: PayloadAction<string>) {
      const t = state.testimonials.find((t) => t.id === action.payload);
      if (t) t.isVisible = !t.isVisible;
    },
    addImpactMetric(state, action: PayloadAction<ImpactMetric>) { state.impactMetrics.push(action.payload); },
    updateImpactMetric(state, action: PayloadAction<ImpactMetric>) {
      const i = state.impactMetrics.findIndex((m) => m.id === action.payload.id);
      if (i !== -1) state.impactMetrics[i] = action.payload;
    },
    removeImpactMetric(state, action: PayloadAction<string>) {
      state.impactMetrics = state.impactMetrics.filter((m) => m.id !== action.payload);
    },
    toggleImpactMetricVisibility(state, action: PayloadAction<string>) {
      const m = state.impactMetrics.find((m) => m.id === action.payload);
      if (m) m.isVisible = !m.isVisible;
    },
    updateSiteSettings(state, action: PayloadAction<Partial<SiteSettings>>) {
      state.siteSettings = { ...state.siteSettings, ...action.payload };
    },
    toggleSectionVisibility(state, action: PayloadAction<keyof SiteSettings["showSections"]>) {
      state.siteSettings.showSections[action.payload] = !state.siteSettings.showSections[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMyPortfolio.fulfilled, (_state, action) => {
        return action.payload;
      })
      .addCase(loadPortfolioByUsername.fulfilled, (_state, action) => {
        if (action.payload) return action.payload;
      });
  },
});

export const {
  updateHero,
  addSkill, updateSkill, removeSkill, toggleSkillVisibility,
  addEmployment, updateEmployment, removeEmployment, toggleEmploymentVisibility,
  addProject, updateProject, removeProject, toggleProjectVisibility, toggleProjectFeatured,
  addEducation, updateEducation, removeEducation, toggleEducationVisibility,
  addDocument, updateDocument, removeDocument, toggleDocumentVisibility,
  addTestimonial, updateTestimonial, removeTestimonial, toggleTestimonialVisibility,
  addImpactMetric, updateImpactMetric, removeImpactMetric, toggleImpactMetricVisibility,
  updateSiteSettings, toggleSectionVisibility,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
