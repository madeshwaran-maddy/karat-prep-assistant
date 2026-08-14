"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CodeEditor from "./CodeEditor";
import {
  AssessmentQuestion,
  EvaluationResult,
} from "./mockAssessment";
import { evaluateQuestion } from "./mockAssessmentApi";

interface Props {
  assessmentId: string;
  question: AssessmentQuestion;
  onNext: () => void;
  hasNext: boolean;
}

export default function QuestionPanel({
  assessmentId,
  question,
  onNext,
  hasNext,
}: Props) {
  const router = useRouter();
  const [code, setCode] = useState(question.code);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setCode(question.code);
    setResult(null);
    setError("");
  }, [question]);

  const isRound1 = question.round === 1;

  function handleSubmit() {
    if (!hasNext) {
      router.push("/candidate-dashboard");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const evaluation = evaluateQuestion(
        assessmentId,
        question.questionNo,
        code
      );

      setResult(evaluation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to evaluate the solution."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {isRound1
                ? `Question ${question.questionNo}`
                : "Round 2"}
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              {isRound1 ? question.topic : question.title}
            </h1>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {isRound1 ? "Round 1" : "Round 2"}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          {isRound1
            ? question.description
            : "Fix the bugs in the Java program below."}
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-700">
        <div className="flex items-center justify-between bg-slate-800 px-4 py-3 text-sm text-white">
          <span>
            {isRound1
              ? question.fileName
              : `Question${question.questionNo}.java`}
          </span>
          <span>Java 17</span>
        </div>

        <CodeEditor value={code} onChange={setCode} />
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">
              Evaluation
            </h3>
            <span className="font-bold">
              {result.score}/10
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            {result.explanation}
          </p>

          {result.suggestions.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
              {result.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || hasNext}
          className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Evaluating..." : "Submit"}
        </button>

        {!hasNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={true}
            className="hidden"
          >
            Next
          </button>
        )}

        {hasNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="rounded-lg bg-green-600 px-7 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        )}
      </div>
    </section>
  );
}
