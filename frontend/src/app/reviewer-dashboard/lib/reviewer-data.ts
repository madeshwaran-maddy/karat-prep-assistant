import { reviewerData } from "../data/reviewer-data";

export type Attempt = {
  id: string;
  round: "Round 1" | "Round 2";
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
  timeline: string;
  leadName: string;
  status: string;
  round1Attempts: number;
  round2Attempts: number;
  attempts: Attempt[];
};

export const candidates: Candidate[] = reviewerData.candidates;

export function getCandidate(id: string) {
  return candidates.find((candidate) => candidate.id === id);
}

export function getAttempt(candidateId: string, attemptId: string) {
  return getCandidate(candidateId)?.attempts.find(
    (attempt) => attempt.id === attemptId
  );
}

/*
  FUTURE DB/API INTEGRATION

  Replace the functions above with calls such as:

  getCandidates()
  searchCandidates(searchText)
  getCandidate(candidateId)
  getCandidateAttempts(candidateId)
  getAttempt(candidateId, attemptId)
  updateCandidate(candidateId, payload)

  The UI pages do not need to change when the data source moves
  from this mock file to the backend/database.
*/