"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import AssessmentSidebar from "./AssessmentSidebar";
import QuestionPanel from "./QuestionPanel";
import { fetchAssessment } from "./mockAssessmentApi";
import {
  AssessmentData,
  AssessmentQuestion,
} from "./mockAssessment";
import { getNextQuestion } from "./assessmentHelpers";
import { useCandidateLanguage } from "../../../components/CandidateLanguageProvider";

export default function MockAssessment() {
  const [assessment, setAssessment] =
    useState<AssessmentData | null>(null);

  const [selectedQuestion, setSelectedQuestion] =
    useState<AssessmentQuestion | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [submittedQuestionKeys, setSubmittedQuestionKeys] = useState<Set<string>>(
    new Set()
  );
  const { language, loading: languageLoading } = useCandidateLanguage();

  useEffect(() => {
    if (languageLoading || !nameSubmitted) {
      return;
    }

    setAssessment(null);
    setSelectedQuestion(null);
    setSubmittedQuestionKeys(new Set());
    setError("");
    setLoading(true);

    async function loadAssessment() {
      try {
        const data = await fetchAssessment(language.id, interviewerName.trim());

        setAssessment(data);

        if (data.round1Questions.length > 0) {
          setSelectedQuestion(data.round1Questions[0]);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load assessment."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, [interviewerName, language.id, languageLoading, nameSubmitted]);

  function handleInterviewerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!interviewerName.trim()) {
      return;
    }
    setError("");
    setNameSubmitted(true);
  }

  const questions = useMemo(() => {
    if (!assessment) {
      return [];
    }

    return [
      ...assessment.round1Questions,
      assessment.round2Question,
    ];
  }, [assessment]);

  if (!nameSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
        <form
          onSubmit={handleInterviewerSubmit}
          className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        >
          <h1 className="text-xl font-bold text-slate-900">Start Mock Assessment</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the interviewer name before loading the assessment.
          </p>
          <label className="mt-5 block text-sm font-semibold text-slate-700">
            Interviewer name
            <input
              autoFocus
              value={interviewerName}
              onChange={(event) => setInterviewerName(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter interviewer name"
              required
            />
          </label>
          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  function handleNext() {
    if (!selectedQuestion || !currentQuestionSubmitted) {
      return;
    }

    const next = getNextQuestion(
      questions,
      selectedQuestion.questionNo,
      selectedQuestion.round
    );

    if (next) {
      setSelectedQuestion(next);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-500">
          Generating mock assessment...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (!assessment || !selectedQuestion) {
    return (
      <div className="p-6 text-slate-500">
        No assessment questions available.
      </div>
    );
  }

  const selectedIndex = questions.findIndex(
    (question) =>
      question.questionNo === selectedQuestion.questionNo &&
      question.round === selectedQuestion.round
  );

  const hasNext = selectedIndex >= 0 &&
    selectedIndex < questions.length - 1;
  const currentQuestionKey = `${selectedQuestion.round}-${selectedQuestion.questionNo}`;
  const currentQuestionSubmitted = submittedQuestionKeys.has(currentQuestionKey);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Mock Assessment
          </h1>

          <p className="mt-1 text-slate-500">
            Round 1 contains four AI-generated debugging questions.
            Round 2 contains one question selected from Excel.
          </p>
        </header>

        <div className="flex min-h-[calc(100vh-180px)] gap-6">
          <div className="w-[180px] shrink-0">
            <AssessmentSidebar
              assessment={assessment}
              selectedQuestion={selectedQuestion}
              submittedQuestionKeys={submittedQuestionKeys}
              onSelectQuestion={setSelectedQuestion}
            />
          </div>

          <div className="min-w-0 flex-1">
            <QuestionPanel
              assessmentId={assessment.assessmentId}
              question={selectedQuestion}
              onNext={handleNext}
              hasNext={hasNext}
              nextEnabled={currentQuestionSubmitted}
              questionSubmitted={currentQuestionSubmitted}
              onSubmitted={(questionKey) => {
                setSubmittedQuestionKeys((current) => {
                  const next = new Set(current);
                  next.add(questionKey);
                  return next;
                });
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
