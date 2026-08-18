"use client";

import { useState } from "react";
import SidebarTopic from "./SidebarTopic";
import { PracticeData, Topic } from "../types/practice";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  title: string;
  section: keyof PracticeData;
  topics: Topic[];
}

export default function SidebarSection({
  title,
  section,
  topics,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const sectionQuestionCount = topics.reduce(
    (total, topic) => total + topic.questions.length,
    0
  );

  return (
    <div className="mb-5">

      <button
        className="flex w-full items-center justify-between rounded-md p-2 hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2 font-semibold">
          {title}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {sectionQuestionCount}
          </span>
        </span>

        {expanded ? (
          <ChevronDown size={18} />
        ) : (
          <ChevronRight size={18} />
        )}
      </button>

      {expanded && (
        <div className="mt-2 ml-3 space-y-2">
          {topics.map((topic) => (
            <SidebarTopic
              key={topic.id}
              section={section}
              id={topic.id}
              title={topic.title}
              questionCount={topic.questions.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
