export type FormatDetail = {
  label: string;
  value: string;
};

export type FormatSection = {
  title: string;
  items: FormatDetail[];
};

export type FormatConfig = {
  title: string;
  description?: string;
  details?: FormatDetail[];
  sections?: FormatSection[];
};

export type PracticeQuestion = {
  id: string;
  questionNo: number;
  title: string;
  question: string;
  answer: string;
  explanation: string;
};
