"use client";

import { UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCandidateLanguage } from "./CandidateLanguageProvider";

function getCookieValue(name: string) {
  if (typeof document === "undefined") return "";

  const cookies = document.cookie.split("; ");
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

export function AppHeader({ pageTitle = "Dashboard" }: { pageTitle?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Karat Demo User");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { language } = useCandidateLanguage();

  useEffect(() => {
    const cookieUser = getCookieValue("user_name");
    if (cookieUser) {
      setUserName(cookieUser);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    const clearCookie = (name: string) => {
      document.cookie = `${name}=; path=/; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    };

    clearCookie("auth_token");
    clearCookie("user_role");
    clearCookie("user_name");
    clearCookie("language_selected");
    sessionStorage.clear();
    setMenuOpen(false);

    router.replace("/login");
    window.location.assign("/login");
  };

  return (
    <header className="mb-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-200/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Karat Preparation Assistant
          </h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            {pageTitle}
          </p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Profile"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
          >
            <UserCircle2 className="h-6 w-6" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-14 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-200 px-3 py-2 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Logged in as
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{userName}</p>
                <p className="mt-1 text-xs text-slate-500">Language: {language.name}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
