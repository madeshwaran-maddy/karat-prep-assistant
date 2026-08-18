"use client";

import usePracticeQuestions from "../hooks/usePracticeQuestions";
import { PracticeData } from "../types/practice";

interface Props {
  section: keyof PracticeData;
  id: string;
  title: string;
  questionCount: number;
}

const statusColors = {
  completed: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  in_progress: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  not_started: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
} as const;

function StatusPill({
  status,
  count,
}: {
  status: "completed" | "in_progress" | "not_started";
  count: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColors[status]}`}
      title={status.replace(/_/g, " ")}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "completed"
            ? "bg-emerald-600"
            : status === "in_progress"
              ? "bg-amber-600"
              : "bg-slate-400"
        }`}
      />
      {count}
    </span>
  );
}

export default function SidebarTopic({
  section,
  id,
  title,
  questionCount,
}: Props) {
  const {
    section: selectedSection,
    topicId,
    setSection,
    setTopicId,
    setQuestionIndex,
    progress,
  } = usePracticeQuestions();

  const active =
    selectedSection === section &&
    topicId === id;

  const topicProgressEntries = Object.values(progress).filter(
    (item) => item.section === section && item.topicId === id
  );

  const completedCount = topicProgressEntries.filter((item) => item.status === "completed").length;
  const inProgressCount = topicProgressEntries.filter((item) => item.status === "in_progress").length;
  const totalProgressCount = topicProgressEntries.length;
  const computedNotStartedCount = Math.max(
    questionCount - completedCount - inProgressCount,
    0
  );

  const derivedStatus =
    completedCount === questionCount
      ? "completed"
      : totalProgressCount > 0 || inProgressCount > 0
        ? "in_progress"
        : "not_started";

  function handleClick() {
    setSection(section);
    setTopicId(id);
    setQuestionIndex(0);
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full rounded-lg p-3 text-left transition-all ${
        active
          ? "border border-green-500 bg-green-100 font-semibold text-green-700"
          : "hover:bg-gray-100"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm leading-5">{title}</span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
            active ? "bg-green-200 text-green-900" : "bg-slate-100 text-slate-500"
          }`}
        >
          {questionCount}
        </span>
      </span>

      <div className="mt-2 flex items-center text-[10px] font-medium uppercase tracking-wide">
        <span className={
          derivedStatus === "completed"
            ? "text-emerald-700"
            : derivedStatus === "in_progress"
              ? "text-amber-700"
              : "text-slate-500"
        }>
          {derivedStatus === "completed"
            ? "Completed"
            : derivedStatus === "in_progress"
              ? "In progress"
              : "Not started"}
        </span>
      </div>
    </button>
  );
}
