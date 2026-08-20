export interface Question {
  questionNo: number;
  buggyCode: string;
  answer: string;
  explanation: string;
  title?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  task?: string;
  expectedBehavior?: string;
  hints?: string[];
  correctedCode?: string;
  keyTakeaways?: string[];
  followUpQuestions?: string[];
}

export interface Topic {
  id: string;
  title: string;
  questions: Question[];
  summary?: string;
  learningGoals?: string[];
}

export type PracticeData = Record<string, Topic[]>;

export interface FlatTopic {
  section: string;
  topic: Topic;
}
