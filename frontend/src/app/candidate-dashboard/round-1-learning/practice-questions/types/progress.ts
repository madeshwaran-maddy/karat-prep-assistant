export type QuestionStatus = "not_started" | "in_progress" | "completed";

export interface QuestionProgress {
  id: string;
  candidateId: string;
  section: string;
  topicId: string;
  questionNo: number;
  status: QuestionStatus;
  timeSpentSeconds: number;
  languageSelected?: string;
  startedAt?: string;
  completedAt?: string;
  lastAccessed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicProgressSummary {
  section: string;
  topicId: string;
  totalQuestions: number;
  completedQuestions: number;
  inProgressQuestions: number;
  averageTimeSpent: number;
  progressPercentage: number;
}

export interface UserPracticeProgressResponse {
  progressMap: Record<string, QuestionProgress>;
  summaryByTopic: Record<string, TopicProgressSummary>;
  totalTimeSpent: number;
}
