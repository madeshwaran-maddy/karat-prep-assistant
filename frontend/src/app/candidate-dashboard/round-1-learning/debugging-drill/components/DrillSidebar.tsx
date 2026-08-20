"use client";

import { useEffect, useState } from "react";
import { Drill } from "../types/drill";
import { loadDrills } from "../services/debuggingApi";
import { useCandidateLanguage } from "../../../../../components/CandidateLanguageProvider";

interface DrillSidebarProps {
  selectedId?: string;
  onSelect?: (drill: Drill) => void;
}

export default function DrillSidebar({
  selectedId,
  onSelect,
}: DrillSidebarProps) {
  const { language } = useCandidateLanguage();
  const [collections, setCollections] = useState<Record<string, Drill[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDrills() {
      try {
        const json = await loadDrills(language.id);
        setCollections(json);
      } catch (error) {
        console.error("Failed to load drills", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDrills();
  }, [language.id]);

  if (loading) {
    return (
      <aside className="flex h-full min-h-0 flex-col rounded-xl border bg-white p-5 shadow-sm overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <h2 className="mb-6 text-xl font-bold">Topics</h2>
          <div className="text-sm text-slate-500">Loading...</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-xl border bg-white p-5 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <h2 className="mb-6 text-xl font-bold">Topics</h2>

        {Object.entries(collections).map(([sectionName, drills]) => (
          <div key={sectionName} className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {sectionName.replaceAll("_", " ")}
            </h3>

            <div className="space-y-2">
              {drills.map((drill) => {
                const isActive = selectedId === drill.id;

                return (
                  <button
                    key={drill.id}
                    onClick={() => onSelect?.(drill)}
                    className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-medium">{drill.title}</div>
                    <div className={`mt-1 text-sm ${isActive ? "text-green-600" : "text-slate-500"}`}>
                      {drill.difficulty}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}