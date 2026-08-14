export interface Round1Question {
  questionNo: number;
  topic: string;
  description: string;
  code: string;
  fileName: string;
  round: 1;
  source: "ollama";
}

export interface Round2Question {
  questionNo: number;
  title: string;
  code: string;
  round: 2;
  source: "excel";
}

export type AssessmentQuestion = Round1Question | Round2Question;

export interface AssessmentData {
  assessmentId: string;
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
