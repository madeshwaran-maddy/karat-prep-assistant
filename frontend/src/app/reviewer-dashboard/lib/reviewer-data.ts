export type Attempt = {
  id: string;
  round: "Round 1" | "Round 2" | "Round 3";
  attemptNo: string;
  attemptedDate: string;
  fileName: string;
  solution: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
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

export const candidates: Candidate[] = [];

export async function fetchCandidates(): Promise<Candidate[]> {
  const response = await fetch("http://localhost:8000/api/reviewer/candidates");

  if (!response.ok) {
    throw new Error("Failed to load reviewer candidates.");
  }

  const data = (await response.json()) as Candidate[];
  candidates.splice(0, candidates.length, ...data);
  return candidates;
}

export async function fetchCandidate(candidateId: string): Promise<Candidate | null> {
  const response = await fetch(
    `http://localhost:8000/api/reviewer/candidates/${candidateId}`
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

export function getCandidate(id: string) {
  return candidates.find((candidate) => candidate.id === id);
}

export function getAttempt(candidateId: string, attemptId: string) {
  return getCandidate(candidateId)?.attempts.find(
    (attempt) => attempt.id === attemptId
  );
}
