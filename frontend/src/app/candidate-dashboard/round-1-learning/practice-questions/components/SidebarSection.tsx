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

  return (
    <div className="mb-5">

      <button
        className="flex w-full items-center justify-between rounded-md p-2 hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-semibold">{title}</span>

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
            />
          ))}
        </div>
      )}
    </div>
  );
}