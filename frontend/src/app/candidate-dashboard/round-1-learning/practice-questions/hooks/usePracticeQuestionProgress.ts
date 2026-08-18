"use client";

import { useEffect, useState, useCallback } from "react";
import {
  QuestionProgress,
  TopicProgressSummary,
  UserPracticeProgressResponse,
} from "../types/progress";

const API_BASE = "http://localhost:8000/api/practice-questions";

function normalizeQuestionProgress(item: any): QuestionProgress {
  return {
    id: item.id,
    candidateId: item.candidate_id ?? item.candidateId,
    section: item.section,
    topicId: item.topic_id ?? item.topicId,
    questionNo: item.question_no ?? item.questionNo,
    status: item.status,
    timeSpentSeconds: item.time_spent_seconds ?? item.timeSpentSeconds ?? 0,
    languageSelected: item.language_selected ?? item.languageSelected,
    startedAt: item.started_at ?? item.startedAt,
    completedAt: item.completed_at ?? item.completedAt,
    lastAccessed: item.last_accessed ?? item.lastAccessed,
    createdAt: item.created_at ?? item.createdAt,
    updatedAt: item.updated_at ?? item.updatedAt,
  };
}

function normalizeTopicSummary(item: any): TopicProgressSummary {
  return {
    section: item.section,
    topicId: item.topic_id ?? item.topicId,
    totalQuestions: item.total_questions ?? item.totalQuestions ?? 0,
    completedQuestions: item.completed_questions ?? item.completedQuestions ?? 0,
    inProgressQuestions: item.in_progress_questions ?? item.inProgressQuestions ?? 0,
    averageTimeSpent: item.average_time_spent ?? item.averageTimeSpent ?? 0,
    progressPercentage: item.progress_percentage ?? item.progressPercentage ?? 0,
  };
}

export function usePracticeQuestionProgress() {
  const [progress, setProgress] = useState<Record<string, QuestionProgress>>({});
  const [summaryByTopic, setSummaryByTopic] = useState<Record<string, TopicProgressSummary>>({});
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all progress on mount
  const fetchAllProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Fetching progress from /progress/all...");
      const response = await fetch(`${API_BASE}/progress/all`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }

      const data: any = await response.json();
      console.log("📦 API Response:", data);
      console.log("📦 progress_map entries:", Object.keys(data.progress_map || {}).length);
      
      const normalizedProgress = Object.fromEntries(
        Object.entries(data.progress_map || {}).map(([key, value]) => [key, normalizeQuestionProgress(value)])
      );
      const normalizedSummary = Object.fromEntries(
        Object.entries(data.summary_by_topic || {}).map(([key, value]) => [key, normalizeTopicSummary(value)])
      );

      console.log("✅ Normalized progress:", normalizedProgress);
      console.log("✅ Normalized summary:", normalizedSummary);

      setProgress(normalizedProgress);
      setSummaryByTopic(normalizedSummary);
      setTotalTimeSpent(data.total_time_spent ?? data.totalTimeSpent ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Failed to fetch progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get progress for a specific question
  const getQuestionProgress = useCallback(
    async (section: string, topicId: string, questionNo: number): Promise<QuestionProgress | null> => {
      try {
        const response = await fetch(
          `${API_BASE}/progress/question/${section}/${topicId}/${questionNo}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch question progress");
        }

        const data = await response.json();
        return data ? normalizeQuestionProgress(data) : null;
      } catch (err) {
        console.error(`Failed to fetch progress for question:`, err);
        return null;
      }
    },
    []
  );

  // Get topic progress
  const getTopicProgress = useCallback(
    async (section: string, topicId: string): Promise<Record<string, QuestionProgress>> => {
      try {
        const response = await fetch(
          `${API_BASE}/progress/topic/${section}/${topicId}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch topic progress");
        }

        const data = await response.json();
        return Object.fromEntries(
          Object.entries(data || {}).map(([key, value]) => [key, normalizeQuestionProgress(value as any)])
        );
      } catch (err) {
        console.error(`Failed to fetch topic progress:`, err);
        return {};
      }
    },
    []
  );

  // Start a question
  const startQuestion = useCallback(
    async (section: string, topicId: string, questionNo: number, languageSelected?: string) => {
      try {
        const params = new URLSearchParams();
        if (languageSelected) {
          params.append("language_selected", languageSelected);
        }

        const response = await fetch(
          `${API_BASE}/progress/start/${section}/${topicId}/${questionNo}?${params.toString()}`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to start question");
        }

        const data: QuestionProgress = normalizeQuestionProgress(await response.json());
        setProgress((prev) => ({
          ...prev,
          [`${section}-${topicId}-${questionNo}`]: data,
        }));
        return data;
      } catch (err) {
        console.error(`Failed to start question:`, err);
      }
    },
    []
  );

  // Complete a question
  const completeQuestion = useCallback(
    async (section: string, topicId: string, questionNo: number, timeSpentSeconds: number = 0) => {
      try {
        const response = await fetch(
          `${API_BASE}/progress/complete/${section}/${topicId}/${questionNo}?time_spent_seconds=${timeSpentSeconds}`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to complete question");
        }

        const data: QuestionProgress = normalizeQuestionProgress(await response.json());
        setProgress((prev) => ({
          ...prev,
          [`${section}-${topicId}-${questionNo}`]: data,
        }));
        return data;
      } catch (err) {
        console.error(`Failed to complete question:`, err);
      }
    },
    []
  );

  // Update time spent
  const updateTimeSpent = useCallback(
    async (section: string, topicId: string, questionNo: number, timeSpentSeconds: number) => {
      try {
        const response = await fetch(
          `${API_BASE}/progress/update-time/${section}/${topicId}/${questionNo}?time_spent_seconds=${timeSpentSeconds}`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update time");
        }

        const data: QuestionProgress = normalizeQuestionProgress(await response.json());
        setProgress((prev) => ({
          ...prev,
          [`${section}-${topicId}-${questionNo}`]: data,
        }));
        return data;
      } catch (err) {
        console.error(`Failed to update time:`, err);
      }
    },
    []
  );

  return {
    progress,
    summaryByTopic,
    totalTimeSpent,
    loading,
    error,
    fetchAllProgress,
    getQuestionProgress,
    getTopicProgress,
    startQuestion,
    completeQuestion,
    updateTimeSpent,
  };
}
