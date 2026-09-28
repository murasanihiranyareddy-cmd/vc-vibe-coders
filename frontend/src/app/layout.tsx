import type { Metadata } from "next";
import "./globals.css";
import { WorkspaceProvider } from "../components/WorkspaceContext";
import { AppShell } from "../components/AppShell";

export const metadata: Metadata = {
  title: "VC (Vibe Coders) | Persistent Shared AI Team Memory",
  description: "Because great teams shouldn't lose great ideas. Persistent AI collaboration memory platform for hackathons, student projects, startups, and research teams.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070a12] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <WorkspaceProvider>
          <AppShell>{children}</AppShell>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
