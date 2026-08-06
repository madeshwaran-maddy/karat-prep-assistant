export interface Question {
  questionNo: number;
  buggyCode: string;
  answer: string;
  explanation: string;
}

export interface Topic {
  id: string;
  title: string;
  questions: Question[];
}

export interface PracticeData {
  collections: Topic[];
  exceptions: Topic[];
  equalsAndHashCode: Topic[];
}

export interface FlatTopic {
  section: keyof PracticeData;
  topic: Topic;
}