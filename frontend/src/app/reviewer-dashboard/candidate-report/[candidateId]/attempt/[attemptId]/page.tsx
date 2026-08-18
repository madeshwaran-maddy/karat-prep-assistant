"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ReviewerShell } from "../../../../components/ReviewerShell";
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
    userAnalysis: "Not available for this submission.",
    score: "N/A",
    explanation: "No detailed explanation is available for this legacy submission.",
    suggestions: ["Review the candidate solution directly in the code window."],
  };
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

  if (!candidate || !attempt) {
    return <div className={styles.notFound}>Solution not found.</div>;
  }

  const activeQuestion = selectedQuestion;

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
              {questions.map((question) => (
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
              <div>
                <span>Topic</span>
                <strong>{activeQuestion.topic || "N/A"}</strong>
              </div>
              <div>
                <span>Subtopic</span>
                <strong>{activeQuestion.subtopic || "General"}</strong>
              </div>
              <div>
                <span>Score</span>
                <strong>{String(activeQuestion.score ?? "N/A")}</strong>
              </div>
            </div>

            <div className={styles.modalContentGrid}>
              <section className={styles.detailCard}>
                <h4>Question Code</h4>
                <pre>
                  <code>{activeQuestion.questionCode || "No question code available."}</code>
                </pre>
              </section>

              <section className={styles.detailCard}>
                <h4>User Code</h4>
                <pre>
                  <code>{activeQuestion.userCode || "No user code submitted."}</code>
                </pre>
              </section>

              <section className={styles.detailCard}>
                <h4>User Analysis</h4>
                <p>{activeQuestion.userAnalysis || "No user analysis recorded."}</p>
              </section>

              <section className={styles.detailCard}>
                <h4>Explanation</h4>
                <p>{activeQuestion.explanation || "No explanation provided."}</p>
              </section>

              <section className={styles.detailCard}>
                <h4>Suggestions</h4>
                {activeQuestion.suggestions && activeQuestion.suggestions.length > 0 ? (
                  <ul>
                    {activeQuestion.suggestions.map((suggestion, index) => (
                      <li key={`${activeQuestion.id}-suggestion-${index}`}>{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No suggestions available.</p>
                )}
              </section>
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