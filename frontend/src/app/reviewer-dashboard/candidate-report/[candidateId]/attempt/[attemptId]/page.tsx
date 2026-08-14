"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ReviewerShell } from "../../../../components/ReviewerShell";
import { getAttempt, getCandidate } from "../../../../lib/reviewer-data";
import styles from "../../../../reviewer-dashboard.module.css";

export default function ViewSolutionPage() {
  const params = useParams<{
    candidateId: string;
    attemptId: string;
  }>();

  const candidate = getCandidate(params.candidateId);
  const attempt = getAttempt(params.candidateId, params.attemptId);

  if (!candidate || !attempt) {
    return <div className={styles.notFound}>Solution not found.</div>;
  }

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
        <h2 className={styles.sectionTitle}>Submitted Solution</h2>

        <div className={styles.codeWindow}>
          <div className={styles.codeHeader}>
            <span>{attempt.fileName}</span>
            <span>Read-only</span>
          </div>

          <pre>
            <code>{attempt.solution}</code>
          </pre>
        </div>
      </section>

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