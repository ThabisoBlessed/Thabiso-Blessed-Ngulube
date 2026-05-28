export interface HeroSection {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  avatar: string;
  resumeUrl: string;
  roles: string[];          // typing animation words — user-defined
  yearsExp: number;         // editable stat
  projectsCount: number;    // editable stat
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  isVisible: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  isVisible: boolean;
}

export interface Employment {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string;
  achievements: string[];
  logo: string;
  techStack: string[];
  isVisible: boolean;
}

export interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  caption?: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  media: MediaItem[];
  snippets: CodeSnippet[];
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
  category: string;
  featured: boolean;
  isVisible: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  description: string;
  logo: string;
  isVisible: boolean;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: "pdf" | "doc" | "other";
  category: "CV" | "Cover Letter" | "Certification" | "Reference" | "Other";
  isVisible: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  text: string;
  rating: number;
  isVisible: boolean;
}

export interface ImpactMetric {
  id: string;
  value: string;
  label: string;
  description?: string;
  isVisible: boolean;
}

export interface SiteSettings {
  theme: "dark" | "light";
  defaultTheme: "dark" | "light";
  accentColor: string;
  openToWork: boolean;
  noticePeriod: "immediately" | "2 weeks" | "1 month" | "3 months" | "not looking";
  showSections: {
    hero: boolean;
    skills: boolean;
    employment: boolean;
    projects: boolean;
    education: boolean;
    documents: boolean;
    testimonials: boolean;
    contact: boolean;
    impact: boolean;
  };
  seoTitle: string;
  seoDescription: string;
  contactEnabled: boolean;
}

export interface PortfolioState {
  hero: HeroSection;
  skills: Skill[];
  employment: Employment[];
  projects: Project[];
  education: Education[];
  documents: Document[];
  testimonials: Testimonial[];
  impactMetrics: ImpactMetric[];
  siteSettings: SiteSettings;
}
