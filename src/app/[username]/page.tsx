"use client";
import { useParams } from "next/navigation";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

// Kept for backward compatibility with any old /username links already
// out there (e.g. shared before this became a single-owner site). The
// canonical URL is now just "/".
export default function UserPortfolioPage() {
  const { username } = useParams<{ username: string }>();
  return <PortfolioView username={username as string} />;
}
