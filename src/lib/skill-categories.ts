// Single source of truth for skill groups: the order here is the order shown
// on the public Skills section, and the options in Admin → Skills.
export const SKILL_CATEGORIES = [
  "Languages",
  "Frontend",
  "Mobile",
  "Backend & APIs",
  "Databases",
  "Cloud",
  "DevOps",
  "AI & LLM Engineering",
  "Architecture & Real-Time Systems",
] as const;

/** Sort order for a category name; unknown (older) categories go last. */
export const categoryRank = (name: string) => {
  const i = (SKILL_CATEGORIES as readonly string[]).indexOf(name);
  return i === -1 ? SKILL_CATEGORIES.length : i;
};