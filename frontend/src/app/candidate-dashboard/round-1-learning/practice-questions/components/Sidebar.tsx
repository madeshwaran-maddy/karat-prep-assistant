"use client";

import SidebarSection from "./SidebarSection";
import usePracticeQuestions from "../hooks/usePracticeQuestions";

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

      <SidebarSection
        title="Collections"
        section="collections"
        topics={data.collections}
      />

      <SidebarSection
        title="Exceptions"
        section="exceptions"
        topics={data.exceptions}
      />

      <SidebarSection
        title="Multithreading"
        section="multithreading"
        topics={data.multithreading}
      />

      <SidebarSection
        title="Equals & HashCode"
        section="equalsAndHashCode"
        topics={data.equalsAndHashCode}
      />
      </div>
    </aside>
  );
}
