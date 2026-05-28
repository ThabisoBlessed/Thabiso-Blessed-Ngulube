import { supabase } from "./supabase";
import type { PortfolioState } from "@/types";
import { initialPortfolioData } from "@/data/portfolio";

function mergeWithDefaults(loaded: Partial<PortfolioState>): PortfolioState {
  return {
    ...initialPortfolioData,
    ...loaded,
    hero: {
      ...initialPortfolioData.hero,
      ...(loaded.hero || {}),
      roles: loaded.hero?.roles ?? initialPortfolioData.hero.roles,
      yearsExp: loaded.hero?.yearsExp ?? initialPortfolioData.hero.yearsExp,
      projectsCount: loaded.hero?.projectsCount ?? initialPortfolioData.hero.projectsCount,
    },
    skills:         loaded.skills         ?? initialPortfolioData.skills,
    employment:     loaded.employment     ?? initialPortfolioData.employment,
    projects:       loaded.projects       ?? initialPortfolioData.projects,
    education:      loaded.education      ?? initialPortfolioData.education,
    documents:      loaded.documents      ?? initialPortfolioData.documents,
    testimonials:   loaded.testimonials   ?? initialPortfolioData.testimonials,
    impactMetrics:  loaded.impactMetrics  ?? initialPortfolioData.impactMetrics,
    siteSettings: {
      ...initialPortfolioData.siteSettings,
      ...(loaded.siteSettings || {}),
      showSections: {
        ...initialPortfolioData.siteSettings.showSections,
        ...(loaded.siteSettings?.showSections || {}),
      },
    },
  };
}

export async function getPortfolioByUsername(username: string): Promise<PortfolioState | null> {
  const { data, error } = await supabase
    .from("portfolios")
    .select("data")
    .eq("username", username)
    .single();
  if (error || !data) return null;
  return mergeWithDefaults(data.data as Partial<PortfolioState>);
}

export async function getMyPortfolio(): Promise<PortfolioState | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("portfolios")
    .select("data")
    .eq("user_id", user.id)
    .single();
  if (error || !data) return initialPortfolioData;
  return mergeWithDefaults(data.data as Partial<PortfolioState>);
}

export async function savePortfolio(portfolioData: PortfolioState): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Get username from profiles — needed for the upsert
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile?.username) return false;

  const { error } = await supabase
    .from("portfolios")
    .upsert(
      { user_id: user.id, username: profile.username, data: portfolioData },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Save error:", error.message);
    return false;
  }
  return true;
}

export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();
  return data;
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
