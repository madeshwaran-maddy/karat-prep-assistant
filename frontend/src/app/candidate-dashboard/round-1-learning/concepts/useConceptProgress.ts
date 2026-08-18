import { useEffect, useState, useCallback } from "react";
import {
  ConceptProgress,
  UserProgressResponse,
  ProgressStatus,
} from "./types";

const API_BASE = "http://localhost:8000/api/concept-learning";

export function useConceptProgress() {
  const [progress, setProgress] = useState<Record<string, ConceptProgress>>({});
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all progress
  const fetchAllProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/progress`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }

      const data: UserProgressResponse = await response.json();
      setProgress(data.progress_map || {});
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Failed to fetch progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get progress for a specific concept
  const getConceptProgress = useCallback(
    async (conceptId: string): Promise<ConceptProgress | null> => {
      try {
        const response = await fetch(`${API_BASE}/progress/${conceptId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch concept progress");
        }

        return await response.json();
      } catch (err) {
        console.error(`Failed to fetch progress for ${conceptId}:`, err);
        return null;
      }
    },
    []
  );

  // Start a concept (mark as in_progress)
  const startConcept = useCallback(async (conceptId: string) => {
    try {
      const response = await fetch(`${API_BASE}/progress/start/${conceptId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to start concept");
      }

      const data: ConceptProgress = await response.json();
      setProgress((prev) => ({ ...prev, [conceptId]: data }));
      return data;
    } catch (err) {
      console.error(`Failed to start concept ${conceptId}:`, err);
      // Don't throw, just log
    }
  }, []);

  // Complete a concept
  const completeConcept = useCallback(async (conceptId: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/progress/complete/${conceptId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to complete concept");
      }

      const data: ConceptProgress = await response.json();
      setProgress((prev) => ({ ...prev, [conceptId]: data }));
      return data;
    } catch (err) {
      console.error(`Failed to complete concept ${conceptId}:`, err);
      // Don't throw, just log
    }
  }, []);

  // Update progress with time spent
  const updateProgress = useCallback(
    async (
      conceptId: string,
      timeSpentSeconds: number
    ): Promise<ConceptProgress | null> => {
      try {
        const response = await fetch(
          `${API_BASE}/progress/update/${conceptId}?time_spent_seconds=${timeSpentSeconds}`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update progress");
        }

        const data: ConceptProgress = await response.json();
        setProgress((prev) => ({ ...prev, [conceptId]: data }));
        return data;
      } catch (err) {
        console.error(`Failed to update progress for ${conceptId}:`, err);
        return null;
      }
    },
    []
  );

  // Get status for a concept
  const getStatus = useCallback(
    (conceptId: string): ProgressStatus => {
      return progress[conceptId]?.status || "not_started";
    },
    [progress]
  );

  // Get time spent for a concept
  const getTimeSpent = useCallback(
    (conceptId: string): number => {
      return progress[conceptId]?.time_spent_seconds || 0;
    },
    [progress]
  );

  return {
    progress,
    summary,
    loading,
    error,
    fetchAllProgress,
    getConceptProgress,
    startConcept,
    completeConcept,
    updateProgress,
    getStatus,
    getTimeSpent,
  };
}
