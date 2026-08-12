"use client";

import { ExerciseQuestion } from "../lib/questionTypes";

import ExerciseSidebar from "./ExerciseSidebar";
import QuestionPanel from "./QuestionPanel";

interface Props {
  question: ExerciseQuestion;
  questions: ExerciseQuestion[];
}

export default function ExerciseQuestions({
  question,
  questions,
}: Props) {
  return (
    <div className="min-h-screen bg-white px-5 py-7">
      <div className="w-full">
        <QuestionPanel
          question={question}
        />
      </div>
    </div>
  );
}