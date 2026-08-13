"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../format-practice-question.module.css";
import FormatSidebar from "./FormatSidebar";
import FormatContent from "./FormatContent";
import QuestionContent from "./QuestionContent";
import { loadFormat } from "../lib/format";
import { loadQuestionsFromExcel } from "../lib/excel";
import type { FormatConfig, PracticeQuestion } from "../types";

type TabKey = "format" | number;

export default function FormatPracticeQuestion() {
  const [format, setFormat] = useState<FormatConfig | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabKey>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, []);

  const selectedQuestion =
    selectedTab === "format" ? null : questions[selectedTab] ?? null;

  function goPrevious() {
    setSelectedTab((current) =>
      current === "format" ? 0 : Math.max(0, current - 1)
    );
  }

  function goNext() {
    setSelectedTab((current) =>
      current === "format"
        ? 0
        : Math.min(questions.length - 1, current + 1)
    );
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
          onSelect={setSelectedTab}
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
            <FormatContent format={format} />
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
            />
          )}
        </div>
      </section>
    </main>
  );
}
