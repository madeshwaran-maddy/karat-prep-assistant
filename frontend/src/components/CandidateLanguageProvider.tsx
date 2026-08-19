"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_LANGUAGE_ID,
  getLanguage,
  LanguageConfig,
} from "@/config/languages";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

interface CandidateLanguageContextValue {
  language: LanguageConfig;
  loading: boolean;
}

const CandidateLanguageContext = createContext<CandidateLanguageContextValue>({
  language: getLanguage(DEFAULT_LANGUAGE_ID),
  loading: true,
});

function getCookieValue(name: string): string {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

export function CandidateLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => {
    try {
      return getLanguage(getCookieValue("language_selected") || DEFAULT_LANGUAGE_ID);
    } catch {
      return getLanguage(DEFAULT_LANGUAGE_ID);
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCandidate() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/me`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) return;

        const candidate = await response.json();
        const selectedLanguage = getLanguage(candidate.languageSelected || DEFAULT_LANGUAGE_ID);
        setLanguage(selectedLanguage);
        document.cookie = `language_selected=${selectedLanguage.id}; path=/; SameSite=Lax;`;
      } catch (error) {
        console.error("Failed to load candidate language", error);
      } finally {
        setLoading(false);
      }
    }

    void loadCandidate();
  }, []);

  return (
    <CandidateLanguageContext.Provider value={{ language, loading }}>
      {children}
    </CandidateLanguageContext.Provider>
  );
}

export function useCandidateLanguage() {
  return useContext(CandidateLanguageContext);
}
