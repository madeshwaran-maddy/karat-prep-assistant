"use client";

import usePracticeQuestions from "../hooks/usePracticeQuestions";

const statusClasses = {
  completed: "border-emerald-300 bg-emerald-50 text-emerald-700",
  in_progress: "border-amber-300 bg-amber-50 text-amber-700",
  not_started: "border-slate-300 bg-white text-slate-700",
} as const;

const statusDotClasses = {
  completed: "bg-emerald-500",
  in_progress: "bg-amber-500",
  not_started: "bg-slate-400",
} as const;

export default function QuestionIndexBar() {
  const { topic, questionIndex, section, setQuestionIndex, progress } = usePracticeQuestions();

  if (!topic) {
    return null;
  }

  return (
    <nav
      aria-label="Choose a question"
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-600">
          Questions in this topic
        </h2>
        <span className="text-sm font-semibold text-slate-500">
          {topic.questions.length} total
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {topic.questions.map((question, index) => {
          const currentStatus =
            progress[`${section}-${topic.id}-${question.questionNo}`]?.status || "not_started";

          const isActive = questionIndex === index;

          return (
            <button
              key={`${topic.id}-${question.questionNo}-${index}`}
              type="button"
              aria-label={`Open question ${index + 1}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setQuestionIndex(index)}
              className={`relative h-10 min-w-10 rounded-lg border px-2 text-sm font-bold transition ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : statusClasses[currentStatus]
              }`}
            >
              <span className="relative z-10">{index + 1}</span>
              {!isActive && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${statusDotClasses[currentStatus]}`}
                  title={currentStatus.replace(/_/g, " ")}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
