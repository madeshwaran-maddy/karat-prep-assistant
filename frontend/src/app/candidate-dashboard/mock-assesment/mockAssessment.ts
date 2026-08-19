export interface Round1Question {
  language: string;
  questionNo: number;
  topic: string;
  description: string;
  code: string;
  fileName: string;
  round: 1;
  source: "ollama";
}

export interface Round2Question {
  language: string;
  questionNo: number;
  title: string;
  code: string;
  round: 2;
  source: "excel";
}

export type AssessmentQuestion = Round1Question | Round2Question;

export interface AssessmentData {
  assessmentId: string;
  language: string;
  round1Questions: Round1Question[];
  round2Question: Round2Question;
}

export interface EvaluationResult {
  score: number;
  correct: boolean;
  explanation: string;
  suggestions: string[];
  correctedCode: string;
}
