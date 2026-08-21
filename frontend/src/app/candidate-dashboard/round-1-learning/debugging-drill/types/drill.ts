export interface PromptConfig {
  topic: string;
  bugTypes: string[];
  rules: string[];
}

export interface Drill {
  id: string;
  title: string;
  difficulty: string;
  prompt: PromptConfig;
}

export interface DrillCategory {
  category: string;
  drills: Drill[];
}

export interface DrillJson {
  [key: string]: Drill[];
}

export interface GenerateRequest {
  id: string;
  language?: string;
  assessmentId?: string;
}

export interface GenerateResponse {
  id?: string;
  assessmentId: string;
  topic: string;
  difficulty: string;
  code: string;
}

export interface EvaluateRequest {
  id: string;
  language?: string;
  questionId?: string;
  assessmentId?: string;
  userAnalysis: string;
  userCode?: string;
  originalCode?: string;
}

export interface EvaluateResponse {
  score: number;
  correct: boolean;
  explanation: string;
  suggestions: string[];
  correctedCode: string;
  buggyCode?: string;
}