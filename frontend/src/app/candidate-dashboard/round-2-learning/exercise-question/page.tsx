"use client";

import { useEffect, useRef, useState } from "react";

import ExerciseQuestions from "./components/ExerciseQuestions";
import { ExerciseQuestion } from "./lib/questionTypes";

export default function ExerciseQuestionsPage() {
  const [question, setQuestion] = useState<ExerciseQuestion | null>(null);
  const [questions, setQuestions] = useState<ExerciseQuestion[]>([]);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;

    const loadQuestion = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/assessments/start-exercise-question", {
          method: "POST",
          credentials: "include",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load exercise question.");
        }

        const loadedQuestion: ExerciseQuestion = {
          id: String(data.questionId ?? data.question?.id ?? ""),
          questionNo: Number(data.question?.questionNo ?? 1),
          title: String(data.question?.title ?? "Exercise Question"),
          code: String(data.question?.code ?? ""),
          assessmentId: String(data.assessmentId ?? ""),
        };

        setQuestion(loadedQuestion);
        setQuestions([loadedQuestion]);
      } catch (err) {
        console.error("Failed to load exercise question", err);
        setError(err instanceof Error ? err.message : "Unable to load the exercise question.");
      }
    };

    void loadQuestion();
  }, []);

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  if (!question) {
    return <div className="p-8 text-slate-600">Loading exercise question...</div>;
  }

  return (
    <ExerciseQuestions
      question={question}
      questions={questions}
    />
  );
}