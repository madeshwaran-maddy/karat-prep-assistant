"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const hasLoadedRef = useRef(false);

  const [assessment, setAssessment] =
    useState<AssessmentData | null>(null);

  const [selectedQuestion, setSelectedQuestion] =
    useState<AssessmentQuestion | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { language } = useCandidateLanguage();

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;

    async function loadAssessment() {
      try {
        const data = await fetchAssessment(language.id);

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
  }, [language.id]);

  const questions = useMemo(() => {
    if (!assessment) {
      return [];
    }

    return [
      ...assessment.round1Questions,
      assessment.round2Question,
    ];
  }, [assessment]);

  function handleNext() {
    if (!selectedQuestion) {
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
              onSelectQuestion={setSelectedQuestion}
            />
          </div>

          <div className="min-w-0 flex-1">
            <QuestionPanel
              assessmentId={assessment.assessmentId}
              question={selectedQuestion}
              onNext={handleNext}
              hasNext={hasNext}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
