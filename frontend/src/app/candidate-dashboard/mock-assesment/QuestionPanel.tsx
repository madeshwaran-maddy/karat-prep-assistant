"use client";

import { useEffect, useRef, useState } from "react";

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
  const [secondsRemaining, setSecondsRemaining] = useState(
    question.round === 1 ? 4 * 60 : 30 * 60
  );
  const [submittedQuestionKeys, setSubmittedQuestionKeys] = useState<Set<string>>(
    new Set()
  );
  const codeRef = useRef(code);
  const timerRef = useRef<number | null>(null);
  const submitRef = useRef<((automatic?: boolean) => Promise<void>) | null>(null);
  const autoSubmitAttemptedRef = useRef(false);
  const submittingQuestionRef = useRef<string | null>(null);

  const questionKey = `${question.round}-${question.questionNo}`;
  const questionSubmitted = submittedQuestionKeys.has(questionKey);
  const timeLimit = question.round === 1 ? 4 * 60 : 30 * 60;

  useEffect(() => {
    setCode(question.code);
    setError("");
    setSuccessMessage("");
    autoSubmitAttemptedRef.current = false;
  }, [question]);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSecondsRemaining(timeLimit);

    if (questionSubmitted) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [questionKey, questionSubmitted, timeLimit]);

  useEffect(() => {
    submitRef.current = handleSubmit;
  });

  useEffect(() => {
    if (
      secondsRemaining === 0 &&
      !questionSubmitted &&
      !autoSubmitAttemptedRef.current
    ) {
      autoSubmitAttemptedRef.current = true;
      void submitRef.current?.(true);
    }
  }, [questionSubmitted, secondsRemaining]);

  const isRound1 = question.round === 1;

  async function handleSubmit(automatic = false) {
    if (
      questionSubmitted ||
      submitting ||
      submittingQuestionRef.current === questionKey
    ) {
      return;
    }

    if (!automatic && timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    submittingQuestionRef.current = questionKey;
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await submitQuestion(
        assessmentId,
        question.questionNo,
        codeRef.current
      );

      if (response?.submitted) {
        setSubmittedQuestionKeys((current) => {
          const next = new Set(current);
          next.add(questionKey);
          return next;
        });

        if (!hasNext) {
          window.location.href = "/candidate-dashboard";
          return;
        }

        setSuccessMessage(
          automatic
            ? "Time expired. Your answer was submitted."
            : "Code saved successfully."
        );
      }
    } catch (err) {
      submittingQuestionRef.current = null;
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
        <div className="mb-5 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-sm font-semibold text-amber-900">Time remaining</span>
          <span className="font-mono text-lg font-bold text-amber-900">
            {Math.floor(secondsRemaining / 60)}:{String(secondsRemaining % 60).padStart(2, "0")}
          </span>
        </div>

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
          disabled={submitting || questionSubmitted}
          className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : questionSubmitted ? "Submitted" : "Submit"}
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
