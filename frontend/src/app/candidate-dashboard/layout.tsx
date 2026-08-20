'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CandidateLanguageProvider } from "@/components/CandidateLanguageProvider";
import { apiUrl } from "@/lib/api";

const navItems = [
  { label: "Dashboard", href: "/candidate-dashboard", icon: "🏠" },
  { label: "Round 1 Learning", href: "/candidate-dashboard/round-1-learning", icon: "📘" },
  { label: "Round 2 Learning", href: "/candidate-dashboard/round-2-learning", icon: "📗" },
  { label: "Mock Assessment", href: "/candidate-dashboard/mock-assesment", icon: "🗂️" },
];

export default function CandidateDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mockEnabled, setMockEnabled] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/me"), { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((candidate) => setMockEnabled(Boolean(candidate?.mockEnabled)))
      .catch(() => setMockEnabled(false));
  }, []);

  const hideSidebar =
    pathname?.startsWith("/candidate-dashboard/round-1-learning/") ||
    pathname?.startsWith("/candidate-dashboard/round-2-learning/") ||
    pathname?.startsWith("/candidate-dashboard/mock-assesment") ||
    pathname?.startsWith("/candidate-dashboard/mock-assessment");

  const pageTitle = pathname === "/candidate-dashboard"
    ? "Candidate Dashboard"
    : pathname === "/candidate-dashboard/round-1-learning"
    ? "Round 1 Learning"
    : pathname === "/candidate-dashboard/round-2-learning"
    ? "Round 2 Learning"
    : pathname === "/candidate-dashboard/mock-assessment" || pathname === "/candidate-dashboard/mock-assesment"
    ? "Mock Assessment"
    : pathname?.includes("/round-1-learning/concepts")
    ? "Round 1 Concepts"
    : pathname?.includes("/round-1-learning/practice-questions")
    ? "Practice Questions"
    : pathname?.includes("/round-1-learning/debugging-drill")
    ? "Debugging Drill"
    : pathname?.includes("/round-2-learning/format-practice-questions")
    ? "Format Practice Questions"
    : pathname?.includes("/round-2-learning/exercise-question")
    ? "Exercise Questions"
    : "Candidate Dashboard";

  const header = <AppHeader pageTitle={pageTitle} />;

  if (hideSidebar) {
    return (
      <CandidateLanguageProvider>
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
          <div className="p-6 sm:p-8">
            {header}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
      </CandidateLanguageProvider>
    );
  }

  return (
    <CandidateLanguageProvider>
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="p-6 sm:p-8">
          {header}
        </div>
        <div className="flex min-h-[calc(100vh-3rem)] overflow-hidden">
          <aside className="w-full max-w-[300px] border-r border-slate-200 bg-slate-50 px-6 py-8 sm:px-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Candidate Menu</p>
            </div>
            <nav className="space-y-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const isMockDisabled = item.href === "/candidate-dashboard/mock-assesment" && !mockEnabled;

                if (isMockDisabled) {
                  return (
                    <span
                      key={item.href}
                      aria-disabled="true"
                      className="flex w-full cursor-not-allowed items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-slate-400"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-sky-700 shadow-sm shadow-slate-200/40 border border-slate-200"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="flex-1 p-6 sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
    </CandidateLanguageProvider>
  );
}
