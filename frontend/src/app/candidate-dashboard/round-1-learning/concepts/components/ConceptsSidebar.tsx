"use client";

import { useMemo, useState } from "react";
import { ConceptSection, ConceptProgress } from "../types";
import styles from "../concepts.module.css";

interface Props {
  sections: ConceptSection[];
  selected: string;
  onSelect: (id: string) => void;
  progress?: Record<string, ConceptProgress>;
}

export default function ConceptsSidebar({
  sections,
  selected,
  onSelect,
  progress = {},
}: Props) {
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sections;
    }

    return sections
      .map((section) => ({
        ...section,
        concepts: section.concepts.filter((concept) =>
          concept.title.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((section) => section.concepts.length > 0);
  }, [query, sections]);

  const totalConcepts = sections.reduce(
    (total, section) => total + section.concepts.length,
    0
  );

  const completedCount = Object.values(progress).filter(
    (p) => p.status === "completed"
  ).length;

  const getProgressIndicator = (conceptId: string) => {
    const conceptProgress = progress[conceptId];

    if (!conceptProgress || conceptProgress.status === "not_started") {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-xs text-slate-600">
          ○
        </span>
      );
    }

    if (conceptProgress.status === "in_progress") {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-xs text-amber-700 font-semibold">
          ↻
        </span>
      );
    }

    if (conceptProgress.status === "completed") {
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-xs text-green-700 font-semibold">
          ✓
        </span>
      );
    }
  };

  const getTimeDisplay = (conceptId: string) => {
    const conceptProgress = progress[conceptId];

    if (!conceptProgress || conceptProgress.time_spent_seconds === 0) {
      return null;
    }

    const seconds = conceptProgress.time_spent_seconds;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <aside className="flex w-full flex-col">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Complete Notes</h2>
            <p className="mt-1 text-sm text-slate-500">
              {totalConcepts} Java 17 chapters
            </p>
          </div>
          {completedCount > 0 && (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 border border-green-200">
              <span className="text-sm font-semibold text-green-700">
                {completedCount}/{totalConcepts}
              </span>
            </div>
          )}
        </div>

        <label className="sr-only" htmlFor="concept-search">
          Search concepts
        </label>
        <input
          id="concept-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a topic..."
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="mt-5 flex-1 space-y-6 pb-4">
        {filteredSections.map((section) => (
          <section key={section.id}>
            <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {section.title}
            </h3>

            <div className="space-y-2">
              {section.concepts.map((item) => {
                const timeDisplay = getTimeDisplay(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-start justify-between gap-3

                    ${
                      selected === item.id
                        ? "bg-green-100 border border-green-500 text-green-700 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm leading-5 truncate">
                        {item.title}
                      </div>
                      {timeDisplay && (
                        <div className="text-xs text-slate-500 mt-1">
                          {timeDisplay}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      {getProgressIndicator(item.id)}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        {filteredSections.length === 0 && (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
            No concept matches “{query}”.
          </p>
        )}
      </div>

      {/* Progress Legend */}
      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-xs font-semibold text-slate-600 mb-2">Progress:</p>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200">
              ○
            </span>
            <span>Not started</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-xs">
              ↻
            </span>
            <span>In progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-700 text-xs">
              ✓
            </span>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
