"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ReviewerShell } from "../../../../components/ReviewerShell";
import { TablePagination, TABLE_PAGE_SIZE } from "../../../../components/TablePagination";
import {
  Attempt,
  AttemptQuestion,
  Candidate,
  fetchCandidate,
  getAttempt,
  getCandidate,
} from "../../../../lib/reviewer-data";
import styles from "../../../../reviewer-dashboard.module.css";

function buildQuestionFromAttempt(attempt: Attempt): AttemptQuestion | null {
  if (!attempt) {
    return null;
  }

  return {
    id: `${attempt.id}-legacy`,
    questionNo: 1,
    topic: attempt.fileName || "Submission",
    subtopic: "General",
    questionCode: attempt.solution || "",
    userCode: attempt.solution || "",
    userAnalysis: "",
    score: "N/A",
    explanation: "",
    suggestions: [],
  };
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function getNumericScore(score: AttemptQuestion["score"]) {
  if (typeof score === "number") {
    return Number.isFinite(score) ? score : null;
  }

  if (typeof score !== "string" || !score.trim()) {
    return null;
  }

  const numericScore = Number(score);
  return Number.isFinite(numericScore) ? numericScore : null;
}

export default function ViewSolutionPage() {
  const params = useParams<{
    candidateId: string;
    attemptId: string;
  }>();

  const [candidate, setCandidate] = useState<Candidate | null>(getCandidate(params.candidateId) ?? null);
  const [attempt, setAttempt] = useState<Attempt | null>(getAttempt(params.candidateId, params.attemptId) ?? null);

  useEffect(() => {
    fetchCandidate(params.candidateId)
      .then((nextCandidate) => {
        setCandidate(nextCandidate);
        setAttempt(nextCandidate ? getAttempt(nextCandidate.id, params.attemptId) ?? null : null);
      })
      .catch(() => {
        setCandidate(null);
        setAttempt(null);
      });
  }, [params.candidateId, params.attemptId]);

  const questions = useMemo(() => {
    if (!attempt) {
      return [] as AttemptQuestion[];
    }

    if (attempt.questions && attempt.questions.length > 0) {
      return attempt.questions;
    }

    const fallback = buildQuestionFromAttempt(attempt);
    return fallback ? [fallback] : [];
  }, [attempt]);

  const [selectedQuestion, setSelectedQuestion] = useState<AttemptQuestion | null>(null);
  const [page, setPage] = useState(1);

  if (!candidate || !attempt) {
    return <div className={styles.notFound}>Solution not found.</div>;
  }

  const activeQuestion = selectedQuestion;
  const scores = questions
    .map((question) => getNumericScore(question.score))
    .filter((score): score is number => score !== null);
  const averageScore = scores.length > 0
    ? scores.reduce((total, score) => total + score, 0) / scores.length
    : null;
  const totalPages = Math.max(1, Math.ceil(questions.length / TABLE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedQuestions = questions.slice(
    (currentPage - 1) * TABLE_PAGE_SIZE,
    currentPage * TABLE_PAGE_SIZE
  );

  return (
    <ReviewerShell active="report">
      <div className={styles.pageHeading}>
        <h1>View Solution</h1>
        <p>
          Review the submitted solution for a selected candidate attempt.
        </p>
      </div>

      <section className={styles.candidateSummary}>
        <div>
          <span>Candidate Name</span>
          <strong>{candidate.name}</strong>
        </div>
        <div>
          <span>Round</span>
          <strong>{attempt.round}</strong>
        </div>
        <div>
          <span>Attempt No</span>
          <strong>{attempt.attemptNo}</strong>
        </div>
        <div>
          <span>Attempted Date</span>
          <strong>{attempt.attemptedDate}</strong>
        </div>
        {attempt.round === "Round 1" && (
          <div>
            <span>Average Score</span>
            <strong>{averageScore === null ? "N/A" : averageScore.toFixed(2)}</strong>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <h2 className={styles.sectionTitle}>Questions in this Attempt</h2>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Question No</th>
                <th>Topic</th>
                <th>Subtopic</th>
                <th>View Progress</th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuestions.map((question) => (
                <tr key={question.id || `${attempt.id}-question-${question.questionNo}`}>
                  <td>{question.questionNo}</td>
                  <td>{question.topic || "N/A"}</td>
                  <td>{question.subtopic || "General"}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.smallButton}
                      onClick={() => setSelectedQuestion(question)}
                    >
                      View Progress
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination page={currentPage} totalItems={questions.length} onPageChange={setPage} />
      </section>

      {activeQuestion && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedQuestion(null)}>
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="solution-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>Question {activeQuestion.questionNo}</span>
                <h3 id="solution-modal-title">{activeQuestion.topic}</h3>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedQuestion(null)}
              >
                Close
              </button>
            </div>

            <div className={styles.modalMetaGrid}>
              {hasText(activeQuestion.topic) && <div>
                <span>Topic</span>
                <strong>{activeQuestion.topic}</strong>
              </div>}
              {hasText(activeQuestion.subtopic) && <div>
                <span>Subtopic</span>
                <strong>{activeQuestion.subtopic}</strong>
              </div>}
              {activeQuestion.score !== null && activeQuestion.score !== undefined && <div>
                <span>Score</span>
                <strong>{String(activeQuestion.score)}</strong>
              </div>}
            </div>

            <div className={styles.modalContentGrid}>
              {hasText(activeQuestion.questionCode) && <section className={styles.detailCard}>
                <h4>Question Code</h4>
                <pre>
                  <code>{activeQuestion.questionCode}</code>
                </pre>
              </section>}

              {hasText(activeQuestion.userCode) && <section className={styles.detailCard}>
                <h4>User Code</h4>
                <pre>
                  <code>{activeQuestion.userCode}</code>
                </pre>
              </section>}

              {hasText(activeQuestion.userAnalysis) && <section className={styles.detailCard}>
                <h4>{attempt.round === "Round 1" ? "User Analysis" : "User Console Output"}</h4>
                <p>{activeQuestion.userAnalysis}</p>
              </section>}

              {hasText(activeQuestion.explanation) && <section className={styles.detailCard}>
                <h4>Explanation</h4>
                <p>{activeQuestion.explanation}</p>
              </section>}

              {activeQuestion.suggestions?.some(hasText) && <section className={styles.detailCard}>
                <h4>Suggestions</h4>
                <ul>
                  {activeQuestion.suggestions.filter(hasText).map((suggestion, index) => (
                    <li key={`${activeQuestion.id}-suggestion-${index}`}>{suggestion}</li>
                  ))}
                </ul>
              </section>}
            </div>
          </div>
        </div>
      )}

      <div className={styles.bottomRow}>
        <Link
          className={styles.primaryButton}
          href={`/reviewer-dashboard/candidate-report/${candidate.id}`}
        >
          Back
        </Link>
        <span>Reviewer can return to Candidate Detailed Report.</span>
      </div>
    </ReviewerShell>
  );
}