"use client";

import usePracticeQuestions from "../hooks/usePracticeQuestions";

import QuestionHeader from "./QuestionHeader";
import CodeViewer from "./CodeViewer";
import Answer from "./Answer";
import Explanation from "./Explanation";
import NavigationBar from "./NavigationBar";
import { useEffect, useRef } from "react";

export default function QuestionPanel() {

  const {
    topic,
    questionIndex,
  } = usePracticeQuestions();

  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    topRef.current?.scrollIntoView({
        behavior: "smooth"
    });

}, [questionIndex, topic]);

  if (!topic) {
    return (
      <div className="flex h-full items-center justify-center">
        No topic selected
      </div>
    );
  }

  const question = topic.questions[questionIndex];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex-1 min-h-0 overflow-y-auto p-8">

        <div ref={topRef} />

        <QuestionHeader
          title={topic.title}
          questionNo={question.questionNo}
        />

        <CodeViewer
          code={question.buggyCode}
        />

        <Answer
          answer={question.answer}
        />

        <Explanation
          explanation={question.explanation}
        />

        <NavigationBar />

      </div>

    </div>

  );
}