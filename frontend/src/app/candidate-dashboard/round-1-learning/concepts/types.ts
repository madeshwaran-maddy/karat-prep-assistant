export interface ConceptTable {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface ConceptDetailSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
  codeExample?: string;
  table?: ConceptTable;
}

export interface OfficialReference {
  title: string;
  url: string;
}

export interface Concept {
  id: string;
  title: string;
  explanation: string[];
  keyConcepts: string[];
  commonMistakes: string[];
  codeExample: string;
  debuggingScenario: string[];
  summary?: string;
  learningObjectives?: string[];
  detailSections?: ConceptDetailSection[];
  complexityTable?: ConceptTable;
  interviewChecklist?: string[];
  officialReferences?: OfficialReference[];
}

export interface ConceptsData {
  collections: Concept[];
  exceptions: Concept[];
  multithreading: Concept[];
}

export interface ConceptSection {
  id: keyof ConceptsData;
  title: string;
  concepts: Concept[];
}

// Progress tracking types
export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface ConceptProgress {
  id: string;
  candidate_id: string;
  concept_id: string;
  status: ProgressStatus;
  started_at?: string | null;
  completed_at?: string | null;
  time_spent_seconds: number;
  last_accessed?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConceptProgressSummary {
  total_concepts: number;
  completed_concepts: number;
  in_progress_concepts: number;
  not_started_concepts: number;
  total_time_spent_seconds: number;
  completion_percentage: number;
}

export interface UserProgressResponse {
  progress_map: Record<string, ConceptProgress>;
  summary: ConceptProgressSummary;
}

export interface ConceptWithProgress extends Concept {
  progress?: ConceptProgress;
}
