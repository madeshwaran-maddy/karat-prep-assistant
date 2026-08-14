"use client";

import {
  AssessmentData,
  AssessmentQuestion,
} from "./mockAssessment";

interface Props {
  assessment: AssessmentData;
  selectedQuestion: AssessmentQuestion | null;
  onSelectQuestion: (question: AssessmentQuestion) => void;
}

export default function AssessmentSidebar({
  assessment,
  selectedQuestion,
  onSelectQuestion,
}: Props) {
  return (
    <aside className="h-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="text-base font-bold text-slate-800">
        Assessment Questions
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Select a question
      </p>

      <h3 className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Round 1
      </h3>

      <div className="space-y-2">
        {assessment.round1Questions.map((question) => {
          const active =
            selectedQuestion?.round === 1 &&
            selectedQuestion.questionNo === question.questionNo;

          return (
            <button
              key={`round1-${question.questionNo}`}
              type="button"
              onClick={() => onSelectQuestion(question)}
              className={`w-full rounded-lg border p-2 text-left text-xs transition ${
                active
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="font-semibold">
                Q{question.questionNo}
              </span>
            </button>
          );
        })}
      </div>

      <h3 className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Round 2
      </h3>

      <button
        type="button"
        onClick={() => onSelectQuestion(assessment.round2Question)}
        className={`w-full rounded-lg border p-2 text-left text-[11px] transition ${
          selectedQuestion?.round === 2
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-slate-200 hover:bg-slate-50"
        }`}
      >
        <span className="font-semibold">
          {assessment.round2Question.title}
        </span>
      </button>
    </aside>
  );
}
