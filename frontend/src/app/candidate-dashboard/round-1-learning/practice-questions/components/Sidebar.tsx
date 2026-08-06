"use client";

import SidebarSection from "./SidebarSection";
import usePracticeQuestions from "../hooks/usePracticeQuestions";

export default function Sidebar() {

  const { data } = usePracticeQuestions();

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-xl border bg-white p-5 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <h2 className="mb-6 text-xl font-bold">
          Topics
        </h2>

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
        title="Equals & HashCode"
        section="equalsAndHashCode"
        topics={data.equalsAndHashCode}
      />
      </div>
    </aside>
  );
}