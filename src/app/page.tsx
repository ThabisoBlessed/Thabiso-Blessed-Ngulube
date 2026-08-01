"use client";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { OWNER_USERNAME } from "@/lib/site-config";

// The root route ("/") is now the site owner's live portfolio — not a
// SaaS marketing/signup landing page. To sign in, go directly to
// /auth/login (it's intentionally not linked from here).
export default function HomePage() {
  return <PortfolioView username={OWNER_USERNAME} />;
}
