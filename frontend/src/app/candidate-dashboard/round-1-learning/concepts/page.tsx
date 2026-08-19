"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import javaData from "./data/java/concepts.json";
import { useCandidateLanguage } from "@/components/CandidateLanguageProvider";

import ConceptContent from "./components/ConceptContent";
import ConceptsSidebar from "./components/ConceptsSidebar";
import { ConceptSection } from "./types";
import { useConceptProgress } from "./useConceptProgress";
import styles from "./concepts.module.css";

export default function ConceptsPage() {
  const { language } = useCandidateLanguage();
  const hasConceptContent = language.id === "java";
  const data = hasConceptContent
    ? javaData
    : { collections: [], exceptions: [], multithreading: [] };
  const sectionTitleMap: Record<string, string> = {
    collections: "Collections",
    exceptions: "Exception Handling",
    multithreading: "Multithreading",
  };

  const sections: ConceptSection[] = Object.entries(data as Record<string, any[]>)
    .filter(([, concepts]) => Array.isArray(concepts))
    .map(([id, concepts]) => ({
      id: id as keyof typeof data,
      title: sectionTitleMap[id] ??
        id
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (char) => char.toUpperCase())
          .trim(),
      concepts: concepts as ConceptSection["concepts"],
    }));

  const concepts = sections.flatMap((section) => section.concepts);

  const [selected, setSelected] = useState(concepts[0]?.id ?? "");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCompletingConcept, setIsCompletingConcept] = useState(false);

  const {
    progress,
    summary,
    loading,
    fetchAllProgress,
    startConcept,
    updateProgress,
    completeConcept,
  } = useConceptProgress();

  // Fetch all progress on mount
  useEffect(() => {
    fetchAllProgress();
  }, [fetchAllProgress]);

  // Update selected concept after progress is loaded
  useEffect(() => {
    if (loading || Object.keys(progress).length === 0) {
      return;
    }

    // Find first concept with "in_progress" status
    const inProgressConcept = concepts.find(
      (c) => progress[c.id]?.status === "in_progress"
    );

    if (inProgressConcept) {
      setSelected(inProgressConcept.id);
      return;
    }

    // Find first concept with "not_started" status
    const notStartedConcept = concepts.find(
      (c) => progress[c.id]?.status === "not_started"
    );

    if (notStartedConcept) {
      setSelected(notStartedConcept.id);
      return;
    }

    // Default to first concept if all are completed
    setSelected(concepts[0]?.id ?? "");
  }, [progress, loading, concepts]);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousConceptRef = useRef<string>(selected);

  const currentConcept = concepts.find((c) => c.id === selected)!;

  // Handle concept selection with progress tracking
  useEffect(() => {
    if (!hasConceptContent || !selected) return;

    const previousConcept = previousConceptRef.current;

    // Save progress for previous concept if time was spent
    if (previousConcept !== selected && elapsedTime > 0) {
      updateProgress(previousConcept, elapsedTime);
      setElapsedTime(0);
    }

    // Start new concept
    startConcept(selected);

    // Update reference
    previousConceptRef.current = selected;

    // Clear previous interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Start new timer
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [hasConceptContent, selected]); // Only depend on selected concept

  // Save progress before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (elapsedTime > 0) {
        // Use sendBeacon for reliable delivery before unload
        const data = new FormData();
        data.append("conceptId", selected);
        data.append("timeSpentSeconds", String(elapsedTime));

        navigator.sendBeacon(
          "http://localhost:8000/api/concept-learning/progress/update/" +
            selected +
            "?time_spent_seconds=" +
            elapsedTime,
          new Blob([JSON.stringify({ timeSpent: elapsedTime })], {
            type: "application/json",
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selected, elapsedTime]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleMarkComplete = async () => {
    setIsCompletingConcept(true);
    try {
      await completeConcept(selected);
      // Refresh progress to get updated summary
      await fetchAllProgress();
    } catch (error) {
      console.error("Failed to mark concept as complete:", error);
    } finally {
      setIsCompletingConcept(false);
    }
  };

  const currentConceptProgress = progress[selected];
  const isConceptCompleted = currentConceptProgress?.status === "completed";

  if (!hasConceptContent) {
    return (
      <div className="flex min-h-96 items-center justify-center p-8 text-center text-slate-600">
        {language.name} concept content is not available yet.
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-5 px-6 ${styles.layoutWrapper}`}>
      <div className="pt-6 pb-3">
        <Link
          href="/candidate-dashboard/round-1-learning"
          className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
        >
          Back to Round 1 Learning
        </Link>
      </div>

      {/* Progress Summary */}
      {summary && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-900">
              <span className="font-semibold">
                {summary.completed_concepts} / {summary.total_concepts}
              </span>{" "}
              concepts completed (
              <span className="font-semibold">
                {Math.round(summary.completion_percentage)}%
              </span>
              )
            </div>
            <div className="text-sm text-blue-800">
              Total time: <span className="font-semibold">{formatTime(summary.total_time_spent_seconds)}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.gridContainer}>
        <div className={`rounded-xl border bg-white p-5 shadow-sm ${styles.sidebarScrollable}`}>
          <ConceptsSidebar
            sections={sections}
            selected={selected}
            onSelect={setSelected}
            progress={progress}
          />
        </div>

        <div className="flex flex-col min-h-0">
          {/* Session Timer and Complete Button */}
          <div className="mb-3 flex-shrink-0 flex items-center justify-between gap-3 rounded-lg bg-slate-100 px-4 py-2">
            <div className="flex items-center justify-between flex-1">
              <div className="text-sm font-medium text-slate-700">
                Current Session Time
              </div>
              <div className="text-lg font-semibold text-slate-900">
                {formatTime(elapsedTime)}
              </div>
            </div>
            
            {!isConceptCompleted ? (
              <button
                onClick={handleMarkComplete}
                disabled={isCompletingConcept}
                className="ml-3 flex-shrink-0 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold transition hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isCompletingConcept ? "Marking..." : "Mark Complete"}
              </button>
            ) : (
              <div className="ml-3 flex-shrink-0 px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-semibold flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>Completed</span>
              </div>
            )}
          </div>

          <div className={`flex-1 min-h-0 ${styles.contentScrollable}`}>
            <ConceptContent concept={currentConcept} />
          </div>
        </div>
      </div>
    </div>
  );
}
