"use client";

import SidebarSection from "./SidebarSection";
import usePracticeQuestions from "../hooks/usePracticeQuestions";
import { PracticeData } from "../types/practice";

function formatSectionTitle(section: string): string {
  return section
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase())
    .trim();
}

export default function Sidebar() {

  const { data } = usePracticeQuestions();
  const totalQuestions = Object.values(data)
    .flat()
    .reduce((total, topic) => total + topic.questions.length, 0);

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-xl border bg-white p-5 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-scroll overflow-x-hidden">
        <div className="mb-5 border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold">Practice Library</h2>
          <p className="mt-1 text-sm text-slate-500">{totalQuestions} debugging questions</p>
        </div>

      {Object.entries(data as PracticeData).map(([section, topics]) => {
        if (topics.length === 0) {
          return null;
        }

        return (
          <SidebarSection
            key={section}
            title={formatSectionTitle(section)}
            section={section as keyof PracticeData}
            topics={topics}
          />
        );
      })}
      </div>
    </aside>
  );
}
