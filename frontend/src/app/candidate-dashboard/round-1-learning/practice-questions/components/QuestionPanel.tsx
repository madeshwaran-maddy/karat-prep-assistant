"use client";

import usePracticeQuestions from "../hooks/usePracticeQuestions";
import PracticeQuestionService from "../services/PracticeQuestionService";

import QuestionHeader from "./QuestionHeader";
import CodeViewer from "./CodeViewer";
import Answer from "./Answer";
import Explanation from "./Explanation";
import NavigationBar from "./NavigationBar";
import QuestionIndexBar from "./QuestionIndexBar";
import { useEffect, useRef, useState } from "react";

export default function QuestionPanel() {

  const {
    topic,
    questionIndex,
    section,
    topicId,
    startQuestion,
    completeQuestion,
    updateTimeSpent,
    progress,
    setSection,
    setTopicId,
    setQuestionIndex,
  } = usePracticeQuestions();

  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousQuestionRef = useRef<{ section: string; topicId: string; questionNo: number } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Handle timer
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Handle question change with progress tracking
  useEffect(() => {
    if (!topic) return;

    const currentQuestion = topic.questions[questionIndex];
    if (!currentQuestion) return;

    const previousQuestion = previousQuestionRef.current;

    // Save progress for previous question if time was spent
    if (previousQuestion && elapsedTime > 0) {
      updateTimeSpent(
        previousQuestion.section,
        previousQuestion.topicId,
        previousQuestion.questionNo,
        elapsedTime
      );
      setElapsedTime(0);
    }

    // Start new question
    startQuestion(section, topicId, currentQuestion.questionNo);
    previousQuestionRef.current = {
      section,
      topicId,
      questionNo: currentQuestion.questionNo,
    };

    topRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [questionIndex, topic, section, topicId, startQuestion, updateTimeSpent]);

  if (!topic) {
    return (
      <div className="flex h-full items-center justify-center">
        No topic selected
      </div>
    );
  }

  const question = topic.questions[questionIndex];
  const currentQuestionProgress = progress[`${section}-${topicId}-${question.questionNo}`];
  const isQuestionCompleted = currentQuestionProgress?.status === "completed";

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const handleMarkComplete = async () => {
    await completeQuestion(section, topicId, question.questionNo, elapsedTime);
    
    if (!topic) return;

    const totalQuestions = topic.questions.length;
    const isLastQuestion = questionIndex === totalQuestions - 1;

    if (isLastQuestion) {
      const nextTopic = PracticeQuestionService.getNextTopic(section, topicId);

      if (nextTopic) {
        setSection(nextTopic.section);
        setTopicId(nextTopic.topic.id);
        setQuestionIndex(0);
      }
    } else {
      setQuestionIndex(questionIndex + 1);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex-1 min-h-0 overflow-y-scroll overflow-x-hidden p-8">

        <div ref={topRef} />

        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="flex-1">
            <QuestionHeader
              title={topic.title}
              questionNo={question.questionNo}
              questionTitle={question.title}
              difficulty={question.difficulty}
              current={questionIndex + 1}
              total={topic.questions.length}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm font-medium text-slate-600">
              <div>Time spent</div>
              <div className="text-lg font-bold text-slate-900">{formatTime(elapsedTime)}</div>
            </div>
            <button
              type="button"
              onClick={handleMarkComplete}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isQuestionCompleted
                  ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {isQuestionCompleted ? "Completed" : "Mark as complete"}
            </button>
          </div>
        </div>

        <QuestionIndexBar />

        {topic.summary && (
          <details className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <summary className="cursor-pointer font-bold text-slate-900">
              Topic briefing & learning goals
            </summary>
            <p className="mt-4 leading-7 text-slate-700">{topic.summary}</p>
            {topic.learningGoals && topic.learningGoals.length > 0 && (
              <ul className="mt-4 grid gap-2 md:grid-cols-2">
                {topic.learningGoals.map((goal) => (
                  <li key={goal} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <span aria-hidden="true" className="font-bold text-emerald-600">✓</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            )}
          </details>
        )}

        {question.task && (
          <section className="mt-7 rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
            <h2 className="text-lg font-bold text-blue-950">Your task</h2>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-blue-950">
              {question.task}
            </p>
            {question.expectedBehavior && (
              <div className="mt-4 rounded-xl bg-white/80 p-4 leading-7 text-slate-700">
                <span className="font-bold text-slate-900">Expected behavior: </span>
                {question.expectedBehavior}
              </div>
            )}
          </section>
        )}

        <h2 className="mt-7 text-xl font-bold text-slate-900">Code to debug</h2>

        <CodeViewer
          code={question.buggyCode}
        />

        <Answer
          answer={question.answer}
        />

        <Explanation
          explanation={question.explanation}
        />

        {question.correctedCode && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900">Corrected solution</h2>
            <CodeViewer code={question.correctedCode} />
          </section>
        )}

        {question.hints && question.hints.length > 0 && (
          <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-xl font-semibold text-amber-950">Debugging hints</h2>
            <ul className="mt-3 space-y-2 text-amber-950">
              {question.hints.map((hint) => (
                <li key={hint} className="flex gap-3 leading-7">
                  <span aria-hidden="true">•</span><span>{hint}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {question.keyTakeaways && question.keyTakeaways.length > 0 && (
          <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="text-xl font-semibold text-emerald-950">Key takeaways</h2>
            <ul className="mt-3 space-y-2 text-emerald-950">
              {question.keyTakeaways.map((takeaway) => (
                <li key={takeaway} className="flex gap-3 leading-7">
                  <span aria-hidden="true" className="font-bold">✓</span><span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {question.followUpQuestions && question.followUpQuestions.length > 0 && (
          <section className="mt-8 rounded-2xl bg-slate-950 p-6 text-white">
            <h2 className="text-xl font-semibold">Karat-style follow-ups</h2>
            <ol className="mt-4 space-y-3 text-slate-200">
              {question.followUpQuestions.map((followUp, index) => (
                <li key={followUp} className="flex gap-3 leading-7">
                  <span className="font-bold text-emerald-400">{index + 1}.</span>
                  <span>{followUp}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <NavigationBar />

      </div>

    </div>

  );
}
