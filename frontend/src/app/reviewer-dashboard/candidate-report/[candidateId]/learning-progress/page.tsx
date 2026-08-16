"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ReviewerShell } from "../../../components/ReviewerShell";
import { Candidate, fetchCandidate } from "../../../lib/reviewer-data";
import styles from "../../../reviewer-dashboard.module.css";

export default function CandidateLearningProgressPage() {
  const params = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    fetchCandidate(params.candidateId).then(setCandidate).catch(() => setCandidate(null));
  }, [params.candidateId]);

  if (!candidate) {
    return <div className={styles.notFound}>Candidate not found.</div>;
  }

  const totalAttempts = candidate.totalMockAttempts ?? 0;

  return (
    <ReviewerShell active="report">
      <div className={styles.pageHeading}>
        <h1>Learning Progress</h1>
        <p>
          Track the candidate&apos;s training progress and assessment activity.
        </p>
      </div>

      <section className={styles.candidateSummary}>
        <div>
          <span>Candidate Name</span>
          <strong>{candidate.name}</strong>
        </div>
        <div>
          <span>Start Date</span>
          <strong>{candidate.startDate}</strong>
        </div>
        <div>
          <span>Total Mock Attempt</span>
          <strong>{totalAttempts}</strong>
        </div>
        <div>
          <span>Lead Name</span>
          <strong>{candidate.leadName}</strong>
        </div>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.sectionTitle}>Progress Summary</h2>

        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Round</th>
                <th>Attempt Count</th>
                <th>Last Attempted Date</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Round 1</td>
                <td>{candidate.round1Attempts}</td>
                <td>{candidate.attempts[0]?.attemptedDate ?? "N/A"}</td>
                <td>
                  <Link
                    className={styles.smallButton}
                    href={`../${candidate.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
              <tr>
                <td>Round 2</td>
                <td>{candidate.round2Attempts}</td>
                <td>{candidate.attempts[candidate.attempts.length - 1]?.attemptedDate ?? "N/A"}</td>
                <td>
                  <Link
                    className={styles.smallButton}
                    href={`../${candidate.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.bottomRow}>
          <Link className={styles.primaryButton} href="../">
            Back
          </Link>
          <span>Review the candidate&apos;s current learning and assessment progress.</span>
        </div>
      </section>
    </ReviewerShell>
  );
}
