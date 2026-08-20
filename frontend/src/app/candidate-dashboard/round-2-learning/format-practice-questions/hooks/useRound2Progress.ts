"use client";

import { useCallback, useState } from "react";
import { apiUrl } from "@/lib/api";

const API_BASE = apiUrl("/api/practice-questions");

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type Round2Progress = {
  status: ProgressStatus;
  timeSpentSeconds: number;
};

type ApiProgress = {
  status?: ProgressStatus;
  time_spent_seconds?: number;
  topic_id?: string;
  question_no?: number;
};

function key(topicId: string, questionNo: number): string {
  return `${topicId}-${questionNo}`;
}

function normalizeProgress(data: ApiProgress): Round2Progress {
  return {
    status: data.status ?? "not_started",
    timeSpentSeconds: data.time_spent_seconds ?? 0,
  };
}

export function useRound2Progress() {
  const [progress, setProgress] = useState<Record<string, Round2Progress>>({});

  async function request(
    path: string,
    options?: RequestInit
  ): Promise<Round2Progress | null> {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      return normalizeProgress((await response.json()) as ApiProgress);
    } catch {
      return null;
    }
  }

  const fetchAll = useCallback(async (): Promise<Record<string, Round2Progress>> => {
    try {
      const response = await fetch(`${API_BASE}/progress/all`, {
        credentials: "include",
      });

      if (!response.ok) {
        return {};
      }

      const data = (await response.json()) as {
        progress_map?: Record<string, ApiProgress>;
      };
      const nextProgress: Record<string, Round2Progress> = {};

      Object.values(data.progress_map ?? {}).forEach((item) => {
        if (item.topic_id && typeof item.question_no === "number") {
          nextProgress[key(item.topic_id, item.question_no)] = normalizeProgress(item);
        }
      });

      setProgress(nextProgress);
      return nextProgress;
    } catch {
      // Tracking is best effort; content remains usable without the API.
      return {};
    }
  }, []);

  async function start(topicId: string, questionNo: number) {
    const result = await request(
      `/progress/start/round2/${encodeURIComponent(topicId)}/${questionNo}`,
      { method: "POST" }
    );

    if (result) {
      setProgress((current) => ({ ...current, [key(topicId, questionNo)]: result }));
    }
    return result;
  }

  async function complete(
    topicId: string,
    questionNo: number,
    timeSpentSeconds: number
  ) {
    const result = await request(
      `/progress/complete/round2/${encodeURIComponent(topicId)}/${questionNo}?time_spent_seconds=${Math.max(0, Math.round(timeSpentSeconds))}`,
      { method: "POST" }
    );

    if (result) {
      setProgress((current) => ({ ...current, [key(topicId, questionNo)]: result }));
    }
    return result;
  }

  async function updateTime(
    topicId: string,
    questionNo: number,
    timeSpentSeconds: number
  ) {
    const result = await request(
      `/progress/update-time/round2/${encodeURIComponent(topicId)}/${questionNo}?time_spent_seconds=${Math.max(0, Math.round(timeSpentSeconds))}`,
      { method: "POST" }
    );

    if (result) {
      setProgress((current) => ({ ...current, [key(topicId, questionNo)]: result }));
    }
    return result;
  }

  return { progress, fetchAll, start, complete, updateTime };
}

export function getProgressStatus(
  progress: Record<string, Round2Progress>,
  topicId: string,
  questionNo: number
): ProgressStatus {
  return progress[key(topicId, questionNo)]?.status ?? "not_started";
}