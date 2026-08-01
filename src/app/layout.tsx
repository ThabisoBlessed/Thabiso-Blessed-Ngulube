import type { Metadata } from "next";
import { ReduxProvider } from "@/store/provider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthTokenGuard } from "@/components/AuthTokenGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thabiso Blessed Ngulube — Full Stack Software Engineer",
  description:
    "Portfolio of Thabiso Blessed Ngulube, a Lead Software Engineer building real-time IoT platforms and enterprise web/mobile systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){document.documentElement.classList.add('dark')}`
        }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <ReduxProvider>
            <AuthTokenGuard />
            {children}
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
