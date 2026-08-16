"use client";

import { useEffect, useState } from "react";

import CodeEditor from "./CodeEditor";
import { AssessmentQuestion } from "./mockAssessment";
import { submitQuestion } from "./mockAssessmentApi";

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
  const [code, setCode] = useState(question.code);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setCode(question.code);
    setError("");
    setSuccessMessage("");
  }, [question]);

  const isRound1 = question.round === 1;

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await submitQuestion(
        assessmentId,
        question.questionNo,
        code
      );

      if (response?.submitted) {
        if (!hasNext) {
          window.location.href = "/candidate-dashboard";
          return;
        }

        setSuccessMessage("Code saved successfully.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit the solution."
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

      {successMessage && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
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
