"use client";

import { ExerciseQuestion } from "../lib/questionTypes";
import Link from "next/link";

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
      <div style={{ padding: "0 0 16px" }}>
        <Link
          href="/candidate-dashboard/round-2-learning"
          className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
        >
          Back to Round 2 Learning
        </Link>
      </div>

      <div className="w-full">
        <QuestionPanel
          question={question}
        />
      </div>
    </div>
  );
}