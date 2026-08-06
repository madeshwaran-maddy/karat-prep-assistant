"use client";

import usePracticeQuestions from "../hooks/usePracticeQuestions";
import { PracticeData } from "../types/practice";

interface Props {
  section: keyof PracticeData;
  id: string;
  title: string;
}

export default function SidebarTopic({
  section,
  id,
  title,
}: Props) {
  const {
    section: selectedSection,
    topicId,
    setSection,
    setTopicId,
    setQuestionIndex,
  } = usePracticeQuestions();

  const active =
    selectedSection === section &&
    topicId === id;

  function handleClick() {
    setSection(section);
    setTopicId(id);
    setQuestionIndex(0);
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full rounded-lg p-3 text-left transition-all

      ${
        active
          ? "bg-green-100 border border-green-500 text-green-700 font-semibold"
          : "hover:bg-gray-100"
      }`}
    >
      {title}
    </button>
  );
}