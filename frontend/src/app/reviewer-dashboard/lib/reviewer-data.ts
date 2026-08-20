import { apiUrl } from "@/lib/api";

export type AttemptQuestion = {
  id: string;
  questionNo: number;
  topic: string;
  subtopic: string;
  questionCode: string;
  userCode: string;
  userAnalysis: string;
  score: number | string | null;
  explanation: string;
  suggestions: string[];
};

export type Attempt = {
  id: string;
  round: "Round 1" | "Round 2" | "Round 3";
  attemptNo: string;
  attemptedDate: string;
  fileName: string;
  solution: string;
  questions?: AttemptQuestion[];
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  languageSelected: string;
  mockEnabled: boolean;
  startDate: string;
  karatAssessmentDate?: string;
  timeline: string;
  leadName: string;
  status: string;
  role?: "candidate" | "reviewer";
  round1Attempts: number;
  round2Attempts: number;
  totalMockAttempts: number;
  attempts: Attempt[];
};

export type ProgressItem = { name: string; completed: boolean };
export type ProgressTopic = { name: string; completed: number; total: number; items: ProgressItem[] };
export type ProgressMetric = { completed: number; total: number; percentage: number };
export type LearningProgress = {
  language: string;
  summary: {
    round1Concepts: ProgressMetric;
    round1Practice: ProgressMetric;
    round2Practice: ProgressMetric;
  };
  details: {
    round1Concepts: ProgressTopic[];
    round1Practice: ProgressTopic[];
    round2Practice: ProgressTopic[];
  };
};

export const candidates: Candidate[] = [];

export async function fetchCandidates(): Promise<Candidate[]> {
  const response = await fetch(apiUrl("/api/reviewer/candidates"));

  if (!response.ok) {
    throw new Error("Failed to load reviewer candidates.");
  }

  const data = (await response.json()) as Candidate[];
  candidates.splice(0, candidates.length, ...data);
  return candidates;
}

export async function fetchCandidate(candidateId: string): Promise<Candidate | null> {
  const response = await fetch(
    apiUrl(`/api/reviewer/candidates/${candidateId}`)
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Candidate;
  const index = candidates.findIndex((candidate) => candidate.id === candidateId);

  if (index >= 0) {
    candidates[index] = data;
  } else {
    candidates.push(data);
  }

  return data;
}

export async function fetchLearningProgress(candidateId: string): Promise<LearningProgress> {
  const response = await fetch(
    apiUrl(`/api/reviewer/candidates/${candidateId}/learning-progress`)
  );

  if (!response.ok) {
    throw new Error("Failed to load learning progress.");
  }

  return response.json() as Promise<LearningProgress>;
}

export function getCandidate(id: string) {
  return candidates.find((candidate) => candidate.id === id);
}

export function getAttempt(candidateId: string, attemptId: string) {
  return getCandidate(candidateId)?.attempts.find(
    (attempt) => attempt.id === attemptId
  );
}
