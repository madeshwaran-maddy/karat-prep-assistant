"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "../format-practice-question.module.css";
import FormatSidebar from "./FormatSidebar";
import FormatContent from "./FormatContent";
import QuestionContent from "./QuestionContent";
import { loadFormat } from "../lib/format";
import { loadQuestionsFromExcel } from "../lib/excel";
import type { FormatConfig, PracticeQuestion } from "../types";
import { getProgressStatus, useRound2Progress } from "../hooks/useRound2Progress";

type TabKey = "format" | number;

export default function FormatPracticeQuestion() {
  const [format, setFormat] = useState<FormatConfig | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabKey>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const { progress, fetchAll, start, complete, updateTime } = useRound2Progress();
  const activeStartedAt = useRef<number | null>(null);
  const activeItem = useRef<{ topicId: string; questionNo: number } | null>(null);

  function getActiveItem(tab: TabKey) {
    if (tab === "format") {
      return { topicId: "format", questionNo: 0 };
    }

    const question = questions[tab];
    return question
      ? { topicId: "format-practice-questions", questionNo: question.questionNo || tab + 1 }
      : null;
  }

  async function stopTracking() {
    const item = activeItem.current;
    const startedAt = activeStartedAt.current;
    if (!item || startedAt === null) {
      return;
    }

    const existing = progress[`${item.topicId}-${item.questionNo}`];
    await updateTime(
      item.topicId,
      item.questionNo,
      (existing?.timeSpentSeconds ?? 0) + (Date.now() - startedAt) / 1000
    );
    activeStartedAt.current = null;
  }

  async function startTracking(tab: TabKey) {
    const item = getActiveItem(tab);
    if (!item) {
      return;
    }

    activeItem.current = item;
    activeStartedAt.current = Date.now();
    await start(item.topicId, item.questionNo);
  }

  async function selectTab(tab: TabKey) {
    await stopTracking();
    setSelectedTab(tab);
    await startTracking(tab);
  }

  async function completeSelected() {
    const item = getActiveItem(selectedTab);
    if (!item || isCompleting) {
      return;
    }

    setIsCompleting(true);
    try {
      const existing = progress[`${item.topicId}-${item.questionNo}`];
      const elapsed = activeStartedAt.current === null
        ? 0
        : (Date.now() - activeStartedAt.current) / 1000;
      const completed = await complete(
        item.topicId,
        item.questionNo,
        (existing?.timeSpentSeconds ?? 0) + elapsed
      );

      if (!completed) {
        return;
      }

      const nextTab = selectedTab === "format"
        ? (questions.length ? 0 : "format")
        : selectedTab < questions.length - 1
          ? selectedTab + 1
          : selectedTab;

      if (nextTab !== selectedTab) {
        await selectTab(nextTab);
      } else {
        activeStartedAt.current = Date.now();
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsCompleting(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const [formatData, questionData] = await Promise.all([
          loadFormat("/format-practice-question/format.json"),
          loadQuestionsFromExcel(
            "/format-practice-question/questions.xlsx"
          ),
        ]);

        const savedProgress = await fetchAll();
        const inProgressIndex = questionData.findIndex((question, index) => {
          const questionNo = question.questionNo || index + 1;
          return savedProgress[
            `format-practice-questions-${questionNo}`
          ]?.status === "in_progress";
        });
        const allQuestionsCompleted = questionData.length > 0 && questionData.every(
          (question, index) => {
            const questionNo = question.questionNo || index + 1;
            return savedProgress[
              `format-practice-questions-${questionNo}`
            ]?.status === "completed";
          }
        );

        setSelectedTab(
          inProgressIndex >= 0 || allQuestionsCompleted
            ? Math.max(0, inProgressIndex)
            : 0
        );
        setFormat(formatData);
        setQuestions(questionData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load screen data."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [fetchAll]);

  useEffect(() => {
    if (!loading && !error && (format || questions.length)) {
      void startTracking(selectedTab);
    }

    return () => {
      void stopTracking();
    };
  }, [loading, error, format, questions.length]);

  const selectedQuestion =
    selectedTab === "format" ? null : questions[selectedTab] ?? null;

  function goPrevious() {
    const nextTab = selectedTab === "format" ? 0 : Math.max(0, selectedTab - 1);
    void selectTab(nextTab);
  }

  function goNext() {
    const nextTab = selectedTab === "format"
      ? 0
      : Math.min(questions.length - 1, selectedTab + 1);
    void selectTab(nextTab);
  }

  return (
    <main className={styles.fpqPage}>
      {/* Header removed: brand and profile are redundant with page title */}

      <div style={{ padding: "16px 24px 0" }}>
        <Link
          href="/candidate-dashboard/round-2-learning"
          className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100"
        >
          Back to Round 2 Learning
        </Link>
      </div>

      <section className={styles.fpqTitlebar}>
        <h1>Format and Practice Questions</h1>
        <span>
          {selectedTab === "format"
            ? "Format selected"
            : `Question ${questions.length ? selectedTab + 1 : 1} selected by default`}
        </span>
      </section>

      <section className={styles.fpqLayout}>
        <FormatSidebar
          questions={questions}
          selectedTab={selectedTab}
          onSelect={(tab) => void selectTab(tab)}
          getStatus={(topicId, questionNo) => getProgressStatus(progress, topicId, questionNo)}
        />

        <div className={styles.fpqContent}>
          {loading && (
            <div className={styles.fpqState}>
              Loading format and questions...
            </div>
          )}

          {!loading && error && (
            <div className={`${styles.fpqState} ${styles.fpqError}`}>
              <strong>Unable to load questions.</strong>
              <p>{error}</p>
              <p>
                Check that these files exist:
                <br />
                <code>public/format-practice-question/format.json</code>
                <br />
                <code>public/format-practice-question/questions.xlsx</code>
              </p>
            </div>
          )}

          {!loading && !error && selectedTab === "format" && format && (
            <FormatContent
              format={format}
              completed={getProgressStatus(progress, "format", 0) === "completed"}
              completing={isCompleting}
              onComplete={() => void completeSelected()}
            />
          )}

          {!loading && !error && selectedTab === "format" && !format && (
            <div className={styles.fpqState}>
              No format details available.
            </div>
          )}

          {!loading && !error && selectedTab !== "format" && !selectedQuestion && (
            <div className={styles.fpqState}>
              No question rows were found in the Excel file.
            </div>
          )}

          {!loading && !error && selectedTab !== "format" && selectedQuestion && (
            <QuestionContent
              question={selectedQuestion}
              currentIndex={selectedTab}
              total={questions.length}
              onPrevious={goPrevious}
              onNext={goNext}
              completed={getProgressStatus(progress, "format-practice-questions", selectedQuestion.questionNo || selectedTab + 1) === "completed"}
              completing={isCompleting}
              onComplete={() => void completeSelected()}
            />
          )}
        </div>
      </section>
    </main>
  );
}
