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
}

export interface GenerateResponse {
  topic: string;
  difficulty: string;
  code: string;
}

export interface EvaluateRequest {
  id: string;
  userAnalysis: string;
}

export interface EvaluateResponse {
  score: number;
  correct: boolean;
  explanation: string;
  suggestions: string[];
  correctedCode: string;
}